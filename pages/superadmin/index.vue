<template>

    <Head>
        <Title>Login - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="flex h-screen flex-1">
            <div class="relative hidden w-0 flex-1 lg:block overflow-clip">
                <img src="https://citizenone.dk/wp-content/uploads/2024/09/CitizenOne-6.jpg" alt="Image failed to load"
                    class="absolute inset-0 h-full w-full object-cover" />
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
            <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div class="mx-auto w-full max-w-sm lg:w-96">
                    <div class="flex items-center justify-between">
                        <Logo @click="navigateTo('/superadmin')" />
                        <button type="button" class="-m-2.5 rounded-full w-8" @click="selectLanguage">
                            <img :src="identifyFlag()" alt="flag">
                        </button>
                    </div>

                    <!-- Second step: staff with 2FA get a challenge, not a token, from the password. -->
                    <form v-if="state.twoFactor.challenge" class="mt-5 space-y-4" method="POST"
                        @submit.prevent="verifyTwoFactor">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="flex items-center gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0faf9]">
                                <Icon name="ph:shield-check" class="h-5 w-5 text-[#2dbab2]" />
                            </div>
                            <h2 class="font-medium text-[#1a2332]">
                                {{ $t('superadmin.twoFactor.codeTitle') }}
                            </h2>
                        </div>
                        <p class="text-sm text-[#64748b]">
                            {{ $t('superadmin.twoFactor.codeIntro') }}
                        </p>
                        <ModulesSuperadminTwoFactorCodeInput id="staff-2fa-code" v-model="state.twoFactor.code"
                            :label="$t('superadmin.twoFactor.codeLabel')" @submit="verifyTwoFactor" />
                        <p class="text-xs text-[#64748b]" v-if="state.twoFactor.secondsLeft > 0">
                            {{ $t('superadmin.twoFactor.expiresIn', { seconds: state.twoFactor.secondsLeft }) }}
                        </p>
                        <FormButton type="submit" buttonStyle="primary" class="w-full"
                            :disabled="!isCompleteTotpCode(state.twoFactor.code)">
                            {{ $t('superadmin.twoFactor.verify') }}
                        </FormButton>
                        <button type="button" class="w-full text-sm text-primary hover:text-primary-800"
                            @click="backToPassword()">
                            {{ $t('superadmin.twoFactor.back') }}
                        </button>
                    </form>

                    <form v-else class="mt-5 space-y-3" method="POST" @submit.prevent="login">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <h2 class="font-medium">
                            Admin login
                        </h2>
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
                                    {{ $t('login.form.rememberMeFor30Days') }}
                                </label>
                            </div>
                            <div class="text-sm leading-6">
                                <a class="text-primary hover:text-primary-800 cursor-pointer"
                                    @click="navigateTo('/superadmin/forgot-password')">
                                    {{ $t('login.form.forgotPassword') }}?
                                </a>
                            </div>
                        </div>
                        <div>
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('login.form.login') }}
                            </FormButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/superadmin/AuthService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import {
    isChallengeExpired,
    isCompleteTotpCode,
    isStaffTwoFactorChallenge,
    secondsLeft,
} from '@/composables/staffTwoFactor'

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
    twoFactor: {
        challenge: '' as string,
        code: '' as string,
        expiresAt: 0,
        secondsLeft: 0,
    },
})

let twoFactorTimer: ReturnType<typeof setInterval> | null = null

// The customer login sends staff here (pages/index.vue) with a challenge already in hand.
const HANDOFF_KEY = 'staffTwoFactorChallenge'

onMounted(() => {
    try {
        const handoff = JSON.parse(sessionStorage.getItem(HANDOFF_KEY) || 'null')
        sessionStorage.removeItem(HANDOFF_KEY)
        if (handoff?.challenge && handoff.expiresAt > Date.now()) {
            startTwoFactor(handoff.challenge, handoff.expiresAt)
        }
    } catch {
        // No handoff: the ordinary login.
    }
})

onBeforeUnmount(stopTimer)

function startTwoFactor(challenge: string, expiresAt: number) {
    state.twoFactor.challenge = challenge
    state.twoFactor.code = ''
    state.twoFactor.expiresAt = expiresAt
    tick()
    stopTimer()
    twoFactorTimer = setInterval(tick, 1000)
}

function tick() {
    state.twoFactor.secondsLeft = secondsLeft(state.twoFactor.expiresAt, Date.now())
    if (state.twoFactor.challenge && state.twoFactor.secondsLeft === 0) {
        backToPassword(t('superadmin.twoFactor.expired'))
    }
}

function stopTimer() {
    if (twoFactorTimer) clearInterval(twoFactorTimer)
    twoFactorTimer = null
}

function backToPassword(message?: string) {
    stopTimer()
    state.twoFactor.challenge = ''
    state.twoFactor.code = ''
    state.twoFactor.secondsLeft = 0
    state.password = null
    state.error = message ? ({ message } as Error) : {}
}

async function finishLogin(data: any) {
    await setSessionToken(data?.token)
    userStore.setUser(data?.user)
    userStore.setLanguage(data?.user?.language?.code)
    language.locale.value = data?.user?.language?.code
    navigateTo('/superadmin/today')
}

async function verifyTwoFactor() {
    if (!isCompleteTotpCode(state.twoFactor.code) || state.isPageLoading) return
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await authService.verifyTwoFactor({
            challenge: state.twoFactor.challenge,
            code: state.twoFactor.code,
        })
        if (response.data?.token) {
            stopTimer()
            await finishLogin(response.data)
        }
    } catch (error: any) {
        if (isChallengeExpired(error)) {
            backToPassword(error?.message || t('superadmin.twoFactor.expired'))
        } else {
            state.error = error
            state.twoFactor.code = ''
        }
    }
    state.isPageLoading = false
}

const rules = computed(() => {
    return {
        email: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        password: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    }
})
const v$ = useVuelidate(rules, state)

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
            if (isStaffTwoFactorChallenge(response.data)) {
                startTwoFactor(response.data.challenge, Date.now() + (response.data.expires_in ?? 300) * 1000)
            } else if (response.data) {
                await finishLogin(response.data)
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
    const flags: Record<string, string> = {
        en: '/img/icons/flags/united-kingdom.svg',
        dk: '/img/icons/flags/denmark.svg',
        no: '/img/icons/flags/norway.svg',
        sv: '/img/icons/flags/sweden.svg',
    }
    return flags[selectedLanguage] ?? '/img/icons/flags/united-kingdom.svg'
}
</script>