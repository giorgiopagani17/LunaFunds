<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg" style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">{{ `${props.bankTransfer ? 'VIEW' : 'NEW'}` }} BANK TRANSFER</h5>

        <div class="flex items-center justify-center q-py-lg" style="border-bottom: solid 1px #E9E9E9">
          <div class="text-center q-mr-sm" style="font-size: 250%; width: 5%">
            <q-icon name="swap_horiz" size="3rem" class="q-mr-sm" />
          </div>
          <q-input
            v-model="displayAmount"
            maxlength="12"
            dense
            color="secondary"
            placeholder="10,00"
            lazy-rules
            style="width: 250px; font-size: 300%; padding: 0% !important"
            :input-class="[
              'text-center',
              'q-pb-sm'
            ]"
            :error="transferAmountError"
            :disable="isDisabled"
          />
          <span
            class="q-ml-sm"
            style="font-size: 250%;"
          >
            {{ detailsStore.currency }}
          </span>
        </div>

        <div class="flex items-center justify-between q-mt-lg">
          <div class="flex items-center">
            <q-icon name="text_snippet" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Name:</span>
          </div>
          <q-input
            v-model="transferName"
            maxlength="20"
            dense
            color="secondary"
            placeholder="Insert a name"
            lazy-rules
            style="width: 40%"
            :error="transferNameError"
            :disable="isDisabled"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <q-icon name="calendar_month" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Date:</span>
          </div>
          <q-input
            v-model="transferDate"
            type="date"
            maxlength="20"
            dense
            color="secondary"
            lazy-rules
            style="width: 40%"
            :error="transferDateError"
            :max="new Date().toISOString().split('T')[0]"
            :disable="isDisabled"
          />
        </div>

        <div class="flex items-center justify-between" v-if="!props.bankTransfer">
          <div class="flex items-center">
            <q-icon name="person" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Send To:</span>
          </div>
          <q-input
            v-model="transferIban"
            dense
            color="secondary"
            placeholder="Insert an Iban"
            lazy-rules
            style="width: 40%"
            :error="transferIbanError"
            :disable="isDisabled"
          />
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md">
        <div class="flex items-center justify-center" v-if="props.bankTransfer" style="width: 100%">
          <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        </div>
        <q-btn v-if="!props.bankTransfer" flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        <q-btn v-if="!props.bankTransfer" flat style="margin-left: auto; width: 100px; font-size: 110%" label="Create" color="positive" @click="createTransfer()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, defineProps, defineEmits, ref, onMounted, PropType} from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'stores/details';
import { Notify } from 'quasar';

class Account {
  id!: number;
  name!: string;
  totalAmount!: number;
  default!: boolean;
}

type Transfer = {
  id: number;
  userId: number;
  accountId: number;
  name: string;
  amount: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  transfer: number | null;
  bankTransfer: number | null;
  categories: {
    id: number;
    name: string;
    userId: number;
    image: string;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    transactionCount: number;
  };
};

const props = defineProps({
  modelValue: Boolean,
  accounts: {
    type: Array as () => Account[],
    default: () => [],
  },
  bankTransfer: {
    type: Object as PropType<Transfer | null>,
    default: () => null
  }
});

const emit = defineEmits(['update:modelValue']);
const isDisabled = ref(false);
const transferName = ref('');
const transferAmount = ref<number>(0);
const transferDate = ref('');
const transferIban = ref('');
const transferIbanError = ref(false);
const transferNameError = ref(false);
const transferAmountError = ref(false);
const transferDateError = ref(false);
const detailsStore = useDetailsStore();

const cleanAndFormatInput = (input: string): string => {
  // Rimuovi tutti i caratteri tranne numeri, punto e virgola
  const cleanedValue = input.replace(/[^\d.,]/g, '')

  // Sostituisci il punto con la virgola se ci sono entrambi
  const normalizedValue = cleanedValue.replace(/\./g, '').replace(',', '.')

  // Converti in numero
  const numericValue = parseFloat(normalizedValue)

  // Ritorna formattato in stile italiano se è un numero valido
  return isNaN(numericValue)
    ? ''
    : numericValue.toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
}

