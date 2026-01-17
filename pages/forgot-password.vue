<template>

    <Head>
        <Title>{{ $t('forgotPassword.forgotPassword') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="bg-[#f9fafaff] flex h-screen min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div class="flex items-center justify-center">
                <Logo @click="navigateTo('/')" />
            </div>

            <div class="mt-10 p-3 md:p-0 sm:mx-auto sm:w-full sm:max-w-7xl">
                <div class="bg-white shadow rounded-lg">
                    <div class="grid grid-cols-1 lg:grid-cols-2">
                        <div class="hidden lg:block p-3">
                            <div class="relative h-[600px] w-full overflow-hidden rounded-md ">
                                <img class="h-full w-full object-cover"
                                    src="https://citizenone.dk/wp-content/uploads/2025/03/DSC_6902-1024x684-1.jpg"
                                    :alt="$t('imageFailedToLoad')" />

                                <div class="absolute inset-0 bg-black/15"></div>

                                <div class="absolute -top-28 -right-20">
                                    <img src="/img/icons/asset-01.svg" alt="Image failed to load" class="z-10 w-60"
                                        id="animatedAsset01">
                                </div>

                                <div class="absolute -bottom-28 -left-20 opacity-80">
                                    <img src="/img/icons/asset-02.svg" alt="Image failed to load" class="z-10 w-60"
                                        id="animatedAsset02">
                                </div>

                                <div
                                    class="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
                                    <div class="text-center">
                                        <h4 class="text-base">
                                            {{ $t('login.welcomeBack') }}👋
                                        </h4>
                                        <h3 class="mt-5 text-4xl">
                                            <span class="font-normal">
                                                {{ $t('login.loginToContinueTo') }}
                                            </span>
                                            <br />
                                            <span>CitizenOne</span>.
                                        </h3>
                                        <div class="mt-10 flex justify-center">
                                            <FormButton type="button" buttonStyle="primary" class="w-fit"
                                                @click="navigateToHomePage('https://citizenone.dk')">
                                                {{ $t('login.seeWhatsNew') }}
                                            </FormButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form class="mt-5 space-y-3 p-8 lg:p-28" method="POST" @submit.prevent="forgotPassword">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div class="flex items-center justify-between">
                                <h3 class="font-medium">
                                    {{ $t('forgotPassword.forgotPassword') }}
                                </h3>
                                <button type="button" class="rounded-full w-8" @click="selectLanguage">
                                    <img :src="identifyFlag()" alt="flag">
                                </button>
                            </div>
                            <p>
                                {{ $t('forgotPassword.enterEmailAssociated') }}
                            </p>
                            <div class="space-y-1">
                                <FormLabel for="email" :label="$t('forgotPassword.emailAddress')" />
                                <FormTextField id="email" name="email" :placeholder="$t('forgotPassword.emailAddress')"
                                    v-model="state.email" />
                                <FormError :error="v$?.email?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.email?.[0]" />
                            </div>
                            <div>
                                <FormButton type="submit" buttonStyle="primary" class="w-full">
                                    {{ $t('forgotPassword.requestPasswordReset') }}
                                </FormButton>
                            </div>
                            <p class="text-center text-sm leading-6 text-gray-500">
                                {{ $t('forgotPassword.or') }}
                                {{ ' ' }}
                                <a class="text-primary hover:text-primary-800 cursor-pointer" @click="navigateTo('/')">
                                    {{ $t('forgotPassword.loginHereInstead') }}
                                </a>
                            </p>
                        </form>
                    </div>
                </div>

                <p class="mt-8 text-center text-sm/6 text-gray-500">
                    ISO-certificeret serverlagring beliggende i EU
                </p>
            </div>
        </div>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { authService } from '@/components/api/user/AuthService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const langugage = useI18n()
const { successAlert } = useAlert()
const { t } = useI18n()

// Set language
langugage.locale.value = userStore.getLanguage

const state = reactive({
    email: null as any,
    error: {} as Error,
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const rules = computed(() => {
    return {
        email: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    animateAssets()
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

async function forgotPassword() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const params = {
                email: state.email,
            }
            const response = await authService.forgotPassword(params)
            if (response?.message) {
                successAlert(`${t('alert.success')}!`, `${t('alert.forgotPasswordSuccess')}.`)
                navigateTo('/')
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
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

async function navigateToHomePage(link: any) {
    await navigateTo(link, {
        external: true
    })
}
</script>