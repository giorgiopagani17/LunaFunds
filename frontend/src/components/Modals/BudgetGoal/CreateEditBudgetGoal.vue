<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <q-btn
          v-if="props.data"
          flat
          round
          dense
          icon="close"
          color="grey-8"
          @click="closeModal"
          style="position: absolute; top: 15px; right: 5px;"/>
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg"
            style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">
          {{ `${props.data ? 'EDIT' : 'NEW'} ${props.type.toUpperCase()}` }}
        </h5>

        <div class="flex items-center justify-center q-py-lg" style="border-bottom: solid 1px #E9E9E9">
          <div class="text-center q-mr-sm" style="font-size: 250%; width: 5%">
            <q-icon name="data_saver_on" class="q-mr-sm"/>
          </div>
          <q-input
            v-model="budgetGoalAmount"
            maxlength="8"
            dense
            type="number"
            color="secondary"
            placeholder="10.00"
            lazy-rules
            style="width: 150px; font-size: 300%; padding: 0% !important"
            :input-class="[
              'text-center',
              'q-pb-sm'
            ]"
            :error="budgetGoalAmountError"
          />
          <span
            class="q-ml-sm"
            style="font-size: 250%;"
          >
            {{ detailsStore.currency }}
          </span>
        </div>

        <div class="flex items-center justify-between q-mt-lg">
          <div class="flex items-center">
            <q-icon name="text_snippet" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Name:</span>
          </div>
          <q-input
            v-model="budgetGoalName"
            maxlength="7"
            dense
            color="secondary"
            placeholder="Insert a name"
            lazy-rules
            style="width: 40%"
            :error="budgetGoalNameError"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <q-icon name="event" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Timeline:</span>
          </div>
          <q-select
            v-model="timelineSelected"
            dense
            color="secondary"
            :options="computedTimelines"
            lazy-rules
            style="width: 40%"
            :error="budgetGoalTimelineError"
            popup-content-class="dropdown-style menu-scroll"
            behavior="menu"
          />
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md" >
        <div v-if="props.data" class="flex justify-between" style="width: 100%">
          <div class="flex flex-col" style="align-items: center;">
            <q-btn
              v-if="deleteConfirmationShown"
              flat
              style="width: 100px; font-size: 110%"
              label="Confirm"
              color="negative"
              @click="deleteBudgetGoal"
            />
            <q-btn
              v-else
              flat
              style="width: 100px; font-size: 110%"
              label="Delete"
              color="negative"
              @click="showDeleteConfirmation"
            />
          </div>
          <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Update" color="positive" @click="updateBudgetGoal()" :disabled="isUpdateDisabled"/>
        </div>
        <div v-else class="flex justify-between" style="width: 100%">
          <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="negative" @click="closeModal()"/>
          <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Create" color="positive" @click="createBudgetGoal()" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, defineProps, defineEmits, ref, watch, PropType} from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'stores/details';
import {Notify} from 'quasar';

interface BudgetGoalData {
  id?: number;
  userId?: number;
  categoryId?: number;
  accountID?: number;
  image?: string;
  name?: string;
  amount?: number;
  timeline?: string; // Update to string
  createdAt?: Date;
  transactionSum?: number;
}

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object as PropType<BudgetGoalData | null>,
    default: () => null,
  },
  type: {
    type: String,
    required: true,
  },
});

const budgetGoalName = ref('');
const budgetGoalAmount = ref<number>(0);
const budgetGoalTimeline = ref('');
const budgetGoalNameError = ref(false);
const budgetGoalAmountError = ref(false);
const budgetGoalTimelineError = ref(false);
const detailsStore = useDetailsStore();
const deleteConfirmationShown = ref(false);

const timelineSelected = ref({ label: 'Select a Timeline', value: 'none' });
const timelineOptions = ref([
  { label: 'Weekly', value: 'weekly'},
  { label: 'Monthly', value: 'monthly'},
  { label: 'Annual', value: 'annual'},
]);

watch(
  () => props.data,
  () => {
    if (props.data) {
      timelineSelected.value = {
        label: props.data.timeline ? props.data.timeline.charAt(0).toUpperCase() + props.data.timeline.slice(1) : 'Select a Timeline',
        value: props.data.timeline ? props.data.timeline : '0',
      };
      budgetGoalAmount.value = props.data.amount ?? 0; // Provide a default value of 0
      budgetGoalName.value = props.data.name ?? 'Ciao'; // Provide a default value of an empty string
    } else {
      timelineSelected.value = { label: 'Select a Timeline', value: 'none' };
    }
  },
  { immediate: true },
);

