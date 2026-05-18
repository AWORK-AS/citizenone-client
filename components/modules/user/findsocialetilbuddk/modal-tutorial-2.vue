<template>
    <div>
        <div v-if="props.isModalTwoOpen"
            class="fixed top-0 left-1/2 transform -translate-x-1/2 w-full p-6 bg-white border border-gray-300 shadow-lg z-50 rounded-md md:top-auto md:bottom-20 md:right-48 md:w-96 md:overflow-visible md:left-auto md:transform-none"
            :class="modalClasses">
            <div class="absolute top-0 right-0 w-52 h-52 overflow-hidden">
                <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                    class="absolute -top-14 -right-14 z-10 opacity-70 object-cover" id="animatedImage">
            </div>
            <div class="flex justify-between items-center mb-4">
                <p class="text-md text-gray-800 mb-4 text-center">
                    <span v-if="language.locale.value === 'en'">
                        This is the last step in the tour for FindSocialeTilbud.dk
                    </span>
                    <span v-if="language.locale.value === 'dk'">
                        Dette er det sidste trin i rundturen for FindSocialeTilbud.dk
                    </span>
                    <span v-if="language.locale.value === 'no'">
                        Dette er det siste trinnet i omvisningen for FindSocialeTilbud.dk
                    </span>
                    <span v-if="language.locale.value === 'sv'">
                        Detta är det sista steget i rundturen för FindSocialeTilbud.dk
                    </span>
                </p>
                <button type="button"
                    class="top-4 right-3 z-10 outline-none px-0 py-2 text-gray-800 hover:text-gray-700"
                    @click="$emit('button-click', '2')">
                    <Icon name="heroicons:x-mark" class="h-6 w-6 cursor-pointer" aria-hidden="true" />
                </button>
            </div>
            <div class="mt-4 flex justify-center">
                <button v-if="language.locale.value === 'en'" @click="doneAndClose"
                    class="px-4 py-2 z-50 bg-tertiary text-white rounded">
                    Next
                </button>
                <button v-if="language.locale.value === 'dk'" @click="doneAndClose"
                    class="px-4 py-2 z-50 bg-tertiary text-white rounded">
                    Næste
                </button>
                <button v-if="language.locale.value === 'no'" @click="doneAndClose"
                    class="px-4 py-2 z-50 bg-tertiary text-white rounded">
                    Neste
                </button>
                <button v-if="language.locale.value === 'sv'" @click="doneAndClose"
                    class="px-4 py-2 z-50 bg-tertiary text-white rounded">
                    Nästa
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useI18n } from "vue-i18n"
const language = useI18n()

const props = defineProps({
    isModalTwoOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'button-click'])

const doneAndClose = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    })
    emit('close')
}
const pageHeight = ref(window.innerHeight)
const pageWidth = ref(window.innerWidth)  // Make window width reactive

const updatePageSize = () => {
    pageHeight.value = window.innerHeight
    pageWidth.value = window.innerWidth
}

const updatePageHeight = () => {
    pageHeight.value = window.innerHeight
}

onMounted(() => {
    window.addEventListener("resize", updatePageHeight)
    window.addEventListener("resize", updatePageSize)
})

onUnmounted(() => {
    window.removeEventListener("resize", updatePageHeight)
    window.addEventListener("resize", updatePageSize)
})

const modalClasses = computed(() => {
    const isSmallScreen = pageWidth.value < 768  // Use the reactive pageWidth value

    if (isSmallScreen) {
        return `after:absolute after:bottom-[-20px] after:left-1/2 after:transform after:-translate-x-1/2 after:w-0 after:h-0 
            after:border-l-[20px] after:border-l-transparent after:border-r-[20px] after:border-r-transparent 
            after:border-t-[20px] after:border-t-white`
    } else {
        return `after:absolute after:-left-4 after:w-0 after:h-0 after:border-t-[20px] after:border-t-transparent
            after:border-b-[20px] after:border-b-transparent after:border-r-[20px] after:border-r-white after:top-4`
    }
})
</script>