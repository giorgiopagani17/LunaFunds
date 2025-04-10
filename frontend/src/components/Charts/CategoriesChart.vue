<template>
  <div id="app">
    <div class="flex items-center">
      <apexchart :options="chartOptions" :series="series" type="donut" style="width: 100px" />
      <div class="q-ml-sm">
        <span class="text-grey" style="font-weight: bold; font-size: 110%;">{{ category.name }} <br></span>
        <span style="font-size: 130%; font-weight: bold">{{ formattedTotalAmount }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import ApexCharts from 'vue3-apexcharts';
import { useDetailsStore } from '../../stores/details';

export default {
  components: {
    apexchart: ApexCharts,
  },
  props: {
    balance: Number, // Total balance
    category: Object, // Single Category object with { name, totalAmount }
  },
  setup() {
    const detailsStore = useDetailsStore();
    const currency = detailsStore.currency; // Assuming currency is a reactive property in your store

    return { currency };
  },
  data() {
    return {
      series: [0], // Initialize with zero
    };
  },
  computed: {
    formattedTotalAmount() {
      return `${this.category.totalAmount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${this.currency}`;
    },
    chartOptions() {
      return {
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
        labels: ['Category Amount'], // Label for the chart
        colors: ['#0549B7', '#E5E5E5'], // Always blue color
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
        legend: {
          show: false, // Disable the legend
        },
        dataLabels: {
          enabled: false, // Disable data labels (percentages)
        },
        tooltip: {
          enabled: false, // Enable tooltips
        },
      };
    },
  },
  watch: {
    // Watch for changes in category or balance to update the chart
    category: {
      immediate: true,
      handler() {
        this.updateChartData();
      },
    },
    balance: {
      immediate: true,
      handler() {
        this.updateChartData();
      },
    },
  },
  methods: {
    updateChartData() {
      const categoryAmount = Math.abs(this.category.totalAmount);
      const remainingBalance = Math.max(0, this.balance - categoryAmount);

      // Reset series with category amount and remaining balance
      this.series = [categoryAmount, remainingBalance];
    },
  },
};
</script>
