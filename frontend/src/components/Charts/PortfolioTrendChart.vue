<template>
  <div id="app" class="flex items-center">
    <apexchart
      :key="detailsStore.accountID"
      type="line"
      :options="chartOptions"
      :series="series"
      :height="250"
    />
  </div>
</template>

<script lang="ts">
import { ref, watch } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import { useDetailsStore } from '../../stores/details';

const detailsStore = useDetailsStore();

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
    last3Balance: {
      type: Number,
      required: true,
    },
    last2Balance: {
      type: Number,
      required: true,
    },
    last1Balance: {
      type: Number,
      required: true,
    },
    lastBalance: {
      type: Number,
      required: true,
    },
    newBalance: {
      type: Number,
      required: true,
    }
  },
  setup(props) {
    console.log(props);

    const now = new Date();
    const currentHour = now.getHours();
    const categories = Array.from({ length: 5 }, (_, i) => `${currentHour - 4 + i}:00`);

    const series = ref([
      {
        name: 'Balances',
        data: [
          props.last3Balance,
          props.last2Balance,
          props.last1Balance,
          props.lastBalance,
          props.newBalance
        ],
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
        text: 'Balance Trends',
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
        categories,
        labels: {
          show: true,
          style: {
            colors: Array(5).fill('#ffffff'),
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => `${formatMillions(value)} ${detailsStore.currency}`,
          show: true,
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
    });

    const formatMillions = (num: number) => {
      if (Math.abs(num) >= 1_000_000) {
        return (num / 1_000_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + 'M'; // Abbreviate millions
      } else if (Math.abs(num) >= 1_000) {
        return (num / 1_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + 'k'; // Abbreviate millions
      }
      return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Format smaller numbers to two decimal places
    };

    watch(
      () => [props.last3Balance, props.last2Balance, props.last1Balance, props.lastBalance, props.newBalance],
      (newValues) => {
        series.value = [
          {
            name: 'Balances',
            data: newValues,
          },
        ];
      }
    );

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
