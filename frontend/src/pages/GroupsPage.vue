<template>
  <q-page class="q-px-lg q-pt-lg">
    <div v-if="!loading && useDetailsStore().groupID === '00000'" style="height: 97vh" class="flex justify-center items-center q-pb-lg">
      <div class="text-center q-mb-xl">
        <q-icon name="groups" size="10rem" color="secondary" />
        <p class="text-h4 text-bold text-secondary">You aren't part of any Group</p>
        <p class="text-h6 text-bold text-grey">create a new group or accept an invitation to access this feature</p>
      </div>
    </div>
    <div v-else class="flex justify-between items-center q-mb-lg">
      <span class="text-h4 text-bold">Groups Expenses</span>
      <div>
        <q-btn v-if="currentUser && currentUser.isBoss" round class="q-mr-md" size="100%" @click="openEditGroupModal">
          <q-icon name="edit" color="secondary" />
          <q-tooltip anchor="bottom left" self="center left">
            Edit
          </q-tooltip>
        </q-btn>
        <q-btn v-else round class="q-mr-md" size="100%" @click="showLeaveGroupModal= true">
          <q-icon name="logout" color="secondary" />
          <q-tooltip anchor="bottom left" self="center left">
            Leave
          </q-tooltip>
        </q-btn>
        <q-btn round class="custom-btn-blue" size="100%" @click="showCreateTransactionModal = true">
          <q-icon name="add" color="white" />
          <q-tooltip anchor="bottom left" self="center left">
            Create New Transaction
          </q-tooltip>
        </q-btn>
      </div>
    </div>
    <q-input filled v-model="searchQuery" color="secondary" label="Search Group Transactions..." />

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
        v-for="(user) in displayedUsers"
        :key="user.id"
        class="user-button q-pa-sm q-px-md"
        :class="{
          'bg-secondary text-white': user.id === selectedUser,
        }"
        style="opacity: 1"
        @click="selectUser(user.id)"
      >
        <div class="text-center">
          <span class="text-caption">{{ user.name }}</span>
        </div>
      </div>

      <q-btn
        flat
        round
        dense
        icon="chevron_right"
        @click="scrollRight"
        class="q-ml-sm"
        :disable="offset + visibleUsersCount >= users.length"
      />
    </div>
    <div class="flex q-mt-sm">
      <div style="width: 60%; padding-right: 5%" class="q-pl-md q-mt-md">
        <div v-if="loading">
          <p>Loading transactions...</p>
        </div>
        <div v-else-if="transactions.length > 0">
          <div class="flex justify-between q-px-md" style="border-bottom: solid 2px #E9E9E9">
            <div class="flex justify-between q-pb-sm" style="width: 50%">
              <div class="text-center">
                <span class="text-grey">Transactions:<br/></span>
                <span class="text-h6">{{ transactions.length }}</span>
              </div>
            </div>
            <div>
              <div class="text-center">
                <span class="text-grey">Total Net<br/></span>
                <span class="text-h6">{{ (totalOutcomes).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}{{ detailsStore.groupCurrency }}</span>
              </div>
            </div>
          </div>

          <div class="overflow-y-auto" style="max-height: 460px;">
            <div
              v-for="(transaction, index) in transactions"
              :key="transaction.id"
              class="bordered q-pa-md"
              :style="{ borderBottom: index !== transactions.length - 1 ? '1px solid #E9E9E9' : 'none', cursor: 'pointer' }"
              @click="showTransactionDetails(transaction)"
            >
              <div style="color: #1F2A3C" class="flex justify-between items-center">
                <div class="flex items-center">
                  <div class="flex items-center justify-center text-white text-bold" :style="{ background: transaction.users.userGroup?.[0]?.color || '#0549B5' }" style="width:40px; height:40px; border-radius: 10%; font-size: 140%">{{ getUserInitials(transaction.users.name) }}</div>
                  <div class="q-ml-md">
                    <strong style="font-size: 120%">{{ transaction.name }}</strong><br/>
                    <span class="text-grey-7">{{ new Date(transaction.createdAt).toLocaleDateString('en-GB', {month: 'short', day: '2-digit'}) }}</span>
                  </div>
                </div>
                <div>
                  <strong class="q-pr-sm" :style="{ color: transaction.amount >= 0 ? '#00673E' : '#BE0022', fontSize: '120%' }">
                    {{ (transaction.amount).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}{{ detailsStore.groupCurrency }}</strong><br/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else style="height: 100%" class="flex items-center justify-center">
          <p>No transactions found.</p>
        </div>
      </div>
      <div style="width: 40%; padding-left: 5%" class="custom-border-container q-pr-md q-pt-md">
        <div class="flex items-center justify-between q-mb-sm">
          <div class="text-h6">Members Balance</div>
          <q-btn v-if="currentUser && currentUser.isBoss && users.length > 2" class="custom-btn-blue" size="80%" @click="showInviteModal = true">
            <span class="text-white text-bold">invite</span>
          </q-btn>
        </div>
        <div v-if="loading">
          <p>Loading categories...</p>
        </div>
        <div v-else-if="users">
          <div v-if="users.length > 2" class="overflow-y-auto" style="max-height: 270px; min-height: 270px">
            <div
              v-for="(user, index) in users.filter(user => user.name !== 'All Users' && !user.isMine)"
              :key="user.id"
              class="bordered q-pa-md"
              :style="{ borderBottom: index !== users.length - 3 ? '1px solid #E9E9E9' : 'none'}"
            >
              <div style="color: #1F2A3C" class="flex justify-between items-center">
                <div class="flex items-center">
                  <div>
                    <strong style="font-size: 120%">{{ user.name }}</strong><br/>
                  </div>
                </div>
                <div>
                  <strong class="q-pr-sm" :style="{ color: (averageAmount - user.totalAmount) >= 0 ? '#00673E' : '#BE0022', fontSize: '120%' }">
                    {{ (averageAmount - user.totalAmount).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}{{ detailsStore.groupCurrency }}
                  </strong><br/>
                </div>
              </div>
              <q-linear-progress
                :value="isNaN(Math.abs(user.totalAmount) / Math.abs(totalAmount)) ? 0 : (Math.abs(user.totalAmount) / Math.abs(totalAmount))"
                track-color="#D3D3D3"
                size="15px"
                class="q-mt-md"
                color="secondary"
                style="border-radius: 15px; position: relative;"
                animated
              >
                <div
                  class="text-white"
                  style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); color: black; font-weight: bold; font-size: 70% "
                >
                  {{ (isNaN(Math.abs(user.totalAmount) / Math.abs(totalAmount)) ? 0 : (Math.abs(user.totalAmount) / Math.abs(totalAmount))*100).toFixed(0) }}%
                </div>
              </q-linear-progress>
            </div>
          </div>
          <div v-else class="flex items-center justify-center" style="height: 270px">
            <q-btn color="secondary" size="100%" @click="showInviteModal = true">
              <span class="text-white text-bold">
                INVITE MEMBERS
              </span>
            </q-btn>
          </div>
        </div>
        <p class="q-mt-md text-h6" style="font-size: 130%">Group Actions</p>
          <div class="q-mt-md">
            <div>
              <q-btn
                color="secondary"
                :disable="isCurrentUserPayGroup"
                @click="showPayGroupModal = true"
              >
                Pay Members {{ numberUsersVotes }}/{{ users.length - 1 }}
              </q-btn>
            </div>
            <div class="text-bold q-mt-md">All users must vote before proceeding <br/> with the payment!</div>
            <div class="text-grey text-bold q-mt-sm">Payment will be done with Bank Transfer</div>
        </div>
      </div>
    </div>
    <ConfirmPayGroup v-if="showPayGroupModal" v-model="showPayGroupModal" @confirmed="handleConfirmed" />
    <ConfirmLeaveGroup v-if="showLeaveGroupModal" v-model="showLeaveGroupModal" />
    <EditGroupModal v-if="showEditGroupModal && users.length > 0" v-model="showEditGroupModal" :users="users" />
    <CreateGroupTransaction v-if="showCreateTransactionModal" v-model="showCreateTransactionModal" :transaction="selectedTransaction" :userId="currentUser?.id"/>
    <InviteMember v-if="showInviteModal" v-model="showInviteModal" />
  </q-page>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'src/stores/details';
import ConfirmPayGroup from 'components/Modals/Groups/ConfirmPayGroup.vue';
import ConfirmLeaveGroup from 'components/Modals/Groups/ConfirmLeaveGroup.vue';
import EditGroupModal from 'components/Modals/Groups/EditGroupModal.vue';
import CreateGroupTransaction from 'components/Modals/Groups/GroupTransaction.vue';
import InviteMember from 'components/Modals/Groups/InviteMember.vue';

class UserGroup {
  color!: string;
}

class User {
  name!: string;
  id!: number;
  totalAmount!: number;
  isMine!: boolean;
  payGroup!: boolean;
  isBoss!: boolean;
  userGroup?: UserGroup[];
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

const users = ref<User[]>([]);
const searchQuery = ref('');
const selectedUser = ref<number>(0); // Keep track of selected user
const offset = ref(0); // To control the visible users
const visibleUsersCount = ref(0); // To hold the number of visible users
const userButtonWidth = 100; // Set the width of each user button (similar to your month button width)
const totalOutcomes = ref(0);
const loading = ref(true);
const totalAmount = ref(0);
const transactions = ref<Transaction[]>([]);
const detailsStore = useDetailsStore();
const numberUsersVotes = ref(0);
const showCreateTransactionModal = ref(false);
const currentUser = ref<User | undefined>(undefined);
const showPayGroupModal = ref(false);
const showLeaveGroupModal = ref(false);
const showEditGroupModal = ref(false);
const showInviteModal = ref(false);
const selectedTransaction = ref<Transaction | null>(null);

console.log(detailsStore.groupID);

const openEditGroupModal = () => {
  if (users.value.length > 0) {
    showEditGroupModal.value = true;
    console.log(users.value);
  } else {
    console.error('Users not loaded yet.');
  }
};

const showTransactionDetails = (transaction: Transaction) => {
  selectedTransaction.value = transaction;
  showCreateTransactionModal.value = true;
};

// Update the visible users count
const updateVisibleUsersCount = () => {
  const container = document.querySelector('.overflow-auto');
  const additionalPadding = 100;
  const availableWidth = container ? container.clientWidth : window.innerWidth; // Use container's width
  const finalWidth = availableWidth - additionalPadding;
  visibleUsersCount.value = Math.floor(finalWidth / userButtonWidth);
  offset.value = Math.max(0, users.value.length - visibleUsersCount.value);
};

const averageAmount = computed(() => {
  return users.value.length > 0 ? totalAmount.value / (users.value.length - 1) : 0;
});

// Define the displayed users based on the offset and visible count
const displayedUsers = computed(() => {
  return users.value
    .filter(user =>
      user.name.toLowerCase()
    )
    .slice(offset.value, offset.value + visibleUsersCount.value);
});

const getUserInitials = (name: string) => {
  const initials = name.split(' ').map(n => n[0]).join('');
  return initials.toUpperCase();
};

// Handle scrolling left
const scrollLeft = () => {
  if (offset.value > 0) offset.value -= 1;
};

// Handle scrolling right
const scrollRight = () => {
  if (offset.value + visibleUsersCount.value < users.value.length) offset.value += 1;
};

// Handle user selection
const selectUser = (userId: number) => {
  selectedUser.value = userId;
  console.log(`User selected: ${userId}`);
};

const isCurrentUserPayGroup = computed(() => {
  return currentUser.value ? currentUser.value.payGroup : false;
});

// Fetch users from the API
const fetchUsers = async (groupID: number) => {
  numberUsersVotes.value = 0;
  try {
    const response = await fetchWithAuth(`http://localhost:3000/groups/getusers/${groupID}`, { method: 'GET' });
    if (response.ok) {
      users.value = await response.json();
      users.value.push({ name: 'All Users', id: 0, totalAmount: 0, isMine: false, isBoss: false, payGroup: false }); // Add a default user
      users.value.forEach((user) => {
        totalAmount.value += user.totalAmount;
        if(user.payGroup){
          numberUsersVotes.value += 1;
        }
      });
      currentUser.value = users.value.find(user => user.isMine);
      updateVisibleUsersCount(); // Update the visible users count when users are fetched
    } else {
      console.error('Failed to fetch users:', response.statusText);
    }
  } catch (error) {
    console.error('Error while fetching users:', error);
  }
};

const fetchTransactions = async () => {
  try {
    const params = new URLSearchParams({
      groupID: useDetailsStore().groupID?.toString() ?? '0',
      searchQuery: searchQuery.value ?? '',
      selectedUser: selectedUser.value !== 0 ? selectedUser.value.toString() : '0',
    });

    const url = `http://localhost:3000/transactions/group?${params.toString()}`;

    const response = await fetchWithAuth(url, { method: 'GET' });

    if (response.ok) {
      const data = await response.json();
      transactions.value = Array.isArray(data) ? data : [];

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

// GroupsPage.vue
const handleConfirmed = async (confirmed: boolean) => {
  if (confirmed) {
    await fetchUsers(Number(useDetailsStore().groupID));
  }
};

onMounted(() => {
  fetchUsers(Number(useDetailsStore().groupID));
  fetchTransactions();

});

watch(
  () => useDetailsStore().groupID,
  async (newGroupID: string) => {
    const groupID = parseInt(newGroupID, 10);
    if (!isNaN(groupID)) {
      await fetchUsers(groupID);
      await fetchTransactions();
    } else {
      console.error('Invalid group ID');
    }
  }
);

watch(
  () => selectedUser.value,
  async () => {
    await fetchTransactions();
    }
);

watch(
  () => searchQuery.value,
  async () => {
    await fetchTransactions();
  }
)

watch(
  () => useDetailsStore().groupChanges,
  async () => {
    await fetchUsers(Number(useDetailsStore().groupID));
    await fetchTransactions();
  }
)

watch(() => showCreateTransactionModal.value, (newValue) => {
  if (!newValue) {
    selectedTransaction.value = null;
  }
});
</script>

<style scoped>
.overflow-y-auto {
  overflow-y: auto;
}

.bordered {
  border-radius: 8px;
  background-color: white;
}

.overflow-auto {
  display: flex;
  align-items: center;
  scroll-snap-type: x mandatory;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.overflow-auto::-webkit-scrollbar {
  display: none;
}

.user-button {
  width: 100px; /* Adjusted width for user buttons */
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

.custom-btn-blue {
  background-color: #0549B7;
}

.custom-border-container {
  position: relative;
}
.custom-border-container::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10%; /* Start 10% down from the top */
  height: 86%; /* Set the border height to 80% */
  border-left: solid 2px #E9E9E9; /* Border color and style */
}
</style>
