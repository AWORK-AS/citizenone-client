<template>
    <div>
        <NuxtLayout>

            <Head>
                <Title>{{ view.title }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="flex h-screen flex-1">
                    <div class="relative hidden w-0 flex-1 lg:block overflow-clip">
                        <img src="https://citizenone.dk/wp-content/uploads/2024/09/CitizenOne-6.jpg"
                            alt="Image failed to load" class="absolute inset-0 h-full w-full object-cover" />
                        <img src="https://citizenone.dk/wp-content/uploads/2025/03/citizenone-journalsystem.svg"
                            alt="Image failed to load" class="absolute w-1/2" style="top: -16%; left: -11%;" />
                        <div>
                            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                                class="absolute w-2/4 -bottom-56 -right-12" />
                            <p class="absolute bottom-10 right-10 text-lg text-white flex items-center gap-x-2">
                                <img src="/img/icons/shield.svg" alt="Image failed to load" class="w-8 h-8" />
                                ISO-certificeret serverlagring beliggende i EU
                            </p>
                        </div>
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
                                <div v-if="state.outcome" class="ring-1 ring-gray-100 rounded-lg p-8 xl:py-12 xl:px-6">
                                    <div class="mx-auto max-w-fit rounded-full p-4 flex items-center justify-center"
                                        :class="view.iconClass">
                                        <Icon :name="view.icon" class="h-5 w-5 text-white" aria-hidden="true" />
                                    </div>
                                    <div class="mt-4 text-center" role="status">
                                        <h2 class="text-xl font-extrabold text-gray-900">
                                            {{ view.title }}
                                        </h2>
                                        <p class="mt-2 text-sm text-gray-600">
                                            {{ view.body }}.
                                        </p>
                                    </div>
                                    <div class="mt-6">
                                        <FormButton type="button" buttonStyle="primary" class="w-full"
                                            @click="navigateTo('/')">
                                            {{ $t('invitation.loginToContinue') }}
                                        </FormButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
                    @close="state.slideOver.isLanguageSwitcherOpen = false" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyInvitationService } from '@/components/api/user/CompanyInvitationService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { readCompanyInviteParams, companyInviteOutcomeOf, type CompanyInviteOutcome } from '@/composables/companyInvite'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const userStore = useUserStore()
const language = useI18n()
const router = useRouter()
const invite = readCompanyInviteParams(router?.currentRoute?.value?.query ?? {})

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    outcome: null as CompanyInviteOutcome | null,
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const view = computed(() => {
    switch (state.outcome) {
        case 'accepted':
            return { icon: 'ph:check-bold', iconClass: 'bg-green-600', title: t('invitation.invitationAccepted'), body: t('invitation.youHaveSuccessfullyAcceptedTheInvitation') }
        case 'expired':
            return { icon: 'ph:clock-bold', iconClass: 'bg-amber-500', title: t('invitation.expiredTitle'), body: t('invitation.expiredBody') }
        case 'invalid':
            return { icon: 'ph:link-break-bold', iconClass: 'bg-red-600', title: t('invitation.invalidTitle'), body: t('invitation.invalidBody') }
        case 'notAdmin':
            return { icon: 'ph:x-bold', iconClass: 'bg-red-600', title: t('invitation.notAdminTitle'), body: t('invitation.notAdminBody') }
        case 'error':
            return { icon: 'ph:warning-bold', iconClass: 'bg-red-600', title: t('invitation.errorTitle'), body: t('invitation.errorBody') }
        default:
            return { icon: '', iconClass: '', title: t('invitation.accepting'), body: '' }
    }
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
    // An old or cut-off link is refused without a round trip.
    if (!invite) {
        state.outcome = 'invalid'
        return
    }

    state.isPageLoading = true
    try {
        await companyInvitationService.acceptInvitation({ ...invite, locale: userStore.getLanguage })
        state.outcome = 'accepted'
    } catch (error: any) {
        state.outcome = companyInviteOutcomeOf(error)
    }
    state.isPageLoading = false
}

function selectLanguage() {
    state.slideOver.isLanguageSwitcherOpen = true
}

function identifyFlag() {
    const selectedLanguage = userStore.getLanguage
    const flags: Record<string, string> = {
        en: '/img/icons/flags/united-kingdom.svg',
        dk: '/img/icons/flags/denmark.svg',
        no: '/img/icons/flags/norway.svg',
        sv: '/img/icons/flags/sweden.svg',
    }
    return flags[selectedLanguage] ?? '/img/icons/flags/united-kingdom.svg'
}
</script>