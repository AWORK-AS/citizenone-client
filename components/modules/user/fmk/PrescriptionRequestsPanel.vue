<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkDrugMedication, FmkPrescriptionRequest } from '@/types/fmk'
import { fmkOrganisation } from '@/utils/fmk'
import { fMKService } from '@/components/api/user/FMKService'
import { useFmkModifier } from '@/composables/useFmkModifier'
import { useAlert } from '@/composables/alert'

/**
 * GK 16.3/16.4: the prescription requests sent for the citizen, unhandled
 * first, with who they went to, their status and, for rejected ones, the
 * reason. Unhandled ones can be cancelled. Fetched when staff open it.
 */
const props = defineProps<{ citizenUuid: string, medications: FmkDrugMedication[], canEdit?: boolean, cardVersion?: string | null }>()
const emit = defineEmits<{ cardChanged: [] }>()

const { t } = useI18n()
const { by } = useFmkModifier()
const { successAlert, errorAlert } = useAlert()

const requests = shallowRef<FmkPrescriptionRequest[] | null>(null)
const pending = shallowRef(false)
const error = shallowRef<string | null>(null)
const busy = shallowRef<string | null>(null)

async function load() {
    pending.value = true
    error.value = null
    try {
        const response = await fMKService.getPrescriptionRequests(props.citizenUuid)
        requests.value = ((response?.data ?? response) ?? []) as FmkPrescriptionRequest[]
    } catch (cause: any) {
        error.value = cause?.message ?? String(cause)
    } finally {
        pending.value = false
    }
}

async function cancel(r: FmkPrescriptionRequest) {
    if (!r.identifier) return
    busy.value = r.identifier
    try {
        await fMKService.cancelPrescriptionRequest(props.citizenUuid, r.identifier, props.cardVersion)
        successAlert(`${t('alert.success')}!`, t('fmk.request.cancelled'))
        await load()
    } catch (cause: any) {
        if (cause?.code === 'fmk_card_changed') emit('cardChanged')
        else errorAlert(`${t('alert.somethingWentWrong')}!`, cause?.message ?? '')
    } finally {
        busy.value = null
    }
}

// Unhandled first (GK 16.3), then newest.
const sorted = computed(() => [...(requests.value ?? [])].sort((a, b) => Number(b.status === 'unhandled') - Number(a.status === 'unhandled')))
const drugName = (id: string | null) => {
    const m = props.medications.find(x => x.identifier === id)
    return m ? [m.drug_name, m.strength].filter(Boolean).join(' ') : t('fmk.request.drugMedication', { id })
}
const receivers = (r: FmkPrescriptionRequest) => r.organisations.map(o => fmkOrganisation(o)).map(o => [o.name, o.identifier && `(${o.identifier})`].filter(Boolean).join(' ')).join(', ')
const statusTone: Record<string, string> = {
    unhandled: 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]',
    prescribed: 'border-[#2dbab2]/40 bg-[#f0faf9] text-[#1b6d8a]',
    cancelled: 'border-[#e2e8f0] bg-[#f8fafc] text-[#475569]',
}

defineExpose({ load })
</script>

<template>
    <section class="rounded-2xl border border-[#e2e8f0] bg-white" :aria-label="$t('fmk.request.panelTitle')">
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <h2 class="text-base font-semibold text-[#1a2332]">{{ $t('fmk.request.panelTitle') }}</h2>
            <button type="button" :disabled="pending" @click="load"
                class="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f4c75] hover:border-[#0f4c75] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                <Icon :name="pending ? 'ph:spinner' : 'ph:arrows-clockwise'" :class="['size-4', pending && 'motion-safe:animate-spin']" aria-hidden="true" />
                {{ requests ? $t('fmk.header.refresh') : $t('fmk.request.load') }}
            </button>
        </div>
        <p v-if="error" role="alert" class="mx-4 mb-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b] sm:mx-6">{{ error }}</p>
        <p v-if="requests && !requests.length" class="px-4 pb-4 text-sm text-[#64748b] sm:px-6">{{ $t('fmk.request.none') }}</p>
        <ul v-if="sorted.length" class="divide-y divide-[#f1f5f9] border-t border-[#f1f5f9]">
            <li v-for="r in sorted" :key="r.identifier ?? ''" class="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm sm:px-6">
                <div class="min-w-0">
                    <p class="flex flex-wrap items-center gap-2">
                        <span class="font-semibold text-[#1a2332]">{{ drugName(r.drug_medication_id) }}</span>
                        <span class="rounded-full border px-2 py-0.5 text-[11px] font-semibold" :class="statusTone[r.status ?? ''] ?? statusTone.cancelled">{{ $t(`fmk.request.status.${r.status}`) }}</span>
                    </p>
                    <p class="text-xs text-[#64748b]">{{ $t('fmk.request.sentTo', { to: receivers(r) }) }}<template v-if="r.created"> · {{ by(r.created) }}</template></p>
                    <p v-if="r.package_quantity" class="text-xs text-[#64748b]">{{ $t('fmk.request.asked', { quantity: r.package_quantity, number: r.package_number }) }}<template v-if="r.reiteration"> · {{ $t('fmk.prescription.reiterated', { number: r.reiteration.number, interval: r.reiteration.interval, unit: r.reiteration.unit ?? '' }) }}</template></p>
                    <p v-if="r.status === 'cancelled' && r.cancellation_reason" class="mt-1 text-xs font-semibold text-[#b91c1c]">{{ $t('fmk.request.reason', { reason: r.cancellation_reason }) }}<template v-if="r.cancelled_by"> · {{ by(r.cancelled_by) }}</template></p>
                </div>
                <button v-if="canEdit && r.status === 'unhandled'" type="button" :disabled="busy === r.identifier" @click="cancel(r)"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#b91c1c] hover:border-[#b91c1c] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                    <Icon :name="busy === r.identifier ? 'ph:spinner' : 'ph:x'" :class="['size-4', busy === r.identifier && 'motion-safe:animate-spin']" aria-hidden="true" />
                    {{ $t('fmk.request.cancel') }}
                </button>
            </li>
        </ul>
    </section>
</template>
