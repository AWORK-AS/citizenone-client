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
                    <div class="flex items-center justify-between">
                        <Logo @click="navigateTo('/')" />
                        <button type="button" class="-m-2.5 rounded-full w-8" @click="selectLanguage">
                            <img :src="identifyFlag()" alt="flag">
                        </button>
                    </div>

                    <form class="mt-5 space-y-3" method="POST" @submit.prevent="forgotPassword">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <p>
                            {{ $t('forgotPassword.enterEmailAssociated') }}
                        </p>
                        <div class="space-y-1">
                            <FormLabel for="email" :label="$t('forgotPassword.emailAddress')" />
                            <FormTextField id="email" name="email" :placeholder="$t('forgotPassword.emailAddress')"
                                v-model="state.email" />
                            <FormError :error="v$?.email?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.email?.[0]" />
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
        <ModulesLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
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

interface ForgotPasswordError {
    message?: string;
    errors?: {
        [key: string]: string[];
    };
}

// Set language
langugage.locale.value = userStore.getLanguage

const state = reactive({
    email: null,
    error: {} as ForgotPasswordError,
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
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
</script>