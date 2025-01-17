<template>
    <div v-if="isModalThreeOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6">

        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl font-semibold text-gray-800">Step 4: What is CitizenOne?</h3>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-800 text-xl">&times;</button>
        </div>
  
        
        <p class="text-base text-gray-700 mb-4">
          CitizenOne is Denmark’s new, efficient journaling system. FindSocialeTilbud.dk is part of CitizenOne, and you can use it for the following:
        </p>
        <ul class="list-disc list-inside text-gray-600 text-base space-y-3 mb-4">
          <li>Journaling system to keep track of your services, daily operations, and ensure GDPR compliance.</li>
          <li>Efficient daily planning, including task management and communication.</li>
          <li>Integration with other tools that make your work smooth and manageable.</li>
        </ul>
        <p class="text-base text-gray-700 mb-6">
          Would you like a free walkthrough of the system and all its features? 
          <a 
            href="https://citizenone.dk/book-gratis-demo-af-journalsystemet" 
            target="_blank" 
            class="text-blue-500 underline hover:text-blue-700">
            Book a demo here
          </a> 
          and see how CitizenOne can make a difference for you and your organization.
        </p>
  
        
        <div class="flex justify-end">
          <button 
            @click="doneAndClose" 
            class="px-6 py-2 bg-tertiary text-white rounded-md text-lg">
            Done
          </button>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup>
  import { useI18n } from "vue-i18n"
  

  const language = useI18n();
  

  defineProps({
    isModalThreeOpen: {
      type: Boolean,
      required: true,
    },
  });
  

  const emit = defineEmits(['close']);
  

  const handleClose = () => {
    emit('close');
  };
  
  const doneAndClose = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    emit('close')
  };
  </script>
  
  <style scoped>
  /* Add any additional styles if needed */
  </style>
  