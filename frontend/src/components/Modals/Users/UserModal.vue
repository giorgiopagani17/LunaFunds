<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section>

        <q-btn
          flat
          round
          dense
          icon="close"
          color="grey-8"
          @click="closeModal"
          style="position: absolute; top: 15px; right: 5px;"
        />
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg"
            style="font-weight: bold; font-size: 2em;">
         User Info
        </h5>


        <div class="flex items-center justify-between bg-primary q-pa-xs" style="margin: auto; border-radius: 12px; width: 99%">
          <span
            @click="index = 0"
            :class="{
              'text-secondary bg-white shadow-1': index === 0,
              'text-dark': index != 0
            }"
            style="cursor: pointer; font-weight: bold; padding: 5px 10px; border-radius: 8px; text-align: center; width: 33%; transition: all 0.3s;"
          >
            Profile
          </span>
          <span
            @click="index = 1"
            :class="{
              'text-secondary bg-white shadow-1': index === 1,
              'text-dark': index != 1
            }"
            style="cursor: pointer; font-weight: bold; padding: 5px 10px; border-radius: 8px; text-align: center; width: 33%; transition: all 0.3s;"
          >
            Details
          </span>
          <span
            @click="index = 2"
            :class="{
            'text-secondary bg-white shadow-1': index === 2,
            'text-dark': index != 2
          }"
            style="cursor: pointer; font-weight: bold; padding: 5px 10px; border-radius: 8px; text-align: center; width: 33%; transition: all 0.3s;"
          >
          Security
        </span>
        </div>

        <div v-if="index === 0" class="custom-card q-pa-lg q-mt-md" style="height: 50vh">
          <div class="q-pb-lg flex items-center" style="height: 50%; border-bottom: solid 1px #E9E9E9">
            <div class="flex items-center" style="width: 50%; height: 100%">
              <div class="rounded-circle">
                <q-icon name="person" color="white" style="font-size: 500%;"/>
              </div>
            </div>


            <div style="width: 50%">
              <div>
                <span class="text-bold text-grey">Name: <br/></span>
                <span style="font-weight: bold; font-size: 160%">{{ userInfo?.name ? `${userInfo.name.split(' ')[0]} ${userInfo.name.split(' ')[1][0]}.` : '' }}</span>
              </div>
              <div class="q-mt-md">
                <span class="text-bold text-grey">Active from: <br/></span>
                <span style="font-weight: bold; font-size: 150%">{{ userInfo?.name ? new Date(userInfo.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}}</span>
              </div>
            </div>
          </div>
          <div class="q-pt-lg" style="height: 50%">
            <div class="flex justify-between">
              <div>
                <span class="text-bold text-grey">Total Net Worth: <br/></span>
                <span style="font-weight: bold; font-size: 300%">
                  {{ userInfo?.totalTransactions !== undefined ? formatMillions(userInfo.totalTransactions) : 'Loading...' }}
                </span>
              </div>
              <div class="text-right">
                <span class="text-bold text-grey">Currency: <br/></span>
                <span class="text-center" style="font-weight: bold; font-size: 300%; width: 100%">{{ userInfo?.currency || 'Loading...' }}</span>
              </div>
            </div>
            <div class="flex justify-between q-pt-md">
              <div>
                <span class="text-bold text-grey">Default Account: <br/></span>
                <span style="font-weight: bold; font-size: 150%">{{ userInfo?.defaultAccount?.name || 'Loading...' }}</span>
              </div>
              <div class="text-right">
                <span class="text-bold text-grey">Accounts: <br/></span>
                <span class="text-center q-pl-sm" style="font-weight: bold; font-size: 150%; width: 100%">{{ userInfo?.numberOfAccounts || 'Loading...' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="index === 1" class="custom-card flex items-center q-pa-lg q-mt-md" style="height: 50vh">
          <div style="width: 100%">
            <p class="text-center text-h6 text-secondary text-bold">Edit Details</p>
            <div class="flex-inputs">
              <q-input filled color="secondary" v-model="userFirstName" label="First Name"/>
              <q-input filled color="secondary" v-model="userLastName" label="Last Name"/>
            </div>
            <br/>
            <q-input filled color="secondary" v-model="userEmail" label="Email" />
            <br/>
            <q-select filled color="secondary" v-model="userCurrency" :options="computedCurrencies" label="Currency" />
            <div class="q-mt-lg flex justify-between items-center">
              <q-btn
                v-if="deleteConfirmationShown"
                flat
                style="width: 100px; font-size: 110%"
                label="Confirm"
                color="negative"
                @click="deleteUser()"
              />
              <q-btn
                v-else
                flat
                style="width: 100px; font-size: 110%"
                label="Delete"
                color="negative"
                @click="showDeleteConfirmation"
              />
              <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Update" color="positive" :disabled="isUpdateDisabled" @click="updateUser()"/>
            </div>
          </div>
        </div>
        <div v-if="index === 2" class="custom-card flex items-center q-pa-lg q-mt-md" style="height: 50vh">
          <div style="width: 100%">
            <p class="text-center text-h6 text-secondary text-bold">Insert New Password</p>
            <q-input
              filled
              color="secondary"
              type="password"
              v-model="userPassword"
              label="Password"
            />
            <q-input
              filled
              class="q-mt-md"
              color="secondary"
              type="password"
              v-model="userConfirmPassword"
              label="Confirm Password"
              :error="userConfirmPassword !== userPassword && userPassword !== '' && userConfirmPassword !== ''"
              :error-message="'Password must be equal and not empty'"
            />
            <div class="flex justify-center">
              <q-btn flat style="font-size: 110%" label="Change Password" color="positive" :disabled="isUpdatePasswordDisabled" @click="updatePassword()"/>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, onMounted, watch } from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { Notify } from 'quasar';
import {useDetailsStore} from 'stores/details';

const props = defineProps({
  modelValue: Boolean,
});

interface Account {
  id: number;
  name: string;
  balance: number;
}

class UserInfo {
  name!: string;
  email!: string;
  createdAt!: string;
  currency!: string;
  accounts: Account[] = [];
  defaultAccount: Account | null = null;
  totalTransactions!: number;
  numberOfAccounts!: number;
}

const emit = defineEmits(['update:modelValue']);
const index = ref(0);
const userInfo = ref<UserInfo | null>(null);
const userFirstName = ref('');
const userLastName = ref('');
const detailsStore = useDetailsStore();
const userEmail = ref('');
const userPassword = ref('');
const userConfirmPassword = ref('');
const deleteConfirmationShown = ref(false);
const userCurrency = ref({ label: 'Select a Currency', value: '0' });
const currencyOptions = ref([
  { label: 'EUR €', value: '€'},
  { label: 'USD $', value: '$'},
  { label: 'GBT £', value: '£'},
]);

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const closeModal = () => {
  deleteConfirmationShown.value = false;
  isVisible.value = false;
};

const showDeleteConfirmation = () => {
  deleteConfirmationShown.value = true;
  setTimeout(() => {
    deleteConfirmationShown.value = false;
  }, 3000); // Adjust the timeout duration as needed
};

const formatMillions = (num: number) => {
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M'; // Abbreviate millions
  } else if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'k'; // Abbreviate millions
  }
  return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Format smaller numbers to two decimal places
};

