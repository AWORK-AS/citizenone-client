<template>
    <div class="space-y-3">
        <p v-for="(warning, index) in props.result?.warnings ?? []" :key="'w-' + index"
            class="rounded-lg border border-dashed border-[#f0c4b8] bg-[#fdf1ee] px-3 py-2 text-[12px] text-[#c0442c]">
            <Icon name="ph:warning" class="mr-1 inline size-4 align-text-bottom" />
            {{ warning }}
        </p>

        <div class="overflow-x-auto rounded-lg border border-surface-200 bg-white">
            <table class="w-full text-[13px]">
                <thead>
                    <tr class="bg-surface-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th class="px-3 py-2">{{ $t('inquiryOffer.result.item') }}</th>
                        <th class="px-3 py-2 text-right">{{ $t('inquiryOffer.result.quantity') }}</th>
                        <th class="px-3 py-2 text-right">{{ $t('inquiryOffer.result.unitPrice') }}</th>
                        <th class="px-3 py-2 text-right">{{ $t('inquiryOffer.result.perWeek') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(line, index) in props.result?.lines ?? []" :key="index" class="border-t border-surface-100">
                        <td class="px-3 py-2 text-slate-700">
                            {{ line.label }}
                            <span v-if="line.per === 'month'" class="text-[11px] text-slate-400">({{ $t('inquiryOffer.per.month') }})</span>
                            <span v-if="line.key === 'special_language' && props.result?.special_language?.languages?.length"
                                class="ml-1 rounded-full bg-[#fdf1ee] px-2 py-px text-[10.5px] font-bold text-[#c0442c]">
                                {{ props.result.special_language.languages.join(', ') }}
                            </span>
                        </td>
                        <td class="px-3 py-2 text-right tabular-nums text-slate-500">{{ line.quantity === null ? '' : number(line.quantity) }}</td>
                        <td class="px-3 py-2 text-right tabular-nums text-slate-500">{{ number(line.unit_price) }}</td>
                        <td class="px-3 py-2 text-right tabular-nums font-semibold text-slate-800">{{ number(line.weekly_amount) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div class="rounded-lg bg-white px-3 py-2 ring-1 ring-surface-200">
                <p class="text-[11px] text-slate-400">{{ $t('inquiryOffer.result.weeklyPrice') }}</p>
                <p class="text-[15px] font-bold text-slate-800">{{ number(props.result?.totals?.weekly_price) }}</p>
            </div>
            <div class="rounded-lg bg-white px-3 py-2 ring-1 ring-surface-200">
                <p class="text-[11px] text-slate-400">{{ $t('inquiryOffer.result.monthlyPrice') }}</p>
                <p class="text-[15px] font-bold text-slate-800">{{ number(props.result?.totals?.monthly_price) }}</p>
            </div>
            <div class="rounded-lg bg-white px-3 py-2 ring-1 ring-surface-200">
                <p class="text-[11px] text-slate-400">{{ $t('inquiryOffer.result.totalPrice') }}</p>
                <p class="text-[15px] font-bold text-slate-800">
                    {{ props.result?.totals?.total_price === null ? '-' : number(props.result?.totals?.total_price) }}
                </p>
            </div>
            <div class="rounded-lg bg-white px-3 py-2 ring-1 ring-surface-200">
                <p class="text-[11px] text-slate-400">{{ $t('inquiryOffer.result.weeklyHours') }}</p>
                <p class="text-[15px] font-bold text-slate-800">{{ number(props.result?.totals?.weekly_hours) }}</p>
            </div>
        </div>

        <!-- What the price rests on, and where each figure came from -->
        <div>
            <p class="mb-1 text-xs font-bold text-slate-500">{{ $t('inquiryOffer.result.assumptions') }}</p>
            <ul class="space-y-0.5 text-[12px] text-slate-600">
                <li v-for="assumption in props.result?.assumptions ?? []" :key="assumption.key">
                    {{ assumption.label }}: <span class="font-semibold text-slate-800">{{ display(assumption.value) }}</span>
                    <span class="text-slate-400"
                        :class="assumption.source === 'manual' && 'font-semibold text-[#8a6208]'">
                        ({{ assumption.source_label }}<template v-if="assumption.detail">, {{ assumption.detail }}</template>)
                    </span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps({
    result: {
        type: Object,
        required: true,
    },
})

const { t } = useI18n()

function number(value: any) {
    if (value === null || value === undefined || value === '') return '-'

    return Number(value).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function display(value: any) {
    if (value === true) return t('inquiryOffer.yes')
    if (value === false) return t('inquiryOffer.no')
    if (value === null || value === undefined || value === '') return '-'
    if (typeof value === 'number') return number(value)

    return String(value)
}
</script>
