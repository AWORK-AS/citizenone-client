<template>

    <Head>
        <Title>{{ $t('setupPassword.setupPassword') }} - {{ runtimeConfig?.public?.appName }}</Title>
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

                        <form class="mt-5 p-8 lg:p-28" method="POST" @submit.prevent="setPassword">
                            <div class="space-y-3">
                                <Alert type="danger" :text="state?.error?.message"
                                    v-if="state.error?.message && state.error.message.length > 0" />
                                <div class="flex items-center justify-between">
                                    <h3 class="font-medium">
                                        {{ $t('setupPassword.setupPassword') }}
                                    </h3>
                                    <button type="button" class="rounded-full w-8" @click="selectLanguage">
                                        <img :src="identifyFlag()" alt="flag">
                                    </button>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="password" :label="$t('setupPassword.form.password')" />
                                    <FormPasswordField id="password" name="password"
                                        :placeholder="$t('setupPassword.form.password')"
                                        v-model="state.formUser.password" />
                                    <FormError :error="v$?.formUser?.password?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.password?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="confirm_password"
                                        :label="$t('setupPassword.form.confirmPassword')" />
                                    <FormPasswordField id="confirm_password" name="confirm_password"
                                        :placeholder="$t('setupPassword.form.confirmPassword')"
                                        v-model="state.formUser.confirm_password" />
                                    <FormError
                                        :error="v$?.formUser?.confirm_password?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.confirm_password?.[0]" />
                                </div>
                            </div>
                            <div class="mt-6">
                                <FormButton type="submit" buttonStyle="primary" class="w-full">
                                    {{ $t('setupPassword.setPassword') }}
                                </FormButton>
                            </div>
                            <p class="mt-2 text-center text-sm leading-6 text-gray-500">
                                {{ $t('setupPassword.or') }}
                                {{ ' ' }}
                                <a class="text-primary hover:text-primary-800 cursor-pointer" @click="navigateTo('/')">
                                    {{ $t('setupPassword.loginHereInstead') }}.
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
import { required, helpers, minLength, sameAs } from '@vuelidate/validators'
import { authService } from '@/components/api/user/AuthService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const route = useRoute()
const language = useI18n()
const { errorAlert, successAlert } = useAlert()
const { t } = useI18n()

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    error: {} as Error,
    formUser: {
        password: null,
        confirm_password: null,
    } as any,
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
    token: '',
})

const rules = computed(() => {
    return {
        formUser: {
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                minLength: helpers.withMessage(`${t('alert.setupPassword.required8Characters')}.`, minLength(8))
            },
            confirm_password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                sameAsPassword: helpers.withMessage(`${t('alert.setupPassword.confirmPasswordNotTheSame')}.`, sameAs(state.formUser.password)),
            }
        }
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    animateAssets()
    const token = route.query.token
    if (token && typeof token === 'string') {
        state.token = token
        verifyPasswordResetToken()
    } else {
        errorAlert(`${t('alert.somethingWentWrong')}.`, `${t('alert.setupPassword.invalidPasswordSetupToken')}.`)
        navigateTo('/forgot-password')
    }
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

async function verifyPasswordResetToken() {
    state.isPageLoading = true
    state.error = {}
    try {
        await authService.verifyResetPassword(state.token)
    } catch (error) {
        if (error) {
            const err = error as Error
            state.error = err
            if (err.hasOwnProperty('message')) {
                if (err.message === 'Invalid password reset token.') {
                    errorAlert(`${t('alert.somethingWentWrong')}.`, `${t('alert.setupPassword.invalidPasswordSetupToken')}.`)
                } else {
                    errorAlert(`${t('alert.somethingWentWrong')}.`, err.message ?? '')
                }
                navigateTo('/')
            }
        }
    }
    state.isPageLoading = false
}

async function setPassword() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        const params = {
            password: state.formUser.password,
            token: state.token,
        }
        try {
            await authService.setPassword(params)
            successAlert(`${t('alert.success')}!`, `${t('alert.setupPassword.passwordSetupSucessfully')}.`)
            navigateTo('/')
        } catch (error) {
            const err = error as Error
            state.error = err
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
