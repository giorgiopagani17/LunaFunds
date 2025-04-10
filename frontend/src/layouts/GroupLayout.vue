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
        <div class="flex justify-between q-pa-lg group-container items-center" style="height: 15%">
          <div v-if="loading">Loading...</div>
          <div v-if="!loading && selectedGroup">
            <div style="font-size: 130%; font-weight: bold">Gruppo {{ selectedGroup ? selectedGroup.name : 'N/A' }}</div>
          </div>
          <div v-if="!loading && selectedGroup">
            <q-tooltip anchor="bottom left" self="center left">
              Show other groups
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
                  v-for="group in otherGroups"
                  :key="group.id"
                  clickable
                  @click="selectGroup(group); menuVisible = false"
                >
                  <q-item-section style="width: 225px; cursor: pointer;">
                    <div class="flex justify-between q-pa-md group-container items-center" style="height: 100px; opacity: 80%">
                      <div v-if="group">
                        <div style="font-size: 130%; font-weight: bold">Gruppo {{ group ? group.name : 'N/A' }}</div>
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
                <q-item v-if="groups.length < 3">
                  <q-item-section style="width: 225px; cursor: pointer;" @click="showCreateGroup = true; menuVisible = false">
                    <div class="flex justify-between q-pa-md create-group-container text-secondary items-center text-center" style="height: 100px; opacity: 80%">
                      <div style="font-size: 130%; font-weight: bold">Create New Group</div>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
          <div v-else-if="!selectedGroup && !loading" class="flex items-center justify-center" style="height: 100%">
            <q-btn round color="white" size="100%" class="q-mr-md" @click="showCreateGroup = true">
              <q-icon name="add" color="secondary" />
            </q-btn>
            <div class="text-white text-bold">
              CREATE A NEW GROUP
            </div>
          </div>
          <div v-else-if="loading" class="flex items-center justify-center" style="height: 100%">
            Loading...
          </div>
        </div>
        <div class="q-mt-lg q-pa-sm custom-card q-pt-lg">
          <Last5GroupTransactionsChart :transactions="userInfo?.userTransactions ?? []" />
        </div>
        <div class="custom-card q-mt-lg q-pa-xs" style="height: 15%">
          <div v-if="selectedGroup && userInfo">
            <div v-if="userInfo.userBalance < 0">
              <GroupChart
                :totalBalance="Math.abs(userInfo?.groupBalance._sum.amount) || 0"
                :dataBalance="Math.abs(userInfo?.userBalance) || 0"
                :type="'Spesa'"
              />
            </div>
            <div v-else class="flex items-center justify-center">
              <div class="text-secondary text-bold text-center">
                <span style="font-size: 120%">Your contribution is 0% <br/></span>
                <span class="text-grey text-bold">Create new transaction!</span>
              </div>
            </div>
          </div>
          <div v-else-if="loading">
            Loading...
          </div>
          <div v-else class="text-bold text-secondary" style="font-size: 120%">
            Create or Join a group!
          </div>
        </div>
        <div class="custom-card q-mt-lg q-pa-md" style="height: 15%">
          <div v-if="selectedGroup && userInfo">
            <div v-if="userInfo.userBalance < userInfo.averageBalance">
              <GroupChart
                :totalBalance="Math.abs(userInfo?.userBalance) || 0"
                :dataBalance="Math.abs(userInfo?.averageBalance) || 0"
                :type="'Media'"
              />
            </div>
            <div v-else-if="userInfo.userBalance > userInfo.averageBalance">
              <GroupChart
                :totalBalance="Math.abs(userInfo?.userBalance) || 0"
                :dataBalance="Math.abs(userInfo?.averageBalance) || 0"
                :type="'Media'"
              />
            </div>
            <div v-else class="flex items-center justify-center">
              <div class="text-secondary text-bold text-center">
                <span style="font-size: 120%">The group balance is 0{{ detailsStore.groupCurrency }}<br/></span>
                <span class="text-grey text-bold">Create new transaction!</span>
              </div>
            </div>
          </div>
          <div v-else-if="loading">
            Loading...
          </div>
          <div v-else class="text-bold text-secondary" style="font-size: 120%">
            Create or Join a group!
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="content-container">
      <router-view />
    </q-page-container>

    <CreateGroup v-if="showCreateGroup" v-model="showCreateGroup" />
  </q-layout>
</template>

