<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.patientForms') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.patientForms') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <Alert type="danger" :text="state?.error?.message"
                    v-if="!isAnyModalOpen && state.error?.message && state.error.message.length > 0" />

                <div class="flex justify-end">
                    <FormButton buttonStyle="action" @click="openSendModal">
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

            <Modal size="md" :title="$t('patientForms.sendToPatient')" :show="state.modal.isSendOpen"
                @close="state.modal.isSendOpen = false">
                <template #modal-body>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />

                        <div class="space-y-2">
                            <FormLabel for="form_uuid" :label="$t('patientForms.chooseForm')" />
                            <FormSelect id="form_uuid" :options="state.options.forms" v-model="state.selectedFormUuid" />
                            <button type="button" class="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                                :disabled="state.isCreatingTemplate" @click="createConsentTemplate">
                                {{ $t('patientForms.consentTemplate.create') }}
                            </button>
                        </div>

                        <fieldset class="space-y-2">
                            <legend class="text-sm font-medium text-gray-900">{{ $t('patientForms.sendBy') }}</legend>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <label v-for="option in deliveryOptions" :key="option.value"
                                    :class="['flex items-center gap-x-2 rounded-md border px-3 py-2 text-sm',
                                        option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                                        state.delivery === option.value ? 'border-primary bg-primary/5' : 'border-gray-300']">
                                    <input type="radio" class="text-primary focus:ring-primary" name="delivery"
                                        :value="option.value" v-model="state.delivery" :disabled="option.disabled"
                                        @change="prefillRecipient" />
                                    <Icon :name="option.icon" class="h-4 w-4 text-gray-500" />
                                    {{ option.label }}
                                    <span v-if="option.comingSoon"
                                        class="ml-auto whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                        {{ $t('comingSoon') }}
                                    </span>
                                </label>
                            </div>
                            <p class="text-sm text-gray-500">{{ deliveryHelp }}</p>
                            <p v-if="hasPatientPortal && !canUsePortal" class="text-xs text-gray-500">
                                {{ $t('patientForms.portalUnavailable') }}
                            </p>
                        </fieldset>

                        <div v-if="isLinkDelivery" class="space-y-2">
                            <FormLabel for="recipient"
                                :label="state.delivery === 'sms' ? $t('patientForms.phone') : $t('patientForms.email')" />
                            <FormTextField id="recipient" name="recipient" v-model="state.recipient" />
                            <Alert v-if="!citizen?.birthday" type="warning" :text="$t('patientForms.birthdayMissing')" />
                        </div>
                    </div>
                    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton type="button" buttonStyle="cancel" @click="state.modal.isSendOpen = false">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="primary" :disabled="!canSubmit || state.isSending"
                            @click="sendForm">
                            {{ $t('patientForms.send') }}
                        </FormButton>
                    </div>
                </template>
            </Modal>

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
import { useCitizenStore } from '@/store/citizen'
import { useUserStore } from '@/store/user'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const citizenStore = useCitizenStore() as any
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const { build: buildConsentTemplate } = useConsentFormTemplate()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as string

const breadcrumbLinks = [
    { name: 'citizens.tabs.patientForms', translate: true, href: `/citizens/${citizenUuid}/patient-forms` },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isSending: false,
    isCreatingTemplate: false,
    isResending: '' as string,
    assignments: [] as any[],
    selectedFormUuid: '',
    delivery: 'email' as 'portal' | 'email' | 'sms',
    recipient: '',
    selectedAssignment: null as any,
    options: { forms: [] as any[] },
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

// The details header loads the citizen and keeps it in the store; read from there rather than
// fetching the whole record a second time.
const citizen = computed(() => {
    const selected = citizenStore.getSelectedCitizen
    return selected?.uuid === citizenUuid ? selected : null
})

const isAnyModalOpen = computed(() => state.modal.isSendOpen)
const isLinkDelivery = computed(() => state.delivery === 'email' || state.delivery === 'sms')

// Sending to the patient portal is hidden for now; forms go out as a link by email. The server still
// supports it, so turning this back on is this one flag. With it on, a clinic without the patient
// app still never sees the option.
const SHOW_PORTAL_OPTION = false
const hasPatientPortal = computed(() => SHOW_PORTAL_OPTION && !!userStore.getUser?.has_patient_app)
const canUsePortal = computed(() => hasPatientPortal.value && !!citizen.value?.has_system_access)

const deliveryOptions = computed(() => [
    { value: 'email', label: t('patientForms.delivery.email'), icon: 'ph:envelope-simple', disabled: false },
    // Built and tested on the server, held back in the dialog until SMS is ready to offer.
    { value: 'sms', label: t('patientForms.delivery.sms'), icon: 'ph:chat-circle-text', disabled: true, comingSoon: true },
    // Only someone who can log in to the portal can answer a form there.
    ...(hasPatientPortal.value
        ? [{ value: 'portal', label: t('patientForms.delivery.portal'), icon: 'ph:user-circle', disabled: !canUsePortal.value }]
        : []),
])

const deliveryHelp = computed(() => isLinkDelivery.value
    ? t('patientForms.sendHelpLink')
    : t('patientForms.sendHelp'))

const canSubmit = computed(() => {
    if (!state.selectedFormUuid) return false
    if (isLinkDelivery.value) return !!citizen.value?.birthday && state.recipient.trim() !== ''
    return true
})

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
    fetchForms()
})

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

async function fetchForms() {
    try {
        const response = await formService.getAllForms()
        state.options.forms = (response?.data ?? []).map((form: any) => ({
            value: form.uuid,
            label: form.title,
        }))
    } catch (error: any) {
        state.error = error
    }
}

function prefillRecipient() {
    state.recipient = state.delivery === 'sms'
        ? (citizen.value?.phone ?? '')
        : state.delivery === 'email' ? (citizen.value?.email ?? '') : ''
}

function openSendModal() {
    state.error = {}
    state.selectedFormUuid = ''
    state.delivery = canUsePortal.value ? 'portal' : 'email'
    prefillRecipient()
    state.modal.isSendOpen = true
}

/** Creates the ready-made consent form in Forms and picks it, so it can be sent straight away. */
async function createConsentTemplate() {
    state.error = {}
    state.isCreatingTemplate = true
    try {
        const response = await formService.saveForm(buildConsentTemplate())
        if (response?.data?.uuid) {
            await fetchForms()
            state.selectedFormUuid = response.data.uuid
            successAlert(`${t('alert.success')}!`, t('patientForms.consentTemplate.created'))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isCreatingTemplate = false
}

async function sendForm() {
    state.error = {}
    state.isSending = true
    try {
        const response = await formService.sendFormToPatient(state.selectedFormUuid, {
            citizen_uuid: citizenUuid,
            delivery: state.delivery,
            recipient: isLinkDelivery.value ? state.recipient.trim() : null,
        })
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, t(`patientForms.sentAlert${isLinkDelivery.value ? 'Link' : ''}`))
            state.modal.isSendOpen = false
            await fetchAssignments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSending = false
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
