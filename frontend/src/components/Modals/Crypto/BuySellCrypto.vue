<template>
  <q-dialog
    v-model="isVisible"
    :persistent="true"
    class="crypto-modal"
  >
    <q-card class="q-pa-md custom-modal-black bg-dark">
      <q-card-section>
        <h5 class="text-secondary text-center q-pb-lg modal-title">
          {{ type.toUpperCase() }} CRYPTO
        </h5>

        <div class="crypto-header q-pa-lg q-px-lg">
          <div class="crypto-info">
            <img
              :src="`/src/assets/crypto/${crypto.image}`"
              :alt="crypto.name"
              class="crypto-logo"
            >
            <span v-if="crypto.name === 'Lido Staked Ether'" class="crypto-name">Lido</span>
            <span v-else class="crypto-name">{{ crypto.name }}</span>
          </div>
          <div v-if="props.type === 'Buy'" class="crypto-value">
            {{ crypto.actualValue }}{{ detailsStore.currency }}
          </div>
          <div v-if="props.type === 'Sell'" class="crypto-value">
            {{ crypto.actualValue.toFixed(2) }}{{ detailsStore.currency }}
          </div>
        </div>

        <div class="q-mt-lg">
          <div class="flex items-center justify-center">
            <q-input
              v-model="displayAmount"
              maxlength="12"
              dense
              placeholder="10,00"
              lazy-rules
              :style="{ width: '250px', fontSize: '300%', padding: '0% !important' }"
              input-class="text-center q-pb-sm text-white"
              :error="error"
              @input="handleInput"
              @change="validateAmount"
            />
            <span
              class="q-ml-sm text-white"
              style="font-size: 250%;"
            >
              {{ detailsStore.currency }}
            </span>
          </div>
          <div class="text-center text-grey q-mr-lg" v-if="type === 'Buy'">
            <div v-if="balance > 0">
              {{ formatMillions(balance) }}{{ detailsStore.currency }} disponibili
            </div>
            <div v-else>
              0,00{{ detailsStore.currency }} disponibili
            </div>
          </div>
          <div class="text-center text-grey q-mr-lg" v-if="type === 'Sell'">
           0.1% fee
        </div>
        </div>
      </q-card-section>

      <q-card-actions class="modal-actions q-pt-lg">
        <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        <q-btn v-if="props.type === 'Buy'" flat style="margin-left: auto; width: 100px; font-size: 110%" label="Buy" color="positive" @click="buyCrypto()" :disable="isDisabled" />
        <q-btn v-if="props.type === 'Sell'" flat style="margin-left: auto; width: 100px; font-size: 110%" label="Sell" color="positive" @click="sellCrypto()" :disable="isDisabled"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, defineProps, defineEmits, PropType} from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'stores/details';
import {Notify} from 'quasar';

interface Crypto {
  id: number;
  image: string;
  name: string;
  actualValue: number;
  lastValue: number;
  idStock?: number;
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  crypto: {
    type: Object as PropType<Crypto>,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value: string) => ['Buy', 'Sell'].includes(value)
  }
});

console.log(props.crypto);
const emit = defineEmits(['update:modelValue', 'transaction']);

const detailsStore = useDetailsStore();
const balance = ref(0);
const error = ref(false);
const amount = ref(0);

const formatMillions = (num: number) => {
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'; // Abbreviate millions
  } else if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1) + 'k'; // Abbreviate millions
  }
  return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Format smaller numbers to two decimal places
};

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
    return amount.value !== 0
      ? amount.value.toLocaleString('it-IT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
      : ''
  },
  set(newValue: string) {
    const formattedValue = cleanAndFormatInput(newValue)
    amount.value = parseFloat(formattedValue.replace(/\./g, '').replace(',', '.')) || 0
  }
})

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const formattedValue = cleanAndFormatInput(input.value)
  input.value = formattedValue
}

const isDisabled = computed(() => {
  if (props.type === 'Buy') {
    return amount.value > balance.value || amount.value <= 0;
  } else {
    return amount.value > parseFloat(props.crypto.actualValue.toFixed(2)) || amount.value <= 0;
  }
});


