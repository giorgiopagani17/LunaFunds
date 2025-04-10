<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <div class="text-h5 q-mb-md text-center text-bold text-secondary q-pb-lg" style="border-bottom: solid 1px #E9E9E9">
          SET AS THE DEFAULT?
        </div>
        <span class="text-center text-grey">Every bank transfer, group or crypto transaction <br/> will be recorded in this account.</span>
      </q-card-section>
      <q-card-actions class="q-mt-md">
        <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="confirm" color="positive" @click="setDefaultAccount()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, defineProps, defineEmits} from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import {useDetailsStore} from 'stores/details';
import {Notify} from 'quasar';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  accountId: {
    type: String,
    required: true,
  },
});

const detailsStore = useDetailsStore();

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const closeModal = () => {
  refreshChanges();
  isVisible.value = false;
};

const refreshChanges = () => {
  const changes = parseInt(detailsStore.changes ? detailsStore.changes.toString() : '0');
  detailsStore.setChanges((changes + 1).toString());
};

const setDefaultAccount = async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/accounts/default/${props.accountId}`, {
      method: 'PUT',
      body: JSON.stringify({ accountId: 1 }), // Replace with the actual account ID
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Account set as default successfully:', data);

    closeModal();

    Notify.create({
      type: 'positive',
      message: 'You set the account as default successfully!',
      color: 'positive',
    });
  } catch (error) {
    console.error('Error while setting default account:', error);
    Notify.create({
      type: 'error',
      message: 'Error setting default account!',
      color: 'error',
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
</style>
