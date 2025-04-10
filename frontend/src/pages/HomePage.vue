<template>
  <q-page class="q-px-lg q-pt-lg">
    <!-- Header Section -->
    <div class="flex justify-between">
      <div>
        <span class="text-grey text-bold">{{ actualDate }} | LunaFunds</span><br/>
        <span class="text-h4 text-bold">Hello, {{ detailsStore.name }}</span>
      </div>
      <div class="flex items-center">
        <div>
          <q-icon name="person" color="grey" size="30px" class="q-mr-md" style="cursor: pointer" @click="showModalUser"/>
          <q-tooltip anchor="top middle" self="center left">
            Your Details
          </q-tooltip>
        </div>
        <div class="notification-icon-container">
          <q-icon name="notifications" color="grey" size="30px" style="cursor: pointer" @click="showModalNotification"/>
          <q-tooltip anchor="top middle" self="center left">
            Notifications
          </q-tooltip>
          <q-badge v-if="unreadNotifications > 0" :class="badgeClass" color="red" floating>{{ formattedUnreadNotifications }}</q-badge>
        </div>
      </div>
    </div>

    <div class="q-mt-md q-pa-lg custom-card grid-container">
      <div class="text-center" v-for="button in buttons" :key="button.label">
        <q-btn round class="custom-btn" size="150%" @click="button.action">
          <q-icon :name="button.icon" :color="button.color" />
        </q-btn>
        <span class="q-mt-sm" style="font-size: 120%">{{ button.label }}</span>
      </div>
    </div>

    <div class="q-mt-lg q-px-lg flex">
      <div style="width: 50%; padding-right: 5%">
        <div class="text-h6 q-mb-sm">Recent Transactions</div>
        <div v-if="loading">
          <p>Loading transactions...</p>
        </div>
        <div v-else-if="transactions.length">
          <div
            v-for="(transaction, index) in transactions.slice(0, 6)"
            :key="transaction.id"
            class="bordered q-py-md q-pr-md q-pl-sm"
            :style="{ borderBottom: index !== transactions.slice(0, 6).length - 1 ? '1px solid #E9E9E9' : 'none' }"
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
                <strong :style="{ color: transaction.amount >= 0 ? '#00673E' : '#BE0022', fontSize: '120%' }">
                  {{ (transaction.amount).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}{{ detailsStore.currency }}</strong><br/>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex justify-center items-center" style="height: 100%">
          <div>No transactions found.</div>
        </div>
      </div>
      <div style="width: 50%; padding-left: 5%" class="custom-border-container">
        <p class="text-h6">Account Details</p>
        <div>
          <MonthlyTransactionsChart :transactions="transactions"/>
        </div>
        <p class="q-mt-xl text-bold" style="font-size: 110%">Balance Content</p>
        <div class="flex items-center justify-between">
          <div class="flex">
            <div class="flex items-center justify-center" style="background: #E9E9E9; border-radius: 50%; width: 50px; height: 50px">
              <q-icon name="swap_horiz" size="35px" color="positive" />
            </div>
            <div class="q-ml-md">
              <div>
                <span class="text-bold text-grey">Income</span><br/>
                <span class="text-bold" style="font-size: 120%">{{ totalIncomes.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}{{ detailsStore.currency }}</span>
              </div>
            </div>
          </div>
          <div style="width: 40%">
            <div class="text-center text-bold">{{ ((totalIncomes === 0 ? 0 : (Math.abs(totalIncomes) / (totalIncomes + Math.abs(totalOutcomes))) * 100)).toFixed(0) }}%</div>
            <q-linear-progress
              :value="totalIncomes === 0 ? 0 : (Math.abs(totalIncomes) / (totalIncomes - totalOutcomes))"
              track-color="#D3D3D3"
              size="15px"
              color="positive"
              style="border-radius: 15px;"
              animated
            />
          </div>
        </div>
        <div class="flex items-center justify-between q-mt-md">
          <div class="flex">
            <div class="flex items-center justify-center" style="background: #E9E9E9; border-radius: 50%; width: 50px; height: 50px">
              <q-icon name="swap_horiz" size="35px" color="negative" />
            </div>
            <div class="q-ml-md">
              <div>
                <span class="text-bold text-grey">Expense</span><br/>
                <span class="text-bold" style="font-size: 120%">{{ totalOutcomes.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}{{ detailsStore.currency }}</span>
              </div>
            </div>
          </div>
          <div style="width: 40%">
            <div class="text-center text-bold">{{ ((totalOutcomes === 0 ? 0 : (Math.abs(totalOutcomes) / (totalIncomes + Math.abs(totalOutcomes))) * 100)).toFixed(0) }}%</div>
            <q-linear-progress
              :value="totalIncomes === 0 ? 0 : (Math.abs(totalOutcomes) / (totalIncomes - totalOutcomes))"
              track-color="#D3D3D3"
              size="15px"
              color="negative"
              style="border-radius: 15px;"
              animated
            />
          </div>
        </div>
      </div>
    </div>
    <CreateTransactionModal  v-if="showTransactionModal" v-model="showTransactionModal" :categories="categories"/>
    <CreateTransferModal  v-if="showTransferModal" v-model="showTransferModal" :accounts="accounts"/>
    <CreateBankTransferModal  v-if="showBankTransferModal" v-model="showBankTransferModal"/>
    <DefaultAccountModal v-if="showDefaultModal" v-model="showDefaultModal" :accountId="detailsStore.accountID"/>
    <AccountModal v-if="showAccountModal" v-model="showAccountModal" :account="accountToEdit"/>
    <UserModal v-if="showUserModal" v-model="showUserModal"/>
    <ViewNotifications v-if="showNotificationModal" v-model="showNotificationModal"/>
    <GetReport v-if="showReportModal" v-model="showReportModal"/>
  </q-page>
</template>

<script setup lang="ts">
import {fetchWithAuth} from 'src/utils/api';
import {computed, onMounted, ref, watch} from 'vue';
import {useDetailsStore} from 'src/stores/details';
import MonthlyTransactionsChart from 'components/Charts/MonthlyTransactionsChart.vue';
import CreateTransactionModal from 'components/Modals/Transactions/CreateTransactionModal.vue';
import CreateTransferModal from 'components/Modals/Transactions/TransferModal.vue';
import CreateBankTransferModal from 'components/Modals/Transactions/BankTransferModal.vue';
import DefaultAccountModal from 'components/Modals/Accounts/DefaultAccount.vue';
import AccountModal from 'components/Modals/Accounts/AccountModal.vue';
import UserModal from 'components/Modals/Users/UserModal.vue';
import ViewNotifications from 'components/Modals/Notifications/ViewNotifications.vue';
import GetReport from 'components/Modals/Reports/GetReport.vue';
import {Notify} from 'quasar';

class Category {
    id!: number;
    name!: string;
    userId!: number;
    image!: string;
    createdAt!: Date;
    updatedAt!: Date;
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
  const totalIncomes = ref(0);
  const totalOutcomes = ref(0);
  const loading = ref(true);
  const detailsStore = useDetailsStore();
  const showTransactionModal = ref(false);
  const showNotificationModal = ref(false);
  const showTransferModal = ref(false);
  const accountToEdit = ref<Account | null>(null);
  const showBankTransferModal = ref(false);
  const showAccountModal = ref(false);
  const unreadNotifications = ref(0);
  const showDefaultModal = ref(false);
  const showReportModal = ref(false);
  const showUserModal = ref(false);
  const actualDate = new Date().toLocaleDateString(undefined, {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });

  const isDefaultAccount = computed(() => {
    console.log(accounts.value);
    const defaultAccount = accounts.value.find(account => account.default);
    return defaultAccount && defaultAccount.id === Number(detailsStore.accountID);
  });

  const fetchTransactions = async () => {
    try {
      const url = `http://localhost:3000/transactions/user/year?accountID=${detailsStore.accountID}`;
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

  const showCreateTransactionModal = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:3000/categories/user', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          categories.value = data;
          console.log(categories.value);
          showTransactionModal.value = true;
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

  const showCreateTransferModal = async () => {
    await fetchAccount();
    showTransferModal.value = true;
  };

  const showSetDefaultModal = async () => {
    if (isDefaultAccount.value) {
      return;
    } else {
      showDefaultModal.value = true;
    }

  };

  const fetchAccount = async () => {
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
    }
  };

  const showCreateBankTransferModal = () => {
    showBankTransferModal.value = true;
  };

  const showModalNotification = () => {
    showNotificationModal.value = true;
    unreadNotifications.value = 0;
  };

  const countUnreadNotifications = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:3000/users/notifications/unread', {
        method: 'GET'
      });
      if (response.ok) {
        unreadNotifications.value = await response.json();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formattedUnreadNotifications = computed(() => {
    return unreadNotifications.value > 9 ? '9+' : unreadNotifications.value;
  });

  const badgeClass = computed(() => {
    return formattedUnreadNotifications.value === '9+' ? 'badge-large' : 'badge-small';
  });

  onMounted(async () => {
    await fetchAccount();
    await fetchTransactions();
    await countUnreadNotifications();
  });

  watch(
    () => detailsStore.accountID,
    (newAccountID, oldAccountID) => {
      console.log(`Account ID changed from ${oldAccountID} to ${newAccountID}`); // Log changes
      if (newAccountID !== oldAccountID) {
        fetchTransactions();
        countUnreadNotifications();
        fetchAccount();
      }
    },
    { immediate: true } // Optional: fetch immediately if accountID is set
  );

  watch(
    () => detailsStore.changes,
    (newChanges, oldChanges) => {
      console.log(`Account ID changed from ${oldChanges} to ${newChanges}`); // Log changes
      if (newChanges !== oldChanges) {
        fetchTransactions();
        fetchAccount();
        countUnreadNotifications();
      }
    },
    { immediate: true }
  );

  const showModalAccount = () => {
    const accountId = detailsStore.accountID ? parseInt(detailsStore.accountID) : 0;
    accountToEdit.value = accounts.value.find(account => account.id === accountId) || null;
    showAccountModal.value = true;
  };

  const showModalUser = () => {
    showUserModal.value = true;
  };

  const showModalReport = () => {
    showReportModal.value = true;
  };

  const copyIbanToClipboard = () => {
    const iban = detailsStore.iban;
    if (iban) {
      navigator.clipboard.writeText(iban).then(() => {
        Notify.create({
          type: 'positive',
          message: `IBAN copied to clipboard: ${iban}`,
          color: 'positive',
        });
      }).catch(err => {
        Notify.create({
          type: 'positive',
          message: 'Failed to copy IBAN!',
          color: 'positive',
        });
        console.error('Failed to copy IBAN:', err);
      });
    } else {
      console.error('No IBAN found to copy');
    }
  };

  const buttons = computed(() => [
    { label: 'Transaction', icon: 'payments', color: 'secondary', action: showCreateTransactionModal },
    { label: 'Bank Transfer', icon: 'price_check', color: 'secondary', action: showCreateBankTransferModal },
    { label: 'Transfer', icon: 'swap_horiz', color: 'secondary', action: showCreateTransferModal },
    { label: 'Reports', icon: 'assessment', color: 'secondary', action: showModalReport },
    { label: 'Copy Iban', icon: 'content_copy', color: 'secondary', action: copyIbanToClipboard },
    {
      label: 'Default',
      icon: isDefaultAccount.value ? 'star' : 'star_outline',
      color: 'secondary',
      action: showSetDefaultModal
    },
    { label: 'Edit', icon: 'edit', color: 'secondary', action: showModalAccount }
  ]);

</script>

<style>
  .custom-card {
    border: 1px solid #E0E0E0;
    box-shadow: 0px 1.5px 3px rgba(0, 0, 0, 0.3),
    0px 5px 10px rgba(0, 0, 0, 0.1),
    inset 0 0 10px rgba(255, 255, 255, 0.5);
    border-radius: 10px;
    transition: box-shadow 0.3s ease;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .text-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .custom-btn {
    background-color: #E9E9E9;
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

  .notification-icon-container {
    position: relative;
  }

  .badge-small {
    position: absolute;
    top: -10px;
    right: -10px;
  }

  .badge-large {
    position: absolute;
    top: -10px;
    right: -15px;
  }
</style>
