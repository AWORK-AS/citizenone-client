<template>
    <TransitionRoot as="template" :show="props.isOpen">
        <Dialog class="relative z-50" @close="closeSlide">
            <div class="fixed inset-0" />

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <TransitionChild as="template"
                            enter="transform transition ease-in-out duration-500 sm:duration-600"
                            enter-from="translate-x-full" enter-to="translate-x-0"
                            leave="transform transition ease-in-out duration-500 sm:duration-700"
                            leave-from="translate-x-0" leave-to="translate-x-full">
                            <DialogPanel class="pointer-events-auto w-screen max-w-md">
                                <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                    <div class="px-4 sm:px-6">
                                        <div class="flex items-start justify-between">
                                            <DialogTitle class="text-base font-semibold leading-6 text-gray-900">
                                                {{ $t('languageSwitcher.selectLanguage') }}
                                            </DialogTitle>
                                            <div class="ml-3 flex h-7 items-center">
                                                <button type="button"
                                                    class="relative rounded-md bg-white text-tertiary-800 hover:text-tertiary focus:outline-none"
                                                    @click="closeSlide">
                                                    <span class="absolute -inset-2.5" />
                                                    <span class="sr-only">Close panel</span>
                                                    <Icon name="material-symbols-light:arrow-forward-ios"
                                                        class="h-6 w-6" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="relative mt-10 flex-1 px-4 sm:px-6">
                                        <div class="flex items-center gap-5">
                                            <button class="relative rounded-full p-1 border-2 border-gray-200"
                                                @click="switchLanguage('en')">
                                                <img src="/img/icons/flags/united-states-of-america.svg" alt="flag"
                                                    class="w-12 h-12">
                                                <div class="bg-white rounded-full absolute -end-3 -top-3 p-1 w-fit h-fit"
                                                    v-if="userStore.getLanguage === 'en'">
                                                    <div
                                                        class="bg-tertiary text-white rounded-full p-1 flex items-center justify-center">
                                                        <Icon name="material-symbols:check-rounded" class="h-4 w-4"
                                                            aria-hidden="true" />
                                                    </div>
                                                </div>
                                            </button>
                                            <button class="relative rounded-full p-1 border-2 border-gray-200"
                                                @click="switchLanguage('dk')">
                                                <img src="/img/icons/flags/denmark.svg" alt="flag" class="w-12 h-12">
                                                <div class="bg-white rounded-full absolute -end-3 -top-3 p-1 w-fit h-fit"
                                                    v-if="userStore.getLanguage === 'dk'">
                                                    <div
                                                        class="bg-tertiary text-white rounded-full p-1 flex items-center justify-center">
                                                        <Icon name="material-symbols:check-rounded" class="h-4 w-4"
                                                            aria-hidden="true" />
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"

const userStore = useUserStore()
const language = useI18n()

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

function closeSlide() {
    emit('close')
}

function switchLanguage(languageCode: any) {
    userStore.setLanguage(languageCode)
    if (languageCode === 'en') {
        // English
        language.locale.value = 'en'
    } else if (languageCode === 'dk') {
        // Danish
        language.locale.value = 'dk'
    }
}
</script>