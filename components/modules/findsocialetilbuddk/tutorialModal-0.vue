<template>
    <div>
        <!-- Modal -->
        <div v-if="props.isModalZeroOpen"
            class="fixed bottom-10 left-99 w-96 p-6 bg-white border border-gray-300 shadow-lg z-50 rounded-md overflow-hidden">
            <!-- Top-right corner image -->
            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                class="w-52 absolute -top-14 -right-14 z-10 opacity-70" id="animatedImage">
            <button type="button"
                class="absolute top-0 right-3 z-10 outline-none px-0 py-2 text-gray-800 hover:text-gray-700"
                @click="$emit('button-click', '0')">
                <Icon name="heroicons:x-mark" class="h-6 w-6 cursor-pointer" aria-hidden="true" />
            </button>


            <div class="flex justify-between items-center mb-4">
                <span v-if="language.locale.value === 'en'">
                    <h3 class="text-lg font-semibold">Step 1: FindSocialeTilbud.dk is part of CitizenOne</h3>
                </span>
                <span v-if="language.locale.value === 'dk'">
                    <h3 class="text-lg font-semibold">Step 1: FindSocialeTilbud.dk er en del af CitizenOne</h3>
                </span>
            </div>
            <p class="text-sm text-gray-700 mb-4">
                <span v-if="language.locale.value === 'en'">
                    You are now logged in and can manage your profile on FindSocialeTilbud.dk right here. Gain an
                    overview and control of your information.
                </span>
                <span v-if="language.locale.value === 'dk'">
                    Du er nu logget ind og kan administrere din profil på FindSocialeTilbud.dk lige her. Her får du
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
                        Keep your profile updated to ensure that potential caseworkers receive accurate information.
                    </span>
                    <span v-if="language.locale.value === 'dk'">
                        Hold din profil opdateret for at sikre, at potentielle sagsbehandlere får korrekt information.
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
        </div>
    </div>
</template>


<script setup>
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalZeroOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'button-click'])
const language = useI18n()

const handleClose = () => {
    emit('close')
}
const scrollToBottom = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    })
}

const handleNext = () => {
    scrollToBottom()
    handleClose()
}
</script>
