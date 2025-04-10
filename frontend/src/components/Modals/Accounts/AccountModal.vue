<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <q-btn
          v-if="props.account"
          flat
          round
          dense
          icon="close"
          color="grey-8"
          @click="closeModal"
          style="position: absolute; top: 15px; right: 5px;"
        />
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg"
            style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">
          {{ props.account ? 'EDIT ACCOUNT' : 'NEW ACCOUNT' }}
        </h5>

        <div class="flex items-center justify-between q-mt-lg">
          <div class="flex items-center">
            <q-icon name="text_snippet" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Name:</span>
          </div>
          <q-input
            v-model="accountName"
            maxlength="20"
            dense
            input-class='text-center'
            color="secondary"
            placeholder="Insert a name"
            lazy-rules
            style="width: 35%"
            :error="accountNameError"
          />
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md" >
        <div v-if="props.account" class="flex justify-between" style="width: 100%">
          <div class="flex flex-col" style="align-items: center;">
            <q-btn
              v-if="deleteConfirmationShown"
              flat
              style="width: 100px; font-size: 110%"
              label="Confirm"
              color="negative"
              @click="deleteAccount"
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
          <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Update" color="positive" @click="updateAccount()" :disabled="isUpdateDisabled"/>
        </div>
        <div v-else class="flex justify-between" style="width: 100%">
          <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
          <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Create" color="positive" @click="createAccount()" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, defineProps, defineEmits, ref, PropType} from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'stores/details';
import {Notify} from 'quasar';

class Account {
  id?: number;
  name?: string;
  totalAmount?: number;
  default?: boolean;
}

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  account: {
    type: Object as PropType<Account | null>,
    default: () => null,
  },
});

const accountName = ref(props.account?.name ? props.account.name || '' : '');
const accountNameError = ref(false);
const detailsStore = useDetailsStore();
const deleteConfirmationShown = ref(false);

const showDeleteConfirmation = () => {
  deleteConfirmationShown.value = true;
  setTimeout(() => {
    deleteConfirmationShown.value = false;
  }, 3000); // Adjust the timeout duration as needed
};

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const closeModal = () => {
  isVisible.value = false;
  accountName.value = '';
};

const refreshChangesEdit = () => {
  const changes = parseInt(detailsStore.changes ? detailsStore.changes.toString() : '0');
  detailsStore.setChanges((changes + 1).toString());
};

const refreshChangesCreateDelete = (accountId: string) => {
  detailsStore.setAccountID((accountId));
};


const isUpdateDisabled = computed(() => {
  if (!props.account) {
    return;
  }
  return accountName.value === props.account.name
});

const createAccount = async () => {
  accountNameError.value = !accountName.value.trim();

  setTimeout(() => {
    accountNameError.value = false;
  }, 3000);

  if (accountNameError.value) {
    console.error('Validation Error: Name is missing.');
    return;
  }

  try {
    const response = await fetchWithAuth('http://localhost:3000/accounts', {
      method: 'POST',
      body: JSON.stringify({
        name: accountName.value.trim(),
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Account created successfully:', data);

    refreshChangesCreateDelete(data.account.id.toString());
    closeModal();
  } catch (error) {
    console.error('Error while creating account:', error);
  }
};

const deleteAccount = async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/accounts/delete/${props.account?.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Account deleted successfully:', data);

    refreshChangesCreateDelete(data.toString());
    closeModal();
  } catch (error) {
    console.error('Error while deleting account:', error);
  }
};

const updateAccount = async () => {
  accountNameError.value = !accountName.value.trim();

  setTimeout(() => {
    accountNameError.value = false;;
  }, 3000);

  if (accountNameError.value) {
    console.error('Validation Error: At least one of Name or Amount is missing.');
    return;
  }

  try {
    if(!props.account) {
      console.error('Account is missing.');
      return;
    }

    const response = await fetchWithAuth(`http://localhost:3000/accounts/update/${props.account?.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: accountName.value.trim(),
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Account updated successfully:', data);

    refreshChangesEdit();
    closeModal();

    Notify.create({
      type: 'positive',
      message: 'You updated the account name!',
      color: 'positive',
    });
  } catch (error) {
    console.error('Error while updating account:', error);
    Notify.create({
      type: 'negative',
      message: 'Error updating the account name!',
      color: 'negative',
    });
  }
}
</script>

<style scoped>
.custom-modal {
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
}

@media (min-width: 500px) {
  .custom-modal {
    min-width: 450px;
  }
}
</style>
