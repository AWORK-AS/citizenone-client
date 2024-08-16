<template>
    <div>
        <NuxtLayout>

            <Head>
                <Title>{{ $t('invitation.invitationAccepted') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="flex h-screen flex-1">
                    <div class="relative hidden w-0 flex-1 lg:block">
                        <img class="absolute inset-0 h-full w-full object-cover"
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="Image failed to load" />
                    </div>
                    <div
                        class="relative overflow-clip flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                        <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                            class="w-64 lg:w-1/2 absolute -top-32 -right-32 opacity-0 transition-opacity duration-500"
                            id="animatedAsset01">
                        <img src="/img/icons/asset-02.svg" alt="Image failed to load"
                            class="w-64 lg:w-1/2 absolute -bottom-32 -left-32 opacity-0 transition-opacity duration-500"
                            id="animatedAsset02">
                        <div class="mx-auto w-full max-w-sm lg:w-96">
                            <div class="flex items-center justify-between">
                                <Logo @click="navigateTo('/')" />
                                <button type="button" class="-m-2.5 rounded-full w-8" @click="selectLanguage">
                                    <img :src="identifyFlag()" alt="flag">
                                </button>
                            </div>

                            <div class="isolate mx-auto mt-10 grid max-w-lg">
                                <div class="ring-1 ring-gray-100 rounded-lg p-8 xl:py-12 xl:px-6">
                                    <div
                                        class="mx-auto max-w-fit bg-green-600 rounded-full p-4 flex items-center justify-center">
                                        <Icon name="ph:check-bold" class="h-5 w-5 text-white" aria-hidden="true" />
                                    </div>
                                    <div class="mt-4 text-center">
                                        <h2 class="text-xl font-extrabold text-gray-900">
                                            {{ $t('invitation.invitationAccepted') }}!
                                        </h2>
                                        <p class="mt-2 text-sm text-gray-600">
                                            {{ $t('invitation.youHaveSuccessfullyAcceptedTheInvitation') }}.
                                        </p>
                                    </div>
                                    <div class="space-y-2 mt-4">
                                        <div class="flex items-center gap-x-2">
                                            <dt class="flex items-center">
                                                <span class="sr-only">Title</span>
                                                <Icon name="ph:clipboard" class="h-4 w-4 text-gray-400"
                                                    aria-hidden="true" />
                                            </dt>
                                            <dd class="font-semibold text-gray-900 xl:pr-0">
                                                {{ state.event?.data?.my_calendar?.title }}
                                            </dd>
                                        </div>
                                        <div class="flex gap-x-2">
                                            <dt class="flex mt-1">
                                                <span class="sr-only">Description</span>
                                                <Icon name="heroicons:bars-3-bottom-left" class="h-4 w-4 text-gray-400"
                                                    aria-hidden="true" />
                                            </dt>
                                            <dd class="text-gray-900 xl:pr-0">
                                                {{ state.event?.data?.my_calendar?.description }}
                                            </dd>
                                        </div>
                                        <div>
                                            <div class="flex items-center space-x-3 text-xs">
                                                <div class="flex items-center">
                                                    <span class="sr-only">Date</span>
                                                    <Icon name="ph:calendar" class="h-4 w-4 text-gray-400"
                                                        aria-hidden="true" />
                                                </div>
                                                <div>
                                                    {{
                                                        formatDateTimeToReadable(state.event?.data?.my_calendar?.description.date_time_start)
                                                    }}
                                                    -
                                                    {{
                                                        formatDateTimeToReadable(state.event?.data?.my_calendar?.description.date_time_end)
                                                    }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>>
                <ModulesLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
                    @close="state.slideOver.isLanguageSwitcherOpen = false" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { invitationService } from '@/components/api/InvitationService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const userStore = useUserStore()
const language = useI18n()
const router = useRouter()
const calendarUserUuid = router?.currentRoute?.value?.query?.uuid
const { t } = useI18n()

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    event: [],
    error: {} as Error,
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

onMounted(() => {
    animateAssets()
    acceptInvitation()
})

function animateAssets() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in')
            } else {
                entry.target.classList.remove('animate-fade-in')
            }
        })
    })

    const animatedAsset01 = document.getElementById('animatedAsset01') as any
    const animatedAsset02 = document.getElementById('animatedAsset02') as any
    observer.observe(animatedAsset01)
    observer.observe(animatedAsset02)
}

async function acceptInvitation() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await invitationService.acceptCalendarInvitation(calendarUserUuid)
        if (response) {
            state.event = response
        }
    } catch (error: any) {
        state.error = error
        if (error?.message === 'Calendar event not found.') {
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('alert.invitation.calendarEventNotFound')}.`)
            navigateTo(`/`)
        }
    }
    state.isPageLoading = false
}

function selectLanguage() {
    state.slideOver.isLanguageSwitcherOpen = true
}

function identifyFlag() {
    const selectedLanguage = userStore.getLanguage
    if (selectedLanguage === 'en') {
        return '/img/icons/flags/united-states-of-america.svg'
    } else {
        if (selectedLanguage === 'dk') {
            return '/img/icons/flags/denmark.svg'
        }
    }
}

function errorAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'error',
    })
}
</script>