<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ state.detail?.title ?? $t('questionnaireInbox.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ state.detail?.title ?? $t('questionnaireInbox.title') }}
            </template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 max-w-fit hover:cursor-pointer" to="/questionnaire-inbox">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('questionnaireInbox.backToList') }}</span>
                </NuxtLink>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5" v-if="detail">
                        <div class="lg:col-span-2 space-y-5">
                            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-5 py-4 space-y-3">
                                <div class="flex flex-wrap items-start justify-between gap-3">
                                    <div class="min-w-0 space-y-1">
                                        <p class="text-lg font-semibold text-gray-900">{{ patientName }}</p>
                                        <p class="text-sm text-gray-700">{{ detail.title }}</p>
                                        <div class="flex flex-wrap items-center gap-2">
                                            <span :class="['text-xs font-medium rounded-full px-2.5 py-0.5',
                                                detail.type === 'survey' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800']">
                                                {{ $t(`questionnaireInbox.type.${detail.type}`) }}
                                            </span>
                                            <span v-if="detail.type === 'survey' && detail.score !== null && detail.score !== undefined"
                                                class="text-xs font-medium rounded-full px-2.5 py-0.5 bg-gray-100 text-gray-800">
                                                {{ $t('questionnaireInbox.score') }}: {{ detail.score }}
                                                <template v-if="detail.score_label">({{ detail.score_label }})</template>
                                            </span>
                                        </div>
                                    </div>
                                    <ModulesUserQuestionnaireInboxReviewStatus :status="detail.review_status"
                                        :review="detail.review" align="end" />
                                </div>
                                <p class="text-sm text-gray-500">
                                    {{ $t('questionnaireInbox.returned') }}: {{ formatDateTime(detail.completed_at) }}
                                    <template v-if="detail.sent_by?.name">
                                        · {{ $t('questionnaireInbox.sentBy') }}: {{ detail.sent_by.name }}
                                    </template>
                                </p>
                                <div class="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                                    <NuxtLink v-if="detail.citizen?.uuid" :to="`/citizens/${detail.citizen.uuid}/journals`"
                                        class="inline-flex items-center gap-x-1.5 text-sm font-medium text-primary hover:underline">
                                        <Icon name="ph:user" class="h-4 w-4" />
                                        {{ $t('questionnaireInbox.openProfile') }}
                                    </NuxtLink>
                                    <NuxtLink v-if="detail.citizen?.uuid && canOpenMedicine"
                                        :to="`/citizens/${detail.citizen.uuid}/medicine-journals`"
                                        class="inline-flex items-center gap-x-1.5 text-sm font-medium text-primary hover:underline">
                                        <Icon name="ph:pill" class="h-4 w-4" />
                                        {{ $t('questionnaireInbox.openMedicineList') }}
                                    </NuxtLink>
                                    <a v-if="detail.document?.file_url" :href="detail.document.file_url" target="_blank"
                                        rel="noopener noreferrer"
                                        class="inline-flex items-center gap-x-1.5 text-sm font-medium text-primary hover:underline">
                                        <Icon name="ph:file-pdf" class="h-4 w-4" />
                                        {{ $t('questionnaireInbox.openPdf') }}
                                    </a>
                                </div>
                            </div>

                            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-5 py-4">
                                <h3 class="text-md font-semibold mb-2">{{ $t('questionnaireInbox.answers') }}</h3>
                                <div v-if="(detail.answers ?? []).length > 0" class="divide-y divide-gray-100">
                                    <div v-for="(entry, index) in detail.answers" :key="index" class="py-3">
                                        <p class="text-sm font-medium text-gray-900">{{ entry.question }}</p>
                                        <p class="mt-1 text-sm text-gray-700 whitespace-pre-line">{{ entry.answer || '–' }}</p>
                                    </div>
                                </div>
                                <p v-else class="text-sm text-gray-500">{{ $t('questionnaireInbox.noAnswers') }}</p>
                            </div>
                        </div>

                        <div class="space-y-5">
                            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-5 py-4 space-y-4">
                                <h3 class="text-md font-semibold">{{ $t('questionnaireInbox.review.title') }}</h3>

                                <p v-if="historyLine" class="text-sm text-gray-700 whitespace-pre-line">{{ historyLine }}</p>

                                <template v-if="detail.review_status === 'to_review'">
                                    <div class="space-y-1">
                                        <FormLabel for="review_note" :label="$t('questionnaireInbox.review.note')" />
                                        <FormTextArea name="review_note" v-model="state.note" :rows="4"
                                            :placeholder="$t('questionnaireInbox.review.notePlaceholder')" />
                                        <div class="flex items-start justify-between gap-3">
                                            <p class="text-xs text-gray-500">{{ $t('questionnaireInbox.review.noteHint') }}</p>
                                            <p :class="['text-xs shrink-0', noteTooLong ? 'text-red-700' : 'text-gray-500']">
                                                {{ state.note.length }}/{{ NOTE_MAX_LENGTH }}
                                            </p>
                                        </div>
                                        <p v-if="state.noteError" class="text-sm text-red-700">{{ state.noteError }}</p>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                                        <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving"
                                            @click="approve">
                                            <Icon name="ph:check" class="h-4 w-4" />
                                            {{ $t('questionnaireInbox.review.approve') }}
                                        </FormButton>
                                        <FormButton type="button" buttonStyle="danger" :disabled="state.isSaving"
                                            @click="askToDecline">
                                            <Icon name="ph:x" class="h-4 w-4" />
                                            {{ $t('questionnaireInbox.review.decline') }}
                                        </FormButton>
                                    </div>
                                </template>
                                <FormButton v-else type="button" buttonStyle="cancel" class="w-full" :disabled="state.isSaving"
                                    @click="reopen">
                                    <Icon name="ph:arrow-counter-clockwise" class="h-4 w-4" />
                                    {{ $t('questionnaireInbox.review.reopen') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isDeclineOpen"
                :title="$t('questionnaireInbox.review.declineTitle')"
                :message="$t('questionnaireInbox.review.declineConfirm')"
                :confirmLabel="$t('questionnaireInbox.review.decline')"
                @close="state.modal.isDeclineOpen = false" @confirm="decline" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { questionnaireInboxService } from '@/components/api/user/QuestionnaireInboxService'
import { useQuestionnaireInbox } from '@/composables/questionnaireInbox'
import { canOpenPage } from '@/composables/pageAccess'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

definePageMeta({ middleware: 'require-questionnaire-inbox' })

const NOTE_MAX_LENGTH = 1000

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t } = useI18n()
const { successAlert } = useAlert()
const userStore = useUserStore() as any
const { refreshToReviewCount } = useQuestionnaireInbox()

const type = route.params.type as string
const uuid = route.params.uuid as string

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isSaving: false,
    detail: null as any,
    note: '',
    noteError: '',
    modal: { isDeclineOpen: false },
})

