<template>

    <Head>
        <Title>Forgot Password - {{ runtimeConfig?.public?.appName }}</Title>
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
            <div
                class="relative overflow-clip flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                    class="w-64 lg:w-1/2 absolute -top-32 -right-32 opacity-0 transition-opacity duration-500"
                    id="animatedAsset01">
                <img src="/img/icons/asset-02.svg" alt="Image failed to load"
                    class="w-64 lg:w-1/2 absolute -bottom-32 -left-32 opacity-0 transition-opacity duration-500"
                    id="animatedAsset02">
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
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { authService } from '@/components/api/user/AuthService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const langugage = useI18n()
const { successAlert } = useAlert()
const { t } = useI18n()

// Set language
langugage.locale.value = userStore.getLanguage

const state = reactive({
    email: null as any,
    error: {} as Error,
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