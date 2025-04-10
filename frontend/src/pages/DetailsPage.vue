<template>
  <q-page class="q-px-lg q-pt-lg">
    <div class="flex justify-between items-center q-mb-lg">
      <span class="text-h4 text-bold">Monthly Transactions</span>
      <div class="flex items-center">
        <div>
          <q-btn
            round
            class="q-mr-md bg-primary"
            size="100%"
            @click="toggleCategoriesMenu"
          >
            <q-icon name="filter_list" color="secondary" />
            <q-badge v-if="selectedCategories.length > 0" class="badge" color="secondary" floating>{{ selectedCategories.length }}</q-badge>
          </q-btn>
          <q-menu
            :offset="[175, 5]"
            v-if="categoriesVisible"
            class="dropdown-menu"
            @click.self="categoriesVisible = false"
          >
            <div v-if="categories.length > 0">
              <div class="q-px-md q-pt-md q-pb-sm text-bold text-h6">Filtra per Categorie:</div>
              <div class="overflow-y-auto" style="max-height: 210px;">
                <div
                  v-for="category in categories"
                  :key="category.id"
                  class="q-pa-sm"
                >
                  <q-checkbox
                    v-model="selectedCategories"
                    :val="category.id"
                    :label="category.name"
                    color="secondary"
                  />
                </div>
              </div>
            </div>

            <div v-else>
              <div class="q-pa-md">No categories found.</div>
            </div>
          </q-menu>
          <q-tooltip anchor="bottom left" self="center left">
            Filters
          </q-tooltip>
        </div>
        <div>
          <q-btn round class="custom-btn-blue" size="100%" @click="toggleMenuAdd">
            <q-icon name="add" color="white" />
          </q-btn>
          <q-menu
            :offset="[80, 5]"
            v-if="menuVisible"
            class="dropdown-menu text-center"
            @click.self="menuVisible = false"
          >
            <div class="q-pa-md item-menu" style="width: 130px" @click="showCreateTransaction = true; menuVisible = false">Transaction</div>
            <div class="q-pa-md item-menu" style="width: 130px" @click="showCreateTransferModal">Transfer</div>
            <div class="q-pa-md item-menu" style="width: 130px" @click="showCreateBankTransfer = true; menuVisible = false">Bank Transfer</div>
          </q-menu>
          <q-tooltip anchor="bottom left" self="center left">
            Create New Transaction
          </q-tooltip>
        </div>
      </div>
    </div>

    <q-input filled v-model="searchQuery" color="secondary" input-class="text-black" label="Search Transactions..." />

    <div class="row no-wrap q-px-md overflow-auto justify-center q-mt-lg" style="scroll-snap-type: x mandatory;">
      <q-btn
        flat
        round
        dense
        icon="chevron_left"
        @click="scrollLeft"
        class="q-mr-sm"
        :disable="offset <= 0"
      />

      <div
        v-for="(month, index) in displayedMonths"
        :key="index"
        class="month-button q-pa-sm"
        :class="{
          'bg-secondary text-white': month.index === (selectedMonth),
          'text-grey': month.isFuture,
          'custom-btn-blue': month.index === (selectedMonth)
        }"
        :style="{ opacity: month.isFuture ? 0.5 : 1 }"
        @click="selectMonth(month.index)"
      >
        <div class="text-center">
          <span class="text-caption">{{ month.name.substring(0, 3) }}<br/> {{ month.year }}</span>
        </div>
      </div>

      <q-btn
        flat
        round
        dense
        icon="chevron_right"
        @click="scrollRight"
        class="q-ml-sm"
        :disable="offset + visibleMonthsCount >= months.length"
      />
    </div>

    <div class="flex">
      <div style="width: 60%; padding-right: 5%" class="q-pl-md q-mt-md">
        <div v-if="loading">
          <p>Loading transactions...</p>
        </div>
        <div v-else-if="transactions.length > 0">
          <div class="flex justify-between q-px-md" style="border-bottom: solid 2px #E9E9E9">
            <div class="flex justify-between q-pb-sm" style="width: 50%">
              <div class="text-center">
                <span class="text-grey">Total Income<br/></span>
                <span class="text-h6">{{ formatMillions(totalIncomes) }} {{ detailsStore.currency }}</span>
              </div>
              <div class="text-center">
                <span class="text-grey">Total Expense<br/></span>
                <span class="text-h6">{{ formatMillions(totalOutcomes) }} {{ detailsStore.currency }}</span>
              </div>
            </div>
            <div>
              <div class="text-center">
                <span class="text-grey">Total Net<br/></span>
                <span class="text-h6">{{ formatMillions(totalIncomes + totalOutcomes) }} {{ detailsStore.currency }}</span>
              </div>
            </div>
          </div>

          <div class="overflow-y-auto" style="max-height: 480px;">
            <div
              v-for="(transaction, index) in transactions"
              :key="transaction.id"
              class="bordered q-pa-md"
              :style="{ borderBottom: index !== transactions.length - 1 ? '1px solid #E9E9E9' : 'none', cursor: 'pointer' }"
              @click="showTransactionModal(transaction)"
            >
              <div style="color: #1F2A3C" class="flex justify-between items-center">
                <div class="flex items-center">
                  <img :src="`src/assets/img/${transaction.categories.image}`" alt="category" width="40px" style="border-radius: 10%">
                  <div class="q-ml-md">
                    <strong style="font-size: 120%">{{ transaction.name }}</strong><br/>
                    <span class="text-grey-7">{{ new Date(transaction.createdAt).toLocaleDateString('en-GB', {month: 'short', day: '2-digit'}) }}</span>
                  </div>
                </div>
                <div>
                  <strong class="q-pr-sm" :style="{ color: transaction.amount >= 0 ? '#00673E' : '#BE0022', fontSize: '120%' }">
                    {{ (transaction.amount).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}{{ detailsStore.currency }}</strong><br/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else style="height: 100%" class="flex items-center justify-center">
          <div>No transactions found.</div>
        </div>
      </div>

      <div style="width: 40%; padding-left: 5%" class="custom-border-container q-pr-md q-pt-md">
        <div class="flex items-center justify-between q-mb-sm q-mr-md">
          <div class="text-h6">Categories</div>
          <q-btn round class="custom-btn-blue" size="75%" @click="showCategoryModal(null)">
            <q-icon name="add" color="white"/>
          </q-btn>
        </div>
        <div>
          <div v-if="loading">
            <p>Loading categories...</p>
          </div>
          <div v-else-if="categories">
            <div class="overflow-y-auto" style="max-height: 240px; min-height: 240px"> <!-- Imposta l'altezza massima -->
              <div
                v-for="(category, index) in categories"
                :key="category.id"
                class="bordered q-pa-md"
                :style="{ borderBottom: index !== categories.length - 1 ? '1px solid #E9E9E9' : 'none' }"
              >
                <div style="color: #1F2A3C" class="flex justify-between items-center">
                  <div class="flex items-center">
                    <img :src="`src/assets/img/${category.image}`" alt="category" width="40px" style="border-radius: 10%">
                    <div class="q-ml-md">
                      <strong style="font-size: 120%">{{ category.name }}</strong><br/>
                      <span class="text-grey-7">{{ category.transactionCount }} Transactions</span>
                    </div>
                  </div>
                  <div>
                    <div style="position: relative; display: inline-block;">
                      <q-btn
                        v-if="!categoriesUnauthorized.includes(category.name)"
                        round
                        color="primary"
                        size="100%"
                        @click="showCategoryModal(category)">
                        <q-icon name="edit" color="secondary" />
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No categories found.</p>
          </div>
        </div>
        <p class="q-mt-md text-h6" style="font-size: 130%">Categories Content</p>
        <div style="height: 20%;">
          <CategoriesChart
            v-if="categories.length > 0"
            :balance="totalAmountCategories"
            :category="categories[0]"
          />
          <CategoriesChart
            v-if="categories.length > 0"
            :balance="totalAmountCategories"
            :category="categories[1]"
          />
        </div>
      </div>
    </div>
    <EditCategoryModal v-if="showEditCategoryModal" v-model="showEditCategoryModal" :category="selectedCategory"/>
    <EditTransactionModal v-if="showEditTransactionModal" v-model="showEditTransactionModal" :transaction="selectedTransaction" :categories="categories"/>
    <CreateTransactionModal  v-if="showCreateTransaction" v-model="showCreateTransaction" :categories="categories"/>
    <TransferModal  v-if="showCreateTransfer" v-model="showCreateTransfer" :accounts="accounts" :transfer="selectedTransfer"/>
    <CreateBankTransferModal  v-if="showCreateBankTransfer" v-model="showCreateBankTransfer" :bankTransfer="selectedBankTransfer"/>
  </q-page>
</template>


<script setup lang="ts">
import {ref, computed, onMounted, nextTick, onUnmounted, watch} from 'vue';
import {fetchWithAuth} from 'src/utils/api';
import { useDetailsStore } from 'src/stores/details';
import CategoriesChart from 'components/Charts/CategoriesChart.vue';
import EditCategoryModal from 'components/Modals/Categories/CreateEditCategoryModal.vue';
import EditTransactionModal from 'components/Modals/Transactions/EditTransactionModal.vue';
import CreateTransactionModal from 'components/Modals/Transactions/CreateTransactionModal.vue';
import TransferModal from 'components/Modals/Transactions/TransferModal.vue';
import CreateBankTransferModal from 'components/Modals/Transactions/BankTransferModal.vue';

type Month = {
  name: string;
  year: number;
  index: number;
  isFuture: boolean;
};

class Category {
  id!: number;
  name!: string;
  userId!: number;
  image!: string;
  totalAmount!: number;
  createdAt!: Date;
  updatedAt!: Date;
  transactionCount!: number;
}

class Transaction {
  id!: number;
  userId!: number;
  accountId!: number;
  name!: string;
  amount!: number;
  categoryId!: number;
  createdAt!: Date;
  updatedAt!: Date;
  transfer!: number | null;
  bankTransfer!: number | null;
  categories!: Category;
}

class Account {
  id!: number;
  name!: string;
  totalAmount!: number;
  default!: boolean;
}

const transactions = ref<Transaction[]>([]);
const categories = ref<Category[]>([]);
const accounts = ref<Account[]>([]);
const totalAmountCategories = ref(0);
const totalIncomes = ref(0);
const showCreateTransaction = ref(false);
const showCreateTransfer = ref(false);
const showCreateBankTransfer = ref(false);
const totalOutcomes = ref(0);
const searchQuery = ref('');
const loading = ref(true);
const detailsStore = useDetailsStore();
const menuVisible = ref(false);
const categoriesVisible = ref(false);
const selectedCategories = ref<number[]>([]);
const showEditCategoryModal = ref(false);
const selectedCategory = ref<Category | null>(null);
const showEditTransactionModal = ref(false);
const selectedTransaction = ref<Transaction | null>(null);
const selectedTransfer = ref<Transaction | null>(null);
const selectedBankTransfer = ref<Transaction | null>(null);
const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();
const startYear = ref(2024);
const startMonth = ref(8);
const selectedMonth = ref(0);
const months = ref<Month[]>([]);
const monthButtonWidth = 70;
const visibleMonthsCount = ref(0);
const offset = ref(0);
const categoriesUnauthorized = ['Transfer', 'Bank Transfer', 'Group', 'Crypto'];

const showCategoryModal = (category: Category | null) => {
  showEditCategoryModal.value = true;
  selectedCategory.value = category;
};

const showTransactionModal = async (transaction: Transaction) => {
  if(transaction.transfer !== null) {
    selectedTransfer.value = transaction;
    await fetchAccounts();
    return
  } else if (transaction.bankTransfer !== null) {
    selectedBankTransfer.value = transaction;
    showCreateBankTransfer.value = true;
    return
  } else {
    showEditTransactionModal.value = true;
    selectedTransaction.value = transaction;
  }
};

watch([startMonth, startYear, visibleMonthsCount], () => {
  months.value = [];
  for (let year = startYear.value; year <= currentYear; year++) {
    for (let month = year === startYear.value ? startMonth.value : 1; month <= 12; month++) {
      if (year === currentYear && month > currentMonth + 1) break;
      months.value.push({
        name: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        year,
        index: months.value.length,
        isFuture: year === currentYear && month > currentMonth + 1
      });
    }
  }

  while (months.value.length < (visibleMonthsCount.value - offset.value)) {
    startMonth.value--; // Riduci il mese di inizio
    if (startMonth.value < 0) { // Se il mese di inizio scende sotto gennaio, riduci anche l'anno
      startMonth.value = 11; // Torna a dicembre
      startYear.value--; // Riduci l'anno
    }

    // Ricostruisci i mesi con il nuovo startMonth
    months.value = [];
    for (let year = startYear.value; year <= currentYear; year++) {
      for (let month = year === startYear.value ? startMonth.value : 1; month <= 12; month++) {
        if (year === currentYear && month > currentMonth + 1) break;
        months.value.push({
          name: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
          year,
          index: months.value.length,
          isFuture: year === currentYear && month > currentMonth + 1
        });
      }
    }
  }

  selectedMonth.value = months.value.length - 1;
});

const showCreateTransferModal = async () => {
  await fetchAccounts();
  showCreateTransfer.value = true;
};

const fetchAccounts = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/accounts/user', {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        accounts.value = data;
        console.log('Fetched accounts:', accounts.value);
      } else {
        console.error('No accounts found or incorrect response format');
      }
    } else {
      console.error('Failed to fetch accounts:', response.statusText);
    }
  } catch (error) {
    console.error('Error while fetching accounts:', error);
  } finally {
    showCreateTransfer.value = true;
  }
}

