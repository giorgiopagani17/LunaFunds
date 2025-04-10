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
      class="bg-info narrow-drawer drawer-fixed"
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
              <span class="text-white">{{ link.title }}</span>
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
      class="bg-info narrow-drawer drawer-fixed"
      :behavior="isBelow1200 ? 'mobile' : 'desktop'"
      elevated
    >
      <div class="q-pa-md drawer-container">
        <div class="flex justify-between q-pa-lg portfolio-container items-center" style="height: 15%">
          <div v-if="loading && newBalance != 0">Loading...</div>
          <div v-else>
            <div>Portfolio Balance</div>
            <div style="font-size: 200%; font-weight: bold">
              <span>
                {{ formatMillions(parseFloat(newBalance.toFixed(2))) }} {{ detailsStore.currency }}
              </span>
            </div>
          </div>
          <div>
            <q-icon name="currency_bitcoin" color="white" size="2.5rem"/>
          </div>
        </div>
        <div class="q-mt-lg q-pa-sm custom-card q-pt-lg">
          <PortfolioTrendChart v-if="!loading" :newBalance="newBalance" :lastBalance="lastBalance" :last1Balance="last1Balance" :last2Balance="last2Balance" :last3Balance="last3Balance" />
        </div>
        <div class="q-mt-lg q-pa-sm custom-card q-pt-lg">
          <CryptoTrendChart v-if="!loading" />
        </div>
      </div>
    </q-drawer>

    <q-page-container class="content-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import {useRoute} from 'vue-router'; // Rimuovi useRouter se non utilizzato
import {EssentialLinkProps} from 'components/EssentialLink.vue';
import {fetchWithAuth} from 'src/utils/api';
import PortfolioTrendChart from 'components/Charts/PortfolioTrendChart.vue';
import CryptoTrendChart from 'components/Charts/CryptoTrendChart.vue';
import {useDetailsStore} from 'src/stores/details';

const detailsStore = useDetailsStore();
const leftDrawerOpen = ref(window.innerWidth >= 600);
const rightDrawerOpen = ref(window.innerWidth >= 1200);
const loading = ref(true);
const windowWidth = ref(window.innerWidth);
const oldBalance = ref(0);
const newBalance = ref(0);
const lastBalance = ref(0);
const last1Balance = ref(0);
const last2Balance = ref(0);
const last3Balance = ref(0);
const route = useRoute();

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

const fetchBalance = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/crypto/balance', { method: 'GET' });
    const responseData = await response.json();
    if (response.ok) {
      oldBalance.value = parseFloat(responseData.oldBalance.toFixed(2));
      newBalance.value = parseFloat(responseData.newBalance.toFixed(2));
      lastBalance.value = parseFloat(responseData.lastBalance.toFixed(2));
      last1Balance.value = parseFloat(responseData.last1Balance.toFixed(2));
      last2Balance.value = parseFloat(responseData.last2Balance.toFixed(2));
      last3Balance.value = parseFloat(responseData.last3Balance.toFixed(2));

      loading.value = false;
    } else {
      console.error('Failed to fetch balance:', responseData);
    }
  } catch (error) {
    console.error('Error while fetching balance:', error);
  }
};

const formatMillions = (num: number) => {
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'; // Abbreviate millions
  }
  return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Format smaller numbers to two decimal places
};

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
  () => detailsStore.cryptoChanges,
  (newChanges, oldChanges) => {
    console.log(`Account ID changed from ${oldChanges} to ${newChanges}`); // Log changes
    if (newChanges !== oldChanges) {
      fetchBalance();
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

.portfolio-container {
  padding-left: 10%;
  padding-right: 10%;
  background-image: url('https://static.vecteezy.com/ti/vettori-gratis/p1/555687-il-fondo-blu-scuro-astratto-3d-del-modello-quadra-il-fondo-a-strisce-e-struttura-con-stile-di-lusso-leggero-vettoriale.jpg');
  background-size: cover;
  color: white;
  border-radius: 15px;
}

.custom-card {
  border: 1px solid #0000007F;
  box-shadow:
    0px 3px 6px rgba(0, 0, 0, 0.5),  /* Ombra più evidente */
    0px 7px 15px rgba(0, 0, 0, 0.2); /* Ombra esterna diffusa */
  border-radius: 5px;
  transition: box-shadow 0.3s ease;
  background: #1D1D1D;
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