// Esempio di utilizzo
const displayAmount = computed({
  get() {
    return transferAmount.value !== 0
      ? transferAmount.value.toLocaleString('it-IT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
      : ''
  },
  set(newValue: string) {
    const formattedValue = cleanAndFormatInput(newValue)
    transferAmount.value = parseFloat(formattedValue.replace(/\./g, '').replace(',', '.')) || 0
  }
})

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const getFormattedDate = (dateString: string): string => {
  // Usa la data passata (senza ora) come base
  const date = new Date(dateString);
  const now = new Date();  // Ora corrente

  // Imposta l'ora, i minuti, i secondi e i millisecondi in base all'ora locale
  date.setHours(now.getHours());
  date.setMinutes(now.getMinutes());
  date.setSeconds(now.getSeconds());
  date.setMilliseconds(now.getMilliseconds());

  return date.toISOString();  // Restituisce la data in formato ISO completo (incluso fuso orario)
};

const closeModal = () => {
  isVisible.value = false;
  transferIban.value = '';
  transferName.value = '';
  transferAmount.value = 10;
  transferDate.value = '';
};

const refreshChanges = () => {
  const changes = parseInt(detailsStore.changes ? detailsStore.changes.toString() : '0');
  detailsStore.setChanges((changes + 1).toString());
};

const createTransfer = async () => {
  transferNameError.value = !transferName.value.trim();
  transferAmountError.value = !transferAmount.value || isNaN(Number(transferAmount.value)) || Number(transferAmount.value) === 0;
  transferDateError.value = !transferDate.value;
  transferIbanError.value = !transferIban.value;

  setTimeout(() => {
    transferNameError.value = false;
    transferAmountError.value = false;
    transferDateError.value = false;
    transferIbanError.value = false;
  }, 3000);

  if (transferNameError.value || transferAmountError.value || transferDateError.value || transferIbanError.value) {
    console.error('Validation Error: At least one of Name, Amount, Date, or Iban is missing.');
    return;
  }

  const formattedDate = getFormattedDate(transferDate.value);
  const accountId = detailsStore.accountID ? parseInt(detailsStore.accountID) : 0;

  try {
    const response = await fetchWithAuth('http://localhost:3000/transactions/banktransfer', {
      method: 'POST',
      body: JSON.stringify({
        name: transferName.value.trim(),
        amount: Number(transferAmount.value),
        createdAt: formattedDate,
        accountId: accountId,
        iban: transferIban.value,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Leggi i dettagli dell'errore dal corpo della risposta
      throw new Error(errorData.message); // Lancia un errore con il messaggio ricevuto dal backend
    }

    const data = await response.json();
    console.log('Transfer created successfully:', data);

    refreshChanges();
    closeModal();

    Notify.create({
      type: 'positive',
      message: 'Bank transfer sent successfully!',
      color: 'positive',
    });
  } catch (error) {
    const err = error as { message: string }; // Tipo di errore
    console.error('Error while creating transfer:', err.message);

    if (err.message.includes('Receiver with the provided IBAN not found')) {
      Notify.create({
        type: 'negative',
        message: 'The receiver with the provided IBAN was not found!',
        color: 'negative',
      });
    } else if (err.message.includes('You cannot transfer money to yourself')) {
      Notify.create({
        type: 'negative',
        message: 'You cannot transfer money to yourself!',
        color: 'negative',
      });
    } else {
      Notify.create({
        type: 'negative',
        message: 'Error creating bank transfer!',
        color: 'negative',
      });
    }
  }
};

onMounted(() => {
  if(props.bankTransfer){
    transferAmount.value = Math.abs(props.bankTransfer.amount);
    transferName.value = props.bankTransfer.name;
    transferDate.value = new Date(props.bankTransfer.createdAt).toISOString().split('T')[0];
    isDisabled.value = true;
  } else {
    transferDate.value = new Date().toISOString().split('T')[0];
  }
});
</script>

<style scoped>
.custom-modal {
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
  width: 100%;
}
</style>
