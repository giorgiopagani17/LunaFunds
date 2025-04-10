<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg" style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">{{ `${props.transaction ? 'DELETE' : 'NEW'}` }} GROUP TRANSACTION</h5>
        <q-btn
          flat
          round
          dense
          icon="close"
          color="grey-8"
          @click="closeModal"
          v-if="isMine"
          style="position: absolute; top: 15px; right: 5px;"
        />

        <div class="flex items-center justify-center q-py-lg" style="border-bottom: solid 1px #E9E9E9">
          <div class="text-center q-mr-sm" style="font-size: 250%; width: 5%">
            <span class="text-negative" style="margin-left: 10px;">-</span>
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
              'text-negative',
              'q-pb-sm'
            ]"
            :error="groupAmountError"
            :disable="isDisabled"
          />
          <span
            class="q-ml-sm text-negative"
            style="font-size: 250%;"
          >
            {{ detailsStore.groupCurrency }}
          </span>
        </div>

        <div class="flex items-center justify-between q-mt-lg">
          <div class="flex items-center">
            <q-icon name="text_snippet" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Name:</span>
          </div>
          <q-input
            v-model="groupName"
            maxlength="20"
            dense
            color="secondary"
            placeholder="Insert a name"
            lazy-rules
            style="width: 40%"
            :error="groupNameError"
            :disable="isDisabled"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <q-icon name="calendar_month" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Date:</span>
          </div>
          <q-input
            v-model="groupDate"
            type="date"
            maxlength="20"
            dense
            color="secondary"
            lazy-rules
            style="width: 40%"
            :error="groupDateError"
            :max="new Date().toISOString().split('T')[0]"
            :disable="isDisabled"
          />
        </div>

        <div class="text-center q-mt-sm q-mb-sm text-grey text-bold" style="font-size: 110%" v-if="!isMine && props.transaction">
          Transaction done by {{ props.transaction.users.name }}
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md">
        <div class="flex items-center justify-center" v-if="props.transaction && !isMine" style="width: 100%">
          <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        </div>
        <q-btn v-if="!props.transaction" flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        <q-btn v-if="!props.transaction" flat style="margin-left: auto; width: 100px; font-size: 110%" label="Create" color="positive" @click="createGroupTransaction()" />
        <q-btn
          v-if="deleteConfirmationShown && isMine"
          flat
          style="width: 100px; font-size: 110%"
          label="Confirm"
          color="negative"
          @click="deleteGroupTransaction()"
        />
        <q-btn
          v-else-if="!deleteConfirmationShown && isMine"
          flat
          style="width: 100px; font-size: 110%"
          label="Delete"
          color="negative"
          @click="deleteConfirmationShown = true"
        />
        <q-btn v-if="isMine" flat style="margin-left: auto; width: 100px; font-size: 110%" label="Update" color="positive" @click="updateGroupTransaction()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, defineProps, defineEmits, ref, onMounted, PropType} from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'stores/details';
import {Notify} from 'quasar';

class User {
  name!: string;
  id!: number;
  totalAmount!: number;
  isMine!: boolean;
  payGroup!: boolean;
  isBoss!: boolean;
}

class Transaction {
  id!: number;
  userId!: number;
  groupId!: number;
  name!: string;
  amount!: number;
  createdAt!: Date;
  updatedAt!: Date;
  users!: User;
}

const props = defineProps({
  modelValue: Boolean,
  transaction: {
    type: Object as PropType<Transaction | null>,
    default: () => null
  },
  userId: {
    type: Number,
    default: () => null
  },
});

const emit = defineEmits(['update:modelValue']);
const groupName = ref('');
const groupAmount = ref<number>(0);
const groupDate = ref('');
const groupNameError = ref(false);
const groupAmountError = ref(false);
const groupDateError = ref(false);
const detailsStore = useDetailsStore();
const isDisabled = ref(false);
const isMine = props.userId === parseInt(props.transaction?.userId?.toString() || '0');
const deleteConfirmationShown = ref(false);
const accountSelected = ref({ label: 'Select an Account', value: 0 });

