<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.patientForms') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <ModulesUserCitizenBreadcrumbTrail />
                    </template>
                </Breadcrumb>
            </template>


            <div class="space-y-5">

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <Alert type="danger" :text="state?.error?.message"
                    v-if="!isAnyModalOpen && state.error?.message && state.error.message.length > 0" />

                <div class="flex justify-end gap-x-2">
                    <!-- New forms could only be made under Forms in the menu, so sending a
                         new one meant leaving the patient and finding the way back. -->
                    <FormButton v-if="canCreateForms" buttonStyle="action" @click="createNewForm">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('forms.newForm') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="openSendModal()">
                        <Icon name="ph:paper-plane-tilt" class="h-4 w-4" />
                        {{ $t('patientForms.sendToPatient') }}
                    </FormButton>
                </div>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="!state.isPageLoading && state.assignments.length === 0"
                        class="px-6 py-14 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg text-center">
                        <div class="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:note-pencil" class="h-7 w-7 text-primary" />
                        </div>
                        <h3 class="mt-4 text-lg font-semibold text-gray-900">{{ $t('patientForms.empty.title') }}</h3>
                        <p class="mt-1 text-sm text-gray-500 max-w-md mx-auto">{{ $t('patientForms.empty.text') }}</p>
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="assignment in state.assignments" :key="assignment.uuid"
                            class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                            <div class="min-w-0">
                                <p class="font-semibold text-gray-900">{{ assignment.form?.title }}</p>
                                <p class="text-sm text-gray-500">
                                    {{ $t('patientForms.sent') }}: {{ formatDate(assignment.created_at) }}
                                    · {{ $t(`patientForms.delivery.${assignment.delivery ?? 'portal'}`) }}
                                    <template v-if="assignment.sent_to">({{ assignment.sent_to }})</template>
                                    <template v-if="assignment.status === 'completed'">
                                        · {{ $t('patientForms.answered') }}: {{ formatDate(assignment.completed_at) }}
                                    </template>
                                    <template v-else-if="assignment.expires_at && !assignment.is_expired">
                                        · {{ $t('patientForms.expires') }}: {{ formatDate(assignment.expires_at) }}
                                    </template>
                                </p>
                            </div>
                            <div class="flex flex-wrap items-center gap-3">
                                <span :class="['text-xs font-medium rounded-full px-3 py-1', statusOf(assignment).classes]">
                                    {{ $t(`patientForms.status.${statusOf(assignment).key}`) }}
                                </span>
                                <ModulesUserQuestionnaireInboxReviewStatus v-if="assignment.review_status"
                                    :status="assignment.review_status" :review="assignment.review" />
                                <FormButton v-if="assignment.status === 'completed'" type="button" buttonStyle="cancel"
                                    buttonSize="xs" @click="openAnswers(assignment)">
                                    <Icon name="ph:eye" class="h-4 w-4" />
                                    {{ $t('patientForms.viewAnswers') }}
                                </FormButton>
                                <NuxtLink v-if="assignment.status === 'completed' && assignment.document"
                                    :to="`/citizens/${citizenUuid}/documents`"
                                    class="text-sm font-medium text-primary hover:underline">
                                    {{ $t('patientForms.openDocuments') }}
                                </NuxtLink>
                                <FormButton v-if="canResend(assignment)" type="button" buttonStyle="cancel"
                                    buttonSize="xs" :disabled="state.isResending === assignment.uuid"
                                    @click="resend(assignment)">
                                    {{ $t('patientForms.resend') }}
                                </FormButton>
                                <FormButton v-if="assignment.status !== 'completed'" type="button" buttonStyle="danger"
                                    buttonSize="xs" @click="confirmWithdraw(assignment)">
                                    {{ $t('patientForms.withdraw') }}
                                </FormButton>
                            </div>
                        </div>
                        <p class="text-sm text-gray-500">{{ $t('patientForms.journalNotice') }}</p>
                    </div>
                </LoadingSpinner>
            </div>

            <ModulesUserQuestionnaireModalSend :isModalOpen="state.modal.isSendOpen" :citizenUuid="citizenUuid"
                :preselectFormUuid="state.preselectFormUuid" :allowSurveys="false"
                :title="$t('patientForms.sendToPatient')" @close="state.modal.isSendOpen = false"
                @sent="fetchAssignments" />

            <Modal size="md" :title="state.selectedAssignment?.form?.title ?? $t('patientForms.viewAnswers')"
                :show="state.modal.isAnswersOpen" @close="state.modal.isAnswersOpen = false">
                <template #modal-body>
                    <div class="space-y-5">
                        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <dt class="text-gray-500">{{ $t('patientForms.answered') }}</dt>
                            <dd class="text-gray-900">{{ formatDateTime(state.selectedAssignment?.completed_at) }}</dd>
                            <dt class="text-gray-500">{{ $t('patientForms.sentVia') }}</dt>
                            <dd class="text-gray-900">
                                {{ $t(`patientForms.delivery.${state.selectedAssignment?.delivery ?? 'portal'}`) }}
                                <template v-if="state.selectedAssignment?.sent_to">({{ state.selectedAssignment.sent_to }})</template>
                            </dd>
                            <template v-if="state.selectedAssignment?.submitted_ip">
                                <dt class="text-gray-500">{{ $t('patientForms.ipAddress') }}</dt>
                                <dd class="text-gray-900">{{ state.selectedAssignment.submitted_ip }}</dd>
                            </template>
                        </dl>

                        <div class="divide-y divide-gray-100 border-t border-gray-100">
                            <div v-for="row in answerRows" :key="row.uuid" class="py-3">
                                <p class="text-sm font-medium text-gray-900">{{ row.question }}</p>
                                <p class="mt-1 text-sm text-gray-700 whitespace-pre-line">{{ row.answer || '–' }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6">
                        <FormButton type="button" buttonStyle="cancel" class="w-full" @click="state.modal.isAnswersOpen = false">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.modal.isWithdrawOpen"
                :title="$t('patientForms.withdraw')" :message="$t('patientForms.withdrawConfirm')"
                @close="state.modal.isWithdrawOpen = false" @confirm="withdraw" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { formService } from '@/components/api/user/FormService'
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'
import { usePermissions } from '@/composables/usePermissions'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as string
const { isAtLeast, can } = usePermissions()

// Same gate as Forms itself (sidebar entry and the form list's admin view).
const canCreateForms = computed(() => isAtLeast('Admin') || can('manage_status_reports'))

const breadcrumbLinks = [
    { name: 'citizens.tabs.patientForms', translate: true, href: `/citizens/${citizenUuid}/patient-forms` },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isResending: '' as string,
    assignments: [] as any[],
    // A form to have picked when Send opens (back from the form builder).
    preselectFormUuid: '',
    selectedAssignment: null as any,
    modal: { isSendOpen: false, isWithdrawOpen: false, isAnswersOpen: false },
})

