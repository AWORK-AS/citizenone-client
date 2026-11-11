<template>
    <!-- Sends a form or a survey to one patient. On a patient's record the patient is given
         (citizenUuid); in the questionnaire inbox there is none, so a single patient picker
         comes first. What can be sent, and what is already waiting, comes from the server
         (send-options) for the chosen patient. -->
    <!-- allowOverflow: until something is picked the dialog is short, and the list of forms and
         surveys was cut off at its bottom edge after two options. -->
    <Modal size="md" allowOverflow :title="props.title || $t('questionnaireInbox.sendQuestionnaire')" :show="props.isModalOpen"
        @close="closeModal">
        <template #modal-body>
            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div v-if="!props.citizenUuid" class="space-y-1">
                    <FormLabel for="send_citizen" :label="$t('questionnaireInbox.send.patient')" />
                    <!-- Mounted per opening, so the search field has focus. -->
                    <FormCitizenPicker v-if="props.isModalOpen" id="send_citizen" :single="true"
                        :placeholder="$t('questionnaireInbox.send.searchPatient')"
                        :options="state.citizenOptions" :modelValue="state.citizenUuid"
                        @update:modelValue="onPatientPicked" />
                </div>

                <LoadingSpinner :isActive="state.isLoadingOptions"
                    :class="state.isLoadingOptions && !sendOptions ? 'min-h-24' : ''">
                    <div v-if="state.citizenUuid && sendOptions" class="space-y-5">
                        <Alert v-if="!hasAnythingToSend && !canCreateTemplate" type="warning"
                            :text="$t('questionnaireInbox.send.nothingToSend')" />

                        <div class="space-y-2">
                            <FormLabel for="questionnaire_uuid"
                                :label="hasSurveyChoice ? $t('questionnaireInbox.send.chooseQuestionnaire') : $t('patientForms.chooseForm')" />
                            <FormSelect id="questionnaire_uuid" :options="questionnaireOptions"
                                v-model="state.selected" />
                            <p v-if="pendingNotice" class="text-sm text-amber-700">{{ pendingNotice }}</p>
                            <button v-if="pendingResendUuid" type="button"
                                class="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                                :disabled="state.isResending" @click="resendPending">
                                {{ $t('patientForms.resend') }}
                            </button>
                            <button v-if="canCreateTemplate" type="button"
                                class="block text-sm font-medium text-primary hover:underline disabled:opacity-50"
                                :disabled="state.isCreatingTemplate" @click="createConsentTemplate">
                                {{ $t('patientForms.consentTemplate.create') }}
                            </button>
                        </div>

                        <div v-if="isSurvey" class="space-y-2">
                            <p class="text-sm text-gray-500">{{ $t('questionnaireInbox.send.surveyPortalNote') }}</p>
                            <Alert v-if="!citizen?.has_system_access" type="warning"
                                :text="$t('questionnaireInbox.send.noPortalAccess')" />
                        </div>

                        <fieldset v-else-if="showDelivery" class="space-y-2">
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

                        <div v-if="isLinkDelivery && showDelivery" class="space-y-2">
                            <FormLabel for="recipient"
                                :label="state.delivery === 'sms' ? $t('patientForms.phone') : $t('patientForms.email')" />
                            <FormTextField id="recipient" name="recipient" v-model="state.recipient" />
                            <Alert v-if="!citizen?.has_birthday" type="warning" :text="$t('patientForms.birthdayMissing')" />
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="button" buttonStyle="primary" :disabled="!canSubmit || state.isSending"
                    @click="send">
                    {{ $t('patientForms.send') }}
                </FormButton>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { questionnaireInboxService } from '@/components/api/user/QuestionnaireInboxService'
import { formService } from '@/components/api/user/FormService'
import { surveyService } from '@/components/api/user/SurveyService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    // On a patient's record: the patient to send to. Empty (the inbox): a patient picker comes first.
    citizenUuid: {
        type: String,
        default: '',
    },
    // A form to have picked when the modal opens (e.g. back from the form builder).
    preselectFormUuid: {
        type: String,
        default: '',
    },
    // Off where only forms belong (the patient's Forms tab, which has its own Surveys tab).
    allowSurveys: {
        type: Boolean,
        default: true,
    },
    title: {
        type: String,
        default: '',
    },
    // The success toast. Off where the page shows its own.
    showToast: {
        type: Boolean,
        default: true,
    },
})