<script setup lang="ts">
import {onMounted, ref, computed, watch, onUnmounted, nextTick} from 'vue';
import { useRoute } from 'vue-router'; // Rimuovi useRouter se non utilizzato
import { EssentialLinkProps } from 'components/EssentialLink.vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'src/stores/details';
import Last5GroupTransactionsChart from 'components/Charts/Last5GroupTransactionsChart.vue';
import GroupChart from 'components/Charts/GroupChart.vue';
import CreateGroup from 'components/Modals/Groups/CreateGroup.vue';

interface Group {
  id: number;
  name: string;
  default: boolean;
  currency: string;
}

interface UserTransaction {
  id: number;
  userId: number;
  groupId: number;
  name: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface GroupBalance {
  _sum: {
    amount: number;
  };
}

interface UserInfo {
  userTransactions: UserTransaction[];
  groupBalance: GroupBalance;
  averageBalance: number;
  userBalance: number;
}

const groups = ref<Group[]>([]);
const selectedGroup = ref<Group | null>(null);
const detailsStore = useDetailsStore();
const leftDrawerOpen = ref(window.innerWidth >= 600);
const rightDrawerOpen = ref(window.innerWidth >= 1200);
const loading = ref(true);
const showCreateGroup = ref(false);
const menuVisible = ref(false);
const windowWidth = ref(window.innerWidth);
const route = useRoute();
const userInfo = ref<UserInfo | null>(null);

const linksList: EssentialLinkProps[] = [
  { title: 'Home', caption: 'Dashboard', icon: 'home', link: '/home' },
  { title: 'Finance', caption: 'Transactions', icon: 'credit_card', link: '/details' },
  { title: 'Groups', caption: 'Shared Expenses', icon: 'group', link: '/groups' },
  { title: 'Crypto', caption: 'Investments', icon: 'currency_bitcoin', link: '/crypto' },
];

const activeItemIndex = ref<number>(linksList.findIndex(link => link.link === route.path));

const updateActiveItemFromRoute = async () => {
  await nextTick(); // Wait for the DOM to update
  const routePath = route.path;
  activeItemIndex.value = linksList.findIndex(link => link.link === routePath);
};

const selectGroup = (group: Group) => {
  selectedGroup.value = group;
  menuVisible.value = false;
  detailsStore.setGroupID(group.id.toString());
};

const fetchGroups = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/groups/user', { method: 'GET' });
    const responseData = await response.json();
    if (response.ok && Array.isArray(responseData)) {
      groups.value = responseData;
      if (detailsStore.groupID && detailsStore.groupID !== '00000') {
        selectedGroup.value = groups.value.find(group => group.id === parseInt(detailsStore.groupID || '0')) || groups.value[0] || null;
        detailsStore.setGroupCurrency(selectedGroup.value?.currency || '');
      } else {
        selectedGroup.value = groups.value.find(group => group.default) || groups.value[0] || null;
        detailsStore.setGroupID((selectedGroup.value?.id).toString() || '');
        detailsStore.setGroupCurrency(selectedGroup.value?.currency || '');
      }
      console.log('Groups fetched:',detailsStore.groupID);
    } else {
      console.error('Failed to fetch groups:', responseData);
    }
  } catch (error) {
    console.error('Error while fetching groups:', error);
  } finally {
  }
};

const fetchUserInfo = async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/groups/user/details/${useDetailsStore().groupID}`, { method: 'GET' });
    const responseData = await response.json();
    if (response.ok) {
      userInfo.value = responseData;
      console.log('User info fetched:', userInfo.value);
      loading.value = false;
    } else {
      console.error('Failed to fetch user info:', responseData);
    }
  } catch (error) {
    console.error('Error while fetching user info:', error);
  }
}

const otherGroups = computed(() => groups.value.filter(group => group !== selectedGroup.value));

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
  () => detailsStore.groupChanges,
  (newChanges, oldChanges) => {
    console.log(`Group ID changed from ${oldChanges} to ${newChanges}`); // Log changes
    if (newChanges !== oldChanges) {
      fetchGroups();
      fetchUserInfo()
    }
  },
  { immediate: true }
);

watch(
  () => useDetailsStore().groupID,
  (newGroup, oldGroup) => {
    console.log(`Selected group changed from ${oldGroup} to ${newGroup}`); // Log changes
    if (newGroup !== oldGroup) {
      fetchUserInfo();
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
  fetchGroups();
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

.group-container {
  padding-left: 10%;
  padding-right: 10%;
  background-image: url('https://static.vecteezy.com/ti/vettori-gratis/t2/10790729-astratto-sfondo-buio-blu-con-moderno-concetto-vettoriale.jpg');
  background-size: cover;
  color: white;
  border-radius: 15px;
}

.create-group-container {
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
  display: flex;
  justify-content: center;
  align-items: center;
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
