<template>
    <div class="custom-body">
        <!-- Modal -->
        <div v-if="props.isModalOneOpen"
            class="fixed top-32 left-99 w-96 p-6 bg-white border border-gray-300 shadow-lg z-50 rounded-md">
            <!-- Top-right corner image -->
            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                class="w-52 absolute -top-14 -right-14 z-10 opacity-70" id="animatedImage">

            <div class="flex justify-between items-center mb-4">
                <span v-if="language.locale.value === 'en'">
                    <h3 class="text-lg font-semibold">Step 2: Manage your profile</h3>
                </span>
                <span v-if="language.locale.value === 'dk'">
                    <h3 class="text-lg font-semibold">Step 2: Administrer din profil</h3>
                </span>
            </div>

            <p class="text-sm text-gray-700 mb-4">
                <span v-if="language.locale.value === 'en'">
                    To maximize your visibility and accessibility, this feature helps you present yourself
                    professionally and accessibly on FindSocialeTilbud.dk.
                </span>
                <span v-if="language.locale.value === 'dk'">
                    For at maksimere din synlighed og tilgængelighed, så hjælper denne mulighed dig med at
                    fremstå professionelt og tilgængeligt på FindSocialeTilbud.dk.
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
        </div>
    </div>
</template>

<script setup>
import { useI18n } from "vue-i18n"

const language = useI18n()

const props = defineProps({
    isModalOneOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])

const handleClose = () => {
    emit('close')
}

const scrollToBottom = () => {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
    })
}

const handleNext = () => {
    scrollToBottom()
    handleClose()
}
</script>

