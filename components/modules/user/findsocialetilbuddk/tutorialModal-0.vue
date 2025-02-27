<template>
    <div>
        <div v-if="props.isModalZeroOpen" class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-lg p-6 overflow-hidden bg-white border border-gray-300 shadow-lg z-50 rounded-md
    lg:bottom-44 lg:left-[25rem] lg:transform-none lg:w-96 lg:overflow-visible" :class="modalClasses">



            <div class="absolute top-0 right-0 w-52 h-52 overflow-hidden">
                <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                    class="absolute -top-14 -right-14 z-10 opacity-70 object-cover" id="animatedImage">
            </div>

            <div class="flex justify-between items-center mb-4">
                <span v-if="language.locale.value === 'en'">
                    <h3 class="text-lg font-semibold">FindSocialeTilbud.dk is a part of CitizenOne.</h3>
                </span>
                <span v-if="language.locale.value === 'dk'">
                    <h3 class="text-lg font-semibold">FindSocialeTilbud.dk er en del af CitizenOne</h3>
                </span>
                <button type="button"
                    class="top-4 right-3 z-10 outline-none px-0 py-2 text-gray-800 hover:text-gray-700"
                    @click="$emit('button-click', '0')">
                    <Icon name="heroicons:x-mark" class="h-6 w-6 cursor-pointer" aria-hidden="true" />
                </button>
            </div>
            <p class="text-sm text-gray-700 mb-4">
                <span v-if="language.locale.value === 'en'">
                    Keep your profile updated to ensure that potential caseworkers receive accurate information.
                </span>
                <span v-if="language.locale.value === 'dk'">
                    Hold din profil opdateret for at sikre, at potentielle sagsbehandlere får korrekt information.
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
                        Add relevant services or offers to reach the right audience.
                    </span>
                    <span v-if="language.locale.value === 'dk'">
                        Tilføj relevante ydelser eller tilbud, så du når ud til de rette.
                    </span>
                </li>
            </ul>
            <div class="mt-4 flex justify-center md:justify-end lg:justify-end">
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
const pageHeight = ref(window.innerHeight);

const updatePageHeight = () => {
    pageHeight.value = window.innerHeight;
};

onMounted(() => {
    window.addEventListener("resize", updatePageHeight);
});

onUnmounted(() => {
    window.removeEventListener("resize", updatePageHeight);
});

const modalClasses = computed(() => {
    return `after:absolute after:-left-4 after:w-0 after:h-0 after:border-t-[20px] after:border-t-transparent
        after:border-b-[20px] after:border-b-transparent after:border-r-[20px] after:border-r-white
        ${pageHeight.value < 800 ? "after:top-56" : "after:top-4"}`;
});



</script>
