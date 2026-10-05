<template>
    <div class="inline-flex flex-wrap items-center gap-2">
        <Tooltip v-if="status.kind === 'draft'" :text="$t('superadmin.agreements.economic.draftHelp')" position="top" wrap>
            <span class="co-badge co-badge-gray">
                <Icon name="ph:file-dashed" class="w-3 h-3" aria-hidden="true" />
                {{ $t('superadmin.agreements.economic.draft', { number: status.number }) }}
            </span>
        </Tooltip>
        <Tooltip v-else-if="status.kind === 'booked'" :text="$t('superadmin.agreements.economic.bookedHelp')"
            position="top" wrap>
            <span class="co-badge co-badge-green">
                <Icon name="ph:check-circle" class="w-3 h-3" aria-hidden="true" />
                {{ $t('superadmin.agreements.economic.booked', { number: status.number }) }}
            </span>
        </Tooltip>
        <Tooltip v-else-if="status.kind === 'error'"
            :text="$t('superadmin.agreements.economic.errorHelp', { error: status.error })" position="top" wrap>
            <span class="co-badge co-badge-red">
                <Icon name="ph:warning" class="w-3 h-3" aria-hidden="true" />
                {{ $t('superadmin.agreements.economic.error') }}
            </span>
        </Tooltip>
        <Tooltip v-if="canCreate" :text="$t(`superadmin.agreements.economic.${actionKey}Help`)" position="top" wrap>
            <SuperadminTableButton :disabled="isLoading" @click.stop="createDraft">
                <Icon name="ph:cloud-arrow-up" class="w-3.5 h-3.5" aria-hidden="true" />
                {{ $t(`superadmin.agreements.economic.${actionKey}`) }}
            </SuperadminTableButton>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import { agreementService } from '@/components/api/superadmin/AgreementService'
import { canCreateEconomicDraft, economicDraftActionKey, economicStatus, unwrapData } from '@/composables/agreements'

/**
 * e-conomic status of an invoice with the "create draft" / "try again" action.
 * Superadmin screens only: the e-conomic fields are internal and must never be
 * rendered on a customer page. The backend authorises the call (manage_financials).
 */
const props = defineProps({
    invoice: { type: Object as () => any, default: null },
    /** Hide the action and show the status only. */
    readonly: { type: Boolean, default: false },
})
const emit = defineEmits(['updated', 'failed'])

const isLoading = ref(false)
const status = computed(() => economicStatus(props.invoice))
const actionKey = computed(() => economicDraftActionKey(props.invoice))
const canCreate = computed(() => !props.readonly && !!props.invoice?.uuid && canCreateEconomicDraft(props.invoice))

async function createDraft() {
    if (!props.invoice?.uuid || isLoading.value) return
    isLoading.value = true
    try {
        const response = await agreementService.createEconomicDraft(props.invoice.uuid)
        emit('updated', unwrapData(response))
    } catch (error: any) {
        // 422: the message says why (no customer number, e-conomic rejected it).
        emit('failed', error)
    }
    isLoading.value = false
}
</script>
