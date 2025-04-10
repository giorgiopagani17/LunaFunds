<template>
  <q-layout view="hHh lpR lpL fFf" class="layout-container">
    <div class="drawer-buttons fixed-top q-ma-md">
      <!-- Button to toggle the right drawer for widths below 1200px -->
      <q-btn
        v-show="isBelow1200"
        color="primary"
        @click="toggleRightDrawer"
        label="Toggle Right Drawer"
        class="q-mr-sm"
      />

      <!-- Button to toggle left drawer for widths below 600px -->
      <q-btn
        v-show="isBelow600"
        color="primary"
        @click="toggleLeftDrawer"
        label="Toggle Left Drawer"
      />
    </div>

    <!-- Left Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      :show-if-above="!isBelow600"
      :width="100"
      :breakpoint="500"
      class="bg-primary narrow-drawer drawer-fixed"
      :behavior="isBelow600 ? 'mobile' : 'desktop'"
      elevated
    >
      <span style="color:#0649b8; position: absolute; font-size: 200%; font-weight: bold; text-align: center; width: 100%;" class="q-mt-md">LF</span>
      <div class="drawer-container">
        <q-list class="flex flex-column align-center justify-center">
          <q-item
            v-for="(link, index) in linksList"
            :key="link.link"
            :to="link.link"
            clickable
            v-ripple
            :class="{'bg-secondary text-white op': activeItemIndex === index}"
            class="q-mt-md"
          style="border-radius: 10px; width: 80px; height: 80px"
          @click="setActiveItem(index)"
          >
          <q-item-section class="icon-center text-center">
            <q-icon :name="link.icon" :color="activeItemIndex === index ? 'white' : 'secondary'" size="24px" />
            {{ link.title }}
          </q-item-section>
          <q-tooltip anchor="center right" self="center left">
            {{ link.caption }}
          </q-tooltip>
          </q-item>
        </q-list>
        <q-icon name="logout" style="color:#0649b8; position: absolute; cursor: pointer; font-size: 200%; text-align: center; width: 100%; bottom: 0" class="q-mb-lg" @click="handleLogout"/>
      </div>
    </q-drawer>

    <!-- Right Drawer -->
    <q-drawer
      v-model="rightDrawerOpen"
      :show-if-above="!isBelow1200"
      :width="350"
      :breakpoint="500"
      side="right"
      class="bg-primary narrow-drawer drawer-fixed"
      :behavior="isBelow1200 ? 'mobile' : 'desktop'"
      elevated
    >
      <div class="q-pa-md drawer-container">
        <div class="flex justify-between q-pa-lg account-container items-center" style="height: 15%">
          <div v-if="loading">Loading...</div>
          <div v-else>
            <div>{{ selectedAccount ? selectedAccount.name : 'N/A' }} Balance</div>
            <div style="font-size: 200%; font-weight: bold">
              <span>
                {{ selectedAccount ? formatMillions(selectedAccount.totalAmount) : 'N/A' }} {{ detailsStore.currency }}
              </span>
            </div>
          </div>
          <div>
            <q-tooltip anchor="bottom left" self="center left">
              Show other accounts
            </q-tooltip>
            <q-btn-dropdown
              color="white"
              text-color="white"
              size="20px"
              style="border-radius: 10px"
              no-caps
              no-wrap
              flat
              content-class="bg-white text-white"
              v-model="menuVisible"
            >
              <q-list>
                <q-item
                  v-for="account in otherAccounts"
                  :key="account.id"
                  clickable
                  @click="selectAccount(account); menuVisible = false"
                >
                  <q-item-section>
                    <div class="q-pa-lg account-container" style="opacity: 80%; width: 225px">
                      <div>{{ account ? account.name : 'N/A' }} Balance</div>
                      <div style="font-size: 200%; font-weight: bold">
                        <div>
                          {{ account ? formatMillions(account.totalAmount) : 'N/A' }} {{ detailsStore.currency }}
                        </div>
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
                <q-item v-if="accounts.length < 3">
                  <q-item-section style="width: 225px; cursor: pointer;" @click="menuVisible = false; showAccountModal = true">
                    <div class="flex justify-between q-pa-md create-account-container text-secondary items-center text-center" style="height: 100px; opacity: 80%">
                      <div style="font-size: 130%; font-weight: bold">Create New Account</div>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
        <div class="q-mt-lg q-pa-sm custom-card q-pt-lg">
          <Last5TransactionsChart />
        </div>
        <div class="custom-card q-mt-lg" style="height: 15%">
          <div v-if="budget.length>0" class="flex items-center justify-center" style="height: 100%; cursor: pointer" @click="showCreateModal('budget', budget[0])">
            <BudgetGoalChart
              :data-type="'Budget'"
              :data="budget[0]"/>
          </div>
          <div v-else class="flex items-center justify-center" style="height: 100%">
            <q-btn round color="secondary" size="100%" class="q-mr-md" @click="showCreateModal('budget', null)">
              <q-icon name="add" color="white" />
            </q-btn>
            <div class="text-secondary text-bold">
              CREATE A NEW BUDGET
            </div>
          </div>
        </div>
        <div class="custom-card q-mt-lg" style="height: 15%">
          <div v-if="goal.length>0" class="flex items-center justify-center" style="height: 100%; cursor: pointer" @click="showCreateModal('goal', goal[0])">
            <BudgetGoalChart
              :data-type="'Goal'"
              :data="goal[0]"/>
          </div>
          <div v-else class="flex items-center justify-center" style="height: 100%">
            <q-btn round color="secondary" size="100%" class="q-mr-md" @click="showCreateModal('goal', null)">
              <q-icon name="add" color="white" />
            </q-btn>
            <div class="text-secondary text-bold">
              CREATE A NEW GOAL
            </div>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="content-container">
      <router-view />
    </q-page-container>

    <BudgetGoalModal v-if="showCreateBudgetGoalModal" v-model="showCreateBudgetGoalModal" :type="typeBudgetGoal" :data="budgetGoal"/>
    <AccountModal v-if="showAccountModal" v-model="showAccountModal" />
  </q-layout>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {EssentialLinkProps} from 'components/EssentialLink.vue';
