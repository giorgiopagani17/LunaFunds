<template>
  <div id="app">
    <div class="flex items-center">
      <apexchart :options="chartOptions" :series="series" type="donut" style="width: 100px" />
      <div class="q-mr-lg q-ml-sm">
        <div v-if="type === 'Spesa'">
          <span class="text-secondary" style="font-weight: bold; font-size: 130%;">
            You spent {{ formatMillions(dataBalance) }}{{ currency }}<br>
          </span>
          <span class="text-grey" style="font-size: 110%; font-weight: bold"> Contribution of {{ isNaN(dataBalance / totalBalance) ? 0 : Math.min(((dataBalance / totalBalance) * 100).toFixed(0), 100) }}%</span>
        </div>
        <div v-else>
          <div v-if="totalBalance > dataBalance">
            <span class="text-positive" style="font-weight: bold; font-size: 130%;">
              You are in Credit<br>
            </span>
            <span class="text-grey" style="font-size: 110%; font-weight: bold">You will receive {{ formatMillions(totalBalance - dataBalance) }}{{ currency }}</span>
          </div>
          <div v-else>
            <span class="text-negative" style="font-weight: bold; font-size: 130%;">
              You are in Debit<br>
            </span>
            <span class="text-grey" style="font-size: 110%; font-weight: bold;">You will pay {{ formatMillions(dataBalance - totalBalance) }}{{ currency }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ApexCharts from 'vue3-apexcharts';
import { useDetailsStore } from 'src/stores/details';

export default {
  components: {
    apexchart: ApexCharts,
  },
  props: {
    type: {
      type: String,
      required: true, // Tipo di dato da visualizzare
    },
    totalBalance: {
      type: Number,
      required: true, // Il saldo del gruppo
    },
    dataBalance: {
      type: Number,
      required: true, // Il saldo dell'utente
    },
  },
  setup() {
    const detailsStore = useDetailsStore();
    const currency = detailsStore.groupCurrency; // Valuta condivisa del gruppo
    return {currency};
  },
  data() {
    return {
      series: [],
      chartOptions: {
        chart: {
          type: 'donut',
        },
        plotOptions: {
          pie: {
            donut: {
              size: '60%',
            },
          },
        },
        labels: [],
        colors: [],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
            },
          },
        ],
        tooltip: {
          enabled: true,
        },
        legend: {
          show: false,
        },
        dataLabels: {
          enabled: false,
        },
      },
    };
  },
  watch: {
    totalBalance: {
      immediate: true,
      handler() {
        this.updateChartData();
      },
    },
    dataBalance: {
      immediate: true,
      handler() {
        this.updateChartData();
      },
    },
  },
  methods: {
    updateChartData() {
      // Recupera i valori dai props
      const totalBalance = Math.max(0, this.totalBalance);
      const dataBalance = Math.max(0, this.dataBalance);

      let progress = Math.abs(dataBalance);
      let remaining = Math.abs(totalBalance - progress);

      console.log(this.type)
      console.log(dataBalance, totalBalance, progress, remaining);

      if (this.type !== 'Spesa' && totalBalance < dataBalance) {
        progress = Math.max(totalBalance);
        remaining = dataBalance - progress;
        console.log('cioa')

        console.log(dataBalance, totalBalance, progress, remaining);
        this.chartOptions.colors = ['#BE0022', '#0549B6'];
      } else {
        this.chartOptions.colors = this.type === 'Spesa'
          ? ['#0549B6', '#008DE3']
          : ['#0549B6', '#00673E'];
      }

      this.series = [progress, remaining];

      this.chartOptions.labels = this.type === 'Spesa'
        ? ['My Expense', 'Other Users']
        : [dataBalance > totalBalance ? 'Shortfall' : 'Average Expense', dataBalance > totalBalance ? 'Average Expense' : 'Overspent'];
    },
    formatMillions(num) {
      if (Math.abs(num) >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + 'M'; // Abbreviate millions
      } else if (Math.abs(num) >= 1_000) {
        return (num / 1_000).toFixed(1) + 'k'; // Abbreviate millions
      }
      return num.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits:  0}); // Format smaller numbers to two decimal places
    },
  },
};
</script>

<style scoped>
</style>
