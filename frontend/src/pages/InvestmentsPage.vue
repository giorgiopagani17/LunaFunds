<template>
  <q-page class="q-px-lg q-pt-lg bg-dark text-white">
    <div class="q-mb-lg">
      <span class="text-grey text-bold">{{ actualDate }} | LunaFunds</span><br/>
      <span class="text-h4 text-bold">Crypto Investments</span>

      <div v-if="loading" class="q-mt-lg">Loading...</div>
      <div v-else>
        <div class="q-mt-lg q-py-md q-px-lg custom-card flex items-center justify-between" style="height: 32vh">
          <div class="q-pa-md custom-border-container-right" style="width: 33%">
            <span class="text-bold" style="font-size: 130%">Actual balance <br/></span>
            <span class="text-grey text-bold">{{ formatDate(actualDate) }}</span>
            <div class="q-mt-lg">
              <p class="text-bold" style="font-size: 300%">
                {{ formatMillions(parseFloat(performance?.newBalance?.toFixed(2) ?? '0')) }} {{ detailsStore.currency }}
              </p>
              <span>
              Updated in the last hours
            </span>
            </div>
          </div>
          <div class="q-pa-md text-center" style="width: 34% ">
            <span class="text-bold" style="font-size: 130%">Total Revenue <br/></span>
            <div v-if="performance" class="q-mt-md">
              <p :class="differenceClass" class="text-bold" style="font-size: 300%">
                {{ formatMillions(parseFloat(difference.toFixed(2))) }} {{ detailsStore.currency }}
              </p>
              <span :class="[differenceClass, 'font-size-110']">
              {{ formattedPercentage }}%
            </span>
            </div>
          </div>
          <div class="q-pa-md text-right custom-border-container-left" style="width: 33% ">
            <span class="text-bold" style="font-size: 130%">Total Expenses <br/></span>
            <span class="text-grey text-bold"> {{ formatDate(performance?.createdAt || actualDate) }}</span>
            <div class="q-mt-lg">
              <p class="text-bold" style="font-size: 300%">
                {{ formatMillions(parseFloat(performance?.oldBalance?.toFixed(2) ?? '0')) }} {{ detailsStore.currency }}
              </p>
              <span>
              Total spent on cryptocurrency
            </span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between q-mt-md">
          <div class="custom-card q-pa-md" style="width: 49.25%">
            <div class="flex justify-between q-px-md" style="border-bottom: solid 2px #9A9A9A">
              <div class="flex justify-between q-pb-sm text-bold" style="width: 100%; font-size: 110%">
                <div class="text-center">
                  <span class="text-grey">Portfolio<br/></span>
                </div>
                <div class="text-center">
                  <span class="text-grey">Sell<br/></span>
                </div>
              </div>
            </div>
            <div v-if="portfolio.length > 0">
              <div class="overflow-y-auto" style="max-height: 333px; min-height: 333px"> <!-- Imposta l'altezza massima -->
                <div
                  v-for="(crypto, index) in portfolio"
                  :key="crypto.id"
                  class="bordered q-pa-md bg-dark"
                  :style="{ borderBottom: index !== portfolio.length - 1 ? '1px solid #3A3A3A' : 'none', cursor: 'pointer' }"
                  @click="handleCryptoClick(crypto, 'Sell')"
                >
                  <div class="text-white flex justify-between items-center">
                    <div class="flex items-center">
                      <img :src="`src/assets/crypto/${crypto.image}`" alt="category" width="40px" style="border-radius: 10%">
                      <div class="q-ml-md">
                        <strong style="font-size: 120%">{{ crypto.name }}</strong><br/>
                        <span v-if="crypto.actualValue > crypto.lastValue" class="text-positive">↑{{ (((crypto.actualValue - crypto.lastValue) / crypto.lastValue) * 100).toFixed(2) }}%</span>
                        <span v-else-if="crypto.actualValue < crypto.lastValue" class="text-negative">↓{{ (((crypto.lastValue - crypto.actualValue) / crypto.actualValue) * 100).toFixed(2) }}%</span>
                        <span v-else class="text-grey">0%</span>
                      </div>
                    </div>
                    <div>
                      <strong class="q-pr-sm" style="font-size: 120%">
                        {{ (crypto.actualValue).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}{{ detailsStore.currency }}</strong><br/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex items-center justify-center" style="height: 333px">
              <span class="text-grey">Buy some crypto!</span>
            </div>
          </div>
          <div class="custom-card q-pa-md" style="width: 49.25%">
            <div class="flex justify-between q-px-md" style="border-bottom: solid 2px #9A9A9A">
              <div class="flex justify-between q-pb-sm text-bold" style="width: 100%; font-size: 110%">
                <div class="text-center">
                  <span class="text-grey">Available Crypto<br/></span>
                </div>
                <div class="text-center">
                  <span class="text-grey">Buy<br/></span>
                </div>
              </div>
            </div>
            <div v-if="cryptos">
              <div class="overflow-y-auto" style="max-height: 333px; min-height: 240px"> <!-- Imposta l'altezza massima -->
                <div
                  v-for="(crypto, index) in cryptos"
                  :key="crypto.id"
                  class="bordered q-pa-md bg-dark"
                  :style="{ borderBottom: index !== cryptos.length - 1 ? '1px solid #3A3A3A' : 'none', cursor: 'pointer' }"
                  @click="handleCryptoClick(crypto, 'Buy')"
                >
                  <div class="text-white flex justify-between items-center">
                    <div class="flex items-center">
                      <img :src="`src/assets/crypto/${crypto.image}`" alt="category" width="40px" style="border-radius: 10%">
                      <div class="q-ml-md">
                        <strong style="font-size: 120%">{{ crypto.name }}</strong><br/>
                        <span v-if="crypto.actualValue > crypto.lastValue" class="text-positive">↑{{ (((crypto.actualValue - crypto.lastValue) / crypto.lastValue) * 100).toFixed(2) }}%</span>
                        <span v-else-if="crypto.actualValue < crypto.lastValue" class="text-negative">↓{{ (((crypto.lastValue - crypto.actualValue) / crypto.actualValue) * 100).toFixed(2) }}%</span>
                        <span v-else class="text-grey">0%</span>
                      </div>
                    </div>
                    <div>
                      <strong class="q-pr-sm" style="font-size: 120%">
                        {{ (crypto.actualValue).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}{{ detailsStore.currency }}</strong><br/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <BuySellCryptoModal v-if="showBuySellCryptoModal && selectedCrypto" v-model="showBuySellCryptoModal" :crypto="selectedCrypto" :type="typeModal" />
  </q-page>
</template>

<script setup lang="ts">
import {ref, watch, computed} from 'vue';
import {fetchWithAuth} from 'src/utils/api';
import {useDetailsStore} from 'src/stores/details';
import BuySellCryptoModal from 'components/Modals/Crypto/BuySellCrypto.vue';

class Performance {
  newBalance!: number;
  oldBalance!: number;
  createdAt!: string;
}

class Crypto {
  id!: number;
  image!: string;
  name!: string;
  actualValue!: number;
  lastValue!: number;
  idStock?: number;
}
const detailsStore = useDetailsStore();
const loading = ref(true);
const cryptos = ref<Crypto[]>([]);
const portfolio = ref<Crypto[]>([]);
const showBuySellCryptoModal = ref(false);
const selectedCrypto = ref<Crypto | null>(null);
const typeModal = ref('Sell');
const performance = ref<Performance | null>(null);
const percentage = computed(() => {
  const newBalance = performance.value?.newBalance ?? 0;
  const oldBalance = performance.value?.oldBalance ?? 1;
  return (newBalance >= oldBalance)
    ? (((newBalance - oldBalance) / oldBalance) * 100).toFixed(2)
    : (((oldBalance - newBalance) / newBalance) * 100).toFixed(2);
});
const formattedPercentage = computed(() => {
  const icon = differenceClass.value === 'text-positive' ? '↑' : '↓';
  return `${icon} ${percentage.value}`;
});
const difference = computed(() => (performance.value?.newBalance ?? 0) - (performance.value?.oldBalance ?? 1));
const differenceClass = computed(() => {
  if (difference.value > 0) return 'text-positive';
  if (difference.value < 0) return 'text-negative';
  return '';
});
const actualDate = new Date().toLocaleDateString(undefined, {
  month: 'long',
  day: '2-digit',
  year: 'numeric'
});

const handleCryptoClick = async (crypto: Crypto, type: string) => {
  if(type === 'Sell') {
    await fetchPortfolio();
  } else {
    await fetchCrypto();
  }
  selectedCrypto.value = crypto;
  showBuySellCryptoModal.value = true;
  typeModal.value = type;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''; // Verifica che la data sia valida
  const date = new Date(dateStr); // Converte stringa in oggetto Date
  const day = date.getDate(); // Giorno del mese
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()]; // Nome mese abbreviato
  const year = date.getFullYear(); // Anno
  return `${day} ${month} ${year}`; // Formattazione
};


const fetchPerformance = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/crypto/performance', { method: 'GET' });
    const responseData = await response.json();
    if (response.ok) {
      performance.value = responseData;
      loading.value = false;
    } else {
      console.error('Failed to fetch balance:', responseData);
    }
  } catch (error) {
    console.error('Error while fetching balance:', error);
  }
};

