<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg"
            style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">
          INVITE MEMBER
        </h5>

        <div class="q-mt-md text-bold text-h6 q-pb-sm" style="border-bottom: solid 2px #E9E9E9">
          <q-input filled v-model="searchQuery" color="secondary" input-class="text-black" label="Search Users..." />
        </div>
        <div class="overflow-y-auto scroll-container" style="max-height: 260px; min-height: 260px">
          <div v-if="users.length < 1" class="flex items-center justify-center q-mt-md text-bold text-grey" style="height: 240px; font-size: 130%;">
            <div>No users found!</div>
          </div>
          <div
            v-else
            v-for="(user, index) in users"
            :key="user.id"
            class="bordered q-pa-md"
            :style="{ borderBottom: index !== users.length - 1 ? '1px solid #E9E9E9' : 'none', width: '100%' }">
            <div style="color: #1F2A3C; width: 100%" class="flex justify-between items-center">
              <div class="flex items-center justify-between" style="width: 100%">
                <div class="flex items-center">
                  <div class="flex items-center justify-center text-white text-bold bg-secondary"
                       style="width:40px; height:40px; border-radius: 10%; font-size: 140%">
                    {{ getUserInitials(user.name) }}
                  </div>
                  <div class="q-ml-md">
                    <strong style="font-size: 120%">{{ user.name }}</strong><br/>
                    <span class="text-grey text-bold" style="margin-left: auto">
                      {{ user.email }}
                    </span>
                  </div>
                </div>
                <div>
                  <q-icon v-if="user.selected && !user.invited" name="check_circle" color="secondary" style="cursor: pointer;" size="250%" @click="selectUser(user)"/>
                  <q-icon v-if="!user.selected && !user.invited" name="radio_button_unchecked" color="secondary" style="cursor: pointer;" size="250%" @click="selectUser(user)"/>
                  <span v-if="user.invited" class="text-positive text-bold q-ml-md" style="font-size: 110%">Invited</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md">
        <q-btn
          flat
          style="width: 100px; font-size: 110%"
          label="Cancel"
          color="grey"
          @click="closeModal"
        />
        <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Invite" color="positive" @click="inviteMembers" :disabled="isInviteDisabled"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {defineEmits, computed, defineProps, ref, onMounted, watch} from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'stores/details';
import { Notify } from 'quasar';

class User {
  name!: string;
  id!: number;
  email!: string;
  selected!: boolean;
  invited!: boolean;
}

const props = defineProps<{
  modelValue: boolean;
}>();

const detailsStore = useDetailsStore();
const emit = defineEmits(['update:modelValue']);
const users = ref<User[]>([]);
const refresh = ref(false);
const searchQuery = ref('');
const selectedUsers = ref<User[]>([]);

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const getUserInitials = (name: string) => {
  const initials = name.split(' ').map(n => n[0]).join('');
  return initials.toUpperCase();
};

const selectUser = (user: User) => {
  user.selected = !user.selected;
  if (user.selected) {
    selectedUsers.value.push(user);
  } else {
    selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id);
  }
};

const closeModal = () => {
  if(refresh.value){
    const changes = parseInt(detailsStore.groupChanges ? detailsStore.groupChanges.toString() : '0');
    detailsStore.setGroupChanges((changes + 1).toString());
  }
  isVisible.value = false;
};

const isInviteDisabled = computed(() => {
  return selectedUsers.value.length <= 0 ;
});

const searchUsers = async () => {
  try {
    const params = new URLSearchParams({
      groupID: detailsStore.groupID ? detailsStore.groupID.toString() : '0',
      searchQuery: searchQuery.value ?? '',
    });

    const response = await fetchWithAuth(`http://localhost:3000/users?${params.toString()}`, {
      method: 'Get'
    });
    if (response.ok) {
      const fetchedUsers = await response.json();
      users.value = fetchedUsers.map((user : User) => {
        const isSelected = selectedUsers.value.some(selectedUser => selectedUser.id === user.id);
        return {
          ...user,
          selected: isSelected,
        };
      });
    }
  } catch (error) {
    users.value = [];
    console.error(error);
  }
};

const inviteMembers = async () => {
  try {
    const userIds = selectedUsers.value.map(user => user.id);

    await fetchWithAuth(`http://localhost:3000/groups/invite/${detailsStore.groupID}`, {
      method: 'POST',
      body: JSON.stringify({
        users: userIds,
      }),
    });

    isVisible.value = false;
    refresh.value = true;
    closeModal();

    Notify.create({
      type: 'positive',
      message: `You invited ${selectedUsers.value.length} members to the group!`,
      color: 'positive',
    });
  } catch (error) {
    console.error(error);
    Notify.create({
      type: 'negative',
      message: 'Error inviting members to the group!',
      color: 'negative',
    });
  }
};

watch(searchQuery, () => {
  searchUsers();
});

onMounted(async () => {
  await searchUsers();
});
</script>

<style lang="scss" scoped>
.custom-modal {
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
}

@media (min-width: 550px) {
  .custom-modal {
    min-width: 500px;
  }
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
</style>
