<template>
    <div class="custom-body">
        <!-- Modal -->
        <div v-if="props.isModalOneOpen" class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full p-6 bg-white border border-gray-300 shadow-lg z-50 rounded-md
           lg:overflow-visible lg:w-96 lg:top-36 md:left-[29rem] md:bottom-auto md:transform-none md:w-96"
            :class="modalClasses">

            <div class="absolute top-0 right-0 w-52 h-52 overflow-hidden">
                <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                    class="absolute -top-14 -right-14 z-10 opacity-70 object-cover" id="animatedImage">
            </div>

            <div class="flex justify-between items-center mb-4">
                <span v-if="language.locale.value === 'en'">
                    <h3 class="text-lg font-semibold">Here you manage your profile.</h3>
                </span>
                <span v-if="language.locale.value === 'dk'">
                    <h3 class="text-lg font-semibold">Her administrerer du din profil</h3>
                </span>
                <button type="button"
                    class="top-4 right-3 z-10 outline-none px-0 py-2 text-gray-800 hover:text-gray-700"
                    @click="$emit('button-click', '1')">
                    <Icon name="heroicons:x-mark" class="h-6 w-6 cursor-pointer" aria-hidden="true" />
                </button>
            </div>

            <p class="text-sm text-gray-700 mb-4">
                <span v-if="language.locale.value === 'en'">
                    Start by entering your contact details so that caseworkers can get in touch with you when they have
                    a citizen.
                </span>
                <span v-if="language.locale.value === 'dk'">
                    Start med at indtaste dine kontaktoplysninger, så sagsbehandlerne kan komme i kontakt med dig, når
                    de har en borger.
                </span>
            </p>

            <div class="mt-4 flex justify-center md:justify-end lg:justify-end">
                <button v-if="language.locale.value === 'en'" @click="handleNext"
                    class="px-4 py-2 z-50 bg-tertiary text-white rounded">
                    Next
                </button>
                <button v-if="language.locale.value === 'dk'" @click="handleNext"
                    class="px-4 py-2 z-50 bg-tertiary text-white rounded">
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

const emit = defineEmits(['close', 'button-click'])


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

const pageHeight = ref(window.innerHeight);
const pageWidth = ref(window.innerWidth);  // Make window width reactive

const updatePageSize = () => {
    pageHeight.value = window.innerHeight;
    pageWidth.value = window.innerWidth;
};

const updatePageHeight = () => {
    pageHeight.value = window.innerHeight;
};

onMounted(() => {
    window.addEventListener("resize", updatePageHeight);
    window.addEventListener("resize", updatePageSize);
});

onUnmounted(() => {
    window.removeEventListener("resize", updatePageHeight);
    window.removeEventListener("resize", updatePageSize);
});

const modalClasses = computed(() => {
    const isSmallScreen = pageWidth.value < 768;  // Use the reactive pageWidth value

    if (isSmallScreen) {
        return `after:absolute after:top-[-20px] after:left-1/2 after:transform after:-translate-x-1/2 after:w-0 after:h-0 
            after:border-l-[20px] after:border-l-transparent after:border-r-[20px] after:border-r-transparent 
            after:border-b-[20px] after:border-b-white`;
    } else {
        return `after:absolute after:-right-4 after:w-0 after:h-0 after:border-t-[20px] after:border-t-transparent
            after:border-b-[20px] after:border-b-transparent after:border-l-[20px] after:border-l-white
            ${pageHeight.value < 800 ? "after:top-40" : "after:top-40"}`;
    }
});

</script>