const isUpdateDisabled = computed(() => {
  if (!userInfo.value) {
    return;
  }
  const [firstName, lastName] = userInfo.value.name.split(' ', 2);

  if(userEmail.value.trim() === '' ||
    userFirstName.value.trim() === '' ||
    userLastName.value.trim() === ''){
    return true;
  }

  return userEmail.value === userInfo.value.email &&
    userFirstName.value === firstName &&
    userLastName.value === lastName &&
    userCurrency.value.value === userInfo.value.currency;
});

const isUpdatePasswordDisabled = computed(() => {
  return userPassword.value.trim() === '' || userConfirmPassword.value.trim() === '' || userPassword.value.trim() !== userConfirmPassword.value.trim();
});

const computedCurrencies = computed(() => {
  if (Array.isArray(currencyOptions.value)) {
    return currencyOptions.value
      .filter((currency) => currency.value !== userCurrency.value.value)
      .map((currency) => ({
        label: currency.label,
        value: currency.value,
      }));
  }
  return [];
});

const fetchUserInfo = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/users/info/', {
      method: 'GET',
    });

    if (response.ok) {
      userInfo.value = await response.json();
    } else {
      console.error('Failed to fetch accounts:', response.statusText);
    }
  } catch (error) {
    console.error('Error while fetching accounts:', error);
  }
};

