<template>
  <div>
    <Modal size="xl" title="Guide" :show="isModalOpen" @close="closeModal">
      <template #modal-body>
        <div class="relative flex items-center justify-center pb-8">
          <!-- Previous Button -->
          <button
            class="absolute left-0 bg-gray-700 bg-opacity-50 text-white rounded-full p-2 hover:bg-gray-800 transition"
            @click="previousImage">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Image -->
          <img :src="images[currentIndex]" alt="Displayed Image"
            class="w-full max-w-[600px] h-auto object-cover rounded-lg shadow-lg border border-gray-300" />


          <!-- Next Button -->
          <button
            class="absolute right-0 bg-gray-700 bg-opacity-50 text-white rounded-full p-2 hover:bg-gray-800 transition"
            @click="nextImage">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg></button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ImageModal',
  props: {
    isModalOpen: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const images = [
      'https://plus.unsplash.com/premium_photo-1675826774815-35b8a48ddc2c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://cdn.pixabay.com/photo/2023/01/08/14/22/sample-7705346_640.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4dGWQgdRtlbW5aRFnN5K5pjTRSFsVWuGf7A&s',
    ];
    const currentIndex = ref(0); // Track the current image index

    const closeModal = () => {
      emit('close');
    };

    const previousImage = () => {
      currentIndex.value = (currentIndex.value - 1 + images.length) % images.length;
    };

    const nextImage = () => {
      currentIndex.value = (currentIndex.value + 1) % images.length;
    };

    return { closeModal, previousImage, nextImage, images, currentIndex };
  },
})
</script>

<style scoped>
button {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
