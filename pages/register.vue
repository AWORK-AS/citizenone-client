<template>

    <Head>
        <Title>Register - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div
            class="bg-[#f5fafe] relative overflow-clip flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                class="w-52 md:w-1/5 absolute -top-28 -right-24 opacity-0 transition-opacity duration-500"
                id="animatedAsset01">
            <img src="/img/icons/asset-02.svg" alt="Image failed to load"
                class="w-52 md:w-1/4 absolute -bottom-48 -left-44 opacity-0 transition-opacity duration-500"
                id="animatedAsset02">
            <div class="px-4 md:px-0 sm:mx-auto sm:w-full sm:max-w-3xl relative">
                <Logo @click="navigateTo('/')" class="mx-auto" />
                <button type="button" class="-m-2.5 rounded-full w-8 absolute right-5 top-1.5" @click="selectLanguage">
                    <img :src="identifyFlag()" alt="flag">
                </button>
            </div>

            <div class="md:mt-10 sm:mx-auto sm:w-full sm:max-w-3xl">
                <div class="md:bg-white md:shadow-sm px-6 py-3 md:py-8 sm:rounded-lg sm:px-12">
                    <form class="mt-5 space-y-3" method="POST" @submit.prevent="register">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <h3 class="font-medium text-lg md:text-xl">
                            {{ $t('register.form.createAccount') }}
                        </h3>
                        <div class="space-y-1">
                            <FormLabel for="name" :label="$t('register.form.companyName')" />
                            <FormTextField id="name" name="name" :placeholder="$t('register.form.companyName')"
                                v-model="state.formRegister.name" />
                            <FormError :error="v$?.formRegister?.name?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.name?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="firstname" :label="$t('register.form.firstname')" />
                                <FormTextField id="firstname" name="firstname"
                                    :placeholder="$t('register.form.firstname')"
                                    v-model="state.formRegister.firstname" />
                                <FormError :error="v$?.formRegister?.firstname?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.firstname?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="lastname" :label="$t('register.form.lastname')" />
                                <FormTextField id="lastname" name="lastname" :placeholder="$t('register.form.lastname')"
                                    v-model="state.formRegister.lastname" />
                                <FormError :error="v$?.formRegister?.lastname?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.lastname?.[0]" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="phone" :label="$t('register.form.phone')" />
                            <FormTextField id="phone" name="phone" :placeholder="$t('register.form.phone')"
                                v-model="state.formRegister.phone" />
                            <FormError :error="v$?.formRegister?.phone?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.phone?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="email" :label="$t('register.form.emailAddress')" />
                            <FormTextField id="email" name="email" :placeholder="$t('register.form.emailAddress')"
                                v-model="state.formRegister.email" />
                            <FormError :error="v$?.formRegister?.email?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.email?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="password" :label="$t('register.form.password')" />
                                <FormPasswordField id="password" name="password"
                                    :placeholder="$t('register.form.password')" v-model="state.formRegister.password" />
                                <FormError :error="v$?.formRegister?.password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.password?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="confirm_password" :label="$t('register.form.confirmPassword')" />
                                <FormPasswordField id="confirm_password" name="confirm_password"
                                    :placeholder="$t('register.form.confirmPassword')"
                                    v-model="state.formRegister.confirm_password" />
                                <FormError
                                    :error="v$?.formRegister?.confirm_password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.confirm_password?.[0]" />
                            </div>
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
                        <div>
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('register.form.createAccount') }}
                            </FormButton>
                        </div>
                        <p class="text-center text-sm leading-6 text-gray-500 cursor-pointer" @click="navigateTo('/')">
                            {{ $t('register.form.alreadyHaveAnAccount') }}?
                            {{ ' ' }}
                            <a class="text-primary hover:text-primary-800 cursor-pointer">
                                {{ $t('register.form.loginHere') }}
                            </a>
                        </p>
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
import { required, helpers, minLength, sameAs } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const language = useI18n()
const { successAlert } = useAlert()
const { t } = useI18n()

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    agreeToTermsValidation: false,
    error: {} as Error,
    formRegister: {
        name: '',
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
        password: '',
        confirm_password: '',
        agreeToTerms: false
    },
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const rules = computed(() => {
    return {
        formRegister: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            firstname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            phone: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                minLength: helpers.withMessage(`${t('alert.resetPassword.required8Characters')}.`, minLength(8))
            },
            confirm_password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                sameAsPassword: helpers.withMessage(`${t('alert.resetPassword.confirmPasswordNotTheSame')}.`, sameAs(state.formRegister.password)),
            },
        }
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

async function register() {
    state.error = {}
    v$.value.$validate()
    if (!state.formRegister.agreeToTerms) {
        state.agreeToTermsValidation = true
    } else {
        state.agreeToTermsValidation = false
    }
    if (!v$.value.$error && state.formRegister.agreeToTerms) {
        state.isPageLoading = true
        try {
            const params = {
                name: state.formRegister.name,
                firstname: state.formRegister.firstname,
                lastname: state.formRegister.lastname,
                phone: state.formRegister.phone,
                email: state.formRegister.email,
                password: state.formRegister.password,
            }
            const response = await authService.register(params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('alert.accountSuccessfullyCreated')}.`)
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
        return '/img/icons/flags/united-states-of-america.svg'
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