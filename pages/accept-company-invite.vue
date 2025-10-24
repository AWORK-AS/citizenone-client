<template>
    <div>
        <NuxtLayout>

            <Head>
                <Title>{{ $t('invitation.invitationAccepted') }} - {{ runtimeConfig?.public?.appName }}</Title>
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
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { errorAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore()
const language = useI18n()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.query?.company
const userUuid = router?.currentRoute?.value?.query?.user

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
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
        const params = {
            company_uuid: companyUuid,
            user_uuid: userUuid,
        }
        await companyInvitationService.acceptInvitation(params)
    } catch (error: any) {
        state.error = error
        if (error?.message) {
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('invitation.alert.invalidInvitationLink')}.`)
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
        return '/img/icons/flags/united-kingdom.svg'
    } else {
        if (selectedLanguage === 'dk') {
            return '/img/icons/flags/denmark.svg'
        }
    }
}
</script>