// `sent` carries { type: 'form' | 'survey', resent: boolean, citizenUuid, citizenName }.
const emit = defineEmits(['close', 'sent'])

const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const { build: buildConsentTemplate } = useConsentFormTemplate()

const state = reactive({
    error: {} as Error,
    isLoadingOptions: false,
    isSending: false,
    isResending: false,
    isCreatingTemplate: false,
    citizenUuid: '' as string,
    citizenOptions: [] as any[],
    options: null as any,
    // 'form:<uuid>' or 'survey:<uuid>'.
    selected: '' as string | null,
    delivery: 'email' as 'portal' | 'email' | 'sms',
    recipient: '',
})

const sendOptions = computed(() => state.options)
const citizen = computed(() => state.options?.citizen ?? null)

const forms = computed<any[]>(() => (sendOptions.value?.can_send_forms ? sendOptions.value?.forms ?? [] : []))
const surveys = computed<any[]>(() =>
    (props.allowSurveys && sendOptions.value?.can_send_surveys ? sendOptions.value?.surveys ?? [] : []))
const hasSurveyChoice = computed(() => surveys.value.length > 0)
const hasAnythingToSend = computed(() => forms.value.length > 0 || surveys.value.length > 0)
const canCreateTemplate = computed(() => !!sendOptions.value?.can_send_forms)

const selectedKey = computed(() => state.selected || '')
const selectedKind = computed(() => selectedKey.value.split(':')[0])
const selectedUuid = computed(() => selectedKey.value.split(':')[1] ?? '')
const selectedForm = computed(() =>
    selectedKind.value === 'form' ? forms.value.find((form: any) => form.uuid === selectedUuid.value) ?? null : null)
const selectedSurvey = computed(() =>
    selectedKind.value === 'survey' ? surveys.value.find((survey: any) => survey.uuid === selectedUuid.value) ?? null : null)
const isSurvey = computed(() => !!selectedSurvey.value)

const questionnaireOptions = computed(() => {
    const suffix = (kind: 'form' | 'survey') => hasSurveyChoice.value ? ` (${t(`questionnaireInbox.type.${kind}`)})` : ''
    const pendingText = (pending: any) => pending === 'waiting'
        ? ` - ${t('questionnaireInbox.send.alreadySent')}`
        : pending === 'expired' ? ` - ${t('questionnaireInbox.send.expired')}` : ''
    return [
        ...forms.value.map((form: any) => ({
            value: `form:${form.uuid}`,
            // Selectable even when already waiting: picking it explains why it cannot be sent again and
            // offers Resend instead (Send stays off, see canSubmit).
            label: `${form.title}${suffix('form')}${pendingText(form.pending)}`,
        })),
        ...surveys.value.map((survey: any) => ({
            value: `survey:${survey.uuid}`,
            label: `${survey.title}${suffix('survey')}${pendingText(survey.pending)}`,
        })),
    ]
})

// A form already out for an answer: say so, and offer a new link where there is a message to resend.
const pendingNotice = computed(() => {
    const pending = selectedForm.value?.pending ?? selectedSurvey.value?.pending
    if (pending === 'waiting') return t('questionnaireInbox.send.alreadySentHint')
    if (pending === 'expired') return t('questionnaireInbox.send.expiredHint')
    return ''
})
// Only a link (email or SMS) can be resent; a form waiting in the portal cannot.
const pendingResendUuid = computed<string>(() =>
    ['email', 'sms'].includes(selectedForm.value?.pending_delivery) ? selectedForm.value?.pending_assignment_uuid ?? '' : '')

// A form already waiting is not sent again, so how to send it is not asked.
const showDelivery = computed(() => !!selectedForm.value && selectedForm.value.pending !== 'waiting')

const isLinkDelivery = computed(() => !isSurvey.value && (state.delivery === 'email' || state.delivery === 'sms'))

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
    if (!state.citizenUuid || !sendOptions.value) return false
    if (isSurvey.value) return selectedSurvey.value?.pending !== 'waiting'
    if (!selectedForm.value || selectedForm.value.pending === 'waiting') return false
    if (isLinkDelivery.value) return !!citizen.value?.has_birthday && state.recipient.trim() !== ''
    return true
})

function citizenName(): string {
    return [citizen.value?.firstname, citizen.value?.lastname].filter(Boolean).join(' ')
}

function prefillRecipient() {
    state.recipient = state.delivery === 'sms'
        ? (citizen.value?.phone ?? '')
        : state.delivery === 'email' ? (citizen.value?.email ?? '') : ''
}

