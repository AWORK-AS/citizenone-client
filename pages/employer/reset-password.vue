<template>
    <Head>
        <Title>{{ $t('employer.resetPassword') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="flex h-screen flex-1">
            <div class="relative hidden w-0 flex-1 lg:block overflow-clip">
                <img src="https://citizenone.dk/wp-content/uploads/2024/09/CitizenOne-6.jpg" alt="Image failed to load"
                    class="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div
                class="relative flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div class="mx-auto w-full max-w-sm lg:w-96">
                    <div class="mb-6">
                        <Logo @click="navigateTo('/employer/login')" />
                    </div>

                    <div v-if="state.tokenInvalid" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                        {{ $t('employer.resetTokenInvalid') }}
                        <a class="block mt-2 text-primary cursor-pointer" @click="navigateTo('/employer/forgot-password')">
                            {{ $t('employer.requestNewLink') }}
                        </a>
                    </div>

                    <div v-else-if="state.done" class="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                        {{ $t('employer.passwordResetSuccess') }}
                        <a class="block mt-2 text-primary cursor-pointer" @click="navigateTo('/employer/login')">
                            {{ $t('login.form.login') }}
                        </a>
                    </div>

                    <form v-else class="space-y-4" @submit.prevent="submit">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <h3 class="text-lg font-medium text-gray-900">
                            {{ $t('employer.resetPassword') }}
                        </h3>
                        <div class="space-y-1">
                            <FormLabel for="password" :label="$t('login.form.password')" />
                            <FormPasswordField id="password" name="password" :placeholder="$t('login.form.password')"
                                v-model="state.password" />
                            <FormError :error="v$?.password?.$errors[0]?.$message.toString()" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="password_confirmation" :label="$t('employer.confirmPassword')" />
                            <FormPasswordField id="password_confirmation" name="password_confirmation"
                                :placeholder="$t('employer.confirmPassword')"
                                v-model="state.passwordConfirmation" />
                            <FormError :error="v$?.passwordConfirmation?.$errors[0]?.$message.toString()" />
                        </div>
                        <FormButton type="submit" buttonStyle="primary" class="w-full">
                            {{ $t('employer.resetPassword') }}
                        </FormButton>
                    </form>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { employerAuthService } from '@/components/api/employer/EmployerAuthService'
import { useVuelidate } from "@vuelidate/core"
import { required, minLength, sameAs, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    tokenInvalid: false,
    done: false,
    password: null as any,
    passwordConfirmation: null as any,
})

const rules = computed(() => ({
    password: {
        required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        minLength: helpers.withMessage(() => `${t('validation.minLength', { min: 8 })}.`, minLength(8)),
    },
    passwordConfirmation: {
        required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        sameAs: helpers.withMessage(() => `${t('validation.passwordsMustMatch')}.`, sameAs(computed(() => state.password))),
    },
}))
const v$ = useVuelidate(rules, state)

onMounted(async () => {
    const token = route.query.token as string
    if (!token) {
        state.tokenInvalid = true
        return
    }
    try {
        await employerAuthService.verifyToken(token)
    } catch {
        state.tokenInvalid = true
    }
})

async function submit() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            await employerAuthService.resetPassword({
                token: route.query.token,
                password: state.password,
                password_confirmation: state.passwordConfirmation,
            })
            state.done = true
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>
