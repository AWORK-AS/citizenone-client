<template>

    <Head>
        <Title>{{ $t('setupPassword.setupPassword') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="flex h-screen flex-1">
            <div class="relative hidden w-0 flex-1 lg:block overflow-clip">
                <img src="https://citizenone.dk/wp-content/uploads/2024/09/CitizenOne-6.jpg" alt="Image failed to load"
                    class="absolute inset-0 h-full w-full object-cover" />
                <img src="https://citizenone.dk/wp-content/uploads/2025/03/citizenone-journalsystem.svg"
                    alt="Image failed to load" class="absolute w-1/2" style="top: -16%; left: -11%;" />
                <div>
                    <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                        class="absolute w-2/4 -bottom-56 -right-12" />
                    <p class="absolute bottom-10 right-10 text-lg text-white flex items-center gap-x-2">
                        <img src="/img/icons/shield.svg" alt="Image failed to load" class="w-8 h-8" />
                        ISO-certificeret serverlagring beliggende i EU
                    </p>
                </div>
            </div>
            <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div class="mx-auto w-full max-w-sm lg:w-96">
                    <div class="flex items-center justify-between">
                        <Logo @click="navigateTo('/superadmin')" />
                        <button type="button" class="-m-2.5 rounded-full w-8" @click="selectLanguage">
                            <img :src="identifyFlag()" alt="flag">
                        </button>
                    </div>

                    <form class="mt-5 space-y-3" method="POST" @submit.prevent="setPassword">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <h3 class="font-medium">
                            {{ $t('setupPassword.setupPassword') }}
                        </h3>
                        <div class="space-y-1">
                            <FormLabel for="password" :label="$t('setupPassword.form.password')" />
                            <FormPasswordField id="password" name="password"
                                :placeholder="$t('setupPassword.form.password')" v-model="state.formUser.password" />
                            <FormError :error="v$?.formUser?.password?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.password?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="confirm_password" :label="$t('setupPassword.form.confirmPassword')" />
                            <FormPasswordField id="confirm_password" name="confirm_password"
                                :placeholder="$t('setupPassword.form.confirmPassword')"
                                v-model="state.formUser.confirm_password" />
                            <FormError :error="v$?.formUser?.confirm_password?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.confirm_password?.[0]" />
                        </div>
                        <div>
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('setupPassword.setPassword') }}
                            </FormButton>
                        </div>
                        <p class="text-center text-sm leading-6 text-gray-500">
                            {{ $t('setupPassword.or') }}
                            {{ ' ' }}
                            <a class="text-primary hover:text-primary-800 cursor-pointer"
                                @click="navigateTo('/superadmin')">
                                {{ $t('setupPassword.loginHereInstead') }}.
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers, minLength, sameAs } from '@vuelidate/validators'
import { authService } from '@/components/api/superadmin/AuthService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const route = useRoute()
const language = useI18n()
const { errorAlert, successAlert } = useAlert()
const { t } = useI18n()

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    error: {} as Error,
    formUser: {
        password: null,
        confirm_password: null,
    },
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
    token: '',
})

const rules = computed(() => {
    return {
        formUser: {
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                minLength: helpers.withMessage(`${t('alert.setupPassword.required8Characters')}.`, minLength(8))
            },
            confirm_password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                sameAsPassword: helpers.withMessage(`${t('alert.setupPassword.confirmPasswordNotTheSame')}.`, sameAs(state.formUser.password)),
            }
        }
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    const token = route.query.token
    if (token && typeof token === 'string') {
        state.token = token
        verifyPasswordResetToken()
    } else {
        errorAlert(`${t('alert.somethingWentWrong')}.`, `${t('alert.setupPassword.invalidPasswordSetupToken')}.`)
        navigateTo('/superadmin/forgot-password')
    }
})

async function verifyPasswordResetToken() {
    state.isPageLoading = true
    state.error = {}
    try {
        await authService.verifyResetPassword(state.token)
    } catch (error) {
        if (error) {
            const err = error as Error
            state.error = err
            if (err.hasOwnProperty('message')) {
                if (err.message === 'Invalid password reset token.') {
                    errorAlert(`${t('alert.somethingWentWrong')}.`, `${t('alert.setupPassword.invalidPasswordSetupToken')}.`)
                } else {
                    errorAlert(`${t('alert.somethingWentWrong')}.`, err.message ?? '')
                }
                navigateTo('/superadmin')
            }
        }
    }
    state.isPageLoading = false
}

async function setPassword() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        const params = {
            password: state.formUser.password,
            token: state.token,
        }
        try {
            await authService.setPassword(params)
            successAlert(`${t('alert.success')}!`, `${t('alert.setupPassword.passwordSetupSucessfully')}.`)
            navigateTo('/superadmin')
        } catch (error) {
            const err = error as Error
            state.error = err
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
        return '/img/icons/flags/united-kingdom.svg'
    } else {
        if (selectedLanguage === 'dk') {
            return '/img/icons/flags/denmark.svg'
        }
    }
}
</script>
