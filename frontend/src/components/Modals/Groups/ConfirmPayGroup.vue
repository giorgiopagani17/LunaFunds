<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg"
            style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">
          VOTE PAY GROUP
        </h5>

        <div class="text-center q-mt-lg q-mb-md" style="font-size: 110%">
          By confirming your intent to proceed with the group payment, <br/> once all members have voted, the group will be deleted, <br/> and you will authorize LunaFunds to send an automatic <br/> bank transfer to settle the group's accounts.
        </div>
        <div class="text-center text-bold text-negative" style="font-size: 120%">
          Once you confirm, you will not be able to undo it.
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md" >
        <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Confirm" color="positive" @click="setPayGroup()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import {defineEmits, computed, defineProps} from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'stores/details';
import { Notify } from 'quasar';

const detailsStore = useDetailsStore();

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirmed', value: boolean): void;
}>();

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const closeModal = () => {
  isVisible.value = false;
};

const setPayGroup = async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/groups/pay/${detailsStore.groupID}`, {
      method: 'PUT'
    });
    isVisible.value = false;
    emit('confirmed', true);

    const responseText = await response.text();
    if (responseText === 'deletedGroup') {
      detailsStore.setGroupID('00000');
      detailsStore.setGroupChanges((parseInt(detailsStore.groupChanges) + 1).toString());
    }
    closeModal();

    Notify.create({
      type: 'positive',
      message: 'You voted to pay the group!',
      color: 'positive',
    });
  } catch (error) {
    console.error(error);
    Notify.create({
      type: 'negative',
      message: 'Error voting to pay the group!',
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
