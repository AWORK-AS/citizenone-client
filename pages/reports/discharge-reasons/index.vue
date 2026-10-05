<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dischargeReasons.report.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('dischargeReasons.report.title') }}</template>

            <div class="mt-8 space-y-5">
                <p class="max-w-2xl text-sm text-gray-500">{{ $t('dischargeReasons.report.description') }}</p>

                <div class="flex flex-wrap items-end gap-3">
                    <div class="w-44">
                        <FormLabel for="report-from" :label="$t('dischargeReasons.report.from')" />
                        <FormDateField id="report-from" name="report-from" v-model="state.from" :placeholder="$t('dischargeReasons.report.from')" />
                    </div>
                    <div class="w-44">
                        <FormLabel for="report-to" :label="$t('dischargeReasons.report.to')" />
                        <FormDateField id="report-to" name="report-to" v-model="state.to" :placeholder="$t('dischargeReasons.report.to')" />
                    </div>
                    <Tooltip :text="$t('dischargeReasons.report.showHint')">
                        <FormButton type="button" buttonStyle="primary" @click="load">{{ $t('dischargeReasons.report.show') }}</FormButton>
                    </Tooltip>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <div class="rounded-lg border border-gray-200 bg-white">
                        <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                            <p class="text-sm font-semibold text-gray-900">{{ $t('dischargeReasons.report.endings', { count: state.report.total }) }}</p>
                        </div>
                        <p v-if="!state.report.reasons.length" class="px-4 py-5 text-sm text-gray-400">{{ $t('dischargeReasons.report.empty') }}</p>
                        <div v-for="row in state.report.reasons" :key="row.uuid || 'none'"
                            class="flex items-center gap-4 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                            <p class="min-w-0 flex-1 text-sm" :class="row.name ? 'text-gray-900' : 'italic text-gray-400'">
                                {{ row.name || $t('dischargeReasons.report.noReason') }}
                            </p>
                            <div class="hidden w-40 sm:block">
                                <div class="h-2 rounded-full bg-surface-100">
                                    <div class="h-2 rounded-full bg-primary" :style="{ width: share(row.total) + '%' }" />
                                </div>
                            </div>
                            <p class="w-16 text-right text-sm font-semibold tabular-nums text-gray-900">{{ row.total }}</p>
                            <Tooltip :text="$t('dischargeReasons.report.averageHint')">
                                <p class="w-28 text-right text-xs tabular-nums text-gray-500">
                                    {{ row.average_days !== null ? $t('dischargeReasons.report.averageDays', { days: row.average_days }) : '-' }}
                                </p>
                            </Tooltip>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Citizens' })

import { dischargeReasonService } from '@/components/api/user/DischargeReasonService'

const runtimeConfig = useRuntimeConfig()

const breadcrumbLinks = [
    { name: 'dischargeReasons.title', translate: true, href: '/settings/discharge-reasons' },
    { name: 'dischargeReasons.report.title', translate: true, href: '/reports/discharge-reasons' },
]

const today = new Date()
const state = reactive({
    from: `${today.getFullYear()}-01-01`,
    to: today.toISOString().slice(0, 10),
    isLoading: false,
    report: { total: 0, reasons: [] as any[] },
})

function share(total: number) {
    return state.report.total ? Math.round((total / state.report.total) * 100) : 0
}

async function load() {
    state.isLoading = true
    try {
        const response = await dischargeReasonService.getReport({ from: state.from, to: state.to })
        state.report = response?.data ?? { total: 0, reasons: [] }
    } catch (_) {
        state.report = { total: 0, reasons: [] }
    }
    state.isLoading = false
}

onMounted(load)
</script>
