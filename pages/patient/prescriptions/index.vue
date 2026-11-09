<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ $t('patientPrescriptions.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('patientPrescriptions.title') }}</template>

            <div class="mt-2 space-y-8" data-testid="patient-prescriptions">
                <p class="text-sm text-gray-500 max-w-2xl">{{ $t('patientPrescriptions.intro') }}</p>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <section class="space-y-3">
                        <p class="text-xs font-bold text-primary uppercase tracking-widest">{{ $t('patientPrescriptions.yourPrescriptions') }}</p>

                        <Alert v-if="state.prescriptions.length === 0 && !state.isLoading" type="info"
                            :text="$t('patientPrescriptions.empty')" />

                        <div v-for="prescription in state.prescriptions" :key="prescription.uuid"
                            class="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex flex-wrap items-center justify-between gap-3"
                            :data-testid="`patient-prescription-${prescription.uuid}`">
                            <div class="space-y-1">
                                <p class="font-semibold text-gray-900 flex items-center gap-2">
                                    <Icon name="ph:pill" class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    {{ prescription.name ?? '-' }}
                                    <span v-if="strengthOf(prescription)" class="font-normal text-gray-500">{{ strengthOf(prescription) }}</span>
                                </p>
                                <p v-if="prescription.end_date" class="text-sm text-gray-500">
                                    {{ $t('patientPrescriptions.validUntil', { date: formatDate(prescription.end_date) }) }}
                                </p>
                                <p v-if="prescription.open_request" class="text-sm text-gray-600">
                                    <span :class="['badge', renewalBadgeClass(prescription.open_request.status)]">
                                        {{ $t(`patientPrescriptions.statuses.${prescription.open_request.status}`) }}
                                    </span>
                                </p>
                            </div>

                            <FormButton v-if="patientRenewalAction(prescription) === 'request'" type="button" buttonStyle="action"
                                :data-testid="`request-renewal-${prescription.uuid}`" @click="openRequest(prescription)">
                                <Icon name="ph:arrows-clockwise" class="size-4" aria-hidden="true" />
                                {{ $t('patientPrescriptions.requestRenewal') }}
                            </FormButton>
                            <FormButton v-else-if="patientRenewalAction(prescription) === 'answer'" type="button" buttonStyle="primary"
                                @click="answer(prescription.open_request.survey_assignment_uuid)">
                                <Icon name="ph:clipboard-text" class="size-4" aria-hidden="true" />
                                {{ $t('patientPrescriptions.answerQuestionnaire') }}
                            </FormButton>
                        </div>
                    </section>

                    <!-- A prescription the patient does not have yet. Shown when the clinic linked a questionnaire to it. -->
                    <section v-if="state.newPrescription?.available || state.newPrescription?.open_request"
                        class="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex flex-wrap items-center justify-between gap-3 mt-8"
                        data-testid="new-prescription">
                        <div class="space-y-1">
                            <p class="font-semibold text-gray-900 flex items-center gap-2">
                                <Icon name="ph:prescription" class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                {{ $t('patientPrescriptions.newPrescription') }}
                            </p>
                            <p v-if="!state.newPrescription?.open_request" class="text-sm text-gray-500">
                                {{ $t('patientPrescriptions.newIntro') }}
                            </p>
                            <p v-else class="text-sm text-gray-600">
                                <span :class="['badge', renewalBadgeClass(state.newPrescription.open_request.status)]">
                                    {{ $t(`patientPrescriptions.statuses.${state.newPrescription.open_request.status}`) }}
                                </span>
                            </p>
                        </div>
                        <FormButton v-if="!state.newPrescription?.open_request" type="button" buttonStyle="action"
                            data-testid="request-new-prescription" @click="openRequest(null)">
                            <Icon name="ph:plus" class="size-4" aria-hidden="true" />
                            {{ $t('patientPrescriptions.requestNew') }}
                        </FormButton>
                        <FormButton
                            v-else-if="state.newPrescription.open_request.status === 'awaiting_answers' && state.newPrescription.open_request.survey_assignment_uuid"
                            type="button" buttonStyle="primary"
                            @click="answer(state.newPrescription.open_request.survey_assignment_uuid)">
                            <Icon name="ph:clipboard-text" class="size-4" aria-hidden="true" />
                            {{ $t('patientPrescriptions.answerQuestionnaire') }}
                        </FormButton>
                    </section>

                    <section v-if="state.renewals.length > 0" class="space-y-3 mt-8">
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ $t('patientPrescriptions.yourRequests') }}</p>
                        <div v-for="renewal in state.renewals" :key="renewal.uuid"
                            class="bg-white rounded-2xl border border-gray-200 px-5 py-4 space-y-1">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <p class="font-semibold text-gray-900">
                                    {{ renewal.is_new_prescription ? $t('patientPrescriptions.newPrescription') : (renewal.medicine?.name ?? '-') }}
                                </p>
                                <span :class="['badge', renewalBadgeClass(renewal.status)]">
                                    {{ renewal.is_new_prescription && renewal.status === 'prescribed'
                                        ? $t('patientPrescriptions.prescribedNew')
                                        : $t(`patientPrescriptions.statuses.${renewal.status}`) }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-500">{{ $t('patientPrescriptions.requestedOn', { date: formatDate(renewal.created_at) }) }}</p>
                            <p v-if="renewal.review_note" class="text-sm text-gray-700 whitespace-pre-line">
                                {{ $t('patientPrescriptions.clinicNote') }}: {{ renewal.review_note }}
                            </p>
                        </div>
                    </section>
                </LoadingSpinner>
            </div>

            <Modal size="md"
                :title="state.request.prescription ? $t('patientPrescriptions.requestRenewal') : $t('patientPrescriptions.requestNew')"
                :show="state.request.isOpen" @close="state.request.isOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <p class="text-sm text-gray-700">
                            {{ state.request.prescription
                                ? $t('patientPrescriptions.confirm', { medicine: state.request.prescription?.name ?? '-' })
                                : $t('patientPrescriptions.confirmNew') }}
                        </p>
                        <p v-if="!state.request.prescription || state.request.prescription?.has_questionnaire" class="text-sm text-gray-500">
                            {{ state.request.prescription ? $t('patientPrescriptions.questionnaireNext') : $t('patientPrescriptions.questionnaireNextNew') }}
                        </p>
                        <div class="space-y-1">
                            <FormLabel for="renewal_note" :label="$t('patientPrescriptions.noteLabel')" />
                            <FormTextArea id="renewal_note" name="renewal_note" :rows="3" v-model="state.request.note"
                                :placeholder="state.request.prescription ? $t('patientPrescriptions.notePlaceholder') : $t('patientPrescriptions.notePlaceholderNew')" />
                        </div>
                        <Alert type="danger" :text="state.request.error?.message" v-if="state.request.error?.message" />
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="state.request.isOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="state.request.isSaving"
                                data-testid="send-renewal-request" @click="sendRequest">
                                {{ $t('patientPrescriptions.send') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { patientPrescriptionService } from '@/components/api/patient/PrescriptionService'
import { patientRenewalAction, renewalBadgeClass } from '@/composables/prescriptionRenewals'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as any,
    isLoading: false,
    prescriptions: [] as any[],
    renewals: [] as any[],
    // { available, open_request }: "Request a new prescription", when the clinic linked a questionnaire to it.
    newPrescription: null as any,
    request: {
        isOpen: false,
        isSaving: false,
        prescription: null as any,
        note: '',
        error: {} as any,
    },
})

onMounted(fetchAll)

async function fetchAll() {
    state.error = {}
    state.isLoading = true
    try {
        const [prescriptions, renewals] = await Promise.all([
            patientPrescriptionService.getPrescriptions(),
            patientPrescriptionService.getRenewals(),
        ])
        state.prescriptions = prescriptions?.data ?? []
        state.newPrescription = prescriptions?.new_prescription ?? null
        state.renewals = renewals?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function strengthOf(prescription: any) {
    return [prescription.strength, prescription.mass_unit].filter(Boolean).join(' ')
}

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}

function openRequest(prescription: any) {
    state.request.prescription = prescription
    state.request.note = ''
    state.request.error = {}
    state.request.isOpen = true
}

function answer(assignmentUuid: string) {
    navigateTo({ path: `/patient/surveys/${assignmentUuid}`, query: { from: 'prescriptions' } })
}

// With no prescription the request is for a new one ("Request a new prescription").
async function sendRequest() {
    state.request.error = {}
    state.request.isSaving = true
    try {
        const note = state.request.note || undefined
        const response = state.request.prescription
            ? await patientPrescriptionService.requestRenewal({ citizen_medicine_uuid: state.request.prescription.uuid, note })
            : await patientPrescriptionService.requestNewPrescription({ note })
        const renewal = response?.data
        if (renewal) {
            state.request.isOpen = false
            // With a questionnaire the patient goes straight on to it; without one the request is with the clinic.
            if (renewal.status === 'awaiting_answers' && renewal.survey_assignment_uuid) {
                answer(renewal.survey_assignment_uuid)
            } else {
                successAlert(`${t('alert.success')}!`, t('patientPrescriptions.sent'))
                await fetchAll()
            }
        }
    } catch (error: any) {
        state.request.error = error
    }
    state.request.isSaving = false
}
</script>
