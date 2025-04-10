<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section>
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg"
            style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">
          Terms & Conditions
        </h5>
        <q-btn
          flat
          round
          dense
          icon="close"
          color="grey-8"
          @click="closeModal"
          style="position: absolute; top: 15px; right: 5px;"
        />

        <div class="scrollable-content">
          <div class="text-h5 q-mt-md">1. Acceptance of Terms</div>
          <span>
            By using LunaFunds, you agree to these Terms and Conditions.
            If you do not agree, please discontinue use immediately.
          </span>

          <div class="text-h5 q-mt-md">2. Simulative Nature of the Service</div>
          <span>
            The App provides a platform to simulate financial transactions and investments.
            All data, balances, and performances shown are for educational
            and simulation purposes only.
          </span>
          <ul>
            <li><strong>No Financial Advice:</strong> The App does not provide financial, legal, or tax advice.</li>
            <li><strong>No Real Transactions:</strong> All transactions are virtual and do not involve real money.</li>
          </ul>

          <div class="text-h5 q-mt-md">3. User Requirements</div>
          <span>
            To use the App, you must:
          </span>
          <ul>
            <li>Be at least 18 years old.</li>
            <li>Provide accurate and truthful registration information.</li>
          </ul>

          <div class="text-h5 q-mt-md">4. Limitation of Liability</div>
          <span>
            The App and its developers are not responsible for any decisions or actions
            taken by users based on the simulated data provided.
          </span>

          <div class="text-h5 q-mt-md">5. Privacy</div>
          <span>
            All personal data provided will be handled in accordance with our Privacy Policy.
          </span>

          <div class="text-h5 q-mt-md">6. Changes to the Terms</div>
          <span>
            We reserve the right to modify these Terms at any time. Continued use of the
            App after changes constitutes acceptance of the updated Terms.
          </span>

          <div class="text-h5 q-mt-md">7. Contact Information</div>
          <span>
            If you have any questions or concerns, please contact us at
            <a href="mailto:support@lunafunds.com">support@example.com</a>.
          </span>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineEmits, computed, defineProps } from 'vue';

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue']);

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const closeModal = () => {
  isVisible.value = false;
};
</script>

<style scoped>
.custom-modal {
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
}

.scrollable-content {
  max-height: 490px;
  overflow-y: auto;
}

@media (min-width: 550px) {
  .custom-modal {
    min-width: 500px;
  }
}
</style>
