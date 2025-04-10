<template>
  <div id="app">
    <span class="text-bold text-secondary q-mx-sm">Trends of</span>
    <select v-model="selectedCrypto" @change="updateChart" class="dark-mode-select">
      <option v-for="crypto in cryptos" :value="crypto.id" :key="crypto.id">
        {{ crypto.name }}
      </option>
    </select>
    <div id="chart"></div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue';
import ApexCharts from 'apexcharts';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from '../../stores/details';

const detailsStore = useDetailsStore();

interface Crypto {
  id: number;
  name: string;
  last3Value: number;
  last2Value: number;
  last1Value: number;
  lastValue: number;
  actualValue: number;
}

export default {
  setup() {
    const cryptos = ref<Crypto[]>([]); // Dati delle criptovalute
    const selectedCrypto = ref<number | null>(null); // Criptovaluta selezionata
    const chart = ref<ApexCharts | null>(null); // Riferimento al grafico

    // Funzione per ottenere i dati delle criptovalute
    const fetchCryptos = async () => {
      try {
        // Esegui la fetch per ottenere i dati delle criptovalute
        const response = await fetchWithAuth('http://localhost:3000/crypto/all');
        const data = await response.json();

        // Trasforma i dati nel formato richiesto
        cryptos.value = data.map((crypto: Crypto) => ({
          id: crypto.id,
          name: crypto.name,
          last3Value: crypto.last3Value,
          last2Value: crypto.last2Value,
          last1Value: crypto.last1Value,
          lastValue: crypto.lastValue,
          actualValue: crypto.actualValue,
        }));

        // Seleziona la prima criptovaluta come predefinita
        if (cryptos.value.length > 0) {
          selectedCrypto.value = cryptos.value[0].id;
          updateChart(); // Aggiorna il grafico per la criptovaluta iniziale
        }
      } catch (error) {
        console.error('Errore durante la fetch delle criptovalute:', error);
      }
    };

    // Funzione per aggiornare il grafico
    const updateChart = () => {
      const crypto = cryptos.value.find((c) => c.id === selectedCrypto.value);
      if (!crypto) return;

      // Calculate the last 5 hours
      const currentTime = new Date();
      const labels = Array.from({ length: 5 }, (_, i) => {
        const time = new Date(currentTime.getTime() - i * 60 * 60 * 1000);
        return `${time.getHours()}:00`;
      }).reverse();

      const options: ApexCharts.ApexOptions = {
        series: [
          {
            name: crypto.name,
            data: [
              crypto.last3Value,
              crypto.last2Value,
              crypto.last1Value,
              crypto.lastValue,
              crypto.actualValue,
            ],
          },
        ],
        chart: {
          type: 'area',
          height: 170,
          zoom: {
            enabled: false,
          },
          toolbar: {
            show: false, // Remove the export option
          },
        },
        dataLabels: {
          enabled: false,
        },
        markers: {
          size: 3,
        },
        stroke: {
          curve: 'smooth',
          width: 3,
        },
        labels,
        xaxis: {
          type: 'category',
          labels: {
            style: {
              colors: Array(5).fill('#ffffff'),
            },
          },
        },
        grid: {
          show: true,
          borderColor: 'grey',
        },
        yaxis: {
          labels: {
            formatter: (value) => `${formatMillions(value)} ${detailsStore.currency}`,
            style: {
              colors: '#ffffff',
            },
          },
        },
        tooltip: {
          enabled: true,
          shared: true,
          intersect: false,
          y: {
            formatter: (value) => `${formatMillions(value)} ${detailsStore.currency}`,
          },
          style: {
            fontSize: '12px',
          },
        },
        colors: ['#0549B7'],
      };

      // Render or update the chart
      if (!chart.value) {
        chart.value = new ApexCharts(document.querySelector('#chart') as HTMLElement, options);
        chart.value.render();
      } else {
        chart.value.updateOptions(options);
      }
    };

    const formatMillions = (num : number) => {
      if (Math.abs(num) >= 1_000_000) {
        return (num / 1_000_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) + 'M'; // Abbreviate millions
      } else if (Math.abs(num) >= 1_000) {
        return (num / 1_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) + 'k'; // Format smaller numbers to two decimal places
      }
      return num.toLocaleString('it-IT', { minimumFractionDigits: 3, maximumFractionDigits: 3 }); // Format smaller numbers to two decimal places
    };

    // Esegui la fetch delle criptovalute al montaggio
    onMounted(() => {
      fetchCryptos();
    });

    return {
      cryptos,
      selectedCrypto,
      updateChart,
    };
  },
};
</script>

<style scoped>
.dark-mode-select {
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 5px;
  border-radius: 4px;
}

.dark-mode-select option {
  background-color: #333;
  color: #fff;
}
</style>
