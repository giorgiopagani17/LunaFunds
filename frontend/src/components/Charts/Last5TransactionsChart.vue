<template>
  <div id="app" class="flex items-center">
    <apexchart
      :key="detailsStore.accountID"
    type="line"
    :options="chartOptions"
    :series="series"
    height="250"
    />
  </div>
</template>

<script lang="ts">
import { ref, onMounted, watch } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import { fetchWithAuth } from '../../utils/api';
import { useDetailsStore } from '../../stores/details';

const detailsStore = useDetailsStore();

interface Transaction {
  createdAt: string;
  amount: number;
}

const popolaArrayDate = () => {
  const arrayDay = [];
  const oggi = new Date();

  for (let i = 5; i >= 1; i--) {
    const giorno = new Date(oggi);
    giorno.setDate(oggi.getDate() - i);
    const giornoDelMese = String(giorno.getDate()).padStart(2, '0');
    const mese = giorno.toLocaleString('default', { month: 'short' }).charAt(0).toUpperCase() + giorno.toLocaleString('default', { month: 'short' }).slice(1);
    arrayDay.push(`${giornoDelMese} ${mese}`);
  }
  return arrayDay;
};

const arrayDay = popolaArrayDate();

export default {
  name: 'GoalCharts',
  components: {
    apexchart: ApexCharts
  },
  setup() {
    const series = ref([
      {
        name: 'Transazioni',
        data: [] as number[],
      },
    ]);

    const chartOptions = ref({
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
        text: 'Transaction Trends',
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
        categories: arrayDay,
        labels: {
          show: true,
          style: {
            colors: Array(arrayDay.length).fill('#000000'),
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

    const fetchTransactions = async () => {
      if (!detailsStore.accountID) return; // Don't do anything if accountID is not defined
      console.log('Fetching transactions for account ID:', detailsStore.accountID);
      try {
        const response = await fetchWithAuth(`http://localhost:3000/transactions/user/latest?accountID=${detailsStore.accountID}`, {
          method: 'GET',
        });
        const responseData = await response.json();

        if (response.ok && Array.isArray(responseData)) {
          const datiPerGiorno = Array(5).fill(0);
          const today = new Date();
          const todayWithoutTime = new Date(today.toISOString().split('T')[0]).getTime();

          responseData.forEach((transaction: Transaction) => {
            const transactionDate = new Date(transaction.createdAt);
            const transactionDateWithoutTime = new Date(transactionDate.toISOString().split('T')[0]).getTime();

            const daysDifference = Math.floor((todayWithoutTime - transactionDateWithoutTime) / (1000 * 3600 * 24));
            if (daysDifference > 0 && daysDifference <= 5) {
              datiPerGiorno[daysDifference -1] += transaction.amount;
            }
          });

          series.value[0].data = datiPerGiorno.reverse();
          console.log('Updated series data:', series.value[0].data); // Log updated data
        } else {
          console.error('No transactions found or incorrect response:', responseData);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    onMounted(() => {
      fetchTransactions(); // Fetch initial transactions
    });

    const formatMillions = (num: number) => {
      if (Math.abs(num) >= 1_000_000) {
        return (num / 1_000_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M'; // Abbreviate millions
      } else if (Math.abs(num) >= 1_000) {
        return (num / 1_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'k'; // Abbreviate millions
      }
      return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Format smaller numbers to two decimal places
    };

    // Watch for changes in the accountID
    watch(
      () => detailsStore.accountID,
      (newAccountID, oldAccountID) => {
        console.log(`Account ID changed from ${oldAccountID} to ${newAccountID}`); // Log changes
        if (newAccountID !== oldAccountID) {
          fetchTransactions(); // Fetch transactions when account ID changes
        }
      },
      { immediate: true } // Optional: fetch immediately if accountID is set
    );

    watch(
      () => detailsStore.changes,
      (newChanges, oldChanges) => {
        console.log(`Account ID changed from ${oldChanges} to ${newChanges}`); // Log changes
        if (newChanges !== oldChanges) {
          fetchTransactions(); // Fetch transactions when account ID changes
        }
      },
      { immediate: true } // Optional: fetch immediately if accountID is set
    );

    return {
      series,
      chartOptions,
      detailsStore, // Expose the store to use it in the template if needed
    };
  },
}
</script>

<style>
#app {
  background-color: transparent;
}
</style>
