<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section>
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg"
            style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">
          VIEW NOTIFICATIONS
        </h5>
        <q-btn
          flat
          round
          dense
          icon="close"
          color="grey-8"
          @click="closeModal"
          style="position: absolute; top: 15px; right: 10px;"
        />

        <div class="overflow-y-auto scroll-container" style="max-height: 360px; min-height: 360px">
          <div v-if="notifications.length < 1" class="flex items-center justify-center q-mt-md text-bold text-grey" style="height: 240px; font-size: 130%;">
            <div class="q-pt-xl">No notification found!</div>
          </div>
          <div
            v-else
            v-for="(notification, index) in notifications"
            :key="notification.id"
            class="bordered q-pa-md notification-item"
            :class="{ 'no-border': index === notifications.length - 1 }"
          >
            <div style="color: #1F2A3C; width: 100%" class="flex justify-between items-center">
              <div class="flex items-center justify-between" style="width: 100%">
                <div class="flex items-center" style="width: 100%">
                  <q-icon v-if="notification.groups" name="groups" color="secondary" class="bg-primary q-pa-sm" style="cursor: pointer; border-radius: 50%" size="250%"/>
                  <q-icon v-if="notification.fromUsers && !notification.groups" name="account_balance" color="secondary" class="bg-primary q-pa-sm" style="cursor: pointer; border-radius: 50%" size="250%"/>
                  <div class="q-ml-md" style="width: 80%; cursor: pointer">
                    <div class="flex items-center justify-between">
                      <div :class="{'dot-grey': notification.read, 'dot-green': !notification.read}" class="dot"></div>
                      <strong v-if="notification.groups" style="font-size: 120%">
                        {{ notification.fromUsers.name }}<br/></strong>
                      <strong v-if="notification.fromUsers && !notification.groups" style="font-size: 120%">Bank Transfer<br/></strong>
                      <span class="text-grey text-bold" style="margin-left: auto">
                        {{ formatDate(notification.createdAt) }}
                      </span>
                    </div>
                    <div class="q-mt-xs">
                      {{ notification.message }}!
                    </div>

                  </div>
                </div>
              </div>
              <div v-if ="notification.groups" class="text-right q-mt-sm" style="width: 100%">
                <q-btn color="positive" label="Accept" class="q-mr-sm" size="10px" @click="joinGroup(notification)"/>
                <q-btn color="negative" label="Decline" size="10px" @click="declineGroup(notification)"/>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, defineEmits, defineProps, onMounted, ref} from 'vue';
import {fetchWithAuth} from 'src/utils/api';
import { formatDistanceToNow } from 'date-fns';
import { Notify } from 'quasar';

class User {
  name!: string;
}

class Group {
  name!: string;
  id!: number;
}

class Notification {
  id!: number;
  message!: string;
  read!: boolean;
  fromUsers!: User;
  groups!: Group;
  createdAt!: string;
}

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
const notifications = ref<Notification[]>([]);

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formatDate = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

const closeModal = () => {
  readNotifications();
  isVisible.value = false;
};

const getNotifications = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/users/notifications', {
      method: 'Get'
    });
    if (response.ok) {
      notifications.value = await response.json();
    }
  } catch (error) {
    console.error(error);
  }
};

const joinGroup = async (notification: Notification) => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/groups/join/${notification.groups.id}/${notification.id}`, {
      method: 'Post'
    });
    if (response.ok) {
      await getNotifications();

      Notify.create({
        type: 'positive',
        message: `You joined ${ notification.groups.name } group!`,
        color: 'positive',
      });
    }
  } catch (error) {
    console.error(error);
    Notify.create({
      type: 'negative',
      message: 'Error joining the group!',
      color: 'negative',
    });
  }
};

const declineGroup = async (notification: Notification) => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/users/decline/${notification.id}`, {
      method: 'Delete'
    });
    if (response.ok) {
      await getNotifications();

      Notify.create({
        type: 'positive',
        message: `You declined the ${ notification.groups.name } group invitation!`,
        color: 'negative',
      });
    }
  } catch (error) {
    console.error(error);
    Notify.create({
      type: 'negative',
      message: 'Error declining the group invitation!',
      color: 'negative',
    });
  }
};

const readNotifications = async () => {
  try {
    const response = await fetchWithAuth('http://localhost:3000/users/readnotifications', {
      method: 'Put',
      body: JSON.stringify({
        notificationIDs: notifications.value.filter(notification => !notification.read).map(notification => notification.id),
      }),
    });
    if (response.ok) {
      await getNotifications();
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(async () => {
  await getNotifications();
});
</script>

<style lang="scss" scoped>
.custom-modal {
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
}

.custom-modal {
  width: 450px;
}

.item-menu {
  cursor: pointer;
}

.item-menu:hover {
  background-color: #E9E9E9;
}

.overflow-auto {
  display: flex;
  align-items: center;
  scroll-snap-type: x mandatory;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.overflow-auto::-webkit-scrollbar {
  display: none;
}

.scroll-container {
  max-height: 60px; /* O il valore necessario */
  overflow-y: auto;
  scrollbar-width: thin; /* Compatibile con Firefox */
  -ms-overflow-style: none; /* Compatibile con IE/Edge */
}

.scroll-container::-webkit-scrollbar {
  width: 5px; /* Modifica la larghezza dello scrollbar */
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.dot {
  width: 7.5px;
  height: 7.5px;
  border-radius: 50%;
  margin-right: 7.5px;
}

.dot-green {
  background-color: green;
}

.dot-grey {
  background-color: gray;
}

.notification-item {
  position: relative;
  width: 100%;
}

.notification-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 4%;
  width: 92%;
  border-bottom: 1px solid #E9E9E9;
}

.notification-item.no-border::after {
  border-bottom: none;
}
</style>
