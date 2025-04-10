<template>
  <div id="app">
    <div class="flex items-center" style="cursor: pointer">
      <apexchart :options="chartOptions" :series="series" type="donut" style="width: 100px" />
      <div class="q-mr-lg q-ml-sm">
        <span class="text-secondary" style="font-weight: bold; font-size: 130%;">
          {{ label }} - {{ Math.min(((data.transactionSum / formattedAmount) * 100).toFixed(0), 100) }}%<br>
        </span>
        <span class="text-grey" style="font-size: 110%; font-weight: bold">{{ daysRemaining }} days remaining</span>
      </div>
    </div>
  </div>
</template>

<script>
import ApexCharts from 'vue3-apexcharts';
import { useDetailsStore } from 'src/stores/details';
import { watch, ref } from 'vue';

export default {
  components: {
    apexchart: ApexCharts,
  },
  props: {
    dataType: String, // 'Goal' or 'Budget'
    data: Object, // Object containing { name, amount, transactionSum, timeline }
  },
  setup(props) {
    const detailsStore = useDetailsStore();
    const currency = detailsStore.currency; // Assuming currency is a reactive property in your store

    // Reactive variable for daysRemaining
    const daysRemaining = ref(0);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Function to calculate days remaining based on timeline
    const calculateDaysRemaining = () => {
      const timelineType = props.data.timeline;

      if (timelineType === 'weekly') {
        const dayOfWeek = currentDate.getDay();
        daysRemaining.value = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      } else if (timelineType === 'monthly') {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        daysRemaining.value = currentDate.getDate() === daysInMonth ? 0 : daysInMonth - currentDate.getDate();
      } else if (timelineType === 'annual') {
        const lastDayOfYear = new Date(currentYear, 11, 31);
        daysRemaining.value = currentDate.getDate() === 31 && currentDate.getMonth() === 11 ? 0 : Math.floor((lastDayOfYear - currentDate) / (1000 * 60 * 60 * 24));
      }
    };

    // Recalculate daysRemaining whenever the data changes
    watch(() => props.data, () => {
      calculateDaysRemaining(); // Recalculate when data changes
    }, {immediate: true}); // Run immediately on initial load

    return {currency, daysRemaining};
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
        labels: [], // Labels for chart parts
        colors: [], // Dynamic colors based on type
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
          enabled: true, // Enable tooltips
        },
        legend: {
          show: false, // Disable legend
        },
        dataLabels: {
          enabled: false, // Disable percentages
        },
      },
    };
  },
  computed: {
    label() {
      return this.data.name;
    },
    formattedAmount() {
      return `${this.data.amount.toFixed(2)}`;
    },
  },
  watch: {
    data: {
      immediate: true,
      handler() {
        this.updateChartData();
      },
    },
  },
  methods: {
    updateChartData() {
      const {amount, transactionSum} = this.data;

      // Ensure transactionSum is at least 0
      const safeTransactionSum = Math.max(0, transactionSum);

      // Calculate remaining balance
      const remaining = Math.max(0, amount - safeTransactionSum);

      // Set series with transactionSum and remaining amount
      this.series = safeTransactionSum >= amount
        ? [amount, 0] // Full completion
        : [safeTransactionSum, remaining];

      // Define chart colors based on `dataType`
      this.chartOptions.colors = this.dataType === 'Goal'
        ? ['#00683E', '#D3D3D3'] // Green for Goal
        : ['#BE0022', '#D3D3D3']; // Red for Budget

      // Set labels dynamically
      this.chartOptions.labels = [
        this.dataType === 'Goal' ? 'Progress' : 'Expense',
        'Remaining',
      ];
    },
  },
};
</script>

<style scoped>
</style>
