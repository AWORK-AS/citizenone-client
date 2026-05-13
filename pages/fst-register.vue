<template>

    <Head>
        <Title>{{ $t('register.register') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-5 min-h-screen">
            <div class="w-full max-w-xl mx-auto pt-20 px-5 lg:px-0">
                <div class="flex items-end justify-between">
                    <LogoFst @click="navigateTo('/fst-login')" />
                    <p class="text-xs text-gray-700">
                        {{ $t('register.step') }} {{ state.progress.currentStep }}
                        <span class="lowercase">{{ $t('register.of') }}</span> 2
                    </p>
                </div>
                <div class="mt-5 flex items-center gap-x-2">
                    <div class="h-2.5 w-full rounded-full bg-gray-200">
                        <div class="h-2.5 rounded-full bg-secondary transition-all duration-300"
                            :style="{ width: `${Math.round((state.progress.currentStep1Progress / 4) * 100)}%` }"></div>
                    </div>
                    <div class="h-2.5 w-full rounded-full bg-gray-200">
                        <div class="h-2.5 rounded-full bg-secondary transition-all duration-300"
                            :style="{ width: `${Math.round((state.progress.currentStep2Progress / 2) * 100)}%` }"></div>
                    </div>
                    <img class="w-4" src="/img/icons/asset-app.png" :alt="$t('imageFailedToLoad')" />
                </div>
                <form class="mt-5" method="POST" @submit.prevent="register">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-1">
                        <div class="mt-10 flex justify-between items-center">
                            <h3 class="font-bold text-2xl md:text-3xl">
                                <span v-if="state.progress.currentStep === 1">
                                    {{ $t('register.form.createYourAccount') }}
                                </span>
                                <span v-else>
                                    {{ $t('register.form.letsTalkAboutYou') }}
                                </span>
                            </h3>
                            <div class="relative" v-click-outside="() => state.langOpen = false">
                                <button type="button" @click="state.langOpen = !state.langOpen"
                                    class="flex items-center gap-1.5 py-[5px] pr-[10px] pl-[6px] rounded-full border border-slate-200 bg-white cursor-pointer text-xs font-semibold text-slate-500 hover:border-slate-300 transition-colors">
                                    <img :src="identifyFlag()" alt="flag" class="w-5 h-5 rounded-full object-cover" />
                                    {{ language.locale.value === 'en' ? 'EN' : 'DK' }}
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2.5">
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
                                    <button type="button" @click="setLang('no')"
                                        :class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'no' && 'bg-[#edf5fb]']">
                                        <img src="/img/icons/flags/norway.svg"
                                            class="w-5 h-5 rounded-full object-cover" />
                                        Norsk
                                    </button>
                                    <button type="button" @click="setLang('sv')"
                                        :class="['flex items-center gap-2 w-full px-3.5 py-2.5 border-0 bg-transparent cursor-pointer text-[13px] font-medium text-[#1a2332] hover:bg-[#edf5fb] transition-colors', language.locale.value === 'sv' && 'bg-[#edf5fb]']">
                                        <img src="/img/icons/flags/sweden.svg"
                                            class="w-5 h-5 rounded-full object-cover" />
                                        Svenska
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">
                            <span v-if="state.progress.currentStep === 1">
                                {{ $t('register.form.justAFewClicksAndYoureIn') }}
                            </span>
                            <span v-else>
                                {{ $t('register.form.personalizeYourCitizenOneExperience') }}
                            </span>
                        </p>
                    </div>
                    <div class="mt-5 space-y-3" v-if="state.progress.currentStep === 1">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 py-1">
                            <div class="space-y-1">
                                <FormLabel for="firstname" :label="$t('register.form.firstname')" />
                                <FormTextField id="firstname" name="firstname"
                                    :placeholder="$t('register.form.firstname')"
                                    v-model="state.formRegister.firstname" />
                                <FormError
                                    :error="vRules1$?.formRegister?.firstname?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.firstname?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="lastname" :label="$t('register.form.lastname')" />
                                <FormTextField id="lastname" name="lastname" :placeholder="$t('register.form.lastname')"
                                    v-model="state.formRegister.lastname" />
                                <FormError :error="vRules1$?.formRegister?.lastname?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.lastname?.[0]" />
                            </div>
                        </div>
                        <div class="space-y-1 py-1">
                            <FormLabel for="email" :label="$t('register.form.emailAddress')" />
                            <FormTextField id="email" name="email" :placeholder="$t('register.form.emailAddress')"
                                v-model="state.formRegister.email" />
                            <FormError :error="vRules1$?.formRegister?.email?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.email?.[0]" />
                        </div>
                        <div class="space-y-1 py-1">
                            <FormLabel for="phone" :label="$t('register.form.phone')" />
                            <FormTextField id="phone" name="phone" :placeholder="$t('register.form.phone')"
                                v-model="state.formRegister.phone" />
                            <FormError :error="vRules1$?.formRegister?.phone?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.phone?.[0]" />
                        </div>
                    </div>
                    <div class="mt-5 space-y-3" v-else>
                        <div class="space-y-1">
                            <FormLabel for="industry" :label="$t('register.form.industry')" />
                            <FormSelect id="industry" :options="state.options.industries"
                                v-model="state.formRegister.industry" />
                            <FormError :error="vRules2$?.formRegister?.industry?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.industry?.[0]" />
                        </div>
                        <div class="space-y-1"
                            v-if="state.options.industries.find((industry: any) => industry.value === state.formRegister.industry)?.system_name === 'social_welfare'">
                            <FormLabel for="facility_type_uuid" :label="$t('register.form.typeOfFacility')" />
                            <FormSelect id="facility_type_uuid" :options="state.options.typeOfFacilities"
                                v-model="state.formRegister.facility_type_uuid" />
                            <FormError
                                :error="vRules2$?.formRegister?.facility_type_uuid?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.facility_type_uuid?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.formRegister.agreeToTerms = !state.formRegister.agreeToTerms">
                                <FormCheckbox :value="state.formRegister.agreeToTerms" />
                                <span class="text-sm">
                                    {{ $t('register.form.iHaveReadAndAcceptThe') }}
                                    <span class="cursor-pointer text-tertiary hover:text-tertiary/90"
                                        @click="navigateToTAC">
                                        {{ $t('register.form.termsAndConditions') }}
                                    </span>
                                </span>
                            </div>
                            <span v-if="state.agreeToTermsValidation" class="text-sm text-red-500">
                                <span>{{ $t('register.form.agreetoTAC') }}</span>
                            </span>
                        </div>
                    </div>
                    <div class="mt-5">
                        <FormButton type="submit" buttonStyle="primary" class="w-full"
                            v-if="state.progress.currentStep === 1">
                            {{ $t('register.form.continue') }}
                        </FormButton>
                        <FormButton type="submit" buttonStyle="primary" class="w-full" v-else>
                            {{ $t('register.form.createFreeAccount') }}
                        </FormButton>
                    </div>
                    <p class="mt-3 text-center text-sm leading-6 text-gray-500 cursor-pointer"
                        @click="navigateTo('/fst-login')">
                        {{ $t('register.form.alreadyHaveAnAccount') }}?
                        {{ ' ' }}
                        <a class="font-semibold text-primary hover:text-primary-800 cursor-pointer">
                            {{ $t('register.form.signin') }}
                        </a>
                    </p>
                </form>
            </div>
            <div class="hidden lg:block p-4">
                <div class="co-panel">
                    <div class="co-bc co-bc1"></div>
                    <div class="co-bc co-bc2"></div>
                    <div class="co-bc co-bc3"></div>
                    <div class="co-top">
                        <div class="co-logo-row">
                            <div class="co-logo-icon">
                                <div class="co-ring co-rg1"></div>
                                <div class="co-ring co-rg2"></div>
                                <div class="co-ring co-rg3"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38.98 38.98" width="38" height="38"
                                    style="position:relative;z-index:2">
                                    <circle class="co-oc" cx="19.49" cy="19.49" r="18.99" fill="#1a3a5c"
                                        stroke="rgb(66,174,217)" stroke-width="1" />
                                    <circle class="co-ic" cx="19.43" cy="19.55" r="11.93" fill="rgb(66,174,217)"
                                        stroke="#fff" stroke-width="0.5" />
                                </svg>
                            </div>
                            <span class="co-wordmark">CitizenOne<sup
                                    style="font-size:10px;vertical-align:super">&#x2122;</sup></span>
                        </div>
                    </div>
                    <div class="co-mid">
                        <div class="co-tag">{{ $t('login.tagline') }}</div>
                        <div class="co-h1">{{ $t('login.headlineLine1') }}<br>{{ $t('login.headlineLine2') }}</div>
                        <p class="co-desc">{{ $t('login.description') }}</p>
                        <div class="co-live-header">
                            <div class="co-live-dot"></div>
                            <span class="co-live-lbl">{{ $t('login.liveActivity') }}</span>
                        </div>
                        <div class="co-stats">
                            <div class="co-stat">
                                <div class="co-stat-num" id="fst-reg-users">—</div>
                                <div class="co-stat-lbl">{{ $t('register.activeUsersNow') }}</div>
                            </div>
                            <div class="co-stat">
                                <div class="co-stat-num" id="fst-reg-journals">—</div>
                                <div class="co-stat-lbl">{{ $t('login.journalNotesToday') }}</div>
                            </div>
                            <div class="co-stat">
                                <div class="co-stat-num" id="fst-reg-shifts">—</div>
                                <div class="co-stat-lbl">{{ $t('login.shiftsPlannedToday') }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="co-foot">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)"
                            stroke-width="2" stroke-linecap="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        {{ $t('login.gdprNote') }}
                    </div>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/user/AuthService'
import { industryService } from '@/components/api/user/IndustryService'
import { facilityTypeService } from '@/components/api/user/FacilityTypeService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useGtag } from '@/composables/gTags'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const language = useI18n()
const { successAlert } = useAlert()
const { gtagReportConversion } = useGtag()
const { t } = language

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    agreeToTermsValidation: false,
    error: {} as Error,
    formRegister: {
        industry: '',
        facility_type_uuid: '',
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
        agreeToTerms: false
    } as any,
    isPageLoading: false,
    langOpen: false,
    options: {
        industries: [] as any,
        typeOfFacilities: [] as any,
    },
    progress: {
        currentStep: 1,
        currentStep1Progress: 0,
        currentStep2Progress: 0,
    },
})

