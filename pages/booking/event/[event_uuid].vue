<template>
    <div class="min-h-screen flex flex-col">
        <header class="bg-primary">
            <div class="mx-auto max-w-6xl px-4 py-8 flex justify-between gap-x-5">
                <div class="flex items-center gap-x-4 cursor-pointer"
                    @click="navigateTo('/booking/company-link/overview')">
                    <p class="text-xl text-white font-semibold">
                        Company Header
                    </p>
                    <div class="bg-white px-3 py-2 text-xs font-semibold rounded-lg">
                        {{ $t('bookings.events') }}
                    </div>
                </div>
                <button type="button" class="-m-2.5 rounded-full w-8" @click="selectLanguage">
                    <img :src="identifyFlag()" alt="flag">
                </button>
            </div>
        </header>
        <div class="flex-grow">
            <div class="mx-auto max-w-6xl px-4 py-8">
                <ModulesUserBookingProgress />
            </div>
        </div>
        <footer class="bg-gray-50">
            <div class="mx-auto max-w-6xl px-4 py-6">
                <p class="text-gray-600">
                    &copy; {{ new Date().getFullYear() }} {{ runtimeConfig?.public?.appName }}
                </p>
            </div>
        </footer>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

function identifyFlag() {
    const selectedLanguage = userStore.getLanguage
    if (selectedLanguage === 'en') {
        return '/img/icons/flags/united-kingdom.svg'
    } else {
        if (selectedLanguage === 'dk') {
            return '/img/icons/flags/denmark.svg'
        }
    }
}

function selectLanguage() {
    state.slideOver.isLanguageSwitcherOpen = true
}
</script>
