<template>
  <q-page class="row justify-evenly" style="height: 100vh;">
    <div class="container row">
      <div class="q-pa-md col-12" style="display: flex; justify-content: center;">
        <q-table
          :rows="formattedTransactions"
          :columns="columns"
          row-key="id"
          bordered
          style="width: 100%;"
          :rows-per-page-options="[15, 25, 50]"
          v-model:pagination="pagination"
          :pagination-label="customPaginationLabel"
        >
          <template v-slot:pagination>
            <div class="q-px-md q-py-sm">
              <q-btn
                :disabled="pagination.page <= 1"
                @click="pagination.page--"
                icon="chevron_left"
                round
                color="primary"
              />
              <span class="q-mx-md">
                Page {{ pagination.page }} of {{ Math.ceil(transactionsCount / pagination.rowsPerPage) }}
              </span>
              <q-btn
                :disabled="pagination.page >= Math.ceil(transactionsCount / pagination.rowsPerPage)"
                @click="pagination.page++"
                icon="chevron_right"
                round
                color="primary"
              />
            </div>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                color="negative"
                @click="confirmDeleteTransaction(props.row.id)"
                round
                icon="delete"
                size="md"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-amount="props">
            <q-td :props="props">
              <span :class="props.row.amount.class">{{ props.row.amount.value }} €</span>
            </q-td>
          </template>
          <template v-slot:top>
            <div class="row full-width items-center justify-between">
              <div class="text-h6">Transactions</div>
              <div class="row items-center">
                <q-btn color="primary" class="q-mr-sm" @click="confirmCreateTransaction()">
                  New
                  <font-awesome-icon :icon="['fas', 'plus']" class="q-ml-sm"/>
                </q-btn>
                <div class="q-mr-sm">
                  <q-input
                    filled
                    v-model="date"
                    mask="date"
                    dense
                    label="Choose Date"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="date" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div>
                  <q-btn-dropdown
                    class="q-mr-xs"
                    :color="activeFilters.length > 0 ? 'primary' : 'white'"
                    :text-color="activeFilters.length > 0 ? 'white' : 'black'"
                  >
                    <template v-slot:label>
                      <span class="flex items-center">
                        <font-awesome-icon :icon="['fas', 'filter']" class="q-mr-xs" />
                        {{ filterButtonLabel }}
                      </span>
                    </template>
                    <q-list style="width: 200px">
                      <q-item clickable @click="toggleFilter('entrate')">
                        <q-item-section>
                          <q-item-label>Entrate</q-item-label>
                        </q-item-section>
                        <q-item-section avatar>
                          <q-checkbox v-model="activeFilters" val="entrate" />
                        </q-item-section>
                      </q-item>
                      <q-item clickable @click="toggleFilter('uscite')">
                        <q-item-section>
                          <q-item-label>Uscite</q-item-label>
                        </q-item-section>
                        <q-item-section avatar>
                          <q-checkbox v-model="activeFilters" val="uscite" />
                        </q-item-section>
                      </q-item>
                      <q-item-section class="q-mb-md">
                        <div>
                          <q-item-label class="q-mt-md q-ml-sm q-mb-sm"><b>Filtra Categorie:</b></q-item-label>
                          <div class="categories-scroll">
                            <div v-for="(category, index) in categories" :key="index">
                              <q-checkbox
                                v-model="activeFilters"
                                :val="category.name"
                                :label="category.name"
                              />
                            </div>
                          </div>
                        </div>
                      </q-item-section>
                    </q-list>
                  </q-btn-dropdown>
                </div>
              </div>
            </div>
          </template>
        </q-table>
      </div>
    </div>

    <q-dialog v-model="isCreateOpen">
      <q-card class="q-pa-md">
        <q-card-section>
          <h5 class="q-mt-none q-mb-lg text-primary text-center"><b>NEW TRANSACTION</b></h5>

          <div class="flex items-center">
            <q-icon name="chat" size="1.7em" class="q-mr-sm text-primary" />
            <span style="width: 150px" class="q-mr-xs text-h6 text-primary">Name:</span>
            <q-input
              v-model="name"
              maxlength="20"
              dense
              color="primary"
              @change="handleNameChange"
              hint="Enter transaction name"
              lazy-rules
              style="width: 200px"
              :error="nameError"
              error-message="Name is required"
              @blur="validateName"
            />
          </div>

          <div class="flex items-center q-mt-md">
            <q-icon name="category" size="1.7em" class="q-mr-sm text-primary" />
            <span style="width: 150px" class="q-mr-xs text-h6 text-primary">Category:</span>
            <q-select
              v-model="selectedCategory"
              :options="categories"
              option-value="id"
              option-label="name"
              dense
              style="width: 200px"
              hint="Choose the category"
              dropdown-icon="arrow_drop_down"
              input-debounce="0"
              menu-style="max-height: 200px; overflow-y: auto;"
              popup-content-class="dropdown-style categories-scroll"
              behavior="menu"
              :error="categoryError"
              error-message="Category is required"
              @blur="validateCategory"
            />
          </div>

          <div class="flex items-center q-mt-md">
            <q-icon name="calendar_today" size="1.7em" class="q-mr-sm text-primary" />
            <span style="width: 150px" class="q-mr-xs text-h6 text-primary">Date:</span>
            <q-input
              v-model="creationDate"
              mask="date"
              dense
              style="width: 200px"
              color="primary"
              hint="Choose the date"
              :error="dateError"
              error-message="Date is required"
              @blur="validateDate"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="datePopup">
                    <q-date v-model="creationDate" @update:model-value="onDateSelect"/>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="flex items-center q-mt-md">
            <q-icon name="payment" size="1.7rem" class="q-mr-sm text-primary" />
            <span style="width: 150px" class="q-mr-xs text-h6 text-primary">Amount:</span>
            <q-input
              v-model="amount"
              type="number"
              dense
              style="width: 200px"
              color="primary"
              @change="handleAmountChange"
              hint="Enter the amount"
              lazy-rules
              :error="amountError"
              error-message="Amount is required and must be a number"
              @blur="validateAmount"
            />
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn style="width: 100px;" label="Cancel" color="negative" @click="closeCreateModal()"/>
          <q-btn style="margin-left: auto; width: 100px;" label="Create" color="positive" @click="createTransaction()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isDialogOpen">
      <q-card class="q-pa-lg text-center" style="width: 400px">
        <q-card-section>
          <q-icon name="cancel" size="100px" color="negative" />
          <h5 class="q-mt-md q-mb-md">Are you sure?</h5>
          <p>Do you really want to delete these records? <br/> This process cannot be undone.</p>
        </q-card-section>
        <q-card-actions class="justify-center">
          <q-btn style="width: 100px;" label="Cancel" color="grey" @click="isDialogOpen = false" />
          <q-btn style="width: 100px;" label="Delete" color="negative" @click="deleteTransaction(confirmedTransactionId)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>


