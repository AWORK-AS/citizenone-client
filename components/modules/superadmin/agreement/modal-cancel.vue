<template>
    <Modal size="sm" :title="$t('superadmin.agreements.cancel.title')" titleIcon="ph:prohibit" :show="props.isModalOpen"
        @close="$emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isSaving">
                <div class="space-y-4">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div>
                        <SuperadminFormLabel :label="$t('superadmin.agreements.detail.cancelDate')" required />
                        <input type="date" class="co-input" v-model="state.cancelledAt" />
                    </div>

                    <Tooltip :text="$t('superadmin.agreements.cancel.accelerateHelp')" position="top" wrap>
                        <label class="inline-flex items-center gap-2 text-sm text-[#1F2533] cursor-pointer">
                            <input type="checkbox" class="rounded border-[#D5D9E2]" v-model="state.accelerate" />
                            {{ $t('superadmin.agreements.cancel.accelerate') }}
                        </label>
                    </Tooltip>

                    <!-- What will happen, from the server -->
                    <div class="rounded-lg border border-[#EAECF0] bg-[#F9FAFB] px-3 py-2.5 text-[13px] text-[#1F2533] min-h-[44px]">
                        <Icon v-if="state.isPreviewing" name="ph:spinner" class="w-4 h-4 text-[#42AED9] animate-spin"
                            aria-hidden="true" />
                        <p v-else-if="state.previewError" class="text-[#CC3B2D]">{{ state.previewError }}</p>
                        <p v-else-if="state.accelerate && preview">
                            {{ $t('superadmin.agreements.cancel.previewAccelerated', {
                                amount: formatAmount(preview.amount, 'DKK'), count: preview.count }) }}
                        </p>
                        <p v-else-if="preview">
                            {{ $t('superadmin.agreements.cancel.previewAsPlanned', {
                                date: formatDateToReadable(preview.endsOn || props.agreement?.ends_on || '') }) }}
                        </p>
                    </div>

                    <div class="flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]"
                        role="alert">
                        <Icon name="ph:warning" class="w-4 h-4 mt-px flex-shrink-0" aria-hidden="true" />
                        <p>{{ $t('superadmin.agreements.cancel.warning') }}</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton type="button" buttonStyle="cancel" @click="$emit('close')">{{ $t('cancel') }}</FormButton>
                        <FormButton type="button" buttonStyle="danger" class="w-full" :disabled="!state.cancelledAt || state.isPreviewing"
                            @click="confirm">
                            {{ $t('superadmin.agreements.cancel.confirm') }}
                        </FormButton>
                    </div>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { agreementService } from '@/components/api/superadmin/AgreementService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { unwrapData } from '@/composables/agreements'
import type { Agreement } from '@/types/agreement'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    agreement: { type: Object as () => Agreement | null, default: null },
})
const emit = defineEmits(['close', 'cancelled'])

const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    cancelledAt: '',
    accelerate: false,
    isPreviewing: false,
    isSaving: false,
    error: {} as Error,
    previewError: '',
    previewData: null as any,
})

/**
 * The preview body is read tolerantly: the amount to invoice now and the number of
 * installments gathered into it, plus ends_on for the "as planned" text.
 */
const preview = computed(() => {
    const body = state.previewData
    if (!body) return null
    return {
        amount: Number(body.accelerated_amount ?? body.amount ?? body.remaining_amount ?? 0),
        count: Number(body.accelerated_count ?? body.installments_count ?? body.count ?? body.installments?.length ?? 0),
        endsOn: body.ends_on as string | undefined,
    }
})

watch(() => props.isModalOpen, (open: boolean) => {
    if (!open) return
    state.error = {}
    state.previewData = null
    state.previewError = ''
    state.cancelledAt = moment().format('YYYY-MM-DD')
    state.accelerate = isBeforeEnd()
    runPreview()
})

function isBeforeEnd(): boolean {
    return !!props.agreement?.ends_on && !!state.cancelledAt && state.cancelledAt < props.agreement.ends_on
}

// Moving the date across ends_on flips the default, as long as nobody has chosen.
let touched = false
watch(() => state.accelerate, () => { if (props.isModalOpen) touched = true })
watch(() => state.cancelledAt, () => {
    if (!props.isModalOpen) return
    if (!touched) state.accelerate = isBeforeEnd()
    runPreview()
})
watch(() => props.isModalOpen, (open: boolean) => { if (open) touched = false })
watch(() => state.accelerate, () => { if (props.isModalOpen) runPreview() })

let seq = 0
async function runPreview() {
    if (!props.agreement || !state.cancelledAt) return
    const mine = ++seq
    state.isPreviewing = true
    state.previewError = ''
    try {
        const response = await agreementService.cancelAgreement(
            props.agreement.uuid,
            { cancelled_at: state.cancelledAt, accelerate_remaining: state.accelerate },
            true,
        )
        if (mine !== seq) return
        state.previewData = unwrapData(response)
    } catch (error: any) {
        if (mine !== seq) return
        state.previewData = null
        state.previewError = error?.message ?? ''
    }
    if (mine === seq) state.isPreviewing = false
}

async function confirm() {
    if (!props.agreement) return
    state.error = {}
    state.isSaving = true
    try {
        const response = await agreementService.cancelAgreement(props.agreement.uuid, {
            cancelled_at: state.cancelledAt,
            accelerate_remaining: state.accelerate,
        })
        emit('cancelled', unwrapData(response))
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
