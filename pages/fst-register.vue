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
                            <button type="button" class="rounded-full w-8" @click="selectLanguage">
                                <img :src="identifyFlag()" alt="flag">
                            </button>
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
                <div class="relative bg-secondary h-full w-full overflow-hidden rounded-md">
                    <div class="square-grid-overlay"></div>
                    <div class="relative z-10 h-full w-full p-6 flex">
                        <div class="h-[75%] rounded-2xl bg-white/10 backdrop-blur-lg p-8 m-auto max-w-lg">
                            <div class="h-full flex flex-col justify-between">
                                <LogoWhite @click="navigateTo('/fst-login')" />

                                <div>
                                    <blockquote class="text-white text-2xl pr-5 leading-relaxed">
                                        “{{ $t('register.review.review1.content') }}.”
                                    </blockquote>
                                    <div class="mt-16 flex gap-x-3">
                                        <div>
                                            <img class="size-16 rounded-full object-cover object-center"
                                                src="https://citizenone.dk/wp-content/uploads/2025/01/Rolf-Hauritz.jpg"
                                                :alt="$t('imageFailedToLoad')" />
                                        </div>
                                        <div class="text-white">
                                            <p class="font-semibold">
                                                Rolf Hauritz
                                            </p>
                                            <p class="text-sm">
                                                {{ $t('register.review.review1.directorAndProfessionalLead') }}
                                            </p>
                                            <p class="text-sm">
                                                {{ $t('register.review.review1.tranerne') }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="absolute -top-28 -right-20">
                        <img src="/img/icons/asset-01.svg" alt="Image failed to load" class="z-10 w-60"
                            id="animatedAsset01">
                    </div>

                    <div class="absolute -bottom-28 -left-20 opacity-50">
                        <img src="/img/icons/asset-02.svg" alt="Image failed to load" class="z-10 w-60"
                            id="animatedAsset02">
                    </div>
                </div>
            </div>
        </div>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/user/AuthService'
import { industryService } from '@/components/api/user/IndustryService'
import { facilityTypeService } from '@/components/api/user/FacilityTypeService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers, minLength, sameAs } from '@vuelidate/validators'
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
const { t } = useI18n()

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
    options: {
        industries: [] as any,
        typeOfFacilities: [] as any,
    },
    progress: {
        currentStep: 1,
        currentStep1Progress: 0,
        currentStep2Progress: 0,
    },
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const rules1 = computed(() => {
    return {
        formRegister: {
            firstname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            phone: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const rules2 = computed(() => {
    return {
        formRegister: {
            industry: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})
const vRules1$ = useVuelidate(rules1, state)
const vRules2$ = useVuelidate(rules2, state)

onMounted(() => {
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

    const animatedAsset01 = document.getElementById('animatedAsset01') as any
    observer.observe(animatedAsset01)
    const animatedAsset02 = document.getElementById('animatedAsset02') as any
    observer.observe(animatedAsset02)
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

async function navigateToTAC() {
    await navigateTo('https://citizenone.dk/vilkaarogbetingelser/', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>