<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import {fetchWithAuth} from '../utils/api';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faFilter, faPlus} from '@fortawesome/free-solid-svg-icons';

library.add(faFilter, faPlus);

const date = ref('');
const transactions = ref([]);
const filteredTransactions = ref([]);
const activeFilters = ref([]);
const categories = ref([]);
const isDialogOpen = ref(false);
const confirmedTransactionId = ref(null);
const isCreateOpen = ref(false);
const name = ref('');
const amount = ref('');
const creationDate = ref('');
const selectedCategory = ref('');
const datePopup = ref(false)
const nameError = ref(false);
const amountError = ref(false);
const dateError = ref(false);
const categoryError = ref(false);
const transactionsCount = ref(0);
const pagination = ref({
  page: 1,
  rowsPerPage: 15,
});

const customPaginationLabel = (firstRowIndex, endRowIndex) => {
  const totalRowsNumber = transactionsCount.value;
  return `Showing ${firstRowIndex} - ${endRowIndex} of ${totalRowsNumber}`;
};

watch([pagination], () => {
  console.log('Numero pagina:', pagination.value.page);
  console.log('Righe per pagina:', pagination.value.rowsPerPage);
  fetchTransactions()
}, {deep: true});

const validateName = () => {
  nameError.value = !name.value;
};

const validateAmount = () => {
  amountError.value = !amount.value;

  if(amount.value && isNaN(amount.value)) {
    amountError.value = true;
  }
};

const validateCategory = () => {
  categoryError.value = !selectedCategory.value;
};

const validateDate = () => {
  dateError.value = !creationDate.value;
};

const onDateSelect = (date) => {
  creationDate.value = date
  datePopup.value = false
}

const handleNameChange = () => {
  console.log('Name cambiato a:', name.value);
};

const handleAmountChange = () => {
  console.log('Amount cambiata a:', amount.value);
};

const filterButtonLabel = computed(() => {
  return activeFilters.value.length > 0 ? `Filters (${activeFilters.value.length})` : 'Filter';
});

const fetchTransactions = async () => {
  try {
    const params = {
      date: date.value || undefined,
      filters: activeFilters.value.length > 0 ? activeFilters.value : [],
      page: String(pagination.value.page), // Convert to string
      rowsPerPage: String(pagination.value.rowsPerPage) // Convert to string
    };

    console.log('Fetching transactions with parameters:', params);

    const queryString = Object.entries(params)
      .filter(([, value]) => value !== undefined && value.length > 0)
      .flatMap(([key, value]) =>
        Array.isArray(value)
          ? value.map(val => `${key}[]=${encodeURIComponent(val)}`)
          : [`${key}=${encodeURIComponent(value)}`]
      )
      .join('&');

    const url = `http://localhost:3000/transactions/user${queryString ? '?' + queryString : ''}`;
    console.log('Constructed URL:', url); // Log the final URL

    const response = await fetchWithAuth(url, {
      method: 'GET'
    });

    console.log('Response Status:', response.status); // Log the status code

    if (response.ok) {
      const data = await response.json();
      console.log('Fetched transactions:', data);
      if (Array.isArray(data.transactions)) {
        transactions.value = data.transactions;
        filteredTransactions.value = data.transactions;
        transactionsCount.value = data.totalCount;
      } else {
        console.log('No transactions found or incorrect response');
        filteredTransactions.value = [];
      }
    } else {
      console.error('Failed to fetch transactions:', response.statusText);
      filteredTransactions.value = [];
    }
  } catch (error) {
    console.error('Error while fetching transactions:', error);
    filteredTransactions.value = [];
  }
};


