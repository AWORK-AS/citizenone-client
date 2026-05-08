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
                            <div class="sp-panel">
                                <div class="sp-bc sp-bc1"></div>
                                <div class="sp-bc sp-bc2"></div>
                                <div class="sp-bc sp-bc3"></div>
                                <div class="sp-top">
                                    <div class="sp-logo-row">
                                        <div class="sp-logo-icon">
                                            <div class="sp-ring sp-rg1"></div>
                                            <div class="sp-ring sp-rg2"></div>
                                            <div class="sp-ring sp-rg3"></div>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38.98 38.98" width="38"
                                                height="38" class="relative z-[2]">
                                                <circle class="sp-oc" cx="19.49" cy="19.49" r="18.99" fill="#1a3a5c"
                                                    stroke="rgb(66,174,217)" stroke-width="1" />
                                                <circle class="sp-ic" cx="19.43" cy="19.55" r="11.93"
                                                    fill="rgb(66,174,217)" stroke="#fff" stroke-width="0.5" />
                                            </svg>
                                        </div>
                                        <span class="sp-wordmark">
                                            CitizenOne<sup class="text-[10px] align-super">&#x2122;</sup>
                                        </span>
                                    </div>
                                </div>
                                <div class="sp-mid">
                                    <div class="sp-tag">
                                        {{ $t('login.tagline') }}
                                    </div>
                                    <div class="sp-h1">
                                        {{ $t('setupPassword.headlineLine1') }}<br>{{ $t('setupPassword.headlineLine2')
                                        }}
                                    </div>
                                    <p class="sp-desc">
                                        {{ $t('setupPassword.panelDescription') }}
                                    </p>
                                    <div class="sp-card">
                                        <div class="sp-card-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                                stroke="rgb(66,174,217)" stroke-width="2" stroke-linecap="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                                <path d="M7 11V7a5 5 0 0110 0v4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="sp-card-title">
                                                {{ $t('setupPassword.strongPasswordTitle') }}
                                            </div>
                                            <div class="sp-card-sub">
                                                {{ $t('setupPassword.strongPasswordSub') }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="sp-card">
                                        <div class="sp-card-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                                stroke="rgb(66,174,217)" stroke-width="2" stroke-linecap="round">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="sp-card-title">
                                                {{ $t('setupPassword.passwordEncryptedTitle') }}
                                            </div>
                                            <div class="sp-card-sub">
                                                {{ $t('setupPassword.passwordEncryptedSub') }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="sp-foot">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                        stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-linecap="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                    {{ $t('login.gdprNote') }}
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
                                    <div class="relative" v-click-outside="() => state.langOpen = false">
                                        <button type="button" @click="state.langOpen = !state.langOpen"
                                            class="flex items-center gap-1.5 py-[5px] pr-[10px] pl-[6px] rounded-full border border-slate-200 bg-white cursor-pointer text-xs font-semibold text-slate-500 hover:border-slate-300 transition-colors">
                                            <img :src="identifyFlag()" alt="flag"
                                                class="w-5 h-5 rounded-full object-cover" />
                                            {{ language.locale.value === 'en' ? 'EN' : 'DK' }}
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2.5">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </button>
                                        <div v-if="state.langOpen"
                                            class="absolute right-0 top-[calc(100%+6px)] bg-white border border-slate-200 rounded-xl shadow-lg z-[100] min-w-[120px] overflow-hidden">
                                            <button type="button" @click="setLang('dk')"
                                                :class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'dk' && 'bg-[#edf5fb]']">
                                                <img src="/img/icons/flags/denmark.svg"
                                                    class="w-5 h-5 rounded-full object-cover" />
                                                Dansk
                                            </button>
                                            <button type="button" @click="setLang('en')"
                                                :class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'en' && 'bg-[#edf5fb]']">
                                                <img src="/img/icons/flags/united-kingdom.svg"
                                                    class="w-5 h-5 rounded-full object-cover" />
                                                English
                                            </button>
                                        </div>
                                    </div>
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
                            <div class="mt-5">
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
                    {{ $t('login.isoNote') }}
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
    langOpen: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
    token: '',
})