console.log(isMine)
console.log(props.transaction)
console.log(props.userId)

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
    return groupAmount.value !== 0
      ? groupAmount.value.toLocaleString('it-IT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
      : ''
  },
  set(newValue: string) {
    const formattedValue = cleanAndFormatInput(newValue)
    groupAmount.value = parseFloat(formattedValue.replace(/\./g, '').replace(',', '.')) || 0
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
  groupName.value = '';
  groupAmount.value = 10;
  groupDate.value = '';
};

const refreshChanges = () => {
  const changes = parseInt(detailsStore.groupChanges ? detailsStore.groupChanges.toString() : '0');
  console.log('Changes:', changes);
  detailsStore.setGroupChanges((changes + 1).toString());
  console.log('Changes:', detailsStore.groupChanges);
};

const createGroupTransaction = async () => {
  groupNameError.value = !groupName.value.trim();
  groupAmountError.value = !groupAmount.value || isNaN(Number(groupAmount.value)) || Number(groupAmount.value) === 0;
  groupDateError.value = !groupDate.value;

  setTimeout(() => {
    groupNameError.value = false;
    groupAmountError.value = false;
    groupDateError.value = false;
  }, 3000);

  if (groupNameError.value || groupAmountError.value || groupDateError.value) {
    console.error('Validation Error: At least one of Name, Amount, or Date is missing.');
    return;
  }

  const formattedDate = getFormattedDate(groupDate.value);
  const groupId = detailsStore.groupID ? parseInt(detailsStore.groupID) : 0;

  try {
    const response = await fetchWithAuth('http://localhost:3000/groups/transaction', {
      method: 'POST',
      body: JSON.stringify({
        name: groupName.value.trim(),
        amount: Number(groupAmount.value),
        createdAt: formattedDate,
        groupId: groupId,
        accountId: parseInt(detailsStore.accountID),
        group: accountSelected.value?.value,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Group Transaction created successfully:', data);

    Notify.create({
      type: 'positive',
      message: 'You created a new group transaction!',
      color: 'positive',
    });

    refreshChanges();
    closeModal();
  } catch (error) {
    console.error('Error while creating group transaction:', error);
    Notify.create({
      type: 'negative',
      message: 'Error creating the group transaction!',
      color: 'negative',
    });
  }
};

const deleteGroupTransaction = async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/groups/transaction/${props.transaction?.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Group Transaction deleted successfully:', data);

    Notify.create({
      type: 'positive',
      message: 'You deleted the group transaction!',
      color: 'negative',
    });

    refreshChanges();
    closeModal();

    Notify.create({
      type: 'positive',
      message: 'Group transaction deleted successfully!',
      color: 'positive',
    });
  } catch (error) {
    console.error('Error while deleting group transaction:', error);
    Notify.create({
      type: 'negative',
      message: 'Error deleting the group transaction!',
      color: 'negative',
    });
  }
};

const updateGroupTransaction = async () => {
  groupNameError.value = !groupName.value.trim();
  groupAmountError.value = !groupAmount.value || isNaN(Number(groupAmount.value)) || Number(groupAmount.value) === 0;
  groupDateError.value = !groupDate.value;

  setTimeout(() => {
    groupNameError.value = false;
    groupAmountError.value = false;
    groupDateError.value = false;
  }, 3000);

  if (groupNameError.value || groupAmountError.value || groupDateError.value) {
    console.error('Validation Error: At least one of Name, Amount, or Date is missing.');
    return;
  }

  const formattedDate = getFormattedDate(groupDate.value);

  try {
    const response = await fetchWithAuth(`http://localhost:3000/groups/transaction/${props.transaction?.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: groupName.value.trim(),
        amount: Number(groupAmount.value),
        createdAt: formattedDate,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Group Transaction created successfully:', data);

    Notify.create({
      type: 'positive',
      message: 'You updated the group transaction!',
      color: 'positive',
    });

    refreshChanges();
    closeModal();
  } catch (error) {
    console.error('Error while creating group transaction:', error);
    Notify.create({
      type: 'negative',
      message: 'Error updating the group transaction!',
      color: 'negative',
    });
  }
};

onMounted(() => {
  if (props.transaction) {
    groupAmount.value = Math.abs(props.transaction.amount);
    groupName.value = props.transaction.name;
    groupDate.value = new Date(props.transaction.createdAt).toISOString().split('T')[0];
    if(!isMine){
      isDisabled.value = true;
    }
  } else {
    groupDate.value = new Date().toISOString().split('T')[0];
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
