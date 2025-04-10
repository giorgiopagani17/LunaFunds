<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg"
            style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">
          NEW GROUP
        </h5>

        <div class="flex items-center justify-between q-mt-lg">
          <div class="flex items-center">
            <q-icon name="text_snippet" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Name:</span>
          </div>
          <q-input
            v-model="groupName"
            maxlength="20"
            dense
            color="secondary"
            placeholder="Insert a name"
            lazy-rules
            style="width: 40%"
            :error="groupNameError"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <q-icon name="currency_exchange" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Currency:</span>
          </div>
          <q-select
            v-model="currencySelected"
            :options="computedCurrencies"
            color="secondary"
            style="width: 40%"
            :error="currencyError"
          />
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md" >
        <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Create" color="positive" @click="createGroup()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, defineProps, defineEmits, ref} from 'vue';
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

const groupName = ref('');
const groupNameError = ref(false);
const currencyError = ref(false);
const detailsStore = useDetailsStore();
const currencySelected = ref({ label: 'Select a Currency', value: 'none'});
const currencyOptions = ref([
  { label: 'EUR €', value: '€'},
  { label: 'USD $', value: '$'},
  { label: 'GBT £', value: '£'},
]);

const computedCurrencies = computed(() => {
  if (Array.isArray(currencyOptions.value)) {
    return currencyOptions.value
      .filter((currency) => currency.value !== (currencySelected.value.value).toString())
      .map((currency) => ({
        label: currency.label,
        value: currency.value,
      }));
  }
  return [];
});

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const closeModal = () => {
  isVisible.value = false;
  groupName.value = '';
  currencySelected.value = { label: 'Select a Currency', value: 'none'};
};

const refreshChanges = (groupId: string) => {
  detailsStore.setGroupID((groupId));
};


const createGroup = async () => {
  groupNameError.value = !groupName.value.trim();
  currencyError.value = currencySelected.value.value === 'none';

  setTimeout(() => {
    groupNameError.value = false;
    currencyError.value = false;
  }, 3000);

  if (groupNameError.value || currencyError.value) {
    console.error('Validation Error: At least one of Name or Currency is missing.');
    return;
  }

  try {
    const response = await fetchWithAuth('http://localhost:3000/groups', {
      method: 'POST',
      body: JSON.stringify({
        name: groupName.value.trim(),
        currency: currencySelected.value.value,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Group created successfully:', data);

    refreshChanges(data.id.toString());
    closeModal();

    Notify.create({
      type: 'positive',
      message: `Group ${groupName.value.trim()} created successfully!`,
      color: 'positive',
    });
  } catch (error) {
    console.error('Error while creating group:', error);
    Notify.create({
      type: 'negative',
      message: 'Error creating group!',
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

@media (min-width: 550px) {
  .custom-modal {
    min-width: 500px;
  }
}
</style>
