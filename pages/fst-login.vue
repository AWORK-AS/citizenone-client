<template>

    <Head>
        <Title>{{ $t('login.login') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="flex h-screen flex-1">
            <div class="relative hidden w-0 flex-1 lg:block overflow-clip">
                <img src="https://findsocialetilbud.dk/wp-content/uploads/2017/04/findopholdssteder-1-1.jpg"
                    alt="Image failed to load" class="absolute inset-0 h-full w-full object-cover" />
                <img src="https://citizenone.dk/wp-content/uploads/2024/09/2.svg" alt="Image failed to load"
                    class="absolute w-1/2" style="top: -16%; left: -11%;" />
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
                        <LogoFst @click="navigateTo('/fst-login')" />
                        <button type="button" class="-m-2.5 rounded-full w-8" @click="selectLanguage">
                            <img :src="identifyFlag()" alt="flag">
                        </button>
                    </div>

                    <form class="mt-5 space-y-3" method="POST" @submit.prevent="login">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <h3 class="font-medium">
                            {{ $t('login.SignInToYourAccount') }}
                        </h3>
                        <div class="space-y-1">
                            <FormLabel for="email" :label="$t('login.form.emailAddress')" />
                            <FormTextField id="email" name="email" :placeholder="$t('login.form.emailAddress')"
                                v-model="state.email" />
                            <FormError :error="v$?.email?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.email?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="password" :label="$t('login.form.password')" />
                            <FormPasswordField id="password" name="password" :placeholder="$t('login.form.password')"
                                v-model="state.password" />
                            <FormError :error="v$?.password?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.password?.[0]" />
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox"
                                    class="w-5 h-5 accent-primary cursor-pointer focus:ring-transparent" />
                                <label for="remember-me"
                                    class="ml-3 block text-sm leading-6 text-gray-700 cursor-pointer">
                                    {{ $t('login.form.rememberMe') }}
                                </label>
                            </div>
                            <div class="text-sm leading-6">
                                <a class="text-primary hover:text-primary-800 cursor-pointer"
                                    @click="navigateTo('/fst-forgot-password')">
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
                            @click="navigateTo('/fst-register')">
                            {{ $t('login.form.dontHaveAnAccount') }}?
                            {{ ' ' }}
                            <a class="text-primary hover:text-primary-800 cursor-pointer">
                                {{ $t('login.form.createAccountHere') }}
                            </a>
                        </p>
                        <div class="text-center text-sm leading-6">
                            <a class="text-primary hover:text-primary-800 cursor-pointer" @click="navigateToSupport">
                                {{ $t('login.doYouNeedHelp') }}?
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <ModulesLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/AuthService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const language = useI18n()
const { t } = useI18n()

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    email: null as any,
    error: {} as Error,
    isPageLoading: false,
    password: null as any,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const rules = computed(() => {
    return {
        email: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
        password: {
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

async function login() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const params = {
                email: state.email,
                password: state.password,
            }
            const response = await authService.login(params)
            if (response.data) {
                localStorage.setItem("_token", response.data?.token)
                userStore.setUser(response?.data?.user)
                userStore.setLanguage(response?.data?.user?.language?.code)
                language.locale.value = response?.data?.user?.language?.code
                navigateTo('/daily-overview')
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
        return '/img/icons/flags/united-states-of-america.svg'
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
</script>