<template>

    <Head>
        <Title>Register - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div class="sm:mx-auto sm:w-full sm:max-w-md">
                <Logo @click="navigateTo('/')" class="mx-auto" />
            </div>

            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-3xl">
                <div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                    <form class="mt-5 space-y-3" method="POST" @submit.prevent="register">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error && state.error.length > 0 || state.error?.message" />
                        <h3 class="font-medium">
                            {{ $t('register.form.register') }}
                        </h3>
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
                                {{ $t('register.form.iAcceptTAA') }}
                            </div>
                            <span v-if="state.agreeToTermsValidation" class="text-sm text-red-500">
                                {{ $t('register.form.agreetoTAC') }}
                            </span>
                        </div>
                        <div>
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('register.form.register') }}
                            </FormButton>
                        </div>
                        <p class="text-center text-sm leading-6 text-gray-500 cursor-pointer" @click="navigateTo('/')">
                            {{ $t('register.form.alreadyHaveAnAcoount') }}?
                            {{ ' ' }}
                            <a class="text-primary hover:text-primary-800 cursor-pointer">
                                {{ $t('register.form.loginHere') }}
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/AuthService'
import { geolocationService } from '@/components/api/GeolocationService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers, minLength, sameAs } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const language = useI18n()
const { t } = useI18n()

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    agreeToTermsValidation: false,
    error: [],
    formRegister: {
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
        password: '',
        confirm_password: '',
        agreeToTerms: false
    },
    isPageLoading: false,
})

const rules = computed(() => {
    return {
        formRegister: {
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

async function register() {
    state.error = []
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        if (!state.formRegister.agreeToTerms) {
            state.agreeToTermsValidation = true
        } else {
            state.agreeToTermsValidation = false
            try {
                const params = {
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
        }
        state.isPageLoading = false
    }
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>