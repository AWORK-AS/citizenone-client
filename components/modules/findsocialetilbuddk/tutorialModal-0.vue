<template>
    <div class="custom-body">
        <!-- Pass the flag prop to the Modal -->
        <Modal size="sm" :title="modalTitle" :show="isModalZeroOpen" class="custom-modal"
            :flag="1" @close="handleClose">
            <template #modal-body>
                    <p class="text-sm text-gray-700 mb-4">
                        <span v-if="language.locale.value === 'en'">
                            You are now logged in and can manage your profile on FindSocialeTilbud.dk right here. Gain
                            an
                            overview and control of your information.
                        </span>
                        <span v-if="language.locale.value === 'dk'">
                            Du er nu logget ind og kan administrere din profil på FindSocialeTilbud.dk lige her. Her får
                            du
                            overblik og kontrol over dine oplysninger.
                        </span>
                    </p>
                    <ul class="list-disc list-inside text-gray-600 text-sm space-y-2">
                        <li>
                            <span v-if="language.locale.value === 'en'">
                                Update your profile information with the latest details.
                            </span>
                            <span v-if="language.locale.value === 'dk'">
                                Opdatér dine profiloplysninger med de nyeste informationer.
                            </span>
                        </li>
                        <li>
                            <span v-if="language.locale.value === 'en'">
                                Add relevant services or offerings to reach the right audience.
                            </span>
                            <span v-if="language.locale.value === 'dk'">
                                Tilføj relevante ydelser eller tilbud, så du når ud til de rette.
                            </span>
                        </li>
                        <li>
                            <span v-if="language.locale.value === 'en'">
                                Keep your profile updated to ensure that potential caseworkers receive accurate
                                information.
                            </span>
                            <span v-if="language.locale.value === 'dk'">
                                Hold din profil opdateret for at sikre, at potentielle sagsbehandlere får korrekt
                                information.
                            </span>
                        </li>
                    </ul>
                    <div class="mt-4 flex justify-end">
                        <button v-if="language.locale.value === 'en'" @click="handleNext"
                            class="px-4 py-2 bg-tertiary text-white rounded">
                            Next
                        </button>
                        <button v-if="language.locale.value === 'dk'" @click="handleNext"
                            class="px-4 py-2 bg-tertiary text-white rounded">
                            Næste
                        </button>
                    </div>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { computed } from "vue";

// Define props for the modal state
defineProps({
    isModalZeroOpen: {
        type: Boolean,
        required: true,
    },
});

// Emit event to close the modal
const emit = defineEmits(['close']);

// Access the i18n instance for handling languages
const language = useI18n();

// Define dynamic modal title based on the current language
const modalTitle = computed(() => {
    return language.locale.value === 'en'
        ? 'Step 1: FindSocialeTilbud.dk is part of CitizenOne'
        : 'Step 1: FindSocialeTilbud.dk er en del af CitizenOne';
});

// Handle closing the modal
const handleClose = () => {
    emit('close');
};

// Scroll to the top of the page
const scrollToBottom = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};

// Handle the "Next" button click
const handleNext = () => {
    scrollToBottom();
    handleClose();
};
</script>


<style scoped></style>
