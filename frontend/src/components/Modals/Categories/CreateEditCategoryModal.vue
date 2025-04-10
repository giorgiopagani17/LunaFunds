<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="q-pa-md custom-modal">
      <q-card-section style="border-bottom: solid 1px #E9E9E9">
        <q-btn
          v-if="props.category"
          flat
          round
          dense
          icon="close"
          color="grey-8"
          @click="closeModal"
          style="position: absolute; top: 15px; right: 5px;"
        />
        <h5 class="q-mt-none q-mb-none text-secondary text-center q-pb-lg" style="font-weight: bold; font-size: 2em; border-bottom: solid 1px #E9E9E9">{{ props.category ? 'EDIT CATEGORY' : 'CREATE CATEGORY' }}</h5>

        <div class="flex items-center justify-center q-py-lg" style="border-bottom: solid 1px #E9E9E9">
          <div class="flex items-center justify-center">
            <img :src="`src/assets/img/${imageName}`" alt="category" width="120px" style="border-radius: 10%; cursor: pointer" @click="showImages">
          </div>
          <q-menu
            v-if="selectImagesVisible"
            class="bg-primary"
            @click.self="selectImagesVisible = false"
          >
            <div class="image-grid q-pa-md overflow-y-auto" style="max-height: 245px;">
              <div v-for="(image, index) in images.filter(img => img != imageName.trim())" :key="index" :class="{'padding-bottom': index >= images.length - 3}">
                <img :src="`src/assets/img/${image}`" alt="category" width="100px" height="100px" style="border-radius: 10%; cursor: pointer" @click="setImage(image)">
              </div>
            </div>
          </q-menu>
        </div>

        <div class="flex items-center justify-between q-mt-lg">
          <div class="flex items-center">
            <q-icon name="text_snippet" size="1.7rem" class="q-mr-sm text-secondary" />
            <span class="q-mr-xs text-h6 text-secondary">Name:</span>
          </div>
          <q-input
            v-model="categoryName"
            maxlength="17"
            dense
            color="secondary"
            placeholder="Insert a name"
            input-class='text-center'
            lazy-rules
            style="width: 40%"
            :error="categoryNameError"
          />
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md">
        <div v-if="props.category" style="width: 100%" class="flex items-center justify-between">
          <div class="flex flex-col" style="align-items: center;">
            <q-btn
              v-if="deleteConfirmationShown"
              flat
              style="width: 100px; font-size: 110%"
              label="Confirm"
              color="negative"
              @click="deleteCategory"
            />
            <q-btn
              v-else
              flat
              style="width: 100px; font-size: 110%"
              label="Delete"
              color="negative"
              @click="deleteConfirmationShown = true"
            />
          </div>
          <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Update" color="positive" @click="updateCategory()" :disabled="isUpdateDisabled"/>
        </div>
        <div v-else style="width: 100%" class="flex items-center justify-between">
          <q-btn flat style="width: 100px; font-size: 110%" label="Cancel" color="grey" @click="closeModal()"/>
          <q-btn flat style="margin-left: auto; width: 100px; font-size: 110%" label="Create" color="positive" @click="createCategory()" :disabled="isCreateDisabled"/>
        </div>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, defineProps, defineEmits, ref, watch} from 'vue';
import { fetchWithAuth } from 'src/utils/api';
import {useDetailsStore} from 'stores/details';
import { Notify } from 'quasar';

