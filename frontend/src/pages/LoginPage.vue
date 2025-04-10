<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view />
      <q-page
        class="q-pa-md flex flex-center"
        style="background-image: url('https://wallpapers.com/images/featured/blu-4k-rlj56byhjvznamv0.jpg'); background-size: cover; background-position: center"
      >
        <div class="custom-login flex justify-center items-center" style="width: 70%; border-radius: 30px; background-color: rgba(12, 23, 43, 0.5); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(10px);">
          <div style="width: 50%" class="q-pa-md">
            <img src="~assets/lunafunds_logo.png" alt="logo" width="100%" height="100%" class="rotate-image"/>
          </div>
          <div v-if="isLogin" class="text-white q-pa-md" style="width: 50%; padding-left: 80px; padding-right: 80px;">
            <p class="text-primary text-bold text-white text-h3">Login</p>
            <span class="text-grey text-bold" style="font-size: 110%">Don't have an Account? <span @click="isLogin = false; isChecked = false" class="text-secondary" style="cursor: pointer;">Sign up</span></span>

            <form @submit.prevent="handleLogin" class="q-mt-xl">
              <q-input
                filled
                v-model="email"
                label="Email"
                type="email"
                :dense="dense"
                color="white"
                label-color="white"
                style="background-color: rgba(17, 37, 74); border-radius: 5px"
                input-class="text-white"
                required
              />
              <br/>
              <q-input
                filled
                v-model="password"
                label="Password"
                type="password"
                :dense="dense"
                color="white"
                label-color="white"
                input-class="text-white"
                style="background-color: rgba(17, 37, 74); border-radius: 5px"
                required
              />
              <div class="flex items-center">
                <q-checkbox v-model="isChecked" label="I agree to the" color="secondary" class="text-white" />
                <span style="cursor: pointer;" class="q-ml-xs text-bold text-secondary" @click="showTerms = true">Terms & Conditions</span>
              </div>
              <div class="text-red" style="height: 15px">
                <span v-if="loginError"> {{ loginError }}</span>
              </div>
              <q-btn push color="secondary" class="q-mt-lg" label="Login" style="width: 100%; padding-top: 12px; padding-bottom: 12px" type="submit" />
            </form>
          </div>
          <div v-else class="text-white q-pa-md" style="width: 50%; padding-left: 80px; padding-right: 80px;">
            <p class="text-primary text-bold text-white text-h3">Sign Up</p>
            <span class="text-grey text-bold" style="font-size: 110%">Have an Account? <span @click="isLogin = true; isChecked = true" class="text-secondary" style="cursor: pointer;">Sign in</span> </span>

            <form @submit.prevent="handleSignUp" class="q-mt-xl">
              <div v-if="firstStep">
                <q-input
                  filled
                  v-model="email"
                  type="email"
                  label="Email"
                  :dense="dense"
                  color="white"
                  label-color="white"
                  style="background-color: rgba(17, 37, 74); border-radius: 5px"
                  input-class="text-white"
                  required
                />
                <br/>
                <q-input
                  filled
                  v-model="password"
                  label="Password"
                  type="password"
                  :dense="dense"
                  color="white"
                  label-color="white"
                  input-class="text-white"
                  style="background-color: rgba(17, 37, 74); border-radius: 5px"
                  required
                />
              </div>

              <div v-else>
                <div class="flex justify-between">
                  <q-input
                    filled
                    v-model="firstName"
                    label="First Name"
                    :dense="dense"
                    color="white"
                    label-color="white"
                    style="background-color: rgba(17, 37, 74); border-radius: 5px; width: 48%"
                    input-class="text-white"
                    required
                  />
                  <q-input
                    filled
                    v-model="lastName"
                    label="Last Name"
                    :dense="dense"
                    color="white"
                    label-color="white"
                    style="background-color: rgba(17, 37, 74); border-radius: 5px; width: 48%"
                    input-class="text-white"
                    required
                  />
                </div>
                <br/>
                <div class="flex justify-between">
                  <q-input
                    filled
                    v-model="accountName"
                    label="Account Name"
                    :dense="dense"
                    color="white"
                    label-color="white"
                    style="background-color: rgba(17, 37, 74); border-radius: 5px; width: 48%"
                    input-class="text-white"
                    required
                  />
                  <q-select
                    filled
                    v-model="currencySelected"
                    :options="computedCurrencies"
                    label="Currency"
                    :dense="dense"
                    color="white"
                    label-color="white"
                    style="background-color: rgba(17, 37, 74); border-radius: 5px; width: 48%;"
                    input-class="text-white"
                    class="text-white custom-select"
                    required
                  />
                </div>
              </div>
              <div v-if="firstStep && !isLogin" class="flex items-center">
                <q-checkbox v-model="isChecked" label="I agree to the" color="secondary" class="text-white" />
                <span style="cursor: pointer;" class="q-ml-xs text-bold text-secondary" @click="showTerms = true">Terms & Conditions</span>
              </div>
              <div v-else style="height: 40px;" class="flex items-center text-bold"><span @click="firstStep = true" style="cursor: pointer"><span class="q-mb-xs q-mr-xs">←</span>Go back</span></div>

              <div class="text-red" style="height: 15px">
                <span v-if="registerError"> {{ registerError }}</span>
              </div>
              <q-btn push color="secondary" class="q-mt-lg" label="Sign Up" style="width: 100%; padding-top: 12px; padding-bottom: 12px" type="submit"/>
            </form>
          </div>
        </div>
        <TermsConditionsModal v-model="showTerms" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useDetailsStore } from 'src/stores/details';
