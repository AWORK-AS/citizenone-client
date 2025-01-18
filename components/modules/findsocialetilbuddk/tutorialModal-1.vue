<template>
    <div class="custom-body">
        <!-- isModalOneOpen -->
        <Modal size="sm" :title="modalTitle" :show="isModalOneOpen" class="custom-modal" :flag="2" @close="handleClose">
            <template #modal-body>
                    <p class="text-sm text-gray-700 mb-4">
                        <span v-if="language.locale.value === 'en'">
                            To maximize your visibility and accessibility, this feature helps you present yourself
                            professionally and accessibly on FindSocialeTilbud.dk.
                        </span>
                        <span v-if="language.locale.value === 'dk'">
                            For at maksimere din synlighed og tilgængelighed, så hjælper denne mulighed dig med at
                            fremstå
                            professionelt og tilgængeligt på FindSocialeTilbud.dk.
                        </span>
                    </p>
                    <ul class="list-disc list-inside text-gray-600 text-sm space-y-2">
                        <li>
                            <span v-if="language.locale.value === 'en'">
                                Set your availability so caseworkers know when they can contact you.
                            </span>
                            <span v-if="language.locale.value === 'dk'">
                                Indstil din tilgængelighed, så sagsbehandlere ved, hvornår de kan kontakte dig.
                            </span>
                        </li>
                        <li>
                            <span v-if="language.locale.value === 'en'">
                                Use advanced features to highlight specific services.
                            </span>
                            <span v-if="language.locale.value === 'dk'">
                                Brug avancerede funktioner til at fremhæve særlige ydelser.
                            </span>
                        </li>
                        <li>
                            <span v-if="language.locale.value === 'en'">
                                Monitor your profile performance to ensure you reach as many people as possible.
                            </span>
                            <span v-if="language.locale.value === 'dk'">
                                Overvåg din profilperformance for at sikre, at du når ud til flest muligt.
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
import { useI18n } from "vue-i18n"
import { computed } from "vue";

const language = useI18n()
const modalTitle = computed(() => {
    return language.locale.value === 'en'
        ? 'Step 2: Manage your profile'
        : 'Step 2: Administrer din profil';
});

defineProps({
    isModalOneOpen: {
        type: Boolean,
        required: true,
    },
});


const emit = defineEmits(['close']);


const handleClose = () => {
    emit('close');
};

const scrollToBottom = () => {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
    });
};

const handleNext = () => {
    scrollToBottom()
    handleClose()
}
</script>


<style scoped>
/* Optional: Add custom modal styles here */
</style>
