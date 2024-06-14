<template>

    <Head>
        <Title>Reset Password - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="flex h-screen flex-1">
            <div class="relative hidden w-0 flex-1 lg:block">
                <img class="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Image failed to load" />
            </div>
            <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div class="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <Logo @click="navigateTo('/')" />
                    </div>

                    <form class="mt-5 space-y-3" method="POST" @submit.prevent="resetPassword">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error && state.error.length > 0 || state.error?.message" />
                        <h3 class="font-medium">
                            {{ $t('resetPassword.resetPassword') }}
                        </h3>
                        <div class="space-y-1">
                            <FormLabel for="password" :label="$t('resetPassword.form.password')" />
                            <FormPasswordField id="password" name="password"
                                :placeholder="$t('resetPassword.form.password')" v-model="state.formUser.password" />
                            <FormError :error="v$?.formUser?.password?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.password?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="confirm_password" :label="$t('resetPassword.form.confirmPassword')" />
                            <FormPasswordField id="confirm_password" name="confirm_password"
                                :placeholder="$t('resetPassword.form.confirmPassword')"
                                v-model="state.formUser.confirm_password" />
                            <FormError :error="v$?.formUser?.confirm_password?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.confirm_password?.[0]" />
                        </div>
                        <div>
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('resetPassword.resetPassword') }}
                            </FormButton>
                        </div>
                        <p class="text-center text-sm leading-6 text-gray-500">
                            {{ $t('resetPassword.or') }}
                            {{ ' ' }}
                            <a class="text-primary hover:text-primary-800 cursor-pointer" @click="navigateTo('/')">
                                {{ $t('resetPassword.loginHereInstead') }}.
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers, minLength, sameAs } from '@vuelidate/validators'
import { notify } from "@kyvg/vue3-notification"
import { authService } from '@/components/api/AuthService'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const route = useRoute()
const language = useI18n()
const { t } = useI18n()

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    error: [],
    formUser: {
        password: null,
        confirm_password: null,
    },
    isPageLoading: false,
    token: '',
})

const rules = computed(() => {
    return {
        formUser: {
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                minLength: helpers.withMessage(`${t('alert.resetPassword.required8Characters')}.`, minLength(8))
            },
            confirm_password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                sameAsPassword: helpers.withMessage(`${t('alert.resetPassword.confirmPasswordNotTheSame')}.`, sameAs(state.formUser.password)),
            }
        }
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    if (route.query && route.query.token) {
        state.token = route.query.token
        verifyPasswordResetToken()
    } else {
        errorAlert(`${t('alert.somethingWentWrong')}.`, `${t('alert.resetPassword.invalidPasswordResetToken')}.`)
        navigateTo('/forgot-password')
    }
})

async function verifyPasswordResetToken() {
    state.isPageLoading = true
    state.error = []
    try {
        await authService.verifyResetPassword(state.token)
    } catch (error) {
        if (error) {
            state.error = error
            if (error.hasOwnProperty('message')) {
                if (error.message === 'Invalid password reset token.') {
                    errorAlert(`${t('alert.somethingWentWrong')}.`, `${t('alert.resetPassword.invalidPasswordResetToken')}.`)
                } else {
                    errorAlert(`${t('alert.somethingWentWrong')}.`, error.message)
                }
                navigateTo('/')
            }
        }
    }
    state.isPageLoading = false
}

async function resetPassword() {
    state.error = []
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        const params = {
            password: state.formUser.password,
            token: state.token,
        }
        try {
            await authService.resetPassword(params)
            successAlert(`${t('alert.success')}!`, `${t('alert.resetPassword.passwordUpdatedSucessfully')}.`)
            navigateTo('/')
        } catch (error) {
            state.error = error
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

function errorAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'error',
    })
}
</script>