<template>
  <div id="app" class="flex items-center">
    <apexchart
      :key="detailsStore.groupID"
      type="line"
      :options="chartOptions"
      :series="series"
      height="250"
    />
  </div>
</template>

<script lang="ts">
import { ref, watch } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import { useDetailsStore } from '../../stores/details';

const detailsStore = useDetailsStore();

interface Transaction {
  createdAt: string;
  amount: number;
}

interface ChartOptions {
  chart: {
    height: number;
    type: string;
    zoom: {
      enabled: boolean;
    };
    toolbar: {
      show: boolean;
    };
  };
  dataLabels: {
    enabled: boolean;
  };
  markers: {
    size: number;
  };
  stroke: {
    curve: string;
    width: number;
  };
  title: {
    text: string;
    align: string;
    style: {
      color: string;
    };
  };
  grid: {
    show: boolean;
    borderColor: string;
  };
  xaxis: {
    categories: string[];
    labels: {
      show: boolean;
      style: {
        colors: string[];
      };
    };
  };
  yaxis: {
    labels: {
      formatter: (value: number) => string;
      show: boolean;
      style: {
        colors: string;
      };
    };
  };
  tooltip: {
    enabled: boolean;
    shared: boolean;
    intersect: boolean;
    y: {
      formatter: (value: number) => string;
    };
    style: {
      fontSize: string;
    };
  };
  colors: string[];
}

export default {
  name: 'GroupTransactionsChart',
  components: {
    apexchart: ApexCharts
  },
  props: {
    transactions: {
      type: Array as () => Transaction[],
      required: true,
    }
  },
  setup(props) {
    const series = ref([
      {
        name: 'Transazioni',
        data: [] as number[],
      },
    ]);

    const chartOptions = ref<ChartOptions>({
      chart: {
        height: 250,
        type: 'line',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
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
      title: {
        text: 'My Group Transactions Trends',
        align: 'left',
        style: {
          color: '#0549B7',
        },
      },
      grid: {
        show: true,
        borderColor: 'grey',
      },
      xaxis: {
        categories: [],
        labels: {
          show: true,
          style: {
            colors: Array(5).fill('#000000'),
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `${formatMillions(value)} ${detailsStore.currency}`,
          show: true,
          style: {
            colors: '#000000',
          },
        },
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        y: {
          formatter: (value: number) => `${formatMillions(value)} ${detailsStore.currency}`,
        },
        style: {
          fontSize: '12px',
        },
      },
      colors: ['#0549B7'],
    });

    const formatDateDisplay = (dateStr: string): string => {
      const [, month, day] = dateStr.split('-');
      const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
      return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
    };

    const processTransactions = () => {
      console.log('Processing transactions:', props.transactions);

      // Get today's date at start of day for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Group transactions by date and sum amounts
      const dailyTransactions: Record<string, number> = {};
      props.transactions.forEach((transaction: Transaction) => {
        const dateStr = transaction.createdAt.split(' ')[0];
        const transactionDate = new Date(dateStr);

        // Skip transactions from today
        if (transactionDate.getTime() === today.getTime()) {
          return;
        }

        if (!dailyTransactions[dateStr]) {
          dailyTransactions[dateStr] = 0;
        }
        dailyTransactions[dateStr] += transaction.amount;
      });

      // Get unique dates and sort them in descending order
      let dates = Object.keys(dailyTransactions).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
      );

      // Take only the first 5 unique dates
      dates = dates.slice(0, 5);

      dates = dates.reverse();

      // If we have only one date, add an adjacent date with 0 amount
      if (dates.length === 1) {
        const singleDate = new Date(dates[0]);
        const adjacentDate = new Date(singleDate);

        // Get the transaction date in the local timezone
        const transactionDateStr = singleDate.toLocaleDateString('en-GB', { timeZone: 'Europe/Rome' });

        console.log(transactionDateStr, today.toLocaleDateString('en-GB', { timeZone: 'Europe/Rome' }));
        // If tomorrow would be today, use yesterday instead
        adjacentDate.setDate(adjacentDate.getDate() + 1);

        const adjacentDateStr = adjacentDate.toISOString().split('T')[0];
        dailyTransactions[adjacentDateStr] = 0;
        dates = [dates[0], adjacentDateStr].sort();
      }

      // Format dates for display using Italian month names
      chartOptions.value = {
        ...chartOptions.value,
        xaxis: {
          ...chartOptions.value.xaxis,
          categories: dates.map(formatDateDisplay),
        },
      };


      // Set the data points
      series.value[0].data = dates.map(date => dailyTransactions[date] || 0);

      console.log('Updated series data:', series.value[0].data);
      console.log('Updated xaxis categories:', chartOptions.value.xaxis.categories);
    };

    const formatMillions = (num: number) => {
      if (Math.abs(num) >= 1_000_000) {
        return (num / 1_000_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M'; // Abbreviate millions
      } else if (Math.abs(num) >= 1_000) {
        return (num / 1_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'k'; // Abbreviate millions
      }
      return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Format smaller numbers to two decimal places
    };

    // Process transactions whenever they change
    watch(() => props.transactions, processTransactions, { immediate: true });

    // Watch detailsStore to ensure it's ready before processing transactions
    watch(detailsStore, (newValue) => {
      if (newValue.currency) {
        processTransactions();
      }
    }, { immediate: true });

    return {
      series,
      chartOptions,
      detailsStore,
    };
  },
};
</script>

<style>
#app {
  background-color: transparent;
}
</style>
