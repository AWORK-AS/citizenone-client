<template>

    <Head>
        <Title>Forgot Password - {{ runtimeConfig?.public?.appName }}</Title>
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

                    <form class="mt-5 space-y-3" method="POST" @submit.prevent="forgotPassword">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error && state.error.length > 0 || state.error?.message" />
                        <p>
                            {{ $t('forgotPassword.enterEmailAssociated') }}
                        </p>
                        <div class="space-y-1">
                            <FormLabel for="email" :label="$t('forgotPassword.emailAddress')" />
                            <FormTextField id="email" name="email" :placeholder="$t('forgotPassword.emailAddress')"
                                v-model="state.email" />
                            <FormError
                                :error="v$.email && v$.email.$errors && v$.email.$errors.length > 0 ? v$.email.$errors[0].$message : null" />
                            <FormError
                                :error="state.error && state.error.errors && state.error.errors.email && state.error.errors.email[0]" />
                        </div>
                        <div>
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('forgotPassword.requestPasswordReset') }}
                            </FormButton>
                        </div>
                        <p class="text-center text-sm leading-6 text-gray-500">
                            {{ $t('forgotPassword.or') }}
                            {{ ' ' }}
                            <a class="text-primary hover:text-primary-800 cursor-pointer" @click="navigateTo('/')">
                                {{ $t('forgotPassword.loginHereInstead') }}
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
import { required, helpers } from '@vuelidate/validators'
import { notify } from "@kyvg/vue3-notification"
import { authService } from '@/components/api/AuthService'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const langugage = useI18n()
const { t } = useI18n()

// Set language
langugage.locale.value = userStore.getLanguage

const state = reactive({
    email: null,
    error: [],
    isPageLoading: false,
})

const rules = computed(() => {
    return {
        email: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
    }
})
const v$ = useVuelidate(rules, state)

async function forgotPassword() {
    state.error = []
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
                navigateTo('/')
            }
        } catch (error: any) {
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
</script>