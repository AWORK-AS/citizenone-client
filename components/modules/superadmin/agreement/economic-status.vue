<template>
    <div class="inline-flex flex-wrap items-center gap-2">
        <Tooltip v-if="chip" :text="chipHelp" position="top" wrap>
            <span class="co-badge" :class="chipClass">
                <Icon :name="chip.icon" class="w-3 h-3" :class="{ 'animate-spin': chip.state === 'in_flight' }"
                    aria-hidden="true" />
                {{ $t(`superadmin.agreements.economic.state.${chip.state}`, { number: chip.number ?? '' }) }}
            </span>
        </Tooltip>
        <Tooltip v-if="canCreate || state.isPolling" :text="state.isPolling
            ? $t('superadmin.agreements.economic.creatingHelp')
            : $t(`superadmin.agreements.economic.${actionKey}Help`)" position="top" wrap>
            <SuperadminTableButton :disabled="isBusy" @click.stop="createDraft(false)">
                <Icon :name="state.isPolling ? 'ph:spinner' : 'ph:cloud-arrow-up'" class="w-3.5 h-3.5"
                    :class="{ 'animate-spin': state.isPolling }" aria-hidden="true" />
                {{ state.isPolling ? $t('superadmin.agreements.economic.creating') : $t(`superadmin.agreements.economic.${actionKey}`) }}
            </SuperadminTableButton>
        </Tooltip>
        <Tooltip v-if="canRecreate && !state.isPolling" :text="$t('superadmin.agreements.economic.recreateHelp')"
            position="top" wrap>
            <SuperadminTableButton :disabled="isBusy" @click.stop="state.isConfirmOpen = true">
                <Icon name="ph:arrow-counter-clockwise" class="w-3.5 h-3.5" aria-hidden="true" />
                {{ $t('superadmin.agreements.economic.recreate') }}
            </SuperadminTableButton>
        </Tooltip>
        <DialogConfirmation :isModalOpen="state.isConfirmOpen"
            :title="$t('superadmin.agreements.economic.recreateConfirmTitle')"
            :message="$t('superadmin.agreements.economic.recreateConfirmText')"
            :confirmLabel="$t('superadmin.agreements.economic.recreate')"
            @close="state.isConfirmOpen = false" @confirm="confirmRecreate" />
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { agreementService } from '@/components/api/superadmin/AgreementService'
import { invoiceService } from '@/components/api/superadmin/InvoiceService'
import {
    ECONOMIC_POLL_INTERVAL_MS,
    canCreateEconomicDraft,
    canRecreateEconomicDraft,
    economicDraftActionKey,
    economicDraftPayload,
    economicStatus,
    shouldKeepPollingEconomic,
    unwrapData,
} from '@/composables/agreements'

/**
 * e-conomic state of an agreement instalment invoice, with the "create draft" /
 * "try again" / "create again" actions. Superadmin screens only: these fields are
 * internal and must never be rendered on a customer page. The backend authorises
 * and validates every call (manage_financials, agreement instalment only); hiding
 * the buttons here is a convenience, not a control.
 */
const props = defineProps({
    invoice: { type: Object as () => any, default: null },
    /** The invoice comes from an agreement instalment row (type and link are implied). */
    installmentLinked: { type: Boolean, default: false },
    /** Hide the actions and show the status only. */
    readonly: { type: Boolean, default: false },
})
const emit = defineEmits(['updated', 'failed'])
const { t } = useI18n()

const state = reactive({ isStarting: false, isPolling: false, isConfirmOpen: false, live: null as any })
let timer: any = null
let destroyed = false

// The freshest copy wins while polling; a new prop replaces it.
watch(() => props.invoice, () => { state.live = null })

const current = computed(() => {
    const base = { ...(props.invoice ?? {}), ...(state.live ?? {}) }
    return props.installmentLinked
        ? { type: 'agreement', linked_to_installment: true, ...base }
        : base
})

const chip = computed(() => economicStatus(current.value))
const chipClass = computed(() => ({
    gray: 'co-badge-gray', green: 'co-badge-green', red: 'co-badge-red',
    navy: 'co-badge-navy', amber: 'bg-[#FEF3C7] text-[#B45309]',
} as Record<string, string>)[chip.value?.color ?? 'gray'])
const chipHelp = computed(() => t(`superadmin.agreements.economic.state.${chip.value!.state}Help`, {
    error: chip.value?.error ?? '',
}))
const isBusy = computed(() => state.isStarting || state.isPolling)
const hasUuid = computed(() => !!props.invoice?.uuid)
const canCreate = computed(() => !props.readonly && hasUuid.value && canCreateEconomicDraft(current.value))
const canRecreate = computed(() => !props.readonly && hasUuid.value && canRecreateEconomicDraft(current.value))
const actionKey = computed(() => economicDraftActionKey(current.value))

function confirmRecreate() {
    state.isConfirmOpen = false
    createDraft(true)
}

async function createDraft(recreate: boolean) {
    if (!props.invoice?.uuid || isBusy.value) return
    state.isStarting = true
    try {
        // 202: the job is queued and the invoice comes back as `in_flight`.
        const response = await agreementService.createEconomicDraft(props.invoice.uuid, economicDraftPayload(recreate))
        state.live = unwrapData(response)
        state.isStarting = false
        if (shouldKeepPollingEconomic(state.live, 0)) {
            state.isPolling = true
            schedulePoll(1)
        } else {
            finish()
        }
    } catch (error: any) {
        // 422: the message says why (no customer number, not an agreement instalment ...).
        state.isStarting = false
        emit('failed', error)
    }
}

function schedulePoll(attempt: number) {
    timer = setTimeout(() => poll(attempt), ECONOMIC_POLL_INTERVAL_MS)
}

async function poll(attempt: number) {
    if (destroyed) return
    try {
        const latest = unwrapData(await invoiceService.getInvoiceDetails(props.invoice.uuid))
        state.live = { ...(state.live ?? {}), ...latest }
    } catch (_) {
        // A failed read is not a failed draft: keep going until the budget runs out.
    }
    if (shouldKeepPollingEconomic(state.live, attempt)) {
        schedulePoll(attempt + 1)
        return
    }
    const stillRunning = state.live?.economic_sync_state === 'in_flight'
    state.isPolling = false
    if (stillRunning) {
        emit('failed', { message: t('superadmin.agreements.economic.pollTimeout') })
        return
    }
    finish()
}

function finish() {
    emit('updated', state.live)
}

onBeforeUnmount(() => {
    destroyed = true
    clearTimeout(timer)
})
</script>
