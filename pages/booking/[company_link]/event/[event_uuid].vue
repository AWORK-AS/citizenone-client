<template>
    <div class="min-h-screen flex flex-col">
        <header class="bg-primary">
            <div class="mx-auto max-w-6xl px-4 py-8 flex justify-between gap-x-5">
                <div>
                    <div class="flex items-center gap-x-4 cursor-pointer"
                        @click="navigateTo('/booking/company-link/overview')"
                        v-if="Object.keys(state.bookingSettings).length > 0">
                        <p class="text-xl text-white font-semibold">
                            {{ state.bookingSettings?.header }}
                        </p>
                        <div class="bg-white px-3 py-2 text-xs font-semibold rounded-lg">
                            {{ $t('bookings.events') }}
                        </div>
                    </div>
                </div>
                <button type="button" class="-m-2.5 rounded-full w-8" @click="selectLanguage">
                    <img :src="identifyFlag()" alt="flag">
                </button>
            </div>
        </header>
        <div class="flex-grow">
            <div class="mx-auto max-w-6xl px-4 py-8" v-if="Object.keys(state.bookingSettings).length > 0">
                <ModulesUserBookingProgress />
            </div>
            <div class="mx-auto max-w-6xl text-center px-4 py-40 space-y-5" v-else>
                <div class="flex justify-center items-center">
                    <img src="/img/undraw/warning.svg" class="w-48 cursor-pointer" />
                </div>
                <div>
                    <h2 class="text-balance text-2xl font-semibold tracking-tight text-gray-900">
                        Opppps! {{ $t('somethingWentWrong') }}.
                    </h2>
                    <p class="text-pretty text-lg text-gray-600">
                        {{ $t('pageNotFound') }}.
                    </p>
                </div>
                <div class="mx-auto max-w-xs">
                    <FormButton buttonStyle="primary" class="w-full" @click="navigateTo('/')">
                        {{ $t('home') }}
                    </FormButton>
                </div>
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
import { onlineBookingSettingsService } from '@/components/api/user/OnlineBookingSettingsService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
const router = useRouter()
const companyLink = router?.currentRoute?.value?.params?.company_link

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()

const state = reactive({
    bookingSettings: {} as any,
    error: {} as Error,
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

onMounted(() => {
    fetchBookingSettings()
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

async function fetchBookingSettings() {
    state.error = {}
    try {
        const response = await onlineBookingSettingsService.getOnlineBookingSettingsPerLink(companyLink)
        if (response?.data) {
            state.bookingSettings = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>
