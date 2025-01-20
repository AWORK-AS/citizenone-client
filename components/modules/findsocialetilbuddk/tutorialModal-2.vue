<template>
    <div>
        <!-- Modal -->
        <div v-if="isModalTwoOpen"
            class="fixed bottom-20 right-32 w-96 p-6 bg-white border border-gray-300 shadow-lg z-50 rounded-md">
            <!-- Top-right corner image -->
            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
            class="w-52 absolute -top-14 -right-14 z-10 opacity-70" id="animatedImage">

            <div class="flex justify-between items-center mb-4">
                <span v-if="language.locale.value === 'en'">
                    <h3 class="text-lg font-semibold">Step 3: Invite Caseworkers</h3>
                </span>
                <span v-if="language.locale.value === 'dk'">
                    <h3 class="text-lg font-semibold">Trin 3: Inviter Sagsbehandlere</h3>
                </span>
            </div>

            <p class="text-sm text-gray-700 mb-4">
                <span v-if="language.locale.value === 'en'">
                    You can now easily invite caseworkers to contact you via FindSocialeTilbud.dk.
                </span>
                <span v-if="language.locale.value === 'dk'">
                    Nu kan du nemt invitere sagsbehandlere til at tage kontakt til dig via FindSocialeTilbud.dk.
                </span>
            </p>

            <ul class="list-disc list-inside text-gray-600 text-sm space-y-2">
                <li>
                    <span v-if="language.locale.value === 'en'">
                        Use the inquiry feature to allow caseworkers to contact you directly.
                    </span>
                    <span v-if="language.locale.value === 'dk'">
                        Benyt henvendelsesfunktionen for at tillade sagsbehandlere at kontakte dig direkte.
                    </span>
                </li>
                <li>
                    <span v-if="language.locale.value === 'en'">
                        Manage incoming inquiries and follow up quickly.
                    </span>
                    <span v-if="language.locale.value === 'dk'">
                        Administrér dine indkomne forespørgsler, og følg op hurtigt.
                    </span>
                </li>
                <li>
                    <span v-if="language.locale.value === 'en'">
                        Collaborate effectively with caseworkers and increase your visibility within the network.
                    </span>
                    <span v-if="language.locale.value === 'dk'">
                        Samarbejd effektivt med sagsbehandlere, og øg din synlighed i netværket.
                    </span>
                </li>
            </ul>

            <div class="mt-4 flex justify-end">
                <button v-if="language.locale.value === 'en'" @click="doneAndClose"
                    class="px-4 py-2 bg-tertiary text-white rounded">
                    Next
                </button>
                <button v-if="language.locale.value === 'dk'" @click="doneAndClose"
                    class="px-4 py-2 bg-tertiary text-white rounded">
                    Næste
                </button>
            </div>
        </div>
    </div>
</template>


<script setup>
import { useI18n } from "vue-i18n"
import { computed } from "vue"

const modalTitle = computed(() => {
    return language.locale.value === 'en'
        ? 'Step 3: Receive inquiries from caseworkers'
        : 'Step 3: Modtag henvendelser fra sagsbehandlere'
});
// i18n setup
const language = useI18n()

// Props
defineProps({
    isModalTwoOpen: {
        type: Boolean,
        required: true,
    },
});

// Emits
const emit = defineEmits(['close']);

// Methods
const handleClose = () => {
    emit('close')
};

const doneAndClose = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
    emit('close');
};
</script>


<style scoped>
/* Optional: Add custom modal styles here */
</style>
