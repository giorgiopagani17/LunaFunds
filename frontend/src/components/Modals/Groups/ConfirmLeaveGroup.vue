<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg"
            style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">
          LEAVE GROUP
        </h5>

        <div class="text-center q-mt-lg q-mb-md" style="font-size: 110%">
          Are you sure you want to leave the group? <br/> Once confirmed, you will no longer be able to participate <br/> in the group’s decisions and activities.
        </div>
        <div class="text-center text-bold text-negative" style="font-size: 120%">
          Once confirmed, your transactions will be deleted.
        </div>

      </q-card-section>
      <q-card-actions class="q-mt-md" >
        <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
        <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Leave" color="negative" @click="leaveGroup()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import {defineEmits, computed, defineProps} from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'stores/details';
import { Notify } from 'quasar';

const props = defineProps({
  modelValue: Boolean,
});

const detailsStore = useDetailsStore();
const emit = defineEmits(['update:modelValue']);

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const closeModal = () => {
  const changes = parseInt(detailsStore.changes ? detailsStore.changes.toString() : '0');
  detailsStore.setChanges((changes + 1).toString());
  detailsStore.setGroupID('');
  isVisible.value = false;
};

const leaveGroup = async () => {
  try {
    await fetchWithAuth(`http://localhost:3000/groups/leave/${detailsStore.groupID}`, {
      method: 'DELETE'
    });
    isVisible.value = false;
    closeModal();

    Notify.create({
      type: 'positive',
      message: 'You left the group!',
      color: 'negative',
    });
  } catch (error) {
    console.error(error);
    Notify.create({
      type: 'negative',
      message: 'Error leaving the group!',
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