const showDeleteConfirmation = () => {
  deleteConfirmationShown.value = true;
  setTimeout(() => {
    deleteConfirmationShown.value = false;
  }, 3000); // Adjust the timeout duration as needed
};

const computedTimelines = computed(() => {
  if (Array.isArray(timelineOptions.value)) {
    return timelineOptions.value
      .filter((timeline) => timeline.value !== (timelineSelected.value.value).toString())
      .map((timeline) => ({
        label: timeline.label,
        value: timeline.value,
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
  budgetGoalName.value = '';
  budgetGoalAmount.value = 100;
  budgetGoalTimeline.value = '';
};

const refreshChanges = () => {
  const changes = parseInt(detailsStore.changes ? detailsStore.changes.toString() : '0');
  detailsStore.setChanges((changes + 1).toString());
};

const isUpdateDisabled = computed(() => {
  if (!props.data) {
    return;
  }
  return budgetGoalAmount.value === Math.abs(props.data.amount ?? 0) &&
    budgetGoalName.value === props.data.name &&
    timelineSelected.value?.value === props.data.timeline;
});

const createBudgetGoal = async () => {
  budgetGoalNameError.value = !budgetGoalName.value.trim();
  budgetGoalAmountError.value = !budgetGoalAmount.value || isNaN(Number(budgetGoalAmount.value)) || Number(budgetGoalAmount.value) === 0;
  budgetGoalTimelineError.value = timelineSelected.value?.value === 'none';

  setTimeout(() => {
    budgetGoalNameError.value = false;
    budgetGoalAmountError.value = false;
    budgetGoalTimelineError.value = false;
  }, 3000);

  if (budgetGoalNameError.value || budgetGoalAmountError.value || budgetGoalTimelineError.value) {
    console.error('Validation Error: At least one of Name, Amount or Timeline is missing.');
    return;
  }
  const accountId = detailsStore.accountID ? parseInt(detailsStore.accountID) : 0;

  try {
    const response = await fetchWithAuth(`http://localhost:3000/${props.type}s`, {
      method: 'POST',
      body: JSON.stringify({
        name: budgetGoalName.value.trim(),
        amount: Number(budgetGoalAmount.value),
        timeline: timelineSelected.value.value,
        accountId: accountId,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('BudgetGoal created successfully:', data);

    refreshChanges();
    closeModal();

    Notify.create({
      type: 'positive',
      message: `${props.type.charAt(0).toUpperCase() + props.type.slice(1)} created successfully!`,
      color: 'positive',
    });
  } catch (error) {
    console.error('Error while creating BudgetGoal:', error);
    Notify.create({
      type: 'negative',
      message: `Error creating ${props.type}!`,
      color: 'negative',
    });
  }
};

const deleteBudgetGoal = async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/${props.type}s/delete/${props.data?.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('BudgetGoal deleted successfully:', data);

    refreshChanges();
    closeModal();
  } catch (error) {
    console.error('Error while deleting BudgetGoal:', error);
  }
};

const updateBudgetGoal = async () => {
  budgetGoalNameError.value = !budgetGoalName.value;
  budgetGoalAmountError.value = !budgetGoalAmount.value || isNaN(Number(budgetGoalAmount.value)) || Number(budgetGoalAmount.value) === 0;
  budgetGoalTimelineError.value = timelineSelected.value?.value === '0';

  setTimeout(() => {
    budgetGoalNameError.value = false;
    budgetGoalAmountError.value = false;
    budgetGoalTimelineError.value = false;
  }, 3000);

  console.log('budgetGoalName.value:', budgetGoalName.value);
  console.log('budgetGoalAmount.value:', budgetGoalAmount.value);
  console.log('budgetGoalTimeline.value:', timelineSelected.value.value);
  if (budgetGoalNameError.value || budgetGoalAmountError.value || budgetGoalTimelineError.value) {
    console.error('Validation Error: At least one of Name, Amount or Timeline is missing.');
    return;
  }

  const accountId = detailsStore.accountID ? parseInt(detailsStore.accountID) : 0;

  try {
    if(!props.data) {
      console.error('BudgetGoal is missing.');
      return;
    }

    const response = await fetchWithAuth(`http://localhost:3000/${props.type}s/update/${props.data?.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: budgetGoalName.value,
        amount: Number(budgetGoalAmount.value),
        timeline: timelineSelected.value.value,
        accountId: accountId,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('BudgetGoal updated successfully:', data);

    refreshChanges();
    closeModal();
  } catch (error) {
    console.error('Error while updating BudgetGoal:', error);
  }
}
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
