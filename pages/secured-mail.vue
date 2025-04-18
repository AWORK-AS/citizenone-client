<template>

    <Head>
        <Title>{{ $t('mail.secured.unlockMessage') }} - {{ runtimeConfig?.public?.appName }}</Title>
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
                    <form class="mt-5 space-y-3" method="POST" @submit.prevent="unlockMessage"
                        v-if="!state.showMessage">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <h3 class="font-medium text-lg md:text-xl">
                            {{ $t('mail.secured.unlockMessage') }}
                        </h3>
                        <div class="space-y-1">
                            <FormLabel for="password" :label="$t('mail.secured.form.password')" />
                            <FormTextField id="password" name="password" :placeholder="$t('mail.secured.form.password')"
                                v-model="state.formSecuredMail.password" />
                            <FormError :error="v$?.formSecuredMail?.password?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.password?.[0]" />
                        </div>
                        <div>
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('mail.secured.form.readMessage') }}
                            </FormButton>
                        </div>
                    </form>
                    <div v-else>

                    </div>
                </div>
            </div>
        </div>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { securedMailService } from '@/components/api/user/SecuredMailService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
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
    error: {} as Error,
    formSecuredMail: {
        password: '',
    },
    isPageLoading: false,
    secured_mail: '',
    showMessage: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const rules = computed(() => {
    return {
        formSecuredMail: {
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
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

async function unlockMessage() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const params = {
                password: state.formSecuredMail.password,
            }
            const response = await securedMailService.getMessage(params)
            if (response) {
                state.secured_mail = response
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
</script>