class Category {
  id!: number;
  name!: string;
  userId!: number;
  image!: string;
  totalAmount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

const props = defineProps({
  modelValue: Boolean,
  category: {
    type: Object as () => Category | null,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);
const categoryName = ref(props.category?.name || '');
const categoryNameError = ref(false);
const deleteConfirmationShown = ref(false);
const detailsStore = useDetailsStore();
const imageName = ref<string>(props.category?.image || 'default.png');
const selectImagesVisible = ref(false);
const images = ['credit.jpg', 'wallet.jpg', 'expensesblue.jpg', 'transfer.jpg', 'income.jpg', 'expenseswhite.jpg', 'banktransfer.jpg', 'crypto.jpg', 'expense.jpg', 'group.jpg', ];

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const closeModal = () => {
  isVisible.value = false;
  categoryName.value = '';
  deleteConfirmationShown.value = false;
};

watch(() => deleteConfirmationShown.value, (newValue) => {
  if (newValue) {
    categoryName.value = props.category?.name || '';
    setTimeout(() => {
      deleteConfirmationShown.value = false;
    }, 3000); // Adjust the timeout duration as needed
  }
});

const refreshChanges = () => {
  const changes = parseInt(detailsStore.changes ? detailsStore.changes.toString() : '0');
  detailsStore.setChanges((changes + 1).toString());
};

const isUpdateDisabled = computed(() => {
  if(!props.category){
    return;
  }
  return categoryName.value === props.category.name &&
    (imageName.value ? imageName.value === props.category.image : true);
});

const isCreateDisabled = computed(() => {
  return imageName.value === 'default.png';
});

const showImages = () => {
  selectImagesVisible.value = true;
};

const setImage = (image: string) => {
  selectImagesVisible.value = false;
  imageName.value = image;
};

const updateCategory = async () => {
  categoryNameError.value = !categoryName.value.trim();

  setTimeout(() => {
    categoryNameError.value = false;
  }, 3000);

  if (categoryNameError.value) {
    console.error('Validation Error: Name is missing.');
    return;
  }

  try {
    if (!props.category) {
      console.error('Category is missing.');
      return;
    }
    const response = await fetchWithAuth(`http://localhost:3000/categories/update/${props.category.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: categoryName.value.trim(),
        image: imageName.value,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Category updated successfully:', data);

    refreshChanges();
    closeModal();

    Notify.create({
      type: 'positive',
      message: 'You updated the category successfully!',
      color: 'positive',
    });
  } catch (error) {
    categoryNameError.value = true;
    setTimeout (() => {
      categoryNameError.value = false;
    }, 3000);
    console.error('Error while creating category:', error);
    Notify.create({
      type: 'negative',
      message: 'Error updating the category!',
      color: 'negative',
    });
  }
};

const deleteCategory = async () => {
  try {
    if (!props.category) {
      console.error('Category is missing.');
      return;
    }

    const response = await fetchWithAuth(`http://localhost:3000/categories/delete/${props.category.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Category deleted successfully:', data);

    refreshChanges();
    closeModal();

    Notify.create({
      type: 'positive',
      message: 'You deleted the category successfully!',
      color: 'negative',
    });
  } catch (error) {
    console.error('Error while updating category:', error);
    Notify.create({
      type: 'negative',
      message: 'Error deleting the category!',
      color: 'negative',
    });
  }
}

const createCategory = async () => {
  categoryNameError.value = !categoryName.value.trim();

  setTimeout(() => {
    categoryNameError.value = false;
  }, 3000);

  if (categoryNameError.value) {
    console.error('Validation Error: Name is missing.');
    return;
  }

  try {
    const response = await fetchWithAuth('http://localhost:3000/categories', {
      method: 'POST',
      body: JSON.stringify({
        name: categoryName.value.trim(),
        image: imageName.value,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log('Category created successfully:', data);

    refreshChanges();
    closeModal();


    Notify.create({
      type: 'positive',
      message: 'You created the category successfully!',
      color: 'positive',
    });
  } catch (error) {
    categoryNameError.value = true;
    setTimeout (() => {
      categoryNameError.value = false;
    }, 3000);
    console.error('Error while creating category:', error);
    Notify.create({
      type: 'negative',
      message: 'Error creating the category!',
      color: 'negative',
    });
  }
};
</script>

<style lang="scss" scoped>
.custom-modal {
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
}

@media (min-width: 450px) {
  .custom-modal {
    min-width: 400px;
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.overflow-auto {
  display: flex;
  align-items: center;
  scroll-snap-type: x mandatory;
  overflow-x: auto;
  scrollbar-width: none; /* Nascondi scrollbar per Firefox */
  -ms-overflow-style: none; /* Nascondi scrollbar per IE e Edge */
}

.overflow-auto::-webkit-scrollbar {
  display: none; /* Nascondi scrollbar per Chrome, Safari e Opera */
}

.padding-bottom {
  padding-bottom: 12px;
}
</style>

