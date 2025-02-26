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
                            <DialogPanel class="pointer-events-auto w-screen max-w-sm">
                                <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                    <LoadingSpinner :isActive="state.isPageLoading">
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
                                            <Alert type="danger" :text="state?.error?.message"
                                                v-if="state.error?.message && state.error.message.length > 0" />
                                            <div class="flex items-center gap-5">
                                                <button class="relative rounded-full p-1 border-2 border-gray-200"
                                                    v-for="(language, index) in state.options.languages?.data"
                                                    :key="index" @click="switchLanguage(language)">
                                                    <span v-if="language.code === 'en'">
                                                        <img src="/img/icons/flags/united-states-of-america.svg"
                                                            alt="flag" class="w-12 h-12">
                                                        <div class="bg-white rounded-full absolute -end-3 -top-3 p-1 w-fit h-fit"
                                                            v-if="userStore.getLanguage === 'en'">
                                                            <div
                                                                class="bg-tertiary text-white rounded-full p-1 flex items-center justify-center">
                                                                <Icon name="material-symbols:check-rounded"
                                                                    class="h-4 w-4" aria-hidden="true" />
                                                            </div>
                                                        </div>
                                                    </span>
                                                    <span v-else-if="language.code === 'dk'">
                                                        <img src="/img/icons/flags/denmark.svg" alt="flag"
                                                            class="w-12 h-12">
                                                        <div class="bg-white rounded-full absolute -end-3 -top-3 p-1 w-fit h-fit"
                                                            v-if="userStore.getLanguage === 'dk'">
                                                            <div
                                                                class="bg-tertiary text-white rounded-full p-1 flex items-center justify-center">
                                                                <Icon name="material-symbols:check-rounded"
                                                                    class="h-4 w-4" aria-hidden="true" />
                                                            </div>
                                                        </div>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </LoadingSpinner>
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
import { citizenService } from '@/components/api/citizen/CitizenService'
import { userService } from '@/components/api/UserService'
import { languageService } from '@/components/api/LanguageService'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const userStore = useUserStore() as any
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
const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    options: {
        languages: [],
    }
})

onMounted(() => {
    fetchLanguages()
})

async function fetchLanguages() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await languageService.getAllLanguages()
        if (response) {
            state.options.languages = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function switchLanguage(selectedLanguage: any) {
    if (localStorage.getItem('_token')) {
        state.error = {}
        state.isPageLoading = true
        try {
            const languageUuid = selectedLanguage.uuid
            const params = {
                language_uuid: languageUuid,
            }
            let response = ''
            if (userStore.getUser?.role === 'Citizen') {
                response = await citizenService.updateCitizenLangugage(params)
            } else if (['Admin', 'User'].includes(userStore.getUser?.role)) {
                response = await userService.updateUserLangugage(params)
            }
            if (response) {
                const languageCode = selectedLanguage.code
                userStore.setLanguage(languageCode)
                if (languageCode === 'en') {
                    // English
                    language.locale.value = 'en'
                } else if (languageCode === 'dk') {
                    // Danish
                    language.locale.value = 'dk'
                }
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    } else {
        const languageCode = selectedLanguage.code
        userStore.setLanguage(languageCode)
        if (languageCode === 'en') {
            // English
            language.locale.value = 'en'
        } else if (languageCode === 'dk') {
            // Danish
            language.locale.value = 'dk'
        }
    }
}
</script>