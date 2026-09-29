<template>
    <div>
        <p class="mb-3 text-sm font-semibold text-gray-900">
            {{ $t('inquiryStageHistory.title') }}
        </p>

        <p v-if="!state.entries.length" class="text-[13px] text-slate-400">
            {{ $t('inquiryStageHistory.empty') }}
        </p>

        <!-- Oldest first, because the list is read as the case unfolded. -->
        <div v-for="entry in state.entries" :key="entry.uuid"
            class="border-t border-surface-100 py-2.5 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span v-if="entry.from_status && entry.from_status !== entry.to_status" class="text-[13px] text-slate-400">
                    {{ stageName(entry.from_status) }}
                </span>
                <Icon v-if="entry.from_status && entry.from_status !== entry.to_status" name="ph:arrow-right"
                    class="size-3 text-slate-300" />
                <span v-if="entry.from_status === entry.to_status && entry.event" class="text-[13px] text-slate-400">
                    {{ stageName(entry.to_status) }}
                </span>
                <span v-if="entry.from_status !== entry.to_status || !entry.event" class="text-[13px] font-semibold text-slate-800">
                    {{ stageName(entry.to_status) }}
                </span>
                <!-- A decision, not only a move: an offer sent, accepted or rejected. -->
                <span v-if="entry.event"
                    class="rounded-full bg-surface-100 px-2 py-px text-[11px] font-bold text-slate-600">
                    {{ $t('inquiryStageHistory.events.' + entry.event) }}
                </span>
            </div>
            <p v-if="entry.remarks" class="mt-0.5 whitespace-pre-line text-[12px] text-slate-600">
                {{ entry.remarks }}
            </p>
            <p class="mt-0.5 text-[11px] text-slate-400">
                {{ formatDateTimeToReadable(entry.changed_at) }}
                <template v-if="entry.changed_by"> · {{ entry.changed_by }}</template>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'

const { formatDateTimeToReadable } = useDatetimeFormatter()

const props = defineProps({
    inquiryUuid: {
        type: String,
        required: true,
    },
    // The company's own stages, so an entry reads as the name the customer
    // gave the stage rather than the slug stored against it.
    stages: {
        type: Array as () => any[],
        required: false,
        default: () => [],
    },
})

const state = reactive({
    entries: [] as any[],
})

onMounted(() => {
    fetchHistory()
})

watch(() => props.inquiryUuid, () => fetchHistory())

function stageName(slug: string): string {
    return props.stages.find((stage: any) => stage.slug === slug)?.name ?? slug
}

async function fetchHistory() {
    if (!props.inquiryUuid) return

    try {
        const response = await citizenInquiryService.getStageHistory(props.inquiryUuid)
        state.entries = response?.data ?? []
    } catch (_) {
        state.entries = []
    }
}

defineExpose({ fetchHistory })
</script>