const detail = computed(() => state.detail)

const patientName = computed(() =>
    [detail.value?.citizen?.firstname, detail.value?.citizen?.lastname].filter(Boolean).join(' '))

// "Medicine card" is a page (the company's modules and the role's pages), not a permission: can() was always false.
const canOpenMedicine = computed(() => canOpenPage(userStore.getUser, 'Medicine card'))

const noteTooLong = computed(() => state.note.length > NOTE_MAX_LENGTH)

const breadcrumbLinks = computed(() => {
    const links: any[] = [{ name: 'questionnaireInbox.title', translate: true, href: '/questionnaire-inbox' }]
    if (state.detail?.title) {
        links.push({ name: state.detail.title, translate: false, href: route.fullPath })
    }
    return links
})

// "Approved by Anna on 12-10-2026 10:30: Prescription renewed for 3 months".
const historyLine = computed(() => {
    const review = detail.value?.review
    const status = detail.value?.review_status
    if (!review || status === 'to_review') return ''

    const parts: string[] = []
    if (review.by?.name) {
        const date = review.at ? formatDateTime(review.at) : ''
        parts.push(t(status === 'declined' ? 'questionnaireInbox.review.declinedBy' : 'questionnaireInbox.review.approvedBy',
            { name: review.by.name, date }))
    } else {
        parts.push(t(`questionnaireInbox.status.${status}`))
    }
    if (review.handled_before_inbox) parts.push(t('questionnaireInbox.handledBeforeInbox'))

    const line = parts.join(' - ')
    return review.note ? `${line}: ${review.note}` : line
})

function formatDateTime(date: any): string {
    return date ? moment(date).format('DD-MM-YYYY HH:mm') : '-'
}

async function fetchDetail() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await questionnaireInboxService.getQuestionnaire(type, uuid)
        if (response?.data) {
            state.detail = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

// What was done is shown, the number in the sidebar follows, and the next one is back in the list.
async function finish(message: string) {
    successAlert(`${t('alert.success')}!`, message)
    await refreshToReviewCount()
    navigateTo('/questionnaire-inbox')
}

function validateNote(required: boolean): boolean {
    state.noteError = ''
    if (noteTooLong.value) {
        state.noteError = t('questionnaireInbox.review.noteTooLong', { max: NOTE_MAX_LENGTH })
        return false
    }
    if (required && state.note.trim() === '') {
        state.noteError = t('questionnaireInbox.review.declineReasonRequired')
        return false
    }
    return true
}

async function approve() {
    if (!validateNote(false)) return
    state.error = {}
    state.isSaving = true
    try {
        const note = state.note.trim()
        const response = await questionnaireInboxService.approve(type, uuid, note ? { note } : {})
        if (response?.data) {
            state.isSaving = false
            await finish(t('questionnaireInbox.alert.approved'))
            return
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

function askToDecline() {
    if (!validateNote(true)) return
    state.modal.isDeclineOpen = true
}

async function decline() {
    if (!validateNote(true)) return
    state.error = {}
    state.isSaving = true
    try {
        const response = await questionnaireInboxService.decline(type, uuid, { note: state.note.trim() })
        if (response?.data) {
            state.isSaving = false
            await finish(t('questionnaireInbox.alert.declined'))
            return
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function reopen() {
    state.error = {}
    state.isSaving = true
    try {
        const response = await questionnaireInboxService.reopen(type, uuid)
        if (response?.data) {
            state.isSaving = false
            await finish(t('questionnaireInbox.alert.reopened'))
            return
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

onMounted(() => {
    if (type !== 'form' && type !== 'survey') {
        navigateTo('/questionnaire-inbox')
        return
    }
    fetchDetail()
})
</script>
