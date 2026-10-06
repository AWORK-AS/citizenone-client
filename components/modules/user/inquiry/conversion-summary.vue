<template>
    <!-- How the inquiries received in the period went: the rate, and what it
         rests on, overall, per service type and per month. -->
    <section class="space-y-4">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Tooltip :text="$t('inquiryConversion.rateHint')" class="block">
                <div class="rounded-lg border border-gray-200 bg-white p-5">
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ $t('inquiryConversion.rate') }}</p>
                    <p class="mt-1 text-2xl font-bold text-slate-900">{{ percent(overall.conversion_rate) }}</p>
                </div>
            </Tooltip>
            <div class="rounded-lg border border-gray-200 bg-white p-5">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ $t('inquiryConversion.won') }}</p>
                <p class="mt-1 text-2xl font-bold text-slate-900">{{ overall.won ?? 0 }}</p>
            </div>
            <div class="rounded-lg border border-gray-200 bg-white p-5">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ $t('inquiryConversion.lost') }}</p>
                <p class="mt-1 text-2xl font-bold text-slate-900">{{ overall.lost ?? 0 }}</p>
            </div>
            <div class="rounded-lg border border-gray-200 bg-white p-5">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ $t('inquiryConversion.open') }}</p>
                <p class="mt-1 text-2xl font-bold text-slate-900">{{ overall.open ?? 0 }}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2" v-if="(props.report?.by_service_type ?? []).length">
            <div v-for="table in tables" :key="table.key" class="rounded-lg border border-gray-200 bg-white p-5">
                <p class="mb-3 text-sm font-semibold text-gray-900">{{ table.title }}</p>
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-left text-xs text-slate-400">
                            <th class="pb-2 font-semibold">{{ table.column }}</th>
                            <th class="pb-2 text-right font-semibold">{{ $t('inquiryConversion.received') }}</th>
                            <th class="pb-2 text-right font-semibold">{{ $t('inquiryConversion.won') }}</th>
                            <th class="pb-2 text-right font-semibold">{{ $t('inquiryConversion.lost') }}</th>
                            <th class="pb-2 text-right font-semibold">{{ $t('inquiryConversion.rate') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in table.rows" :key="row.key" class="border-t border-gray-50">
                            <td class="py-1.5" :class="!row.label && 'italic text-gray-400'">{{ row.label || $t('inquiryConversion.noServiceType') }}</td>
                            <td class="py-1.5 text-right tabular-nums">{{ row.total }}</td>
                            <td class="py-1.5 text-right tabular-nums">{{ row.won }}</td>
                            <td class="py-1.5 text-right tabular-nums">{{ row.lost }}</td>
                            <td class="py-1.5 text-right font-semibold tabular-nums">{{ percent(row.conversion_rate) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps({
    report: {
        type: Object,
        required: false,
        default: null,
    },
})

const overall = computed(() => props.report?.overall ?? {})

function percent(value: number | null | undefined) {
    // No decided inquiries yet: no rate, rather than 0 %.
    return value === null || value === undefined ? '-' : `${String(value).replace('.', locale.value === 'en' ? '.' : ',')} %`
}

function monthLabel(month: string) {
    const [year, m] = month.split('-').map(Number)

    return new Date(year, m - 1, 1).toLocaleDateString(locale.value === 'dk' ? 'da-DK' : undefined, { month: 'short', year: 'numeric' })
}

const tables = computed(() => [
    {
        key: 'type',
        title: t('inquiryConversion.byServiceType'),
        column: t('inquiryConversion.serviceType'),
        rows: (props.report?.by_service_type ?? []).map((row: any) => ({ ...row, key: row.uuid ?? 'none', label: row.name })),
    },
    {
        key: 'month',
        title: t('inquiryConversion.byMonth'),
        column: t('inquiryConversion.month'),
        rows: (props.report?.by_month ?? []).map((row: any) => ({ ...row, key: row.month, label: monthLabel(row.month) })),
    },
])
</script>
