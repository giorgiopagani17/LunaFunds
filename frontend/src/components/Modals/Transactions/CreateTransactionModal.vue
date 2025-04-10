<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <h5 class="q-mt-none q-mb-md text-secondary text-center q-pb-lg" style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">NEW TRANSACTION</h5>

        <div class="flex items-center justify-between bg-primary q-pa-xs" style="margin: auto; border-radius: 12px;">
          <span
            @click="isIncome = true"
            :class="{
              'text-secondary bg-white shadow-1': isIncome,
              'text-dark': !isIncome
            }"
            style="cursor: pointer; font-weight: bold; padding: 7px 20px; border-radius: 8px; text-align: center; width: 50%; transition: all 0.3s;"
          >
            Entrata
          </span>
          <span
            @click="isIncome = false"
            :class="{
              'text-secondary bg-white shadow-1': !isIncome,
              'text-dark': isIncome
            }"
            style="cursor: pointer; font-weight: bold; padding: 7px 20px; border-radius: 8px; text-align: center; width: 50%; transition: all 0.3s;"
          >
            Uscita
          </span>
        </div>


        <div class="flex items-center justify-center q-py-lg" style="border-bottom: solid 1px #E9E9E9">
          <div class="text-center q-mr-sm" style="font-size: 250%; width: 5%">
            <span v-if="!isIncome" class="text-negative" style="margin-left: 10px;">-</span>
            <span v-if="isIncome" class="text-positive" style="margin-left: 10px;">+</span>
          </div>
          <q-input
            v-model="displayAmount"
            maxlength="12"
            dense
            :color="isIncome ? 'positive' : 'negative'"
            placeholder="10,00"
            lazy-rules
            :style="{ width: '250px', fontSize: '300%', padding: '0% !important' }"
            :input-class="[
              {'text-positive': isIncome, 'text-negative': !isIncome},
              'text-center',
              'q-pb-sm'
            ]"
            :error="transactionAmountError"
          />
          <span
            class="q-ml-sm"
            :class="{'text-positive': isIncome, 'text-negative': !isIncome}"
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
            v-model="transactionName"
            maxlength="20"
            dense
            color="secondary"
            placeholder="Insert a name"
            lazy-rules
            style="width: 40%"
            :error="transactionNameError"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <q-icon name="calendar_month" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Date:</span>
          </div>
          <q-input
            v-model="transactionDate"
            type="date"
            maxlength="20"
            dense
            color="secondary"
            lazy-rules
            style="width: 40%"
            :error="transactionDateError"
            :max="new Date().toISOString().split('T')[0]"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <q-icon name="class" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Category:</span>
          </div>
          <q-select
            v-model="categorySelected"
            dense
            color="secondary"
            :options="computedCategories"
            lazy-rules
            style="width: 40%"
            :error="transactionCategoryError"
            popup-content-class="dropdown-style menu-scroll"
            behavior="menu"
          />

        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md">
        <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Create" color="positive" @click="createTransaction()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, defineEmits, defineProps, onMounted, ref, watch} from 'vue';
import {fetchWithAuth} from 'src/utils/api';
import {useDetailsStore} from 'stores/details';
import {Notify} from 'quasar';

class Category {
  id!: number;
  name!: string;
  userId!: number;
  image!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

const props = defineProps({
  modelValue: Boolean,
  categories: {
    type: Array as () => Category[],
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);
const transactionName = ref('');
const transactionAmount = ref(0);
const transactionDate = ref('');
const transactionCategory = ref('');
const transactionNameError = ref(false);
const transactionAmountError = ref(false);
const transactionDateError = ref(false);
const transactionCategoryError = ref(false);
const detailsStore = useDetailsStore();
const isIncome = ref(true);
const categorySelected = ref({ label: 'Select a Category', value: 0 });

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
    return transactionAmount.value !== 0
      ? transactionAmount.value.toLocaleString('it-IT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
      : ''
  },
  set(newValue: string) {
    const formattedValue = cleanAndFormatInput(newValue)
    transactionAmount.value = parseFloat(formattedValue.replace(/\./g, '').replace(',', '.')) || 0
  }
})

const computedCategories = computed(() => {
  if (Array.isArray(props.categories)) {
    return props.categories
      .filter((category: Category) => category.id !== categorySelected.value?.value)
      .map((category: Category) => ({
        label: category.name,
        value: category.id,
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
  transactionName.value = '';
  transactionAmount.value = 10;
  transactionDate.value = '';
  transactionCategory.value = '';
  isIncome.value = true;
  isVisible.value = false;
};

const refreshChanges = () => {
  const changes = parseInt(detailsStore.changes ? detailsStore.changes.toString() : '0');
  detailsStore.setChanges((changes + 1).toString());
};

const createTransaction = async () => {
  transactionNameError.value = !transactionName.value.trim();
  transactionAmountError.value = !transactionAmount.value || isNaN(Number(transactionAmount.value)) || Number(transactionAmount.value) === 0;
  transactionDateError.value = !transactionDate.value;
  transactionCategoryError.value = categorySelected.value?.value === 0;

  setTimeout(() => {
    transactionNameError.value = false;
    transactionAmountError.value = false;
    transactionDateError.value = false;
    transactionCategoryError.value = false;
  }, 3000);

  if (transactionNameError.value || transactionAmountError.value || transactionDateError.value || transactionCategoryError.value) {
    console.error('Validation Error: At least one of Name, Amount, Date, or Category is missing.');
    return;
  }

  const formattedDate = getFormattedDate(transactionDate.value);
  const accountId = detailsStore.accountID ? parseInt(detailsStore.accountID) : 0;

  if(isIncome.value) {
    transactionAmount.value = Math.abs(transactionAmount.value);
  } else {
    transactionAmount.value = -Math.abs(transactionAmount.value);
  }

  try {
    const response = await fetchWithAuth('http://localhost:3000/transactions', {
      method: 'POST',
      body: JSON.stringify({
        name: transactionName.value.trim(),
        amount: transactionAmount.value,
        createdAt: formattedDate,
        categoryId: categorySelected.value?.value,
        accountId: accountId,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Transaction created successfully:', data);

    refreshChanges();
    closeModal();

    Notify.create({
      type: 'positive',
      message: 'Transaction created successfully!',
      color: 'positive',
    });
  } catch (error) {
    console.error('Error while creating transaction:', error);
    Notify.create({
      type: 'negative',
      message: 'Error creating transaction!',
      color: 'negative',
    });
  }
};

onMounted(() => {
  transactionDate.value = new Date().toISOString().split('T')[0];
});

watch(() => categorySelected.value, () => {
  // Ricalcola le categorie ogni volta che categorySelected cambia
  computedCategories.value;
});
</script>

<style lang="scss">

.menu-scroll {
  max-height: 150px;
  overflow-y: scroll;
  padding-right: 10px;
  scrollbar-width: thin;
  scrollbar-color: #0549B7 transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #1F2A3C;
    border-radius: 10px;
    opacity: 1;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: darken(#1F2A3C, 10%);
  }

  &::-webkit-scrollbar {
    display: block;
  }
}
</style>

<style scoped>
.custom-modal {
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
  width: 100%;
}
</style>


