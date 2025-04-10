<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <div class="text-h5 q-mb-md text-center text-bold text-secondary q-pb-lg" style="border-bottom: solid 1px #E9E9E9">
          DOWNLOAD REPORT
        </div>

        <span class="text-center text-bold text-grey q-mb-sm q-mt-lg" style="font-size: 120%">Choose an Option:</span>
        <div class="flex items-center justify-between q-px-xl q-mb-md">
          <div class="flex items-center justify-center" style="width: 100px">
            <q-radio v-model="reportType" color="secondary" val="excel" label="Excel" />
          </div>
          <div class="flex items-center justify-center" style="width: 100px">
            <q-radio v-model="reportType" color="secondary" val="pdf" label="PDF" />
          </div>
        </div>

        <span class="text-center text-bold text-grey q-mb-xs q-mt-lg" style="font-size: 120%">Choose the Timeline:</span>
        <div class="flex items-center justify-between q-px-xl q-mb-md">
          <div>
            <q-select v-model="selectedMonth"  color="secondary" :options="months" label="Month" style="width: 100px" popup-content-class="dropdown-style menu-scroll" behavior="menu"/>
          </div>
          <div>
            <q-select v-model="selectedYear"  color="secondary" :options="years" label="Year" style="width: 100px" popup-content-class="dropdown-style menu-scroll" behavior="menu"/>
          </div>
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md">
        <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="download" color="positive" :disable="isDisabled" @click="downloadReport()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'stores/details';
import {Notify} from 'quasar';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const detailsStore = useDetailsStore();

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isDisabled = computed(() => {
  return selectedMonth.value === null || selectedYear.value === null;
});

const reportType = ref('excel');
const selectedMonth = ref<{ label: string; value: string } | null>(null);
const selectedYear = ref<{ label: string; value: string } | null>(null);
const timeline = ref('');

const months = [
  { label: 'None', value: 'none' },
  { label: 'January', value: 'january' },
  { label: 'February', value: 'february' },
  { label: 'March', value: 'march' },
  { label: 'April', value: 'april' },
  { label: 'May', value: 'may' },
  { label: 'June', value: 'june' },
  { label: 'July', value: 'july' },
  { label: 'August', value: 'august' },
  { label: 'September', value: 'september' },
  { label: 'October', value: 'october' },
  { label: 'November', value: 'november' },
  { label: 'December', value: 'december' },
];

const years = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: year.toString(), value: year.toString() };
});

const closeModal = () => {
  isVisible.value = false;
};

const downloadReport = async function() {
  if (selectedMonth.value && selectedMonth.value.value === 'none') {
    if (selectedYear.value) {
      timeline.value = selectedYear.value.value;
    }
  } else {
    if (selectedMonth.value && selectedYear.value) {
      timeline.value = `${selectedMonth.value.value}${selectedYear.value.value}`;
    }
  }

  try {
    const response = await fetchWithAuth(`http://localhost:3000/reports/${detailsStore.accountID}/${reportType.value}/${timeline.value}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', reportType.value === 'excel' ? `report_${timeline.value}.xlsx` : `report_${timeline.value}.pdf`); // Set the file name based on type
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    closeModal();

    Notify.create({
      type: 'positive',
      message: 'You downloaded the report successfully!',
      color: 'positive',
    });
  } catch (error) {
    console.error('Error downloading the report:', error);
    Notify.create({
      type: 'negative',
      message: 'Error downloading the report!',
      color: 'negative',
    });
  }
};
</script>

<style scoped>
.custom-modal {
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
}
@media (min-width: 450px) {
  .custom-modal {
    min-width: 400px;
  }
}

menu-scroll {
  max-height: 150px;
  overflow-y: scroll;
  padding-right: 10px;
  scrollbar-width: thin;
  scrollbar-color: #0549B7 transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #1F2A3C;
    border-radius: 10px;
    opacity: 1;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: darken(#1F2A3C, 10%);
  }

  &::-webkit-scrollbar {
    display: block;
  }
}
</style>
