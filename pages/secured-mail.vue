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
                <div class="md:bg-white md:shadow-sm sm:rounded-lg">
                    <form class="mt-5 px-6 py-3 sm:px-12 md:py-8 space-y-3" method="POST"
                        @submit.prevent="unlockMessage" v-if="!state.showMessage">
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
                    <div v-else class="divide-y divide-gray-100">
                        <div class="space-y-3 px-6 sm:px-12 py-3 md:py-8">
                            <div class="flex items-center justify-between">
                                <h3 class="font-semibold text-lg">
                                    {{ state.secured_mail?.subject }}
                                </h3>
                                <div>
                                    <FormButton buttonStyle="primary" @click="state.modal.isReplySecuredMailOpen = true"
                                        class="rounded-md">
                                        {{ $t('mail.secured.replySecurely') }}
                                    </FormButton>
                                </div>
                            </div>
                            <div>
                                <p class="text-sm">
                                    {{ formatDateTimeToReadable(state.secured_mail?.created_at) }}
                                </p>
                                <p>
                                    {{ $t('mail.secured.from') }}:
                                    {{ state.secured_mail?.sender?.firstname }}
                                    {{ state.secured_mail?.sender?.lastname }}
                                    {{ state.secured_mail?.from }}
                                </p>
                                <div class="flex items-center gap-x-1">
                                    <p>
                                        {{ $t('mail.secured.to') }}:
                                    </p>
                                    <div class="text-xxs flex flex-wrap gap-1">
                                        <span v-for="(receipient, index) in state.secured_mail?.recipient_emails"
                                            :key=index class="bg-primary px-2 py-1 text-white rounded-md">
                                            {{ receipient }}
                                        </span>
                                    </div>
                                    <p>
                                        {{ state.secured_mail?.to }}
                                    </p>
                                </div>
                            </div>
                            <div v-html="state.secured_mail?.message"></div>
                            <div class="flex flex-wrap items-center gap-2">
                                <div v-for="(attachment, attachmentIndex) in JSON.parse(state.secured_mail?.attachments)"
                                    :index="attachmentIndex" class="border border-gray-200 rounded-sm">
                                    <div class="cursor-pointer flex items-center gap-x-2 p-2"
                                        @click="downloadAttachment(attachment)">
                                        <div class="flex items-center" v-if="isPdf(attachment)">
                                            <Icon name="ph:file-pdf" class="h-5 w-5 text-red-600" aria-hidden="true" />
                                        </div>
                                        <div class="flex items-center" v-else-if="isWord(attachment)">
                                            <Icon name="ph:file-doc" class="h-5 w-5 text-blue-600" aria-hidden="true" />
                                        </div>
                                        <div class="flex items-center" v-else-if="isExcel(attachment)">
                                            <Icon name="ph:file-xls" class="h-5 w-5 text-green-600"
                                                aria-hidden="true" />
                                        </div>
                                        <div class="flex items-center" v-else-if="isPpt(attachment)">
                                            <Icon name="ph:file-ppt" class="h-5 w-5 text-purple-600"
                                                aria-hidden="true" />
                                        </div>
                                        <div class="flex items-center" v-else-if="isImage(attachment)">
                                            <Icon name="ph:file-image" class="h-5 w-5 text-yellow-600"
                                                aria-hidden="true" />
                                        </div>
                                        <div class="flex items-center" v-else>
                                            <Icon name="ph:file" class="h-5 w-5 text-gray-600" aria-hidden="true" />
                                        </div>
                                        <p class="text-xs">
                                            {{ attachment?.split('/').pop() }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p class="flex items-center gap-x-1 text-xs">
                                <span>
                                    {{ $t('mail.secured.sent.sentWith') }}
                                </span>
                                <span class="text-primary">
                                    {{ $t('mail.secured.sent.citizenOneMail') }}
                                </span>
                                <span class="lowercase">
                                    {{ $t('mail.secured.sent.viaSecuredMail') }}.
                                </span>
                            </p>
                        </div>
                        <div class="space-y-3 px-6 sm:px-12 py-3 md:py-8"
                            v-for="(history, historyIndex) in state.secured_mail?.history" :index="historyIndex">
                            <div>
                                <p class="text-sm">
                                    {{ formatDateTimeToReadable(history?.created_at) }}
                                </p>
                                <p>
                                    {{ $t('mail.secured.from') }}:
                                    {{ history?.from }}
                                </p>
                                <div class="flex items-center gap-x-1">
                                    <p>
                                        {{ $t('mail.secured.to') }}:
                                    </p>
                                    <div class="text-xxs flex flex-wrap gap-1">
                                        <span v-for="(receipient, index) in history?.recipient_emails" :key=index
                                            class="bg-primary px-2 py-1 text-white rounded-md">
                                            {{ receipient }}
                                        </span>
                                    </div>
                                    <p>
                                        {{ state.secured_mail?.to }}
                                    </p>
                                </div>
                            </div>
                            <div v-html="history?.message"></div>
                            <p class="flex items-center gap-x-1 text-xs">
                                <span>
                                    {{ $t('mail.secured.sent.sentWith') }}
                                </span>
                                <span class="text-primary">
                                    {{ $t('mail.secured.sent.citizenOneMail') }}
                                </span>
                                <span class="lowercase">
                                    {{ $t('mail.secured.sent.viaSecuredMail') }}.
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
        <ModulesUserSecuredMailModalReply :isModalOpen="state.modal.isReplySecuredMailOpen"
            @close="state.modal.isReplySecuredMailOpen = false" v-if="state.modal.isReplySecuredMailOpen" />
        <ModulesUserSecuredMailModalDownloadFile :isModalOpen="state.modal.isDownloadFileOpen"
            :selectedAttachment="state.selectedAttachment" @close="state.modal.isDownloadFileOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { securedMailService } from '@/components/api/user/SecuredMailService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const language = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { gtagReportConversion } = useGtag()
const { t } = useI18n()
const router = useRouter()
const emailUuid = router?.currentRoute?.value?.query?.token

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    error: {} as Error,
    formSecuredMail: {
        password: '',
    },
    isPageLoading: false,
    modal: {
        isDownloadFileOpen: false,
        isReplySecuredMailOpen: false,
    },
    secured_mail: {} as any,
    selectedAttachment: '',
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
            const response = await securedMailService.unlockMessage(emailUuid, params)
            if (response) {
                state.secured_mail = response?.data
                state.showMessage = true
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

function getFileExtension(url: string): string {
    const fileName = url.split('/').pop() // Extract file name from URL
    if (fileName) {
        const ext = fileName.split('.').pop()?.toLowerCase() // Get the file extension
        return ext || ''
    }
    return ''
}

function isPdf(url: string): boolean {
    return getFileExtension(url) === 'pdf'
}

function isWord(url: string): boolean {
    const ext = getFileExtension(url)
    return ext === 'docx' || ext === 'doc'
}

function isExcel(url: string): boolean {
    const ext = getFileExtension(url)
    return ext === 'xlsx' || ext === 'xls'
}

function isPpt(url: string): boolean {
    const ext = getFileExtension(url)
    return ext === 'pptx' || ext === 'ppt'
}

function isImage(url: string): boolean {
    const ext = getFileExtension(url)
    return ['jpg', 'jpeg', 'png', 'gif'].includes(ext)
}

function downloadAttachment(attachment: any) {
    state.modal.isDownloadFileOpen = true
    state.selectedAttachment = attachment
}
</script>