const ANSWERABLE = ['textfield', 'textarea', 'choice', 'checkbox', 'datefield', 'rating', 'scale']

// The questions as they were sent, each with the patient's answer as readable text: option labels
// rather than the indexes that are stored.
const answerRows = computed(() => {
    const assignment = state.selectedAssignment
    const answers = assignment?.answers ?? {}

    return (assignment?.form?.fields ?? [])
        .filter((entry: any) => ANSWERABLE.includes(entry?.field?.type))
        .map((entry: any) => {
            const field = entry.field
            const options: string[] = field.options ?? []
            const answer = answers[entry.uuid]
            let text = ''

            if (field.type === 'choice' && answer !== undefined && answer !== null) text = options[Number(answer)] ?? ''
            else if (field.type === 'checkbox' && Array.isArray(answer)) text = answer.map((index: number) => options[index] ?? '').join(', ')
            else if (field.type === 'datefield' && answer) text = moment(answer).isValid() ? moment(answer).format('DD-MM-YYYY') : String(answer)
            else if (answer !== undefined && answer !== null) text = String(answer)

            return { uuid: entry.uuid, question: field.value ?? '', answer: text }
        })
})

const isAnyModalOpen = computed(() => state.modal.isSendOpen)

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}

function formatDateTime(date: any) {
    return date ? moment(date).format('DD-MM-YYYY HH:mm') : '-'
}

function openAnswers(assignment: any) {
    state.selectedAssignment = assignment
    state.modal.isAnswersOpen = true
}

function statusOf(assignment: any) {
    if (assignment.status === 'completed') return { key: 'answered', classes: 'bg-green-100 text-green-800' }
    if (assignment.is_expired) return { key: 'expired', classes: 'bg-gray-100 text-gray-700' }
    if (assignment.opened_at) return { key: 'opened', classes: 'bg-blue-100 text-blue-800' }
    return { key: 'waiting', classes: 'bg-amber-100 text-amber-900' }
}

function canResend(assignment: any) {
    return assignment.status !== 'completed' && ['email', 'sms'].includes(assignment.delivery)
}

onMounted(() => {
    fetchAssignments()

    // Back from the form builder with the form just made: open Send with it picked.
    const sendForm = route.query.send_form
    if (typeof sendForm === 'string' && sendForm !== '') {
        openSendModal(sendForm)
    }
    if (sendForm !== undefined) {
        const { send_form, ...rest } = route.query
        router.replace({ query: rest })
    }
})

function createNewForm() {
    navigateTo({ path: '/forms/new', query: { return_to: route.path } })
}

async function fetchAssignments() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await formService.getFormAssignments({ citizen_uuid: citizenUuid })
        state.assignments = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function openSendModal(preselectFormUuid = '') {
    state.error = {}
    state.preselectFormUuid = preselectFormUuid
    state.modal.isSendOpen = true
}

async function resend(assignment: any) {
    state.error = {}
    state.isResending = assignment.uuid
    try {
        const response = await formService.resendFormLink(assignment.uuid)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, t('patientForms.resentAlert'))
            await fetchAssignments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isResending = ''
}

function confirmWithdraw(assignment: any) {
    state.selectedAssignment = assignment
    state.modal.isWithdrawOpen = true
}

async function withdraw() {
    state.error = {}
    try {
        const response = await formService.withdrawFormAssignment(state.selectedAssignment?.uuid)
        if (response) {
            successAlert(`${t('alert.success')}!`, t('patientForms.withdrawnAlert'))
            await fetchAssignments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.modal.isWithdrawOpen = false
}
</script>
