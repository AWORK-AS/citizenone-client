<template>
    <Head>
        <Title>{{ $t('login.form.forgotPassword') }} - {{ runtimeConfig?.public?.appName }}</Title>
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

                    <div v-if="state.sent" class="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                        {{ $t('employer.forgotPasswordSent') }}
                    </div>

                    <form v-else class="space-y-4" @submit.prevent="submit">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <h3 class="text-lg font-medium text-gray-900">
                            {{ $t('login.form.forgotPassword') }}
                        </h3>
                        <p class="text-sm text-gray-500">{{ $t('employer.forgotPasswordDescription') }}</p>
                        <div class="space-y-1">
                            <FormLabel for="email" :label="$t('login.form.emailAddress')" />
                            <FormTextField id="email" name="email" :placeholder="$t('login.form.emailAddress')"
                                v-model="state.email" />
                            <FormError :error="v$?.email?.$errors[0]?.$message.toString()" />
                        </div>
                        <FormButton type="submit" buttonStyle="primary" class="w-full">
                            {{ $t('employer.sendResetLink') }}
                        </FormButton>
                        <p class="text-center text-sm text-gray-500">
                            <a class="text-primary hover:text-primary-800 cursor-pointer"
                                @click="navigateTo('/employer/login')">
                                {{ $t('login.form.login') }}
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { employerAuthService } from '@/components/api/employer/EmployerAuthService'
import { useVuelidate } from "@vuelidate/core"
import { required, email as emailValidator, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    email: null as any,
    isPageLoading: false,
    sent: false,
})

const rules = computed(() => ({
    email: {
        required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        email: helpers.withMessage(() => `${t('validation.invalidEmail')}.`, emailValidator),
    },
}))
const v$ = useVuelidate(rules, state)

async function submit() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            await employerAuthService.forgotPassword({ email: state.email })
            state.sent = true
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>