const fetchCategories = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/categories/user', {
      method: 'GET'
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Categories response:', data);

    if (data && Array.isArray(data)) {
      categories.value = [...data];
      console.log('Categories:', categories.value);
    } else {
      console.log('No categories found or incorrect response');
      categories.value = [];
    }
  } catch (error) {
    console.error('Error while fetching categories:', error);
  }
};

watch([date, activeFilters], () => {
  fetchTransactions();
}, {deep: true});

const createTransaction = async () => {
  validateName();
  validateAmount();
  validateCategory();
  validateDate();

  if (nameError.value || amountError.value || categoryError.value || dateError.value) {
    console.error('Validation Error: At least one of Name, Amount, Category, or Date is missing.');
    return;
  }

  isCreateOpen.value = false;
  const dateCreation = await correctDate(creationDate);

  try {
    const response = await fetchWithAuth('http://localhost:3000/transactions', {
      method: 'POST',
      body: JSON.stringify({
        name: name.value,
        amount: parseInt(amount.value, 10),
        categoryId: selectedCategory.value.id,
        createdAt: dateCreation,
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Transaction created successfully:', data);

    name.value = '';
    amount.value = '';
    selectedCategory.value = '';
    creationDate.value = '';

    fetchTransactions();
  } catch (error) {
    console.error('Error while creating transaction:', error);
  }
};

const correctDate = async (creationDate) => {
  const creationDateFormatted = creationDate.value;

  const [year, month, day] = creationDateFormatted.split('/');
  const formattedDate = `${year}-${month}-${day}`;

  const now = new Date();

  const options = {hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3};
  const localTimeString = now.toLocaleTimeString('en-US', options).split(' ')[0];

  return `${formattedDate}T${localTimeString}Z`;
};

const closeCreateModal = () => {
  isCreateOpen.value = false;
  name.value = '';
  amount.value = '';
  selectedCategory.value = '';
  amountError.value = false;
  nameError.value = false;
  categoryError.value = false;
  dateError.value = false;
}

const confirmDeleteTransaction = (transactionId) => {
  confirmedTransactionId.value = transactionId;
  isDialogOpen.value = true;
};

const confirmCreateTransaction = () => {
  isCreateOpen.value = true;
};

const deleteTransaction = async (transactionId) => {
  isDialogOpen.value = false;

  try {
    const response = await fetchWithAuth(`http://localhost:3000/transactions/delete/${transactionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Network response was not ok');

    transactions.value = transactions.value.filter(transaction => transaction.id !== transactionId);
    console.log('Transaction deleted successfully:', transactionId);
    fetchTransactions();
    confirmedTransactionId.value = null;
  } catch (error) {
    console.error('Error while deleting transaction:', error);
  }
};

const formattedTransactions = computed(() => {
  return filteredTransactions.value.map(transaction => ({
    ...transaction,
    createdAt: formatDate(transaction.createdAt),
    amount: formatAmount(transaction.amount)
  }));
});

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const options = {day: '2-digit', month: 'short'};
  return date.toLocaleDateString('en-GB', options); // Formato GB per avere il mese in forma breve
};

const formatAmount = (amount) => {
  return {
    value: amount >= 0 ? `+${amount}` : `${amount}`,
    class: amount >= 0 ? 'positive' : 'negative'
  };
};

const columns = [
  {name: 'date', align: 'center', label: 'Data', field: 'createdAt'},
  {name: 'name', align: 'center', label: 'Nome', field: 'name'},
  {name: 'category', align: 'center', label: 'Categoria', field: row => row.categories.name},
  {name: 'amount', align: 'center', label: 'Importo'},
  {name: 'actions', align: 'center', label: '', field: 'id'} // Nuova colonna per il pulsante
];

const toggleFilter = (filter) => {
  const index = activeFilters.value.indexOf(filter);
  if (index === -1) {
    activeFilters.value.push(filter);
  } else {
    activeFilters.value.splice(index, 1);
  }
};

onMounted(fetchTransactions);
onMounted(fetchCategories);
</script>

<style lang="scss">
.container {
  width: 100%;
}

.q-table {
  width: 100%;
}

.categories-scroll {
  max-height: 180px;
  overflow-y: scroll;
  padding-right: 10px;
  scrollbar-width: thin;
  scrollbar-color: #1F2A3C transparent;

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

.positive {
  color: #007d54;
  font-weight: bold;
}

.negative {
  color: #CA373B;
  font-weight: bold;
}
</style>
