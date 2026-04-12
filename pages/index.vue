<template>

    <Head>
        <Title>{{ $t('login.login') }} - {{ runtimeConfig?.public?.appName }}</Title>
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

                        <form class="mt-5 space-y-3 p-8 lg:p-28" method="POST" @submit.prevent="login">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div class="flex items-center justify-between">
                                <h3 class="font-medium">
                                    {{ $t('login.signinToYourAccount') }}
                                </h3>
                                <button type="button" class="rounded-full w-8" @click="selectLanguage">
                                    <img :src="identifyFlag()" alt="flag">
                                </button>
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="email" :label="$t('login.form.emailAddress')" />
                                <FormTextField id="email" name="email" :placeholder="$t('login.form.emailAddress')"
                                    v-model="state.formLogin.email" />
                                <FormError :error="v$?.formLogin?.email?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.email?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="password" :label="$t('login.form.password')" />
                                <FormPasswordField id="password" name="password"
                                    :placeholder="$t('login.form.password')" v-model="state.formLogin.password" />
                                <FormError :error="v$?.formLogin?.password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.password?.[0]" />
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <input id="remember-me" name="remember-me" type="checkbox"
                                        class="w-5 h-5 accent-primary cursor-pointer focus:ring-transparent rounded-full"
                                        v-model="state.remember_me" />
                                    <label for="remember-me"
                                        class="ml-3 block text-sm leading-6 text-gray-700 cursor-pointer">
                                        {{ $t('login.form.rememberMeFor14Days') }}
                                    </label>
                                </div>
                                <div class="text-sm leading-6">
                                    <a class="text-primary hover:text-primary-800 cursor-pointer"
                                        @click="navigateTo('/forgot-password')">
                                        {{ $t('login.form.forgotPassword') }}?
                                    </a>
                                </div>
                            </div>
                            <div>
                                <FormButton type="submit" buttonStyle="primary" class="w-full">
                                    {{ $t('login.form.login') }}
                                </FormButton>
                            </div>
                            <p class="text-center text-sm leading-6 text-gray-500 cursor-pointer"
                                @click="navigateTo('/register')">
                                {{ $t('login.form.dontHaveAnAccount') }}?
                                {{ ' ' }}
                                <a class="text-primary hover:text-primary-800 cursor-pointer">
                                    {{ $t('login.form.createAccountHere') }}
                                </a>
                            </p>
                            <div class="text-center text-sm leading-6">
                                <a class="text-primary hover:text-primary-800 cursor-pointer"
                                    @click="navigateToSupport">
                                    {{ $t('login.doYouNeedHelp') }}?
                                </a>
                            </div>
                        </form>
                    </div>
                </div>

                <p class="mt-8 text-center text-sm/6 text-gray-500">
                    ISO-certificeret serverlagring beliggende i EU
                </p>
            </div>
        </div>
        <ModulesUserAuthenticationModal2fa :isModalOpen="state.modal.isGoogle2faVerificationOpen"
            :formLogin="state.formLogin" @close="state.modal.isGoogle2faVerificationOpen = false"
            v-if="state.modal.isGoogle2faVerificationOpen" />
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>


<script setup lang="ts">
import { authService } from '@/components/api/user/AuthService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useDepartmentStore } from '@/store/department'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const departmentStore = useDepartmentStore()
const userStore = useUserStore()
const language = useI18n()
const { t } = useI18n()

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    error: {} as Error,
    formLogin: {
        email: null as any,
        password: null as any,
    },
    isPageLoading: false,
    modal: {
        isGoogle2faVerificationOpen: false
    },
    remember_me: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const rules = computed(() => {
    return {
        formLogin: {
            email: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    animateAssets()
    const rememberMe = localStorage.getItem("remember_me")
    if (rememberMe) {
        navigateTo('/overview')
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
    observer.observe(animatedAsset01)
    const animatedAsset02 = document.getElementById('animatedAsset02') as any
    observer.observe(animatedAsset02)
}

async function login() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const params = {
                email: state.formLogin.email,
                password: state.formLogin.password,
            }
            const response = await authService.login(params)
            if (response.data) {
                if (state.remember_me) {
                    localStorage.setItem("remember_me", state.remember_me?.toString())
                } else {
                    localStorage.removeItem("remember_me")
                }

                if (response.data?.user?.is_google_2fa_enabled) {
                    state.modal.isGoogle2faVerificationOpen = true
                } else {
                    localStorage.setItem("_token", response.data?.token)
                    departmentStore.resetSelectedDepartment()
                    departmentStore.resetSelectedDepartmentColor()
                    departmentStore.resetSelectedDepartmentName()
                    userStore.setUser(response?.data?.user)
                    userStore.setLanguage(response?.data?.user?.language?.code)
                    language.locale.value = response?.data?.user?.language?.code
                    if (response.data.user?.role === 'Citizen') {
                        navigateTo('/citizen/overview')
                    } else if (response.data.user?.role === 'Relative') {
                        navigateTo('/relative/citizens')
                    } else {
                        navigateTo('/overview')
                    }
                }
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

async function navigateToSupport() {
    await navigateTo('https://citizenone.dk/support', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

async function navigateToHomePage(link: any) {
    await navigateTo(link, {
        external: true
    })
}
</script>