// Switching back to a form after a survey: the recipient is still what it was, or empty if it never was set.
watch(() => state.selected, () => {
    if (state.recipient === '') prefillRecipient()
})

let optionsRequest = 0

async function loadSendOptions(keepSelection = false) {
    const request = ++optionsRequest
    const uuid = state.citizenUuid
    if (!uuid) return
    state.isLoadingOptions = true
    try {
        const response = await questionnaireInboxService.getSendOptions(uuid)
        // A slower answer for a patient picked earlier must not overwrite the current one.
        if (request !== optionsRequest) return
        state.options = response?.data ?? null
        if (!keepSelection) {
            state.selected = ''
            state.delivery = canUsePortal.value ? 'portal' : 'email'
            prefillRecipient()
            const preselect = props.preselectFormUuid
            if (preselect && forms.value.some((form: any) => form.uuid === preselect && form.pending !== 'waiting')) {
                state.selected = `form:${preselect}`
            }
        }
    } catch (error: any) {
        if (request !== optionsRequest) return
        state.options = null
        state.error = error
    }
    if (request === optionsRequest) state.isLoadingOptions = false
}

async function loadPatients() {
    if (state.citizenOptions.length) return
    try {
        const response = await citizenService.getAllCitizensPerCurrentUserAssignment({})
        if (response?.data) {
            state.citizenOptions = response.data.map((person: any) => ({
                value: person?.uuid,
                label: `${person?.firstname ?? ''} ${person?.lastname ?? ''}`.trim(),
                // Read by the citizen picker: pinned citizens on top.
                pinned: !!person?.is_pinned,
                departments: person?.departments ?? [],
                // Searchable by CPR. Left out of the list by the server for those who may not see it.
                cpr: person?.social_security_number ?? null,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

function onPatientPicked(uuid: string) {
    state.citizenUuid = uuid || ''
    state.error = {}
    state.options = null
    state.selected = ''
    optionsRequest++
    state.isLoadingOptions = false
    if (state.citizenUuid) loadSendOptions()
}

watch(() => props.isModalOpen, (open: boolean) => {
    if (!open) return
    state.error = {}
    state.options = null
    state.selected = ''
    state.citizenUuid = props.citizenUuid || ''
    if (state.citizenUuid) loadSendOptions()
    else loadPatients()
}, { immediate: true })

function closeModal() {
    emit('close')
}

/** Creates the ready-made consent form in Forms and picks it, so it can be sent straight away. */
async function createConsentTemplate() {
    state.error = {}
    state.isCreatingTemplate = true
    try {
        const response = await formService.saveForm(buildConsentTemplate())
        if (response?.data?.uuid) {
            await loadSendOptions(true)
            state.selected = `form:${response.data.uuid}`
            successAlert(`${t('alert.success')}!`, t('patientForms.consentTemplate.created'))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isCreatingTemplate = false
}

async function send() {
    state.error = {}
    state.isSending = true
    const kind = isSurvey.value ? 'survey' : 'form'
    try {
        const response = isSurvey.value
            ? await surveyService.saveAssignment(selectedUuid.value, { citizen_uuid: state.citizenUuid })
            : await formService.sendFormToPatient(selectedUuid.value, {
                citizen_uuid: state.citizenUuid,
                delivery: state.delivery,
                recipient: isLinkDelivery.value ? state.recipient.trim() : null,
            })
        if (response?.data) {
            if (props.showToast) {
                successAlert(`${t('alert.success')}!`, kind === 'survey'
                    ? `${t('surveys.alert.sent')}.`
                    : t(`patientForms.sentAlert${isLinkDelivery.value ? 'Link' : ''}`))
            }
            emit('sent', { type: kind, resent: false, citizenUuid: state.citizenUuid, citizenName: citizenName() })
            emit('close')
        }
    } catch (error: any) {
        state.error = error
        // Most likely "already sent": read what is waiting now, so Resend can be offered.
        await loadSendOptions(true)
    }
    state.isSending = false
}

async function resendPending() {
    if (!pendingResendUuid.value) return
    state.error = {}
    state.isResending = true
    try {
        const response = await questionnaireInboxService.resend(pendingResendUuid.value)
        if (response?.data) {
            if (props.showToast) successAlert(`${t('alert.success')}!`, t('patientForms.resentAlert'))
            emit('sent', { type: 'form', resent: true, citizenUuid: state.citizenUuid, citizenName: citizenName() })
            emit('close')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isResending = false
}
</script>
