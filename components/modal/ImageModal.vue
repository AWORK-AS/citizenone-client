<template>
  <div
    v-if="isModalOpen"
    class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
    @click="closeModal"
  >
    <div
      class="bg-white p-6 rounded-xl shadow-lg w-[600px] h-[350px] mx-auto relative transform transition-all duration-300 ease-in-out"
      @click.stop
    >
      <button
        @click="closeModal"
        class="closebtn absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 rounded-full p-3 transition-all duration-200 ease-in-out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Image -->
      <img
        :src="images[currentIndex]"
        alt="Image"
        class="w-full h-[300px] object-cover rounded-lg shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105"
      />

      <!-- Navigation Buttons -->
      <button
        @click="previousImage"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75 transition-all duration-200 ease-in-out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        @click="nextImage"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75 transition-all duration-200 ease-in-out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';

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
      'https://2.img-dpreview.com/files/p/E~C1000x0S4000x4000T1200x1200~articles/3925134721/0266554465.jpeg', // Image 1
      'https://cdn.pixabay.com/photo/2023/01/08/14/22/sample-7705346_640.jpg', // Image 2
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4dGWQgdRtlbW5aRFnN5K5pjTRSFsVWuGf7A&s', // Image 3
    ];
    const currentIndex = ref(0); // Track the current image index

    const closeModal = () => {
      emit('close');
    };

    const previousImage = () => {
      currentIndex.value = (currentIndex.value - 1 + images.length) % images.length; // Loop back to last image
    };

    const nextImage = () => {
      currentIndex.value = (currentIndex.value + 1) % images.length; // Loop back to first image
    };

    return { closeModal, previousImage, nextImage, images, currentIndex };
  },
});
</script>

<style scoped>
/* Modal background */
.fixed {
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

/* Smooth fade-in effect for modal background */
@keyframes fadeIn {
  100% {
    opacity: 1;
  }
}

/* Hover effects for the modal image */
.w-full:hover {
  transform: scale(1.05);
}

/* Rounded corners for the modal and buttons */
.rounded-xl {
  border-radius: 1rem;
}

.rounded-full {
  border-radius: 50%;
}

/* Add shadow for a modern look */
.shadow-lg {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
.closebtn{
  z-index: 9999;
}
</style>