import TermsConditionsModal from 'components/Modals/Terms&ConditionsModal.vue';

const email = ref('');
const password = ref('');
const firstName = ref('');
const lastName = ref('');
const accountName = ref('');
const showTerms = ref(false);
const isChecked = ref(true);
const dense = ref(false);
const loginError = ref('');
const registerError = ref('');
const router = useRouter();
const authStore = useAuthStore();
const detailsStore = useDetailsStore();
const isLogin = ref(true);
const firstStep = ref(true);
const currencySelected = ref({ label: 'USD $', value: '$'});
const currencyOptions = ref([
  { label: 'EUR €', value: '€'},
  { label: 'USD $', value: '$'},
  { label: 'GBT £', value: '£'},
]);

watch(password, (newVal) => {
  password.value = newVal.trim();
});

watch(email, (newVal) => {
  email.value = newVal.trim();
});

watch(firstName, (newVal) => {
  firstName.value = newVal.trim();
});

watch(lastName, (newVal) => {
  lastName.value = newVal.trim();
});

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

const handleLogin = async () => {
  if(!isChecked.value) {
    loginError.value = 'You must agree to the terms and conditions';
    setTimeout(() => {
      loginError.value = '';
    }, 3000);
    return;
  }
  try {
    await authStore.login(email.value.trim(), password.value.trim());

    const userDetails = {
      name: authStore.userDetails.name || 'Unknown User',
      accountID: authStore.userDetails.accountID || '00000',
      groupID: authStore.userDetails.groupID || '00000',
      currency: authStore.userDetails.currency || 'USD',
      changes: '0',
      iban: authStore.userDetails.iban || '00000',
    };

    detailsStore.setDetails(userDetails.name, userDetails.accountID, userDetails.groupID, userDetails.currency, userDetails.changes, userDetails.iban);
    router.push({ name: 'Home' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      loginError.value = 'Credenziali Errate';
      setTimeout(() => {
        loginError.value = '';
      }, 3000);
    } else {
      loginError.value = 'Login failed';
    }
  }
};

watch(firstStep, (newVal) => {
  if (newVal) {
    isChecked.value = true;
  }
});

const handleSignUp = async (event: Event) => {
  event.preventDefault();
  if(!isChecked.value) {
    registerError.value = 'You must agree to the terms and conditions';
    setTimeout(() => {
      registerError.value = '';
    }, 3000);
    return;
  }
  if (firstStep.value) {
    firstStep.value = false;
  } else {
    let name = `${firstName.value.trim()} ${lastName.value.trim()}`;
    try {
      if(password.value.trim() === '' || email.value.trim() === '' || name.trim() === '' || accountName.value.trim() === '') {
        registerError.value = 'All fields are required';
        setTimeout(() => {
          registerError.value = '';
        }, 3000);
        return;
      }
      await authStore.register(email.value.trim(), password.value.trim(), name, accountName.value.trim(), currencySelected.value.value);

      const userDetails = {
        name: authStore.userDetails.name || 'Unknown User',
        accountID: authStore.userDetails.accountID || '00000',
        groupID: authStore.userDetails.groupID || '00000',
        currency: authStore.userDetails.currency || 'USD',
        changes: '0',
        iban: authStore.userDetails.iban || '00000',
      };

      detailsStore.setDetails(userDetails.name, userDetails.accountID, userDetails.groupID, userDetails.currency, userDetails.changes, userDetails.iban);
      router.push({ name: 'Home' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        registerError.value = 'Email gia\' registrata';
      } else {
        registerError.value = 'Register failed';
      }
    }
  }
};
</script>

<style lang="scss">
.custom-btn.q-btn--push {
  transition: background-color 0.3s ease !important;

  &:hover {
    background-color: var(--q-secondary) !important;
  }
}

.custom-select .q-field__native {
  color: white !important;
}

.rotate-image {
  animation: rotate 12s linear infinite;
  width: 120% !important;
  height: 120% !important;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
