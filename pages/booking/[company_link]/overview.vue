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
            <div class="mx-auto max-w-6xl px-4 py-8 ">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                        <div class="relative">
                            <div class="absolute inset-px rounded-lg bg-white"></div>
                            <div
                                class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                                <img class="h-80 object-cover"
                                    src="https://tailwindcss.com/plus-assets/img/component-images/bento-01-integrations.png"
                                    alt="" />
                                <div class="px-5 pb-6 pt-10 space-y-2">
                                    <div class="flex gap-x-5">
                                        <div class="flex gap-x-3">
                                            <div>
                                                <h3 class="text-lg font-semibold text-primary">20</h3>
                                                <h3 class="text-xs font-semibold text-primary">Jun</h3>
                                            </div>
                                            <div>
                                                -
                                            </div>
                                            <div>
                                                <h3 class="text-lg font-semibold text-primary">19</h3>
                                                <h3 class="text-xs font-semibold text-primary">Jun</h3>
                                            </div>
                                        </div>
                                        <div class="mt-1 text-sm">
                                            <p>Friday 9:00AM</p>
                                            <p>Sunday 5:00PM</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p class="text-lg font-medium tracking-tight">
                                            Event Title
                                        </p>
                                        <p class="max-w-lg text-xs text-gray-600">
                                            Course - 10 sessions
                                        </p>
                                    </div>
                                    <p class="max-w-lg text-sm text-gray-600">
                                        Description goes here.
                                    </p>
                                    <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 1
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 2
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 3
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 4
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 5
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 6
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 7
                                        </div>
                                    </div>
                                    <div>
                                        <FormButton buttonStyle="primary"
                                            @click="navigateTo('/booking/event/event-uuid')" class="w-full rounded-md">
                                            {{ $t('bookings.booking.signUp') }}
                                        </FormButton>
                                    </div>
                                    <div class="text-sm flex justify-between">
                                        <div>
                                            DKK 100,00
                                        </div>
                                        <div>
                                            5 spots left
                                        </div>
                                    </div>
                                    <div class="text-sm">
                                        Somewhere over the rainbow
                                    </div>
                                </div>
                            </div>
                            <div class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5">
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="relative">
                            <div class="absolute inset-px rounded-lg bg-white"></div>
                            <div
                                class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                                <img class="h-80 object-cover"
                                    src="https://tailwindcss.com/plus-assets/img/component-images/bento-01-integrations.png"
                                    alt="" />
                                <div class="px-5 pb-6 pt-10 space-y-2">
                                    <div class="flex gap-x-5">
                                        <div class="flex gap-x-3">
                                            <div>
                                                <h3 class="text-lg font-semibold text-primary">20</h3>
                                                <h3 class="text-xs font-semibold text-primary">Jun</h3>
                                            </div>
                                            <div>
                                                -
                                            </div>
                                            <div>
                                                <h3 class="text-lg font-semibold text-primary">19</h3>
                                                <h3 class="text-xs font-semibold text-primary">Jun</h3>
                                            </div>
                                        </div>
                                        <div class="mt-1 text-sm">
                                            <p>Friday 9:00AM</p>
                                            <p>Sunday 5:00PM</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p class="text-lg font-medium tracking-tight">
                                            Event Title
                                        </p>
                                        <p class="max-w-lg text-xs text-gray-600">
                                            Course - 10 sessions
                                        </p>
                                    </div>
                                    <p class="max-w-lg text-sm text-gray-600">
                                        Description goes here.
                                    </p>
                                    <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 1
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 2
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 3
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 4
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 5
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 6
                                        </div>
                                        <div
                                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                            Tag 7
                                        </div>
                                    </div>
                                    <div>
                                        <FormButton buttonStyle="primary"
                                            @click="navigateTo('/booking/event/event-uuid')" class="w-full rounded-md">
                                            {{ $t('bookings.booking.signUp') }}
                                        </FormButton>
                                    </div>
                                    <div class="text-sm flex justify-between">
                                        <div>
                                            DKK 100,00
                                        </div>
                                        <div>
                                            5 spots left
                                        </div>
                                    </div>
                                    <div class="text-sm">
                                        Somewhere over the rainbow
                                    </div>
                                </div>
                            </div>
                            <div class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5">
                            </div>
                        </div>
                    </div>
                    <div class="relative">
                        <div class="absolute inset-px rounded-lg bg-white"></div>
                        <div
                            class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                            <img class="h-80 object-cover"
                                src="https://tailwindcss.com/plus-assets/img/component-images/bento-01-integrations.png"
                                alt="" />
                            <div class="px-5 pb-6 pt-10 space-y-2">
                                <div class="flex gap-x-5">
                                    <div class="flex gap-x-3">
                                        <div>
                                            <h3 class="text-lg font-semibold text-primary">20</h3>
                                            <h3 class="text-xs font-semibold text-primary">Jun</h3>
                                        </div>
                                        <div>
                                            -
                                        </div>
                                        <div>
                                            <h3 class="text-lg font-semibold text-primary">19</h3>
                                            <h3 class="text-xs font-semibold text-primary">Jun</h3>
                                        </div>
                                    </div>
                                    <div class="mt-1 text-sm">
                                        <p>Friday 9:00AM</p>
                                        <p>Sunday 5:00PM</p>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-lg font-medium tracking-tight">
                                        Event Title
                                    </p>
                                    <p class="max-w-lg text-xs text-gray-600">
                                        Course - 10 sessions
                                    </p>
                                </div>
                                <p class="max-w-lg text-sm text-gray-600">
                                    Description goes here.
                                </p>
                                <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 1
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 2
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 3
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 4
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 5
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 6
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 7
                                    </div>
                                </div>
                                <div>
                                    <FormButton buttonStyle="primary" @click="navigateTo('/booking/event/event-uuid')"
                                        class="w-full rounded-md">
                                        {{ $t('bookings.booking.signUp') }}
                                    </FormButton>
                                </div>
                                <div class="text-sm flex justify-between">
                                    <div>
                                        DKK 100,00
                                    </div>
                                    <div>
                                        5 spots left
                                    </div>
                                </div>
                                <div class="text-sm">
                                    Somewhere over the rainbow
                                </div>
                            </div>
                        </div>
                        <div class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5"></div>
                    </div>
                    <div class="relative">
                        <div class="absolute inset-px rounded-lg bg-white"></div>
                        <div
                            class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                            <img class="h-80 object-cover"
                                src="https://tailwindcss.com/plus-assets/img/component-images/bento-01-integrations.png"
                                alt="" />
                            <div class="px-5 pb-6 pt-10 space-y-2">
                                <div class="flex gap-x-5">
                                    <div class="flex gap-x-3">
                                        <div>
                                            <h3 class="text-lg font-semibold text-primary">20</h3>
                                            <h3 class="text-xs font-semibold text-primary">Jun</h3>
                                        </div>
                                        <div>
                                            -
                                        </div>
                                        <div>
                                            <h3 class="text-lg font-semibold text-primary">19</h3>
                                            <h3 class="text-xs font-semibold text-primary">Jun</h3>
                                        </div>
                                    </div>
                                    <div class="mt-1 text-sm">
                                        <p>Friday 9:00AM</p>
                                        <p>Sunday 5:00PM</p>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-lg font-medium tracking-tight">
                                        Event Title
                                    </p>
                                    <p class="max-w-lg text-xs text-gray-600">
                                        Course - 10 sessions
                                    </p>
                                </div>
                                <p class="max-w-lg text-sm text-gray-600">
                                    Description goes here.
                                </p>
                                <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 1
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 2
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 3
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 4
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 5
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 6
                                    </div>
                                    <div
                                        class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                                        Tag 7
                                    </div>
                                </div>
                                <div>
                                    <FormButton buttonStyle="primary" @click="navigateTo('/booking/event/event-uuid')"
                                        class="w-full rounded-md">
                                        {{ $t('bookings.booking.signUp') }}
                                    </FormButton>
                                </div>
                                <div class="text-sm flex justify-between">
                                    <div>
                                        DKK 100,00
                                    </div>
                                    <div>
                                        5 spots left
                                    </div>
                                </div>
                                <div class="text-sm">
                                    Somewhere over the rainbow
                                </div>
                            </div>
                        </div>
                        <div class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5"></div>
                    </div>
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

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const router = useRouter()
const companyLink = router?.currentRoute?.value?.params?.company_link

const state = reactive({
    bookingSettings: {},
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
