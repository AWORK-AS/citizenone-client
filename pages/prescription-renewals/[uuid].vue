<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('prescriptionRenewals.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('prescriptionRenewals.detail.title') }}</template>

            <div class="mt-8 space-y-5 max-w-4xl" data-testid="prescription-renewal">
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="renewal" class="space-y-5">
                        <div class="bg-white rounded-2xl border border-gray-200 px-6 py-5 space-y-4">
                            <div class="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p class="text-xs font-bold text-primary uppercase tracking-widest">{{ $t('prescriptionRenewals.columns.patient') }}</p>
                                    <NuxtLink :to="`/citizens/${renewal.citizen?.uuid}/medicine-journals`"
                                        class="text-lg font-semibold text-gray-900 hover:underline">
                                        {{ citizenName }}
                                    </NuxtLink>
                                </div>
                                <span :class="['badge', renewalBadgeClass(renewal.status)]" data-testid="renewal-status">
                                    {{ $t(`prescriptionRenewals.statuses.${renewal.status}`) }}
                                </span>
                            </div>

                            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <dt class="text-gray-500">{{ $t('prescriptionRenewals.columns.medicine') }}</dt>
                                    <dd class="font-medium text-gray-900">{{ renewal.medicine?.name ?? '-' }}</dd>
                                </div>
                                <div v-if="renewal.current_prescription">
                                    <dt class="text-gray-500">{{ $t('prescriptionRenewals.detail.currentPrescription') }}</dt>
                                    <dd class="font-medium text-gray-900">
                                        {{ currentPrescriptionLabel }}
                                    </dd>
                                </div>
                                <div v-if="renewal.current_prescription?.end_date">
                                    <dt class="text-gray-500">{{ $t('prescriptionRenewals.detail.endsOn') }}</dt>
                                    <dd class="font-medium text-gray-900">{{ formatDate(renewal.current_prescription.end_date) }}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-500">{{ $t('prescriptionRenewals.columns.received') }}</dt>
                                    <dd class="font-medium text-gray-900">{{ formatDateToReadable(renewal.submitted_at ?? renewal.created_at) }}</dd>
                                </div>
                            </dl>

                            <div v-if="renewal.patient_note" class="rounded-lg bg-gray-50 px-4 py-3">
                                <p class="text-xs text-gray-500">{{ $t('prescriptionRenewals.detail.patientNote') }}</p>
                                <p class="text-sm text-gray-800 whitespace-pre-line">{{ renewal.patient_note }}</p>
                            </div>
                        </div>

                        <!-- The questionnaire the request was sent with, as the patient answered it. -->
                        <div class="bg-white rounded-2xl border border-gray-200 px-6 py-5 space-y-3" data-testid="renewal-questionnaire">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <p class="text-xs font-bold text-primary uppercase tracking-widest">
                                    {{ $t('prescriptionRenewals.detail.questionnaire') }}
                                </p>
                                <span v-if="hasScore" class="text-sm bg-gray-100 rounded-md px-3 py-1">
                                    {{ $t('surveys.score') }}: <span class="font-bold">{{ questionnaire.score }}</span>
                                    <span v-if="scoreText"> - {{ scoreText }}</span>
                                </span>
                            </div>
                            <template v-if="questionnaire">
                                <p class="font-semibold text-gray-900">{{ questionnaire.survey?.title }}</p>
                                <p v-if="questionnaire.status !== 'completed'" class="text-sm text-gray-500">
                                    {{ $t('prescriptionRenewals.detail.notAnsweredYet') }}
                                </p>
                                <div v-for="(entry, index) in answerEntries" :key="index" class="bg-gray-50 rounded-md p-4 space-y-1">
                                    <p class="text-sm text-gray-500">{{ index + 1 }}. {{ entry.question }}</p>
                                    <p class="font-medium whitespace-pre-line">{{ entry.answer }}</p>
                                </div>
                            </template>
                            <p v-else class="text-sm text-gray-500">{{ $t('prescriptionRenewals.detail.noQuestionnaire') }}</p>
                        </div>

                        <div v-if="renewal.reviewed_at" class="bg-white rounded-2xl border border-gray-200 px-6 py-5 space-y-1 text-sm">
                            <p class="text-xs font-bold text-primary uppercase tracking-widest">{{ $t('prescriptionRenewals.detail.decision') }}</p>
                            <p class="text-gray-700">
                                {{ $t('prescriptionRenewals.detail.decidedBy', { name: reviewerName, date: formatDateToReadable(renewal.reviewed_at) }) }}
                            </p>
                            <p v-if="renewal.review_note" class="text-gray-800 whitespace-pre-line">{{ renewal.review_note }}</p>
                        </div>

                        <!-- Waiting for staff: approve with an optional note, or reject with a reason for the patient. -->
                        <div v-if="canDecide(renewal.status)" class="bg-white rounded-2xl border border-gray-200 px-6 py-5 space-y-3">
                            <FormLabel for="renewal_note" :label="$t('prescriptionRenewals.detail.noteToPatient')" />
                            <FormTextArea id="renewal_note" name="renewal_note" :rows="3" v-model="state.note"
                                :placeholder="$t('prescriptionRenewals.detail.notePlaceholder')" />
                            <FormError :error="state.error?.errors?.note?.[0]" />
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="danger" :disabled="state.isSaving"
                                    data-testid="renewal-reject" @click="reject">
                                    <Icon name="ph:x-circle" class="size-4" aria-hidden="true" />
                                    {{ $t('prescriptionRenewals.detail.reject') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving"
                                    data-testid="renewal-approve" @click="approve">
                                    <Icon name="ph:check-circle" class="size-4" aria-hidden="true" />
                                    {{ $t('prescriptionRenewals.detail.approve') }}
                                </FormButton>
                            </div>
                        </div>

                        <div v-if="canPrescribe(renewal.status)" class="bg-secondary/5 rounded-2xl border border-secondary/30 px-6 py-5 flex flex-wrap items-center justify-between gap-3">
                            <p class="text-sm text-gray-700">{{ $t('prescriptionRenewals.detail.prescribeHelp') }}</p>
                            <FormButton type="button" buttonStyle="primary" data-testid="renewal-prescribe" @click="prescribe">
                                <Icon name="ph:prescription" class="size-4" aria-hidden="true" />
                                {{ $t('prescriptionRenewals.detail.prescribe') }}
                            </FormButton>
                        </div>

                        <div v-if="renewal.status === 'prescribed' && renewal.citizen?.uuid" class="text-sm">
                            <NuxtLink :to="`/citizens/${renewal.citizen.uuid}/medicine-journals`" class="text-primary hover:underline">
                                {{ $t('prescriptionRenewals.detail.openMedicineCard') }}
                            </NuxtLink>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { prescriptionRenewalService } from '@/components/api/user/PrescriptionRenewalService'
import { canDecide, canPrescribe, prescribeLink, renewalBadgeClass } from '@/composables/prescriptionRenewals'
import { visibleSurveyQuestions } from '@/composables/surveyFollowUps'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const route = useRoute()
const renewalUuid = String(route.params.uuid)

const breadcrumbLinks = [
    { name: 'prescriptionRenewals.title', translate: true, href: '/prescription-renewals' },
    { name: 'prescriptionRenewals.detail.title', translate: true, href: `/prescription-renewals/${renewalUuid}` },
]

const state = reactive({
    isLoading: false,
    isSaving: false,
    error: {} as any,
    renewal: null as any,
    note: '',
})

watch(() => userStore.getUser, (user: any) => {
    if (user && user.can_review_prescription_renewals === false) navigateTo('/')
}, { immediate: true })

onMounted(fetchRenewal)

const renewal = computed(() => state.renewal)
const questionnaire = computed(() => state.renewal?.questionnaire ?? null)

const citizenName = computed(() =>
    [renewal.value?.citizen?.firstname, renewal.value?.citizen?.lastname].filter(Boolean).join(' ') || '-')

const reviewerName = computed(() =>
    [renewal.value?.reviewed_by?.firstname, renewal.value?.reviewed_by?.lastname].filter(Boolean).join(' ') || '-')

const currentPrescriptionLabel = computed(() => {
    const current = renewal.value?.current_prescription
    if (!current) return '-'
    const strength = [current.strength, current.mass_unit].filter(Boolean).join(' ')
    return [renewal.value?.medicine?.name, strength, current.dosage].filter(Boolean).join(', ')
})

const hasScore = computed(() => questionnaire.value?.score !== null && questionnaire.value?.score !== undefined)

const scoreText = computed(() => {
    const ranges = questionnaire.value?.survey?.score_ranges
    const score = questionnaire.value?.score
    if (!hasScore.value || !Array.isArray(ranges)) return ''
    return ranges.find((range: any) => Number(score) >= Number(range.from) && Number(score) <= Number(range.to) && range.label)?.label ?? ''
})

// Follow-ups the patient never saw are left out, as on the citizen's Surveys tab.
const answerEntries = computed(() => {
    const assignment = questionnaire.value
    if (!assignment || assignment.status !== 'completed') return []
    return visibleSurveyQuestions(assignment.survey?.questions ?? [], assignment.answers ?? {}).map((question: any) => {
        const definition = question.question ?? question
        return { question: definition?.value, answer: resolveAnswer(definition, assignment.answers?.[question.uuid]) }
    })
})

function resolveAnswer(definition: any, answer: any) {
    if (answer === undefined || answer === null || answer === '') return '-'
    if (definition?.type === 'choice') return definition?.options?.[answer] ?? '-'
    if (definition?.type === 'checkbox' && Array.isArray(answer)) return answer.map((index: any) => definition?.options?.[index]).filter(Boolean).join(', ') || '-'
    return String(answer)
}

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}

async function fetchRenewal() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await prescriptionRenewalService.getRequest(renewalUuid)
        state.renewal = response?.data ?? null
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function approve() {
    await decide(() => prescriptionRenewalService.approve(renewalUuid, { note: state.note || undefined }), 'prescriptionRenewals.detail.approved')
}

async function reject() {
    await decide(() => prescriptionRenewalService.reject(renewalUuid, { note: state.note }), 'prescriptionRenewals.detail.rejected')
}

async function decide(request: () => Promise<any>, message: string) {
    state.error = {}
    state.isSaving = true
    try {
        const response = await request()
        if (response?.data) {
            state.renewal = response.data
            state.note = ''
            successAlert(`${t('alert.success')}!`, t(message))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

function prescribe() {
    const link = prescribeLink(state.renewal)
    if (link) navigateTo(link)
}
</script>
