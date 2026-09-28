<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('inquiryLost.report.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('inquiryLost.report.title') }}
                <p class="text-sm font-normal text-gray-900">{{ $t('inquiryLost.report.subtitle') }}</p>
            </template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="rounded-lg border border-gray-200 bg-white p-4">
                    <div class="flex flex-wrap items-end gap-4">
                        <div class="space-y-1">
                            <FormLabel for="lost-from" :label="$t('inquiryLost.report.from')" />
                            <FormDateField id="lost-from" name="lost-from" :placeholder="$t('inquiryLost.report.from')"
                                v-model="state.filter.from" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="lost-to" :label="$t('inquiryLost.report.to')" />
                            <FormDateField id="lost-to" name="lost-to" :placeholder="$t('inquiryLost.report.to')"
                                v-model="state.filter.to" />
                        </div>
                        <FormButton buttonStyle="primary" :disabled="state.isLoading" @click="fetchReport">
                            <Icon name="ph:funnel" class="size-4" />
                            {{ $t('filter') }}
                        </FormButton>
                    </div>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div class="rounded-lg border border-gray-200 bg-white p-5">
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {{ $t('inquiryLost.report.totalCount') }}
                            </p>
                            <p class="mt-1 text-2xl font-bold text-slate-900">{{ state.report.total_count ?? 0 }}</p>
                        </div>
                        <div class="rounded-lg border border-gray-200 bg-white p-5">
                            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {{ $t('inquiryLost.report.totalRevenue') }}
                            </p>
                            <p class="mt-1 text-2xl font-bold text-slate-900">
                                {{ formatAmount(state.report.total_lost_revenue ?? 0) }}
                            </p>
                        </div>
                    </div>

                    <div class="mt-5 rounded-lg border border-gray-200 bg-white p-5">
                        <p class="mb-4 text-sm font-semibold text-gray-900">{{ $t('inquiryLost.report.byReason') }}</p>
                        <p v-if="!byReason.length" class="text-sm text-gray-400">{{ $t('inquiryLost.report.empty') }}</p>
                        <div v-else class="space-y-3">
                            <div v-for="row in byReason" :key="row.reason_uuid ?? 'none'" class="space-y-1">
                                <div class="flex flex-wrap items-baseline justify-between gap-2 text-[13px]">
                                    <span class="font-semibold text-slate-800">
                                        {{ row.reason_name ?? $t('inquiryLost.report.noReason') }}
                                    </span>
                                    <span class="text-slate-500">
                                        {{ $t('inquiryLost.report.cases', { count: row.count }) }}
                                        ·
                                        {{ formatAmount(row.lost_revenue) }}
                                        <span v-if="row.without_price" class="text-slate-400">
                                            ({{ $t('inquiryLost.report.withoutPrice', { count: row.without_price }) }})
                                        </span>
                                    </span>
                                </div>
                                <!-- Bar length by count, so a reason that loses many small
                                     cases is as visible as one that loses a few large ones. -->
                                <div class="h-2 rounded-full bg-surface-100">
                                    <div class="h-2 rounded-full bg-[#D2553F]" :style="{ width: barWidth(row.count) }" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-5 rounded-lg border border-gray-200 bg-white p-5">
                        <p class="mb-4 text-sm font-semibold text-gray-900">{{ $t('inquiryLost.report.lostCases') }}</p>
                        <p v-if="!cases.length" class="text-sm text-gray-400">{{ $t('inquiryLost.report.empty') }}</p>
                        <div v-else class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="border-b border-surface-200">
                                    <tr>
                                        <th class="co-th">{{ $t('inquiryLost.report.lostAt') }}</th>
                                        <th class="co-th">{{ $t('inquiryLost.report.case') }}</th>
                                        <th class="co-th">{{ $t('inquiryLost.modal.reason') }}</th>
                                        <th class="co-th text-right">{{ $t('inquiryLost.modal.price') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in cases" :key="item.uuid"
                                        class="cursor-pointer border-b border-surface-200 hover:bg-surface-50"
                                        @click="navigateTo(`/inquiries/${item.uuid}`)">
                                        <td class="co-td whitespace-nowrap">{{ formatDateToReadable(item.lost_at) }}</td>
                                        <td class="co-td">
                                            <p class="font-semibold text-slate-800">{{ item.title || item.inquirer_name || '-' }}</p>
                                            <p v-if="item.service_type" class="text-xs text-slate-500">{{ item.service_type }}</p>
                                        </td>
                                        <td class="co-td">
                                            <p>{{ item.reason_name ?? '-' }}</p>
                                            <p v-if="item.note" class="text-xs text-slate-500 whitespace-pre-line">{{ item.note }}</p>
                                        </td>
                                        <td class="co-td text-right whitespace-nowrap">
                                            {{ item.estimated_price === null ? '-' : formatAmount(item.estimated_price) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()

const breadcrumbLinks = [
    {
        name: 'inquiries.inquiries',
        translate: true,
        href: '/inquiries',
    },
    {
        name: 'inquiryLost.report.title',
        translate: true,
        href: '/inquiries/lost-report',
    },
]

function isoDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// This year so far, which is the period a lost-business review usually asks about.
const today = new Date()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    filter: {
        from: isoDate(new Date(today.getFullYear(), 0, 1)),
        to: isoDate(today),
    },
    report: {} as any,
})

const byReason = computed(() => state.report?.by_reason ?? [])
const cases = computed(() => state.report?.cases ?? [])
const maxCount = computed(() => Math.max(1, ...byReason.value.map((row: any) => Number(row.count) || 0)))

function barWidth(count: number) {
    return `${Math.max(2, (Number(count) / maxCount.value) * 100)}%`
}

function formatAmount(value: number) {
    return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(Number(value) || 0)
}

onMounted(() => {
    fetchReport()
})

async function fetchReport() {
    state.error = {}
    state.isLoading = true
    try {
        const params: Record<string, string> = {}
        if (state.filter.from) params.from = state.filter.from
        if (state.filter.to) params.to = state.filter.to
        const response = await citizenInquiryService.getLostReport(params)
        state.report = response?.data ?? {}
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