const updateUser = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/users/details', {
      method: 'PUT',
      body: JSON.stringify({
        name: `${userFirstName.value.trim()} ${userLastName.value.trim()}`,
        email: userEmail.value.trim(),
        currency: userCurrency.value.value,
      }),
    });

    if(response.ok){
      detailsStore.setCurrency(userCurrency.value.value);
      detailsStore.setName(`${userFirstName.value} ${userLastName.value}`);

      closeModal();

      Notify.create({
        type: 'positive',
        message: 'You updated your details!',
        color: 'positive',
      });
    }
  } catch (error) {
    console.error('Error while fetching accounts:', error);
    Notify.create({
      type: 'negative',
      message: 'Error updating your details!',
      color: 'negative',
    });
  }
}

const updatePassword = async () => {
  if (userPassword.value !== userConfirmPassword.value) {
    Notify.create({
      type: 'negative',
      message: 'Passwords do not match!',
      color: 'negative',
    });
    return;
  }

  try {
    const response = await fetchWithAuth('http://localhost:3000/users/password', {
      method: 'PUT',
      body: JSON.stringify({
        password: userPassword.value.trim(),
      }),
    });

    if (response.ok) {
      handleLogout();
      closeModal();
      Notify.create({
        type: 'positive',
        message: 'You updated your password!',
        color: 'positive',
      });
    } else {
      const errorData = await response.json();
      Notify.create({
        type: 'negative',
        message: errorData.message || 'Failed to update password!',
        color: 'negative',
      });
    }
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Error updating password!',
      color: 'negative',
    });
    console.error('Error while updating password:', error);
  }
};

const deleteUser = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/users', {
      method: 'DELETE',
    });

    if(response.ok){
      handleLogout();
      closeModal();

      Notify.create({
        type: 'positive',
        message: 'You delete your account!',
        color: 'negative',
      });
    }
  } catch (error) {
    console.error('Error while fetching accounts:', error);
    Notify.create({
      type: 'negative',
      message: 'Error deleting your account!',
      color: 'negative',
    });
  }
}

function handleLogout() {
  localStorage.clear();
  console.log('User logged out');
  window.location.href = 'http://localhost:9000/#';
}

watch(userInfo, (newUserInfo) => {
  if (newUserInfo) {
    const [firstName, lastName] = newUserInfo.name.split(' ', 2);
    userFirstName.value = firstName
    userLastName.value = lastName;
    userEmail.value = newUserInfo.email;

    userCurrency.value = currencyOptions.value.find(currency => currency.value === newUserInfo.currency) || { label: 'Select a Currency', value: '0' };
  }
});

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped lang="scss">
.custom-modal {
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
}

@media (min-width: 500px) {
  .custom-modal {
    min-width: 455px;
  }
}

.custom-card {
  border: 1px solid #E0E0E0;
  box-shadow: 0px 1.5px 3px rgba(0, 0, 0, 0.3),
  0px 5px 10px rgba(0, 0, 0, 0.1),
  inset 0 0 10px rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  transition: box-shadow 0.3s ease;
  background: white;
}

.rounded-circle {
  border-radius: 50%;
  height: 100%!Important;
  aspect-ratio: 1 / 1;
  background-image: url('https://img.freepik.com/free-vector/luxury-blue-golden-background_23-2149329431.jpg');
  display: flex;
  background-size: cover;
  background-position: center;
  justify-content: center;
  align-items: center;
}

.flex-inputs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2%;
}

.flex-inputs q-input {
  width: 48%;
}

.q-select {
  .q-field__native {
    color: black!important;
  }
}
</style>
