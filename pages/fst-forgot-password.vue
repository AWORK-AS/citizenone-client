<template>

    <Head>
        <Title>{{ $t('forgotPassword.forgotPassword') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="bg-[#f9fafaff] flex h-screen min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div class="flex items-center justify-center">
                <LogoFst @click="navigateTo('/fst-login')" />
            </div>

            <div class="mt-10 p-3 md:p-0 sm:mx-auto sm:w-full sm:max-w-7xl">
                <div class="bg-white shadow rounded-lg">
                    <div class="grid grid-cols-1 lg:grid-cols-2">
                        <div class="hidden lg:block p-3">
                            <div class="fp-panel">
                                <div class="fp-bc fp-bc1"></div>
                                <div class="fp-bc fp-bc2"></div>
                                <div class="fp-bc fp-bc3"></div>
                                <div class="fp-top">
                                    <div class="fp-logo-row">
                                        <div class="fp-logo-icon">
                                            <div class="fp-ring fp-rg1"></div>
                                            <div class="fp-ring fp-rg2"></div>
                                            <div class="fp-ring fp-rg3"></div>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38.98 38.98" width="38"
                                                height="38" class="relative z-[2]">
                                                <circle class="fp-oc" cx="19.49" cy="19.49" r="18.99" fill="#1a3a5c"
                                                    stroke="rgb(66,174,217)" stroke-width="1" />
                                                <circle class="fp-ic" cx="19.43" cy="19.55" r="11.93"
                                                    fill="rgb(66,174,217)" stroke="#fff" stroke-width="0.5" />
                                            </svg>
                                        </div>
                                        <span class="fp-wordmark">
                                            CitizenOne<sup class="text-[10px] align-super">&#x2122;</sup>
                                        </span>
                                    </div>
                                </div>
                                <div class="fp-mid">
                                    <div class="fp-tag">
                                        {{ $t('login.tagline') }}
                                    </div>
                                    <div class="fp-h1">
                                        {{ $t('forgotPassword.headlineLine1') }}<br>{{
                                            $t('forgotPassword.headlineLine2') }}
                                    </div>
                                    <p class="fp-desc">
                                        {{ $t('forgotPassword.panelDescription') }}
                                    </p>
                                    <div class="fp-card">
                                        <div class="fp-card-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                                stroke="rgb(66,174,217)" stroke-width="2" stroke-linecap="round">
                                                <path
                                                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="fp-card-title">
                                                {{ $t('forgotPassword.checkInboxTitle') }}
                                            </div>
                                            <div class="fp-card-sub">
                                                {{ $t('forgotPassword.checkInboxSub') }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="fp-card">
                                        <div class="fp-card-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                                stroke="rgb(66,174,217)" stroke-width="2" stroke-linecap="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                                <path d="M7 11V7a5 5 0 0110 0v4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="fp-card-title">
                                                {{ $t('forgotPassword.linkValidTitle') }}
                                            </div>
                                            <div class="fp-card-sub">
                                                {{ $t('forgotPassword.linkValidSub') }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="fp-foot">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                        stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-linecap="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                    {{ $t('login.gdprNote') }}
                                </div>
                            </div>
                        </div>

                        <form class="mt-5 p-8 lg:p-28" method="POST" @submit.prevent="forgotPassword">
                            <div class="space-y-3">
                                <Alert type="danger" :text="state?.error?.message"
                                    v-if="state.error?.message && state.error.message.length > 0" />
                                <div class="flex items-center justify-between">
                                    <h3 class="font-medium">
                                        {{ $t('forgotPassword.forgotPassword') }}
                                    </h3>
                                    <div class="relative" v-click-outside="() => state.langOpen = false">
                                        <button type="button" @click="state.langOpen = !state.langOpen"
                                            class="flex items-center gap-1.5 py-[5px] pr-[10px] pl-[6px] rounded-full border border-slate-200 bg-white cursor-pointer text-xs font-semibold text-slate-500 hover:border-slate-300 transition-colors">
                                            <img :src="identifyFlag()" alt="flag"
                                                class="w-5 h-5 rounded-full object-cover" />
                                            {{ langugage.locale.value === 'en' ? 'EN' : 'DK' }}
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" stroke-width="2.5">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </button>
                                        <div v-if="state.langOpen"
                                            class="absolute right-0 top-[calc(100%+6px)] bg-white border border-slate-200 rounded-xl shadow-lg z-[100] min-w-[120px] overflow-hidden">
                                            <button type="button" @click="setLang('dk')"
                                                :class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', langugage.locale.value === 'dk' && 'bg-[#edf5fb]']">
                                                <img src="/img/icons/flags/denmark.svg"
                                                    class="w-5 h-5 rounded-full object-cover" />
                                                Dansk
                                            </button>
                                            <button type="button" @click="setLang('en')"
                                                :class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', langugage.locale.value === 'en' && 'bg-[#edf5fb]']">
                                                <img src="/img/icons/flags/united-kingdom.svg"
                                                    class="w-5 h-5 rounded-full object-cover" />
                                                English
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p>
                                    {{ $t('forgotPassword.enterEmailAssociated') }}
                                </p>
                                <div class="space-y-1">
                                    <FormLabel for="email" :label="$t('forgotPassword.emailAddress')" />
                                    <FormTextField id="email" name="email"
                                        :placeholder="$t('forgotPassword.emailAddress')" v-model="state.email" />
                                    <FormError :error="v$?.email?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.email?.[0]" />
                                </div>
                            </div>
                            <div class="mt-5">
                                <FormButton type="submit" buttonStyle="primary" class="w-full">
                                    {{ $t('forgotPassword.requestPasswordReset') }}
                                </FormButton>
                            </div>
                            <p class="mt-2 text-center text-sm leading-6 text-gray-500">
                                {{ $t('forgotPassword.or') }}
                                {{ ' ' }}
                                <a class="text-primary hover:text-primary-800 cursor-pointer"
                                    @click="navigateTo('/fst-login')">
                                    {{ $t('forgotPassword.loginHereInstead') }}
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
    langOpen: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const rules = computed(() => {
    return {
        email: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
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

    const animatedAsset01 = document.getElementById('animatedAsset01')
    const animatedAsset02 = document.getElementById('animatedAsset02')
    if (animatedAsset01) observer.observe(animatedAsset01)
    if (animatedAsset02) observer.observe(animatedAsset02)
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
                navigateTo('/fst-login')
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}

function setLang(lang: string) {
    langugage.locale.value = lang
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
.fp-panel {
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

.fp-bc {
    position: absolute;
    border-radius: 50%;
    background: rgba(66, 174, 217, 0.09)
}

.fp-bc1 {
    width: 400px;
    height: 400px;
    top: -140px;
    right: -140px;
    animation: fpb1 16s ease-in-out infinite
}

.fp-bc2 {
    width: 240px;
    height: 240px;
    bottom: -90px;
    left: -80px;
    animation: fpb2 20s ease-in-out infinite
}

.fp-bc3 {
    width: 140px;
    height: 140px;
    bottom: 100px;
    right: 40px;
    animation: fpb3 12s ease-in-out infinite
}

@keyframes fpb1 {

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

@keyframes fpb2 {

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

@keyframes fpb3 {

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

.fp-top {
    position: relative;
    z-index: 2
}

.fp-logo-row {
    display: flex;
    align-items: center;
    gap: 14px
}

.fp-logo-icon {
    position: relative;
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center
}

.fp-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(66, 174, 217, 0.35);
    animation: fpring 3s ease-in-out infinite
}

.fp-rg1 {
    width: 46px;
    height: 46px;
    animation-delay: 0s
}

.fp-rg2 {
    width: 68px;
    height: 68px;
    animation-delay: 0.8s
}

.fp-rg3 {
    width: 90px;
    height: 90px;
    animation-delay: 1.5s
}

@keyframes fpring {
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

.fp-oc {
    animation: fpoc 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
    transform-origin: 19.49px 19.49px
}

.fp-ic {
    animation: fpic 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.65s both;
    transform-origin: 19.43px 19.55px
}

@keyframes fpoc {
    from {
        transform: scale(0);
        opacity: 0
    }

    to {
        transform: scale(1);
        opacity: 1
    }
}

@keyframes fpic {
    from {
        transform: scale(0);
        opacity: 0
    }

    to {
        transform: scale(1);
        opacity: 0.9
    }
}

.fp-wordmark {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
    opacity: 0;
    animation: fpfu 0.5s ease 1.2s forwards
}

.fp-mid {
    position: relative;
    z-index: 2;
    opacity: 0;
    animation: fpfu 0.6s ease 1.4s forwards
}

@keyframes fpfu {
    from {
        opacity: 0;
        transform: translateY(12px)
    }

    to {
        opacity: 1;
        transform: translateY(0)
    }
}

.fp-tag {
    font-size: 10px;
    font-weight: 700;
    color: rgba(66, 174, 217, 0.85);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 1rem
}

.fp-h1 {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
    letter-spacing: -0.8px;
    margin-bottom: 0.75rem
}

.fp-desc {
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.7;
    max-width: 300px;
    margin-bottom: 2rem
}

.fp-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: rgba(66, 174, 217, 0.08);
    border: 1px solid rgba(66, 174, 217, 0.15);
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 10px
}

.fp-card-icon {
    width: 36px;
    height: 36px;
    background: rgba(66, 174, 217, 0.12);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0
}

.fp-card-title {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 2px
}

.fp-card-sub {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4)
}

.fp-foot {
    position: relative;
    z-index: 2;
    opacity: 0;
    animation: fpfu 0.5s ease 2s forwards;
    font-size: 10.5px;
    color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 6px
}
</style>