import {fetchWithAuth} from 'src/utils/api';
import Last5TransactionsChart from 'components/Charts/Last5TransactionsChart.vue';
import {useDetailsStore} from 'src/stores/details';
import BudgetGoalChart from 'components/Charts/BudgetGoalChart.vue';
import BudgetGoalModal from 'components/Modals/BudgetGoal/CreateEditBudgetGoal.vue';
import AccountModal from 'components/Modals/Accounts/AccountModal.vue';

interface Account {
  id: number;
  name: string;
  totalAmount: number;
  default: boolean;
}

interface BudgetGoalData {
  id?: number;
  userId?: number;
  categoryId?: number;
  accountID?: number;
  image?: string;
  name?: string;
  amount?: number;
  timeline?: string; // Update to string
  createdAt?: Date;
  transactionSum?: number;
}

const accounts = ref<Account[]>([]);
const selectedAccount = ref<Account | null>(null);
const detailsStore = useDetailsStore();
const leftDrawerOpen = ref(window.innerWidth >= 600);
const rightDrawerOpen = ref(window.innerWidth >= 1200);
const loading = ref(true);
const menuVisible = ref(false);
const showAccountModal = ref(false);
const windowWidth = ref(window.innerWidth);
const goal = ref<BudgetGoalData[]>([]);
const budget = ref<BudgetGoalData[]>([]);
const showCreateBudgetGoalModal = ref(false);
const typeBudgetGoal = ref('');
const route = useRoute();
const budgetGoal = ref<BudgetGoalData | null>(null);

const linksList: EssentialLinkProps[] = [
  { title: 'Home', caption: 'Dashboard', icon: 'home', link: '/home' },
  { title: 'Finance', caption: 'Transactions', icon: 'credit_card', link: '/details' },
  { title: 'Groups', caption: 'Shared Expenses', icon: 'group', link: '/groups' },
  { title: 'Crypto', caption: 'Investments', icon: 'currency_bitcoin', link: '/crypto' },
];

const activeItemIndex = ref<number>(linksList.findIndex(link => link.link === route.path));

const showCreateModal = (type: string, data: BudgetGoalData | null = null) => {
  if (data) {
    budgetGoal.value = data;
  } else {
    budgetGoal.value = null;
  }
  showCreateBudgetGoalModal.value = true;
  typeBudgetGoal.value = type;
};

const updateActiveItemFromRoute = async () => {
  await nextTick(); // Wait for the DOM to update
  const routePath = route.path;
  activeItemIndex.value = linksList.findIndex(link => link.link === routePath);
};

const formatMillions = (num: number) => {
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'; // Abbreviate millions
  }
  return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Format smaller numbers to two decimal places
};