const fetchCrypto = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/crypto/available', { method: 'GET' });
    const responseData = await response.json();
    if (response.ok) {
      if (Array.isArray(responseData)) {
        cryptos.value = responseData;
        loading.value = false;
      }
    } else {
      console.error('Failed to fetch crypto:', responseData);
    }
  } catch (error) {
    console.error('Error while fetching crypto:', error);
  }
};

const formatMillions = (num: number) => {
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M'; // Abbreviate millions
  } else if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'k'; // Abbreviate millions
  }
  return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Format smaller numbers to two decimal places
};

const fetchPortfolio = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/crypto/portfolio', { method: 'GET' });
    const responseData = await response.json();
    if (response.ok) {
      if (Array.isArray(responseData)) {
        portfolio.value = responseData;
        loading.value = false;
      }
    } else {
      console.error('Failed to fetch crypto:', responseData);
    }
  } catch (error) {
    console.error('Error while fetching crypto:', error);
  }
};

watch(
  () => detailsStore.cryptoChanges,
  (newChanges, oldChanges) => {
    console.log(`Account ID changed from ${oldChanges} to ${newChanges}`); // Log changes
    if (newChanges !== oldChanges) {
      fetchPerformance();
      fetchCrypto();
      fetchPortfolio();
    }
  },
  { immediate: true }
);
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

.custom-card {
  border: 1px solid #0000007F;
  box-shadow:
    0px 3px 6px rgba(0, 0, 0, 0.5),  /* Ombra più evidente */
    0px 7px 15px rgba(0, 0, 0, 0.2); /* Ombra esterna diffusa */
  border-radius: 5px;
  transition: box-shadow 0.3s ease;
  background: #1D1D1D;
}

.custom-border-container-left {
  position: relative;
}

.custom-border-container-left::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%; /* Start 10% down from the top */
  height: 70%; /* Set the border height to 80% */
  border-left: solid 2px #9E9E9E; /* Border color and style */
}

.custom-border-container-right {
  position: relative;
}

.custom-border-container-right::before {
  content: "";
  position: absolute;
  right: 0;
  top: 15%; /* Start 10% down from the top */
  height: 70%; /* Set the border height to 80% */
  border-left: solid 2px #9E9E9E; /* Border color and style */
}

.text-grey {
  color: #C0C0C0;
}

.font-size-110 {
  font-size: 110%;
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
  border-left: solid 2px #9E9E9E; /* Border color and style */
}
</style>
