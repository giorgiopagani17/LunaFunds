<template>
  <q-dialog v-model="isVisible" :users="users" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg"
            style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">
          EDIT GROUP
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

        <div class="flex justify-between q-mt-md text-bold text-h6 q-px-md q-pb-xs" style="border-bottom: solid 2px #E9E9E9">
          <div>
            <div v-if="!isEditing" @click="editGroupName" style="cursor: pointer;">
              Gruppo {{ newGroupName }}
            </div>
            <div v-else>
              <input
                v-model="newGroupName"
                style="height: 30px"
                maxlength="15"
                @blur="saveEdit"
              />
            </div>
          </div>
          <div>
            Members: {{ localUsers.length - 1 }}
          </div>
        </div>
        <div class="overflow-y-auto scroll-container" style="max-height: 260px; min-height: 260px">
          <div v-if="localUsers.length < 3" class="flex items-center justify-center q-mt-md text-bold text-grey" style="height: 260px; font-size: 130%;">
            <div>No members in the group</div>
          </div>
          <div
            v-else
            v-for="(user, index) in localUsers.filter(user => user.name !== 'All Users' && !user.isMine)"
            :key="user.id"
            class="bordered q-px-md q-pt-md q-pb-xs"
            :style="{ borderBottom: index !== localUsers.length - 3 ? '1px solid #E9E9E9' : 'none', width: '100%' }">
            <div style="color: #1F2A3C; width: 100%" class="flex justify-between items-center">
              <div class="flex items-center justify-between" style="width: 100%">
                <div class="flex items-center">
                  <div class="flex items-center justify-center text-white text-bold"
                       :style="{ background: user.userGroup?.[0]?.color || '#0549B5' }"
                       style="width:40px; height:40px; border-radius: 10%; font-size: 140%">
                    {{ getUserInitials(user.name) }}
                  </div>
                  <div class="q-ml-md">
                    <strong style="font-size: 120%">{{ user.name }}</strong><br/>
                    <span class="text-grey text-bold" style="margin-left: auto">
                      {{ user.payGroup ? 'Voted for paying' : 'Didn\'t vote for paying' }}
                    </span>
                  </div>
                </div>
                <div>
                  <q-btn round size="100%" @click="toggleMenuAdd">
                    <q-icon name="more_horiz" color="secondary" />
                  </q-btn>
                  <q-menu
                    :offset="[55, 5]"
                    v-if="menuVisible"
                    @click.self="menuVisible = false"
                  >
                    <div class="text-center q-pa-md text-bold text-positive item-menu" @click="setBoss(user)" >Set Leader</div>
                    <div class="text-center q-pa-md text-bold text-negative item-menu" @click="removeUser(user)" >Remove</div>
                  </q-menu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md">
        <q-btn
          v-if="deleteConfirmationShown"
          flat
          style="width: 100px; font-size: 110%"
          label="Confirm"
          color="negative"
          @click="deleteGroup"
        />
        <q-btn
          v-else
          flat
          style="width: 100px; font-size: 110%"
          label="Delete"
          color="negative"
          @click="deleteConfirmationShown = true"
        />
        <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Update" color="positive" @click="updateGroup" :disabled="isUpdateDisabled"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineEmits, computed, defineProps, ref, onMounted } from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import { useDetailsStore } from 'stores/details';
import { Notify } from 'quasar';

class UserGroup {
  color!: string;
}

class User {
  name!: string;
  id!: number;
  totalAmount!: number;
  isMine!: boolean;
  payGroup!: boolean;
  isBoss!: boolean;
  userGroup?: UserGroup[];
}

const props = defineProps<{
  modelValue: boolean;
  users: User[];
}>();

const detailsStore = useDetailsStore();
const emit = defineEmits(['update:modelValue']);
const localUsers = ref<User[]>([]);
const menuVisible = ref(false);
const groupName = ref('');
const newGroupName = ref('');
const isEditing = ref(false);
const deleteConfirmationShown = ref(false);
const refresh = ref(false);

const editGroupName = () => {
  isEditing.value = true;
};

const saveEdit = () => {
  if (!newGroupName.value.trim()) {
    newGroupName.value = groupName.value;
  }
  isEditing.value = false;
};

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const getUserInitials = (name: string) => {
  const initials = name.split(' ').map(n => n[0]).join('');
  return initials.toUpperCase();
};

const toggleMenuAdd = () => {
  menuVisible.value = true;
};

const closeModal = () => {
  if(refresh.value){
    const changes = parseInt(detailsStore.groupChanges ? detailsStore.groupChanges.toString() : '0');
    detailsStore.setGroupChanges((changes + 1).toString());
  }
  isVisible.value = false;
};

const isUpdateDisabled = computed(() => {
  if(!localUsers.value){
    return;
  }
  return newGroupName.value === groupName.value;
});

const deleteGroup = async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/groups/delete/${detailsStore.groupID}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      const newGroupID = await response.text();
      detailsStore.setGroupID(newGroupID.toString());
      isVisible.value = false;
      refresh.value = true;
      closeModal();

      Notify.create({
        type: 'positive',
        message: 'You delete the group!',
        color: 'negative',
      });
    }
  } catch (error) {
    console.error(error);
    Notify.create({
      type: 'negative',
      message: 'Error deleting the group!',
      color: 'negative',
    });
  }
};

const updateGroup = async () => {
  try {
    await fetchWithAuth(`http://localhost:3000/groups/update/${detailsStore.groupID}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: newGroupName.value,
      }),
    });

    isVisible.value = false;
    refresh.value = true
    closeModal();

    Notify.create({
      type: 'positive',
      message: 'You change the group name!',
      color: 'positive',
    });
  } catch (error) {
    console.error(error);
    Notify.create({
      type: 'negative',
      message: 'Error changing the group name!',
      color: 'negative',
    });
  }
};

const setBoss = async (user: User) => {
  try {
    await fetchWithAuth(`http://localhost:3000/groups/setboss/${detailsStore.groupID}/${user.id}`, {
      method: 'PUT'
    });
    isVisible.value = false;
    refresh.value = true
    closeModal();

    Notify.create({
      type: 'positive',
      message: `You set ${user.name} the leader of the group!`,
      color: 'positive',
    });
  } catch (error) {
    console.error(error);
    Notify.create({
      type: 'positive',
      message: `Error setting ${user.name} the leader of the group!`,
      color: 'positive',
    });
  }
};

const removeUser = async (user: User) => {
  try {
    await fetchWithAuth(`http://localhost:3000/groups/remove/${detailsStore.groupID}/${user.id}`, {
      method: 'DELETE'
    });
    refresh.value = true

    localUsers.value = localUsers.value.filter(u => u.id !== user.id);

    Notify.create({
      type: 'positive',
      message: `You remove ${user.name} from the group!`,
      color: 'positive',
    });
  } catch (error) {
    console.error(error);
    Notify.create({
      type: 'positive',
      message: `Error removing ${user.name} from the group!`,
      color: 'positive',
    });
  }
};

onMounted(async () => {
  try {
    const response = await fetchWithAuth(`http://localhost:3000/groups/name/${detailsStore.groupID}`,{
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    groupName.value = await response.text();
    newGroupName.value = groupName.value;
    localUsers.value = props.users;
  } catch (error) {
    console.error('Error fetching user name:', error);
  }
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