const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const fetchBalance = async () => {
  if (props.type === 'Buy') {
    try {
      const response = await fetchWithAuth('http://localhost:3000/transactions/balance', {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.text();
        balance.value = parseFloat(data);
      }
    } catch (error) {
      console.error('Errore nel recupero del saldo:', error);
    }
  }
};

const validateAmount = () => {
  if(props.type === 'Buy') {
    error.value = amount.value > balance.value || amount.value < 0;
  } else {
    error.value = amount.value > parseFloat(props.crypto.actualValue.toFixed(2)) || amount.value < 0;
  }
};

const closeModal = () => {
  const changes = parseInt(detailsStore.cryptoChanges?.toString() || '0');
  detailsStore.setCryptoChanges((changes + 1).toString());
  error.value = false;
  isVisible.value = false;
};

const buyCrypto = async () => {
  if (!error.value && amount.value <= balance.value && amount.value > 0) {
    try {
      const response = await fetchWithAuth('http://localhost:3000/crypto/buy', {
        method: 'POST',
        body: JSON.stringify({
          name: props.crypto.name,
          amount: amount.value,
          cryptoId: props.crypto.id,
          valueWhenBought: props.crypto.actualValue,
        }),
      });
      if (response.ok) {
        const data = await response.text();
        balance.value = parseFloat(data);

        Notify.create({
          type: 'positive',
          message: `You bought ${amount.value}${detailsStore.currency} worth of ${props.crypto.name}`,
          color: 'positive',
        });

        closeModal();
      }
    } catch (error) {
      console.error('Errore nel recupero del saldo:', error);
      Notify.create({
        type: 'negative',
        message: `Error buying ${props.crypto.name}`,
        color: 'negative',
      });
    }
  }
};

const sellCrypto = async () => {
  if (!error.value && amount.value <= parseFloat(props.crypto.actualValue.toFixed(2)) && amount.value > 0) {
    try {
      const response = await fetchWithAuth('http://localhost:3000/crypto/sell', {
        method: 'POST',
        body: JSON.stringify({
          name: props.crypto.name,
          amount: amount.value,
          cryptoId: props.crypto.id,
          stockId: props.crypto.idStock,
          valueWhenBought: props.crypto.actualValue.toFixed(2),
        }),
      });
      if (response.ok) {
        const data = await response.text();
        balance.value = parseFloat(data);

        Notify.create({
          type: 'positive',
          message: `You sold ${amount.value}${detailsStore.currency} worth of ${props.crypto.name}`,
          color: 'positive',
        });

        closeModal();
      }
    } catch (error) {
      console.error('Errore nel recupero del saldo:', error);
      Notify.create({
        type: 'negative',
        message: `Error selling ${props.crypto.name}`,
        color: 'negative',
      });
    }
  }
};

onMounted(fetchBalance);
</script>

<style lang="scss" scoped>
.crypto-modal {
  .custom-modal-black {
    border-radius: 12px;
    box-shadow:
      0px 3px 6px rgba(0, 0, 0, 0.5),
      0px 7px 15px rgba(0, 0, 0, 0.2);
    background-color: #1D1D1D;
    max-width: 500px;
    width: 100%;
  }

  .modal-title {
    font-weight: bold;
    font-size: 2em;
    border-bottom: solid 1px #3E3E3E;
    margin: 0;
    padding-bottom: 1rem;
  }

  .crypto-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: solid 1px #3E3E3E;

    .crypto-info {
      display: flex;
      align-items: center;

      .crypto-logo {
        width: 40px;
        border-radius: 10%;
        margin-right: 0.5rem;
      }

      .crypto-name {
        color: white;
        font-weight: bold;
        font-size: 2rem;
      }
    }

    .crypto-value {
      color: white;
      font-weight: bold;
      font-size: 2rem;
    }
  }

  .amount-input-container {
    display: flex;
    flex-direction: column;
    align-items: center;

    .amount-input {
      width: 150px;

      :deep(input) {
        font-size: 3rem;
        text-align: center;
        color: white;
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: space-between;
    border-top: solid 1px #3E3E3E;

    .q-btn {
      width: 120px;
      font-size: 1.1rem;
    }
  }
}
</style>