const rules = computed(() => {
    return {
        formUser: {
            password: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                minLength: helpers.withMessage(() => `${t('alert.setupPassword.required8Characters')}.`, minLength(8))
            },
            confirm_password: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                sameAsPassword: helpers.withMessage(() => `${t('alert.setupPassword.confirmPasswordNotTheSame')}.`, sameAs(state.formUser.password)),
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

    const animatedAsset01 = document.getElementById('animatedAsset01')
    const animatedAsset02 = document.getElementById('animatedAsset02')
    if (animatedAsset01) observer.observe(animatedAsset01)
    if (animatedAsset02) observer.observe(animatedAsset02)
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

function setLang(lang: string) {
    language.locale.value = lang
    userStore.setLanguage(lang)
    state.langOpen = false
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

<style scoped>
.sp-panel {
    background: linear-gradient(160deg, #0f2b46 0%, #1a4a70 50%, #0a2840 100%);
    border-radius: 12px;
    height: 100%;
    min-height: 500px;
    width: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.5rem;
    font-family: 'Inter', sans-serif
}

.sp-bc {
    position: absolute;
    border-radius: 50%;
    background: rgba(66, 174, 217, 0.09)
}

.sp-bc1 {
    width: 400px;
    height: 400px;
    top: -140px;
    right: -140px;
    animation: spb1 16s ease-in-out infinite
}

.sp-bc2 {
    width: 240px;
    height: 240px;
    bottom: -90px;
    left: -80px;
    animation: spb2 20s ease-in-out infinite
}

.sp-bc3 {
    width: 140px;
    height: 140px;
    bottom: 100px;
    right: 40px;
    animation: spb3 12s ease-in-out infinite
}

@keyframes spb1 {

    0%,
    100% {
        transform: translate(0, 0)
    }

    40% {
        transform: translate(-20px, 16px)
    }

    70% {
        transform: translate(14px, -12px)
    }
}

@keyframes spb2 {

    0%,
    100% {
        transform: translate(0, 0)
    }

    45% {
        transform: translate(22px, -18px)
    }

    75% {
        transform: translate(-12px, 12px)
    }
}

@keyframes spb3 {

    0%,
    100% {
        transform: translate(0, 0)
    }

    35% {
        transform: translate(-16px, -20px)
    }

    68% {
        transform: translate(18px, 10px)
    }
}

.sp-top {
    position: relative;
    z-index: 2
}

.sp-logo-row {
    display: flex;
    align-items: center;
    gap: 14px
}

.sp-logo-icon {
    position: relative;
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center
}

.sp-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(66, 174, 217, 0.35);
    animation: spring 3s ease-in-out infinite
}

.sp-rg1 {
    width: 46px;
    height: 46px;
    animation-delay: 0s
}

.sp-rg2 {
    width: 68px;
    height: 68px;
    animation-delay: 0.8s
}

.sp-rg3 {
    width: 90px;
    height: 90px;
    animation-delay: 1.5s
}

@keyframes spring {
    0% {
        opacity: 0;
        transform: scale(0.8)
    }

    40% {
        opacity: 1
    }

    100% {
        opacity: 0;
        transform: scale(1.2)
    }
}

.sp-oc {
    animation: spoc 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
    transform-origin: 19.49px 19.49px
}

.sp-ic {
    animation: spic 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.65s both;
    transform-origin: 19.43px 19.55px
}

@keyframes spoc {
    from {
        transform: scale(0);
        opacity: 0
    }

    to {
        transform: scale(1);
        opacity: 1
    }
}

@keyframes spic {
    from {
        transform: scale(0);
        opacity: 0
    }

    to {
        transform: scale(1);
        opacity: 0.9
    }
}

.sp-wordmark {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
    opacity: 0;
    animation: spfu 0.5s ease 1.2s forwards
}

.sp-mid {
    position: relative;
    z-index: 2;
    opacity: 0;
    animation: spfu 0.6s ease 1.4s forwards
}

@keyframes spfu {
    from {
        opacity: 0;
        transform: translateY(12px)
    }

    to {
        opacity: 1;
        transform: translateY(0)
    }
}

.sp-tag {
    font-size: 10px;
    font-weight: 700;
    color: rgba(66, 174, 217, 0.85);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 1rem
}

.sp-h1 {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
    letter-spacing: -0.8px;
    margin-bottom: 0.75rem
}

.sp-desc {
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.7;
    max-width: 300px;
    margin-bottom: 2rem
}

.sp-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: rgba(66, 174, 217, 0.08);
    border: 1px solid rgba(66, 174, 217, 0.15);
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 10px
}

.sp-card-icon {
    width: 36px;
    height: 36px;
    background: rgba(66, 174, 217, 0.12);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0
}

.sp-card-title {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 2px
}

.sp-card-sub {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4)
}

.sp-foot {
    position: relative;
    z-index: 2;
    opacity: 0;
    animation: spfu 0.5s ease 2s forwards;
    font-size: 10.5px;
    color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 6px
}
</style>
