<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ headline }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ headline }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- What this inquiry is, and the two decisions that can be made
                     about it from here. -->
                <div class="flex flex-wrap items-start justify-between gap-3">
                    <p class="text-sm text-slate-500">{{ subline }}</p>
                    <div class="flex flex-wrap items-center gap-2">
                        <FormButton v-if="lostStage && !isLost" type="button" buttonStyle="cancel"
                            @click="moveTo(lostStage.slug)">
                            {{ $t('inquiryDetail.markAsLost') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="action"
                            @click="navigateTo(`/inquiries/${inquiryUuid}/match`)">
                            <Icon name="ph:magnifying-glass" class="size-4" />
                            {{ $t('consultantMatch.start') }}
                        </FormButton>
                        <FormButton v-if="!state.inquiry?.citizen_id" type="button" buttonStyle="primary"
                            @click="state.isConvertOpen = true">
                            <Icon name="ph:user-plus" class="size-4" />
                            {{ tt('inquiries.table.actions.convertAsCitizen') }}
                        </FormButton>
                        <span v-else
                            class="inline-flex items-center gap-1 rounded-full bg-[#e6f6ee] px-3 py-1.5 text-[13px] font-bold text-[#177a53]">
                            <Icon name="ph:check" class="size-4" />
                            {{ tt('inquiries.table.status.convertedAsCitizen') }}
                        </span>
                    </div>
                </div>

                <!-- Where the inquiry is in the pipeline, and what the next step is
                     waiting for. Both come from the server's own gate. -->
                <div class="rounded-lg border border-gray-200 bg-white p-5">
                    <ol class="flex items-start">
                        <li v-for="(stage, index) in state.stages" :key="stage.uuid"
                            class="flex flex-1 flex-col items-center">
                            <div class="flex w-full items-center">
                                <span class="h-0.5 flex-1"
                                    :class="index === 0 ? 'bg-transparent' : (stage.state === 'upcoming' ? 'bg-surface-200' : 'bg-secondary')" />
                                <button type="button"
                                    class="grid size-8 shrink-0 place-items-center rounded-full border-2 text-[13px] font-bold transition-colors"
                                    :class="stepClass(stage)" :disabled="stage.state === 'current'"
                                    :aria-label="stage.name" @click="moveTo(stage.slug)">
                                    <Icon v-if="stage.state === 'done'" name="ph:check" class="size-4" />
                                    <span v-else>{{ index + 1 }}</span>
                                </button>
                                <span class="h-0.5 flex-1"
                                    :class="index === state.stages.length - 1 ? 'bg-transparent' : (nextIsReached(index) ? 'bg-secondary' : 'bg-surface-200')" />
                            </div>
                            <span class="mt-2 px-1 text-center text-[12px] font-semibold"
                                :class="stage.state === 'upcoming' ? 'text-slate-400' : 'text-slate-700'">
                                {{ stage.name }}
                            </span>
                        </li>
                    </ol>

                    <p v-if="state.missingFields.length && state.nextStage"
                        class="mt-5 rounded-lg border border-dashed border-[#f0c4b8] bg-[#fdf1ee] px-3 py-2.5 text-[13px] text-[#c0442c]">
                        <Icon name="ph:warning" class="mr-1 inline size-4 align-text-bottom" />
                        {{ $t('inquiryDetail.nextStepLocked', {
                            stage: state.nextStage.name,
                            fields: state.missingFields.join(', '),
                        }) }}
                    </p>
                </div>

                <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <!-- Left: what was recorded, the fields this company asks
                         for, and the notes written along the way -->
                    <div class="space-y-5 lg:col-span-2">
                        <div class="rounded-lg border border-gray-200 bg-white p-5">
                            <ModulesUserInquiryDetailReview v-if="state.inquiry?.uuid" :inquiry="state.inquiry"
                                @edit="state.isEditOpen = true" @fieldsSaved="fetchAll" />
                        </div>
                        <div v-if="state.inquiry?.uuid" class="rounded-lg border border-gray-200 bg-white p-5">
                            <ModulesUserInquiryInvitationsPanel :inquiryUuid="state.inquiry.uuid" />
                        </div>
                        <div v-if="state.inquiry?.uuid" class="rounded-lg border border-gray-200 bg-white p-5">
                            <ModulesUserInquiryOfferPanel :inquiryUuid="state.inquiry.uuid" @changed="onOfferChanged" />
                        </div>
                        <div v-if="state.inquiry?.uuid" class="rounded-lg border border-gray-200 bg-white p-5">
                            <ModulesUserInquiryDocumentsPanel :inquiryUuid="state.inquiry.uuid" />
                        </div>
                        <!-- Agreed with the municipality now, carried to the indsats when it is won. -->
                        <ModulesUserRegistrationRulesPanel v-if="state.inquiry?.uuid" target="inquiry"
                            :uuid="state.inquiry.uuid" :canEdit="canManageRules" />
                        <div v-if="state.inquiry?.uuid" class="rounded-lg border border-gray-200 bg-white p-5">
                            <ModulesUserInquiryNotesPanel :inquiryUuid="state.inquiry.uuid"
                                :stages="state.stages" />
                        </div>
                        <div v-if="state.inquiry?.uuid" class="rounded-lg border border-gray-200 bg-white p-5">
                            <ModulesUserInquiryStageHistoryPanel ref="historyPanel" :inquiryUuid="state.inquiry.uuid"
                                :stages="state.stages" />
                        </div>
                    </div>

                    <!-- Right: who is involved, and where it can go next -->
                    <div class="space-y-5">
                        <div class="rounded-lg border border-gray-200 bg-white p-5">
                            <p class="mb-3 text-sm font-semibold text-gray-900">
                                {{ $t('inquiryDetail.parties') }}
                            </p>
                            <div v-if="state.inquiry?.company_contact" class="flex items-start gap-3 pb-3">
                                <span
                                    class="grid size-[22px] shrink-0 place-items-center rounded-[7px] bg-gradient-to-br from-[#8fd6ea] to-[#3aa7c4] text-[10px] font-bold text-white">
                                    {{ contactInitials }}
                                </span>
                                <div class="min-w-0">
                                    <p class="truncate text-[13px] font-semibold text-slate-800">
                                        {{ contactName }}
                                    </p>
                                    <p class="truncate text-[11px] text-slate-500">
                                        {{ [state.inquiry.company_contact.company_name, state.inquiry.company_contact.phone].filter(Boolean).join(' · ') }}
                                    </p>
                                </div>
                                <span
                                    class="ml-auto shrink-0 rounded-full bg-surface-100 px-2.5 py-[3px] text-[11.5px] font-bold text-slate-500">
                                    {{ $t('inquiryDetail.roles.contact') }}
                                </span>
                            </div>
                            <div v-if="citizenName" class="flex items-start gap-3 border-t border-surface-100 pt-3">
                                <span
                                    class="grid size-[22px] shrink-0 place-items-center rounded-[7px] bg-gradient-to-br from-[#c9b6f0] to-[#8b6fd0] text-[10px] font-bold text-white">
                                    {{ citizenInitials }}
                                </span>
                                <div class="min-w-0">
                                    <p class="truncate text-[13px] font-semibold text-slate-800">{{ citizenName }}</p>
                                    <p v-if="state.inquiry?.cpr" class="truncate text-[11px] text-slate-500">
                                        {{ state.inquiry.cpr }}
                                    </p>
                                </div>
                                <span
                                    class="ml-auto shrink-0 rounded-full bg-surface-100 px-2.5 py-[3px] text-[11.5px] font-bold text-slate-500">
                                    {{ $t('inquiryDetail.roles.recipient') }}
                                </span>
                            </div>
                            <p v-if="!state.inquiry?.company_contact && !citizenName" class="text-[13px] text-slate-400">
                                {{ $t('inquiryDetail.noParties') }}
                            </p>
                        </div>

                        <!-- A case that needs a consultant nobody has yet. Flagging it
                             tells the recruitment team, once. -->
                        <div v-if="state.inquiry?.uuid" class="rounded-lg border border-gray-200 bg-white p-5">
                            <div class="flex items-center justify-between gap-3">
                                <p class="text-sm font-semibold text-gray-900">
                                    {{ $t('inquiryRecruitment.needsRecruitment') }}
                                </p>
                                <FormSwitch :value="!!state.inquiry.needs_recruitment"
                                    @toggleSwitch="toggleNeedsRecruitment" />
                            </div>
                            <p class="mt-2 text-xs text-gray-400">
                                <template v-if="state.inquiry.recruitment_notified_at">
                                    {{ $t('inquiryRecruitment.notifiedAt', { date: formatDateToReadable(state.inquiry.recruitment_notified_at) }) }}
                                </template>
                                <template v-else>{{ $t('inquiryRecruitment.hint') }}</template>
                            </p>
                        </div>

                        <!-- Why it was lost, while it is. -->
                        <div v-if="isLost && (state.inquiry?.lost_reason || state.inquiry?.lost_reason_note || state.inquiry?.lost_estimated_price !== null)"
                            class="rounded-lg border border-[#f0c4b8] bg-[#fdf1ee] p-5 text-[13px] text-slate-700">
                            <p class="mb-2 text-sm font-semibold text-[#c0442c]">{{ $t('inquiryLost.detail.heading') }}</p>
                            <p v-if="state.inquiry?.lost_reason">
                                <span class="font-semibold">{{ $t('inquiryLost.modal.reason') }}:</span>
                                {{ state.inquiry.lost_reason.name }}
                            </p>
                            <p v-if="state.inquiry?.lost_estimated_price !== null && state.inquiry?.lost_estimated_price !== undefined">
                                <span class="font-semibold">{{ $t('inquiryLost.modal.price') }}:</span>
                                {{ formatAmount(state.inquiry.lost_estimated_price) }}
                            </p>
                            <p v-if="state.inquiry?.lost_reason_note" class="mt-1 whitespace-pre-line">
                                {{ state.inquiry.lost_reason_note }}
                            </p>
                        </div>

                        <div class="rounded-lg border border-gray-200 bg-white p-5">
                            <p class="mb-1 text-sm font-semibold text-gray-900">
                                {{ $t('inquiryDetail.moveHeading') }}
                            </p>
                            <p class="mb-3 text-xs text-gray-400">
                                {{ $t('inquiryDetail.moveHint') }}
                            </p>
                            <div class="space-y-2">
                                <button v-for="stage in state.stages" :key="'move-' + stage.uuid" type="button"
                                    class="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] font-semibold transition-colors"
                                    :class="stage.state === 'current'
                                        ? 'border-secondary bg-[#f0fafd] text-secondary'
                                        : 'border-surface-200 text-slate-600 hover:bg-surface-50'"
                                    :disabled="stage.state === 'current'" @click="moveTo(stage.slug)">
                                    <span class="size-[9px] rounded-[3px]" :style="{ background: stage.color }" />
                                    {{ stage.name }}
                                    <Icon v-if="stage.state === 'current'" name="ph:check-circle"
                                        class="ml-auto size-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ModulesUserInquiryModalEdit :isModalOpen="state.isEditOpen" :selectedInquiry="state.inquiry ?? {}"
                @close="state.isEditOpen = false" @refreshInquiries="fetchAll" />

            <ModulesUserInquiryModalMarkLost :isModalOpen="state.isLostOpen" @close="state.isLostOpen = false"
                @confirm="confirmLost" />

            <DialogConfirmation :isModalOpen="state.isConvertOpen"
                :message="$t('inquiries.table.confirmation.convertAsCitizenConfirmation') + '?'"
                @close="state.isConvertOpen = false" @confirm="convert" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { formLabel } from '@/composables/inquiryForms'
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { inquiryFieldService } from '@/components/api/user/InquiryFieldService'
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const customPagesStore = useCustomPagesStore() as any
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { tt } = useTerminology()
const { formatDateToReadable } = useDatetimeFormatter()
const { isAtLeast, can } = usePermissions()
// Same gate as the API: Admin or the update permission.
const canManageRules = computed(() => isAtLeast('Admin') || can('update'))

const inquiryUuid = String(route.params.inquiry_uuid)

const breadcrumbLinks = [
    {
        name: 'inquiries.inquiries',
        translate: true,
        href: '/inquiries',
    },
]

const state = reactive({
    error: {} as Error,
    inquiry: null as any,
    isConvertOpen: false,
    isEditOpen: false,
    isLostOpen: false,
    pendingLostSlug: '' as string,
    missingFields: [] as string[],
    nextStage: null as any,
    stages: [] as any[],
})

const shelterName = computed(() => customPagesStore.getCustomPagesName?.shelter || t('inquiries.form.options.inquiryType.shelter'))
const crisisCenterName = computed(() => customPagesStore.getCustomPagesName?.crisisCenter || t('inquiries.form.options.inquiryType.crisisCenter'))

const citizenName = computed(() =>
    `${state.inquiry?.firstname ?? ''} ${state.inquiry?.lastname ?? ''}`.trim()
)

const headline = computed(() => {
    const parts = [state.inquiry?.company_contact?.company_name, state.inquiry?.purpose || citizenName.value]
        .filter(Boolean)

    return parts.length ? parts.join(' · ') : t('inquiries.inquiries')
})

const subline = computed(() => [
    state.inquiry?.form
        ? formLabel(state.inquiry.form, { shelter: shelterName.value, crisisCenter: crisisCenterName.value })
        : state.inquiry?.inquiry_type === 'shelter' ? shelterName.value : crisisCenterName.value,
    state.inquiry?.origin ? t('inquiryOrigin.' + state.inquiry.origin) : '',
    state.inquiry?.source === 'website' ? t('inquiryIntake.fromWebsite') : '',
    state.inquiry?.inquiry_date ? formatDateToReadable(state.inquiry.inquiry_date) : '',
    state.inquiry?.inquirer_name,
].filter(Boolean).join(' · '))

const lostStage = computed(() => state.stages.find((stage: any) => stage.system_role === 'lost'))
const isLost = computed(() => state.stages.find((stage: any) => stage.state === 'current')?.system_role === 'lost')

const contactName = computed(() =>
    `${state.inquiry?.company_contact?.firstname ?? ''} ${state.inquiry?.company_contact?.lastname ?? ''}`.trim()
)
const contactInitials = computed(() => initialsOf(state.inquiry?.company_contact?.company_name || contactName.value))
const citizenInitials = computed(() => initialsOf(citizenName.value))

function initialsOf(value: string) {
    const parts = (value ?? '').split(/\s+/).filter((word: string) => /^\p{L}/u.test(word))

    if (!parts.length) return '?'

    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

function stepClass(stage: any) {
    if (stage.state === 'done') return 'border-secondary bg-secondary text-white'
    if (stage.state === 'current') return 'border-secondary bg-white text-secondary ring-4 ring-secondary/15'

    return 'border-surface-200 bg-surface-50 text-slate-400 hover:bg-surface-100'
}

// The connector after a step is only filled once the inquiry has actually passed
// the step that follows it.
function nextIsReached(index: number) {
    return state.stages[index + 1]?.state !== 'upcoming'
}

onMounted(() => {
    fetchAll()
})

async function fetchAll() {
    state.error = {}
    try {
        const [inquiry, gate] = await Promise.all([
            citizenInquiryService.getSelectedInquiry(inquiryUuid),
            inquiryFieldService.getStageGate(inquiryUuid),
        ])
        state.inquiry = inquiry?.data ?? null
        state.stages = gate?.data?.stages ?? []
        state.missingFields = gate?.data?.missing_fields ?? []
        state.nextStage = gate?.data?.next_stage ?? null
    } catch (error: any) {
        state.error = error
    }
}

const historyPanel = ref<any>(null)

// Sending or answering an offer moves the inquiry and writes to the decision
// log, so both are read again rather than left showing the old state.
async function onOfferChanged() {
    await fetchAll()
    historyPanel.value?.fetchHistory?.()
}

// Losing a case asks why first: the reason, a note and the estimated price.
function moveTo(slug: string) {
    const target = state.stages.find((stage: any) => stage.slug === slug)

    if (target?.system_role === 'lost') {
        state.pendingLostSlug = slug
        state.isLostOpen = true
        return
    }

    submitMove(slug)
}

function confirmLost(details: Record<string, any>) {
    state.isLostOpen = false
    submitMove(state.pendingLostSlug, details)
}

async function toggleNeedsRecruitment() {
    try {
        const response = await citizenInquiryService.updateNeedsRecruitment(inquiryUuid, !state.inquiry?.needs_recruitment)
        if (response?.data) {
            state.inquiry = response.data
            successAlert(`${t('alert.success')}!`, `${t('inquiryRecruitment.saved')}.`)
        }
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryPipeline.moveFailed'))
    }
}

function formatAmount(value: number) {
    return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(Number(value) || 0)
}

async function submitMove(slug: string, details: Record<string, any> = {}) {
    try {
        const response = await citizenInquiryService.updatePipelineStatus(inquiryUuid, { pipeline_status: slug, ...details })
        if (response?.data) {
            await fetchAll()
            // The move is itself a stage change; the panel reads its own list.
            historyPanel.value?.fetchHistory?.()
            successAlert(`${t('alert.success')}!`, `${t('inquiryPipeline.moved')}.`)
        }
    } catch (error: any) {
        // The refusal names the fields that are missing, and they are on this page.
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryPipeline.moveFailed'))
        await fetchAll()
    }
}

async function convert() {
    state.isConvertOpen = false
    try {
        const response = await citizenInquiryService.convertInquiry(inquiryUuid)
        if (response) {
            await fetchAll()
            successAlert(`${t('alert.success')}!`, `${t('inquiries.form.alert.inquirySuccessfullyConverted')}.`)
        }
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiries.form.alert.inquiryConversionFailed'))
    }
}
</script>