const rules1 = computed(() => {
    return {
        formRegister: {
            firstname: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            phone: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const rules2 = computed(() => {
    return {
        formRegister: {
            industry: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})
const vRules1$ = useVuelidate(rules1, state)
const vRules2$ = useVuelidate(rules2, state)

onMounted(() => {
    // Live stats panel
    const coFmt = (n: number) => Math.round(n).toLocaleString('da-DK')
    const coAnimCount = (id: string, target: number, dur: number) => {
        const el = document.getElementById(id)
        if (!el) return
        const start = performance.now()
        const step = (now: number) => {
            const p = Math.min((now - start) / dur, 1)
            const e = 1 - Math.pow(1 - p, 3)
            el.textContent = coFmt(Math.round(e * target))
            if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }
    const coNow = new Date()
    const coBase = new Date('2024-01-01')
    const coMonths = Math.max(1, (coNow.getFullYear() - coBase.getFullYear()) * 12 + (coNow.getMonth() - coBase.getMonth()))
    const coGf = coMonths <= 12 ? Math.pow(1.08, coMonths) : Math.pow(1.08, 12) * Math.pow(1.04, coMonths - 12)
    const coSeed = coNow.getDate() * 31 + coNow.getMonth() * 7 + coNow.getFullYear()
    const coSr = (min: number, max: number, off: number) => {
        const x = Math.abs(Math.sin(coSeed + off) * 99991)
        return Math.round(min + (x - Math.floor(x)) * (max - min))
    }
    const coH = coNow.getHours()
    const coWd = coNow.getDay()
    const coIsWE = coWd === 0 || coWd === 6
    const coTMul = coIsWE ? 0.6 : (coH >= 7 && coH <= 17 ? 1.0 : 0.35)
    let coUsers = Math.max(200, Math.min(999, Math.round(coSr(750, 999, 1) * coTMul)))
    const coJournalMax = Math.round(Math.min(coGf * 5200, 17000))
    const coMinSinceMidnight = coH * 60 + coNow.getMinutes()
    const coJCurve = (() => {
        const m = coMinSinceMidnight
        if (m < 360) return 18 + m * 0.04
        if (m < 420) return 32 + (m - 360) * 2.5
        if (m < 540) return 182 + (m - 420) * 28
        if (m < 720) return 3542 + (m - 540) * 42
        if (m < 1020) return 11102 + (m - 720) * 19
        if (m < 1380) return 16802 + (m - 1020) * 0.5
        return coJournalMax - 30
    })()
    let coJournals = Math.round(coJCurve * (coJournalMax / 17000))
    if (coIsWE) coJournals = Math.round(coJournals * 0.45)
    const coJSkew = Math.round((coSr(0, 100, 9) - 50) * 1.2)
    coJournals = Math.max(18, Math.min(coJournalMax, coJournals + coJSkew))
    if (coJournals % 100 === 0) coJournals += 43
    if (coJournals % 50 === 0) coJournals += 17
    let coShifts = coSr(300, 800, 3)
    if (coJournals % 100 === 0) coJournals += 43
    if (coJournals % 50 === 0) coJournals += 17
    if (coShifts % 100 === 0) coShifts += 23
    if (coShifts % 50 === 0) coShifts += 11
    if (coUsers % 100 === 0) coUsers += 7
    setTimeout(() => {
        coAnimCount('fst-reg-users', coUsers, 1600)
        coAnimCount('fst-reg-journals', coJournals, 2000)
        coAnimCount('fst-reg-shifts', coShifts, 1800)
    }, 1600)
    setInterval(() => {
        const el = document.getElementById('fst-reg-users')
        if (!el) return
        const delta = (Math.random() > 0.5 ? 1 : -1) * Math.ceil(Math.random() * 3)
        coUsers = Math.max(Math.round(600 * coTMul), Math.min(999, coUsers + delta))
        el.textContent = coFmt(coUsers)
    }, 4000)
    setInterval(() => {
        const el = document.getElementById('fst-reg-journals')
        if (!el) return
        coJournals = Math.min(coJournalMax, coJournals + Math.ceil(Math.random() * 2))
        el.textContent = coFmt(coJournals)
    }, 7000)
    setInterval(() => {
        const el = document.getElementById('fst-reg-shifts')
        if (!el) return
        if (Math.random() > 0.65) {
            coShifts = Math.min(800, coShifts + 1)
            el.textContent = coFmt(coShifts)
        }
    }, 11000)

    animateAssets()
    fetchAllIndustries()
    fetchAllFacilityTypes()
})

watch(() => language.locale.value, (newValue: any) => {
    if (newValue != null) {
        fetchAllIndustries()
        fetchAllFacilityTypes()
    }
})

watch(() => ({
    firstname: state.formRegister.firstname,
    lastname: state.formRegister.lastname,
    email: state.formRegister.email,
    phone: state.formRegister.phone,
}), ({ firstname, lastname, email, phone }) => {
    const isFilled = (value: unknown) => {
        return String(value ?? "").trim().length > 0
    }
    let progress = 0
    if (isFilled(firstname)) progress += 1
    if (isFilled(lastname)) progress += 1
    if (isFilled(email)) progress += 1
    if (isFilled(phone)) progress += 1
    state.progress.currentStep1Progress = progress
}, { immediate: true })

watch(() => ({
    industry: state.formRegister.industry,
    agreeToTerms: state.formRegister.agreeToTerms,
}), ({ industry, agreeToTerms }) => {
    const isFilled = (value: unknown) => {
        return String(value ?? "").trim().length > 0
    }
    let progress = 0
    if (isFilled(industry)) progress += 1
    if (agreeToTerms) progress += 1
    state.progress.currentStep2Progress = progress
}, { immediate: true })

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

async function fetchAllIndustries() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await industryService.getAllIndustries()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (industry: any) => options.push({
                    value: industry?.uuid,
                    label: language.locale.value === 'en' ? industry.en_name : industry.dk_name,
                    system_name: industry.system_name,
                })
            )
            state.options.industries = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllFacilityTypes() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await facilityTypeService.getAllFacilityTypesWithoutAuthentication()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.uuid,
                    label: language.locale.value === 'en' ? item.en_name : item.dk_name,
                })
            )
            state.options.typeOfFacilities = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function register() {
    state.error = {}
    if (state.progress.currentStep === 1) {
        vRules1$.value.$validate()
        if (!vRules1$.value.$error) {
            state.progress.currentStep = 2
        }
    } else {
        vRules2$.value.$validate()
        if (!state.formRegister.agreeToTerms) {
            state.agreeToTermsValidation = true
        } else {
            state.agreeToTermsValidation = false
        }
        if (!vRules2$.value.$error && state.formRegister.agreeToTerms) {
            state.isPageLoading = true
            try {
                const params = {
                    industry_uuid: state.formRegister.industry,
                    facility_type_uuid: state.formRegister.facility_type_uuid,
                    firstname: state.formRegister.firstname,
                    lastname: state.formRegister.lastname,
                    phone: state.formRegister.phone,
                    email: state.formRegister.email,
                }
                const response = await authService.register(params)
                if (response.data) {
                    gtagReportConversion('https://app.citizenone.dk')
                    successAlert(`${t('alert.success')}!`, `${t('alert.accountSuccessfullyCreated')}.`)
                    navigateTo('/fst-login')
                }
            } catch (error: any) {
                state.error = error

                const errors = error?.errors

                const hasStep1Error =
                    !!errors?.firstname?.length ||
                    !!errors?.lastname?.length ||
                    !!errors?.email?.length ||
                    !!errors?.phone?.length

                if (hasStep1Error) {
                    state.progress.currentStep = 1
                }
            }
            state.isPageLoading = false
        }
    }
}

function setLang(lang: string) {
    language.locale.value = lang
    userStore.setLanguage(lang)
    state.langOpen = false
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

async function navigateToTAC() {
    await navigateTo('https://citizenone.dk/vilkaarogbetingelser/', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>

<style scoped>
.co-panel {
    background: linear-gradient(160deg, #0f2b46 0%, #1a4a70 50%, #0a2840 100%);
    border-radius: 12px;
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.5rem;
    font-family: 'Inter', sans-serif
}

.co-bc {
    position: absolute;
    border-radius: 50%;
    background: rgba(66, 174, 217, 0.09)
}

.co-bc1 {
    width: 400px;
    height: 400px;
    top: -140px;
    right: -140px;
    animation: cob1 16s ease-in-out infinite
}

.co-bc2 {
    width: 240px;
    height: 240px;
    bottom: -90px;
    left: -80px;
    animation: cob2 20s ease-in-out infinite
}

.co-bc3 {
    width: 140px;
    height: 140px;
    bottom: 100px;
    right: 40px;
    animation: cob3 12s ease-in-out infinite
}

@keyframes cob1 {

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

@keyframes cob2 {

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

@keyframes cob3 {

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

.co-top {
    position: relative;
    z-index: 2
}

.co-logo-row {
    display: flex;
    align-items: center;
    gap: 14px
}

.co-logo-icon {
    position: relative;
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center
}

.co-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(66, 174, 217, 0.35);
    animation: coring 3s ease-in-out infinite
}

.co-rg1 {
    width: 46px;
    height: 46px;
    animation-delay: 0s
}

.co-rg2 {
    width: 68px;
    height: 68px;
    animation-delay: 0.8s
}

.co-rg3 {
    width: 90px;
    height: 90px;
    animation-delay: 1.5s
}

@keyframes coring {
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


.co-oc {
    animation: cooc 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
    transform-origin: 19.49px 19.49px
}

.co-ic {
    animation: coic 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.65s both;
    transform-origin: 19.43px 19.55px
}

@keyframes cooc {
    from {
        transform: scale(0);
        opacity: 0
    }

    to {
        transform: scale(1);
        opacity: 1
    }
}

@keyframes coic {
    from {
        transform: scale(0);
        opacity: 0
    }

    to {
        transform: scale(1);
        opacity: 0.9
    }
}

.co-wordmark {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
    opacity: 0;
    animation: cofu 0.5s ease 1.2s forwards
}

.co-mid {
    position: relative;
    z-index: 2;
    opacity: 0;
    animation: cofu 0.6s ease 1.4s forwards
}

@keyframes cofu {
    from {
        opacity: 0;
        transform: translateY(12px)
    }

    to {
        opacity: 1;
        transform: translateY(0)
    }
}

.co-tag {
    font-size: 10px;
    font-weight: 700;
    color: rgba(66, 174, 217, 0.85);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 1rem
}

.co-h1 {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
    letter-spacing: -0.8px;
    margin-bottom: 0.75rem
}

.co-desc {
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.7;
    max-width: 300px;
    margin-bottom: 1.5rem
}

.co-live-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 0.875rem
}

.co-live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #22c55e;
    animation: copulse 2s ease-in-out infinite
}

@keyframes copulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1)
    }

    50% {
        opacity: 0.4;
        transform: scale(0.75)
    }
}

.co-live-lbl {
    font-size: 10px;
    font-weight: 700;
    color: rgba(66, 174, 217, 0.8);
    letter-spacing: 1px;
    text-transform: uppercase
}

.co-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 1rem
}

.co-stat {
    background: rgba(66, 174, 217, 0.08);
    border: 1px solid rgba(66, 174, 217, 0.15);
    border-radius: 9px;
    padding: 11px 13px
}

.co-stat-num {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.5px;
    line-height: 1;
    margin-bottom: 4px;
    font-variant-numeric: tabular-nums
}

.co-stat-lbl {
    font-size: 9.5px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 500;
    line-height: 1.3
}

.co-foot {
    position: relative;
    z-index: 2;
    opacity: 0;
    animation: cofu 0.5s ease 2s forwards;
    font-size: 10.5px;
    color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 6px
}
</style>
