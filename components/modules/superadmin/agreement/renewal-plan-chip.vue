<template>
    <Tooltip :text="due
        ? $t('superadmin.agreements.renewal.planMissingHelpDue', { date: formatDateToReadable(due) })
        : $t('superadmin.agreements.renewal.planMissingHelp')" position="top" wrap>
        <span class="co-badge bg-[#FEF3C7] text-[#B45309]">
            <Icon name="ph:warning" class="w-3 h-3" aria-hidden="true" />
            {{ $t('superadmin.agreements.renewal.planMissing') }}
        </span>
    </Tooltip>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/** Amber chip: the agreement renews, but the installment plan for the new period is not entered. */
defineProps({
    /** renewal_plan_due: when the missing plan is needed. */
    due: { type: String as () => string | null, default: null },
})

const { formatDateToReadable } = useDatetimeFormatter()
</script>
