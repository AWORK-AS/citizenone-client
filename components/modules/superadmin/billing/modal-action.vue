<template>
    <Modal size="xs" :title="title" titleIcon="ph:warning-circle" :show="props.isModalOpen" @close="$emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isSaving">
                <form class="space-y-3" @submit.prevent="submit">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <p class="text-sm text-[#1F2533] font-medium">
                        {{ $t('paymentDunning.problems.dialog.about', { company: props.row?.company_name ?? '', amount: formatAmount(props.row?.amount_outstanding ?? 0, 'DKK') }) }}
                    </p>
                    <p class="text-[13px] text-[#5C6478]">
                        {{ props.action ? $t(`paymentDunning.problems.help.${props.action}`) : '' }}
                    </p>

                    <div v-if="needsDays">
                        <SuperadminFormLabel :label="props.action === 'reopen' ? $t('paymentDunning.problems.dialog.daysLabelReopen') : $t('paymentDunning.problems.dialog.daysLabel')" required />
                        <Tooltip :text="$t('paymentDunning.problems.dialog.daysHelp')" position="top" wrap class="!block w-full">
                            <input type="number" min="1" max="90" step="1" v-model.number="state.days" class="co-input" :required="props.action === 'postpone'" />
                        </Tooltip>
                        <p v-if="state.invalid === 'days'" class="text-[12px] text-[#CC3B2D] mt-1" role="alert">
                            {{ $t('paymentDunning.problems.dialog.daysInvalid') }}
                        </p>
                    </div>

                    <p v-if="props.action === 'retry_unknown_charge'"
                        class="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[13px] font-medium text-[#B91C1C]" role="alert">
                        {{ $t('paymentDunning.problems.dialog.retryUnknownConfirm') }}
                    </p>
                    <p v-if="props.action === 'revoke_security_card'" class="text-[13px] text-[#B91C1C]">
                        {{ $t('paymentDunning.problems.dialog.revokeConfirm') }}
                    </p>
                    <p v-if="props.action === 'close'" class="text-[13px] text-[#B91C1C]">
                        {{ $t('paymentDunning.problems.dialog.closeConfirm') }}
                    </p>

                    <div v-if="takesNote">
                        <SuperadminFormLabel :label="needsNote ? $t('paymentDunning.problems.dialog.noteLabel') : `${$t('paymentDunning.problems.dialog.noteLabel')} (${$t('paymentDunning.problems.dialog.optional')})`" :required="needsNote" />
                        <Tooltip :text="$t('paymentDunning.problems.dialog.noteHelp')" position="top" wrap class="!block w-full">
                            <textarea v-model="state.note" rows="3" maxlength="500" class="co-input"
                                :placeholder="$t('paymentDunning.problems.dialog.notePlaceholder')" />
                        </Tooltip>
                        <p v-if="state.invalid === 'note'" class="text-[12px] text-[#CC3B2D] mt-1" role="alert">
                            {{ $t('paymentDunning.problems.dialog.noteRequired') }}
                        </p>
                    </div>

                    <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton type="button" buttonStyle="cancel" @click="$emit('close')">
                            {{ $t('paymentDunning.problems.dialog.cancel') }}
                        </FormButton>
                        <FormButton type="submit" :buttonStyle="destructive ? 'danger' : 'primary'" class="w-full">
                            {{ $t('paymentDunning.problems.dialog.confirm') }}
                        </FormButton>
                    </div>
                </form>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { billingService } from '@/components/api/superadmin/BillingService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { actionNeedsNote, actionTakesNote, errorMessageKey, validateDunningAction, type DunningAction, type DunningRow } from '@/composables/billingMethod'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    row: { type: Object as () => DunningRow | null, default: null },
    action: { type: String as () => DunningAction | null, default: null },
})
const emit = defineEmits(['close', 'done'])

const { t } = useI18n()
const { formatAmount } = useAmountFormatter()

const state = reactive({
    isSaving: false,
    error: {} as Error,
    note: '',
    days: 7 as number | null,
    invalid: null as string | null,
})

const takesNote = computed(() => !!props.action && actionTakesNote(props.action))
const needsNote = computed(() => !!props.action && actionNeedsNote(props.action))
const needsDays = computed(() => props.action === 'postpone' || props.action === 'reopen')
const destructive = computed(() => ['close', 'charge_security_card', 'revoke_security_card', 'retry_unknown_charge'].includes(props.action ?? ''))
const title = computed(() => (props.action ? t(`paymentDunning.problems.dialog.title.${props.action}`) : ''))

watch(() => props.isModalOpen, (open: boolean) => {
    if (!open) return
    state.error = {}
    state.note = ''
    state.days = 7
    state.invalid = null
})

async function submit() {
    if (!props.row?.company_uuid || !props.action) return

    state.invalid = validateDunningAction(props.action, { note: state.note, days: state.days })
    if (state.invalid) return

    state.error = {}
    state.isSaving = true
    try {
        const result = await billingService.act(props.row.company_uuid, props.action, {
            ...(takesNote.value && state.note.trim() ? { note: state.note.trim() } : {}),
            ...(needsDays.value ? { days: Number(state.days) } : {}),
        })
        emit('done', props.action, result)
    } catch (error: any) {
        // Every refusal carries a `code`; show our own text for the ones we know.
        const key = errorMessageKey(error)
        state.error = key ? ({ message: t(key) } as Error) : error
    }
    state.isSaving = false
}
</script>