const formatMillions = (num: number) => {
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M'; // Abbreviate millions
  } else if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'k'; // Abbreviate millions
  }
  return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Format smaller numbers to two decimal places
};

const updateVisibleMonthsCount = () => {
  const container = document.querySelector('.overflow-auto');
  const additionalPadding = 100;
  const availableWidth = container ? container.clientWidth : window.innerWidth; // Use container's width
  const finalWidth = availableWidth - additionalPadding;
  visibleMonthsCount.value = Math.floor(finalWidth / monthButtonWidth);
  offset.value = Math.max(0, months.value.length - visibleMonthsCount.value);
};

const displayedMonths = computed(() => {
  return months.value.slice(offset.value, offset.value + visibleMonthsCount.value);
});

const selectMonth = (monthIndex: number) => {
  selectedMonth.value = monthIndex;
  console.log(`Mese selezionato: ${months.value[monthIndex].name} ${months.value[monthIndex].year}`);
};

const scrollLeft = () => {
  if (offset.value > 0) offset.value -= 1;
};

const scrollRight = () => {
  if (offset.value + visibleMonthsCount.value < months.value.length) offset.value += 1;
};

onMounted(async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/accounts/creation?accountID=${detailsStore.accountID}`, { method: 'GET' });
    if (response.ok) {
      const data = await response.text();
      const [month, year] = data.split('/');
      startMonth.value = parseInt(month, 10) - 1; // Convert month to 0-based index
      startYear.value = parseInt(year, 10);
      fetchCategories();
      updateVisibleMonthsCount();
      console.log(`Account creation date: ${startMonth.value}/${startYear.value}`);

      nextTick(() => {
        const container = document.querySelector('.overflow-auto');
        if (container) {
          container.scrollTo({
            left: monthButtonWidth * selectedMonth.value,
            behavior: 'smooth'
          });
        }
      });
    } else {
      console.error('Failed to fetch creation account date:', response.statusText);
    }
  } catch (error) {
    console.error('Error while fetching creation account date:', error);
  }
});

const fetchTransactions = async () => {
  try {
    if (months.value.length === 0) {
      console.error('Months array is empty');
      return;
    }

    if (selectedMonth.value >= months.value.length) {
      console.error('Selected month index is out of bounds');
      return;
    }

    const selectedMonthData = months.value[selectedMonth.value];
    console.log('Selected month data:', selectedMonthData);

    const params = new URLSearchParams({
      accountID: detailsStore.accountID ?? '0',
      searchQuery: searchQuery.value ?? '',
      categories: selectedCategories.value.join(',') || '',
      month: String(`${selectedMonthData.name}${selectedMonthData.year}`)
    });

    const url = `http://localhost:3000/transactions/user?${params.toString()}`;

    const response = await fetchWithAuth(url, { method: 'GET' });

    if (response.ok) {
      const data = await response.json();
      transactions.value = Array.isArray(data) ? data : [];

      totalIncomes.value = transactions.value
        .filter(transaction => transaction.amount > 0)
        .reduce((acc, transaction) => acc + transaction.amount, 0);

      totalOutcomes.value = transactions.value
        .filter(transaction => transaction.amount < 0)
        .reduce((acc, transaction) => acc + transaction.amount, 0);
    } else {
      console.error('Failed to fetch transactions:', response.statusText);
    }
  } catch (error) {
    console.error('Error while fetching transactions:', error);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/categories/user/transactions?accountID=${detailsStore.accountID}`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        totalAmountCategories.value = 0;
        categories.value = data;
        categories.value.forEach((category: { totalAmount: number }) => {
          totalAmountCategories.value += Math.abs(category.totalAmount);
        });
      } else {
        console.error('No categories found or incorrect response format');
      }
    } else {
      console.error('Failed to fetch categories:', response.statusText);
    }
  } catch (error) {
    console.error('Error while fetching categories:', error);
  }
};

watch(
  () => detailsStore.accountID,
  async (newAccountID, oldAccountID) => {
    console.log(`Account ID changed from ${oldAccountID} to ${newAccountID}`);
    if (months.value.length === 0) {
      console.warn('Months array is empty, skipping fetchTransactions');
      return;
    }
    if (selectedMonth.value >= months.value.length) {
      console.warn('Selected month is invalid, skipping fetchTransactions');
      return;
    }
    await fetchTransactions();
    await fetchCategories();
  },
  { immediate: true }
);


watch(
  () => detailsStore.changes,
  async (newChanges, oldChanges) => {
    console.log(`Changes detected: ${oldChanges} -> ${newChanges}`);
    if (months.value.length === 0) {
      console.warn('Months array is empty, skipping fetchTransactions');
      return;
    }
    if (selectedMonth.value >= months.value.length) {
      console.warn('Selected month is invalid, skipping fetchTransactions');
      return;
    }
    await fetchTransactions();
    await fetchCategories();
  },
  { immediate: true }
);

watch(
  [searchQuery, selectedMonth, selectedCategories], // Array delle variabili da monitorare
  () => {
    fetchTransactions(); // Chiama fetch quando una delle variabili cambia
  }
);

watch(() => showCreateTransfer.value, (newValue) => {
  if (!newValue) {
    selectedTransfer.value = null;
  }
});


watch(() => showCreateBankTransfer.value, (newValue) => {
  if (!newValue) {
    selectedBankTransfer.value = null;
  }
});

window.addEventListener('resize', updateVisibleMonthsCount);
onUnmounted(() => {
  window.removeEventListener('resize', updateVisibleMonthsCount);
  fetchTransactions();
  fetchCategories();
});

const toggleMenuAdd = () => {
  categoriesVisible.value = false;
  menuVisible.value = true;
};

const toggleCategoriesMenu = () => {
  menuVisible.value = false;
  categoriesVisible.value = true;
};
</script>


<style scoped>
.overflow-y-auto {
  overflow-y: auto; /* Abilita lo scorrimento verticale */
}

.bordered {
  border-radius: 8px; /* Aggiungi un bordo arrotondato per migliorare l'aspetto */
  background-color: white; /* Colore di sfondo per i contenitori delle transazioni e categorie */
}

.overflow-auto {
  display: flex;
  align-items: center;
  scroll-snap-type: x mandatory;
  overflow-x: auto;
  scrollbar-width: none; /* Nascondi scrollbar per Firefox */
  -ms-overflow-style: none; /* Nascondi scrollbar per IE e Edge */
}

.overflow-auto::-webkit-scrollbar {
  display: none; /* Nascondi scrollbar per Chrome, Safari e Opera */
}

.month-button {
  width: 70px; /* Keep this width */
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  scroll-snap-align: center;
  cursor: pointer;
}

.text-grey {
  color: #C0C0C0;
}

.custom-border-container {
  position: relative;
}
.custom-border-container::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10%; /* Start 10% down from the top */
  height: 80%; /* Set the border height to 80% */
  border-left: solid 2px #E9E9E9; /* Border color and style */
}
.custom-btn-blue {
  background-color: #0549B7;
}

.item-menu {
  cursor: pointer;
}

.item-menu:hover {
  background-color: #E9E9E9;
}

.badge {
  position: absolute;
  top: -7px;
  right: -7px;
}
</style>
