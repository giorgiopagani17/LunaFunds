<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg" style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">{{ `${props.transfer ? 'DELETE' : 'NEW'}` }} TRANSFER</h5>

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

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <q-icon name="class" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Account:</span>
          </div>
          <q-select
            v-model="accountSelected"
            dense
            color="secondary"
            :options="computedAccounts"
            lazy-rules
            style="width: 40%"
            :error="transferAccountError"
            popup-content-class="dropdown-style menu-scroll"
            behavior="menu"
            :disable="isDisabled"
          />

        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md">
        <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        <q-btn v-if="!props.transfer" flat style="margin-left: auto; width: 100px; font-size: 110%" label="Create" color="positive" @click="createTransfer()" />
        <div v-else style="margin-left: auto;">
          <q-btn
            v-if="deleteConfirmationShown"
            flat
            style="width: 100px; font-size: 110%"
            label="Confirm"
            color="negative"
            @click="deleteTransfer()"
          />
          <q-btn
            v-else
            flat
            style="width: 100px; font-size: 110%"
            label="Delete"
            color="negative"
            @click="deleteConfirmationShown = true"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, defineProps, defineEmits, ref, onMounted, watch, PropType} from 'vue';
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
  transfer: {
    type: Object as PropType<Transfer | null>,
    default: () => null
  }
});

const emit = defineEmits(['update:modelValue']);
const deleteConfirmationShown = ref(false);
const transferName = ref('');
const transferAmount = ref<number>(0);
const transferDate = ref('');
const transferAccount = ref('');
const transferNameError = ref(false);
const transferAmountError = ref(false);
const transferDateError = ref(false);
const transferAccountError = ref(false);
const isDisabled = ref(false);
const detailsStore = useDetailsStore();
const accountSelected = ref({ label: 'Select an Account', value: 0 });

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

const computedAccounts = computed(() => {
  if (Array.isArray(props.accounts)) {
    return props.accounts
      .filter((account: Account) => account.id !== accountSelected.value?.value && account.id !== parseInt(detailsStore.accountID ?? '0'))
      .map((account: Account) => ({
        label: account.name,
        value: account.id,
      }));
  }
  return [];
});

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
  transferAccount.value = '';
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
  transferAccountError.value = accountSelected.value?.value === 0;
  transferAccountError.value = accountSelected.value?.value === parseInt(detailsStore.accountID)

  setTimeout(() => {
    transferNameError.value = false;
    transferAmountError.value = false;
    transferDateError.value = false;
    transferAccountError.value = false;
  }, 3000);

  if (transferNameError.value || transferAmountError.value || transferDateError.value || transferAccountError.value) {
    console.error('Validation Error: At least one of Name, Amount, Date, or Account is missing.');
    return;
  }

  const formattedDate = getFormattedDate(transferDate.value);
  const accountId = detailsStore.accountID ? parseInt(detailsStore.accountID) : 0;

  try {
    const response = await fetchWithAuth('http://localhost:3000/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify({
        name: transferName.value.trim(),
        amount: Number(transferAmount.value),
        createdAt: formattedDate,
        accountId: accountId,
        transfer: accountSelected.value?.value,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Transfer created successfully:', data);

    refreshChanges();
    closeModal();

    Notify.create({
      type: 'positive',
      message: 'Transfer created successfully!',
      color: 'positive',
    });
  } catch (error) {
    console.error('Error while creating transfer:', error);
    Notify.create({
      type: 'negative',
      message: 'Error creating transfer!',
      color: 'negative',
    });
  }
};

const deleteTransfer = async () => {
  if(!props.transfer) return;
  try {
    const response = await fetchWithAuth(`http://localhost:3000/transactions/transfer/${props.transfer.id}/${props.transfer.transfer}`, {
      method: 'Delete',
    });

    if (!response.ok) throw new Error('Network response was not ok');

    refreshChanges();
    closeModal();

    Notify.create({
      type: 'positive',
      message: 'Transfer deleted successfully!',
      color: 'positive',
    });
  } catch (error) {
    console.error('Error while creating transfer:', error);
    Notify.create({
      type: 'negative',
      message: 'Error deleting transfer!',
      color: 'negative',
    });
  }
};

onMounted(() => {
  console.log('Transfer:', props.transfer);
  if (props.transfer) {
    transferAmount.value = Math.abs(props.transfer.amount);
    transferName.value = props.transfer.name;
    let account = props.accounts.find((account: Account) => account.id === props.transfer?.accountId);
    if (account) {
      accountSelected.value = {
        label: account.name,
        value: account.id,
      };
    }
    transferDate.value = new Date(props.transfer.createdAt).toISOString().split('T')[0];
    isDisabled.value = true;
  } else {
    transferDate.value = new Date().toISOString().split('T')[0];
  }
});

watch(() => accountSelected.value, () => {
  // Ricalcola le categorie ogni volta che accountSelected cambia
  computedAccounts.value;
});

watch(() => deleteConfirmationShown.value, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      deleteConfirmationShown.value = false;
    }, 3000); // Adjust the timeout duration as needed
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
