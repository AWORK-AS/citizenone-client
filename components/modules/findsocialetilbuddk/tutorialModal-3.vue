<template>
  <div v-if="isModalThreeOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6">

      <div class="flex justify-between items-center mb-4">
        <span v-if="language.locale.value === 'en'">
          <h3 class="text-2xl font-semibold text-gray-800">Step 4: What is CitizenOne?</h3>
        </span>
        <span v-if="language.locale.value === 'dk'">
          <h3 class="text-lg font-semibold">Step 4: Hvad er CitizenOne?</h3>
        </span>
      </div>


      <p class="text-base text-gray-700 mb-4">
        <span v-if="language.locale.value === 'en'">
          CitizenOne is Denmark’s new, efficient journaling system. FindSocialeTilbud.dk is part of CitizenOne, and you
          can use it for the following:
        </span>
        <span v-if="language.locale.value === 'dk'">
          CitizenOne er Danmarks nye effektive journalsystem. FindSocialeTilbud.dk er en del af CitizenOne og du kan bl.a. bruge det til følgende:
        </span>
      </p>
      <ul class="list-disc list-inside text-gray-600 text-base space-y-3 mb-4">
        <li>
          <span v-if="language.locale.value === 'en'">
            Journaling system to keep track of your services, daily operations, and ensure GDPR compliance.
          </span>
          <span v-if="language.locale.value === 'dk'">
            Journalsystem til at holde styr på dit sociale tilbud, dets hverdag samt sikre GDPR-compliance.
          </span>
        </li>
        <li>
          <span v-if="language.locale.value === 'en'">
            Efficient daily planning, including task management and communication.
          </span>
          <span v-if="language.locale.value === 'dk'">
            Effektiv daglig planlægning, herunder opgavestyring og kommunikation.
          </span>
        </li>
        <li>
          <span v-if="language.locale.value === 'en'">
            Integration with other tools that make your work smooth and manageable.
          </span>
          <span v-if="language.locale.value === 'dk'">
            Integration med andre værktøjer, der gør dit arbejde smidigt og overskueligt.
          </span>
        </li>
      </ul>
      <p class="text-base text-gray-700 mb-6">
        <span v-if="language.locale.value === 'en'">
          Would you like a free walkthrough of the system and all its features?
          <a href="https://citizenone.dk/book-gratis-demo-af-journalsystemet" target="_blank"
            class="text-blue-500 underline hover:text-blue-700">
            Book a demo here
          </a>
          and see how CitizenOne can make a difference for you and your organization.
        </span>
        <span v-if="language.locale.value === 'dk'">
          <p class="text-base text-gray-700 mb-6">
            Ønsker du en gratis gennemgang af systemet og alle dets muligheder? 
            <a 
              href="https://citizenone.dk/book-gratis-demo-af-journalsystemet" 
              target="_blank" 
              class="text-blue-500 underline hover:text-blue-700">
              Book en demo her
            </a> 
            og oplev, hvordan CitizenOne kan gøre en forskel for dig og dit sociale tilbud.
          </p>
        </span>
      </p>


      <div class="flex justify-end">
        <button 
          v-if="language.locale.value === 'en'" 
          @click="doneAndClose" 
          class="px-6 py-2 bg-tertiary text-white rounded-md text-lg">
          Done
        </button>
        <button 
          v-if="language.locale.value === 'dk'" 
          @click="doneAndClose" 
          class="px-6 py-2 bg-tertiary text-white rounded-md text-lg">
          Færdig
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