// Funzione per selezionare l'account
const selectAccount = (account: Account) => {
  selectedAccount.value = account;
  menuVisible.value = false;
  detailsStore.setAccountID(account.id.toString());

  fetchBudgets();
  fetchGoals();
};

const fetchAccounts = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/accounts/user', { method: 'GET' });
    const responseData = await response.json();
    if (response.ok && Array.isArray(responseData)) {
      accounts.value = responseData;
      if (detailsStore.accountID && detailsStore.accountID !== '0000') {
        selectedAccount.value = accounts.value.find(account => account.id === parseInt(detailsStore.accountID || '0')) || accounts.value[0] || null;
      } else {
        selectedAccount.value = accounts.value.find(account => account.default) || accounts.value[0] || null;
        detailsStore.setAccountID((selectedAccount.value?.id).toString() || '');
      }
    } else {
      console.error('Failed to fetch accounts:', responseData);
    }
  } catch (error) {
    console.error('Error while fetching accounts:', error);
  } finally {
    loading.value = false;
  }
};

const fetchBudgets = async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/budgets/user/${detailsStore.accountID}`, { method: 'GET' });
    const responseData = await response.json();
    if (response.ok && Array.isArray(responseData)) {
      budget.value = responseData;
    } else {
      console.error('Failed to fetch accounts:', responseData);
    }
  } catch (error) {
    console.error('Error while fetching accounts:', error);
  }
};

const fetchGoals = async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/goals/user/${detailsStore.accountID}`, { method: 'GET' });
    const responseData = await response.json();
    if (response.ok && Array.isArray(responseData)) {
      goal.value=responseData;
    } else {
      console.error('Failed to fetch goals:', responseData);
    }
  } catch (error) {
    console.error('Error while fetching goals:', error);
  }
};

const otherAccounts = computed(() => accounts.value.filter(account => account !== selectedAccount.value));

const setActiveItem = (index: number) => {
  activeItemIndex.value = index;
};

const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
};

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const isBelow1200 = computed(() => windowWidth.value < 1200);
const isBelow600 = computed(() => windowWidth.value < 600);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;

  if (windowWidth.value >= 1200) {
    rightDrawerOpen.value = true;
  }
  if (windowWidth.value >= 600) {
    leftDrawerOpen.value = true;
  }
};

watch(
  () => detailsStore.changes,
  (newChanges, oldChanges) => {
    console.log(`Account ID changed from ${oldChanges} to ${newChanges}`); // Log changes
    if (newChanges !== oldChanges) {
      fetchAccounts();
      fetchBudgets();
      fetchGoals();
    }
  },
  { immediate: true }
);

watch(
  () => detailsStore.accountID,
  (newAccount, oldAccount) => {
    console.log(`Account ID changed from ${oldAccount} to ${newAccount}`); // Log changes
    if (newAccount !== oldAccount) {
      fetchAccounts();
      fetchBudgets();
      fetchGoals();
    }
  },
  { immediate: true }
);

watch(
  () => route.path,
  () => {
    updateActiveItemFromRoute();
  }
);

onMounted(() => {
  updateActiveItemFromRoute(); // Imposta l'elemento attivo al caricamento iniziale
  updateWindowWidth();
  window.addEventListener('resize', updateWindowWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
});

defineOptions({
  name: 'MainLayout'
});

function handleLogout() {
  localStorage.clear();
  console.log('User logged out');
  window.location.href = 'http://localhost:9000/#';
}

</script>

<style scoped>
.layout-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
}

.content-container {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

.drawer-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.drawer-fixed {
  position: fixed !important;
  height: 100vh;
  z-index: 1000;
}

.drawer-buttons {
  z-index: 2000;
}

.account-container {
  padding-left: 10%;
  padding-right: 10%;
  background-image: url('https://static.vecteezy.com/ti/vettori-gratis/p1/4651594-blu-linee-sfondo-sfumato-vettoriale.jpg');
  background-size: cover;
  color: white;
  border-radius: 15px;
}

.create-account-container {
  padding-left: 10%;
  padding-right: 10%;
  color: white;
  border-radius: 15px;
  border: 3px dashed #0549B5;
}

.custom-card {
  border: 1px solid #E0E0E0;
  box-shadow: 0px 1.5px 3px rgba(0, 0, 0, 0.3),
  0px 5px 10px rgba(0, 0, 0, 0.1),
  inset 0 0 10px rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  transition: box-shadow 0.3s ease;
  background: white;
}

/* Aggiungi queste regole per centrare le icone */
.icon-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  text-align: center;
}
</style>
