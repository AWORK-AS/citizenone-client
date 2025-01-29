<template>
    <div>
        <div v-if="props.isModalTwoOpen"
            class="fixed bottom-20 right-32 w-96 p-6 bg-white border border-gray-300 shadow-lg z-50 rounded-md overflow-hidden">
            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                class="w-52 absolute -top-14 -right-14 z-10 opacity-70" id="animatedImage">

            <div class="mt-4 flex justify-center">
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
</script>
