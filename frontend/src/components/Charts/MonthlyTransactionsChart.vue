<template>
  <Bar
    :data="chartData"
    :options="chartOptions"
    :height="230"
  />
</template>

<script>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { useDetailsStore } from '../../stores/details';

const detailsStore = useDetailsStore();

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
)

export default {
  name: 'MonthlyCreditsChart',
  components: { Bar },
  props: {
    transactions: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      originalTotals: new Array(12).fill(0), // Store original values for tooltips
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'MONTHLY CREDITS',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                console.log(tooltipItem);
                const amount = tooltipItem.dataset.data[tooltipItem.dataIndex];
                if(tooltipItem.dataset.backgroundColor[tooltipItem.dataIndex] === '#BE0022') {
                  return `Debits: -${amount} ${detailsStore.currency}`; // Display the amount with euro symbol
                }
                return `Credits: ${amount} ${detailsStore.currency}`; // Display the amount with euro symbol
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false, // Hides Y-axis grid lines
            },
            ticks: {
              display: false // Show Y-axis labels
            },
            border: {
              display: false // This will remove the Y-axis border line
            }
          },
          x: {
            grid: {
              display: false // Hides X-axis grid lines
            },
            ticks: {
              display: true // Show X-axis labels
            }
          }
        }
      }
    }
  },
  computed: {
    chartData() {
      // Create an array to keep track of monthly totals (0-11 for Jan-Dec)
      const monthlyTotals = new Array(12).fill(0);

      // Process each transaction
      this.transactions.forEach(transaction => {
        const date = new Date(transaction.createdAt);
        const month = date.getMonth(); // 0-11
        monthlyTotals[month] += transaction.amount; // Accumulate the amount for each month
        this.originalTotals[month] += transaction.amount; // Keep the original amount for tooltip
      });

      // Get the current month
      const currentMonth = new Date().getMonth();

      // Calculate the last 5 months, wrapping around to the previous year if necessary
      const relevantMonths = [];
      const relevantTotals = [];
      const backgroundColors = []; // Array for background colors
      for (let i = 0; i < 6; i++) {
        const monthIndex = (currentMonth - i + 12) % 12; // Wrap around for negative indices
        const amount = monthlyTotals[monthIndex];

        relevantMonths.unshift(monthNames[monthIndex]); // Add month label
        relevantTotals.unshift(Math.abs(amount)); // Store the absolute value for Y-axis
        backgroundColors.unshift(amount < 0 ? '#BE0022' : '#0549B7'); // Red for negative, blue for positive
      }

      return {
        labels: relevantMonths, // Labels for the last 5 months
        datasets: [{
          label: '', // Optional: Add a label for the dataset
          data: relevantTotals, // Use the totals for the last 5 months
          backgroundColor: backgroundColors, // Set background color based on value
          borderRadius: 8,
          maxBarThickness: 30
        }]
      }
    }
  }
}

// Array for month names
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
</script>
