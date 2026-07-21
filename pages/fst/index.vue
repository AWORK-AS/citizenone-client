<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.fst.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('settings.fst.title') }}</template>

            <LoadingSpinner :isActive="state.isLoading">
                <div class="mt-8 space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- Only ever rendered for dual-platform, fully-activated clients
                         (plan §14/§21) — CitizenOne-only orgs never reach this page's
                         data because sync_eligible is false until FST also activates. -->
                    <div v-if="!state.syncEligible"
                        class="rounded-xl border border-dashed border-surface-200 bg-surface-50 p-8 text-center">
                        <p class="text-sm text-slate-500">{{ $t('settings.fst.syncNotEligible') }}</p>
                        <div class="mt-4 flex justify-center">
                            <FormButton buttonStyle="primary" @click="navigateTo('/settings/fst')">
                                {{ $t('settings.tabs.fst') }}
                            </FormButton>
                        </div>
                    </div>

                    <template v-else>
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div v-for="card in statCards" :key="card.key" class="bg-white shadow-md rounded-md p-4 border-l-4 border-secondary">
                                <h3 class="text-primary text-sm font-medium py-2">{{ card.label }}</h3>
                                <p class="text-xl font-semibold">{{ card.value }}</p>
                            </div>
                        </div>

                        <div v-if="trendOption" class="bg-white shadow-md rounded-md p-4">
                            <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.fst.analytics') }}</h3>
                            <VChart :option="trendOption" style="height: 300px; width: 100%;" autoresize />
                        </div>

                        <div class="bg-white shadow-md rounded-md p-4">
                            <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.fst.inquiries') }}</h3>
                            <p v-if="!state.inquiries.length" class="text-sm text-slate-400">{{ $t('settings.fst.noInquiriesYet') }}</p>
                            <table v-else class="min-w-full divide-y divide-surface-100 text-sm">
                                <tbody>
                                    <tr v-for="inquiry in state.inquiries" :key="inquiry.uuid">
                                        <td class="py-2 pr-4">{{ inquiry.received_at?.slice(0, 10) }}</td>
                                        <td class="py-2 pr-4">{{ inquiry.sender_type }}</td>
                                        <td class="py-2 pr-4">{{ inquiry.status }}</td>
                                        <td class="py-2 text-slate-500">{{ inquiry.inquirer_name || inquiry.fst_case_id }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </template>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { fstService } from '@/components/api/user/FstService'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { Error, FstAnalyticsSnapshot, FstInquiry } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { can, isAtLeast } = usePermissions()
const { t } = useI18n()

// Plan §18: visibility here requires BOTH the spatie permission axis AND the
// bilateral-activation eligibility axis — neither alone is sufficient.
const canViewAnalytics = computed(() => isAtLeast('Admin') || can('view_fst_analytics'))

const state = reactive({
    error: {} as Error,
    isLoading: false,
    syncEligible: false,
    inquiries: [] as FstInquiry[],
    analytics: [] as FstAnalyticsSnapshot[],
})

const statCards = computed(() => {
    const byKey = (key: string) => state.analytics.filter(a => a.metric_key === key).at(-1)?.metric_value ?? 0
    return [
        { key: 'unique_visitors', label: t('settings.fst.analytics'), value: byKey('unique_visitors') },
        { key: 'pageviews', label: 'Pageviews', value: byKey('pageviews') },
        { key: 'profile_visits', label: 'Profile visits', value: byKey('profile_visits') },
        { key: 'inquiries', label: t('settings.fst.inquiries'), value: state.inquiries.length },
    ]
})

const trendOption = computed(() => {
    const visitors = state.analytics.filter(a => a.metric_key === 'unique_visitors')
    if (!visitors.length) return null
    return {
        xAxis: { type: 'category', data: visitors.map(v => v.metric_date) },
        yAxis: { type: 'value' },
        series: [{ type: 'line', data: visitors.map(v => v.metric_value) }],
        tooltip: { trigger: 'axis' },
    }
})

onMounted(async () => {
    if (!canViewAnalytics.value) {
        return navigateTo('/overview')
    }

    state.isLoading = true
    try {
        const status = await fstService.getStatus()
        state.syncEligible = status.sync_eligible
        if (state.syncEligible) {
            const [inquiriesRes, analyticsRes] = await Promise.all([
                fstService.getInquiries(),
                fstService.getAnalytics(),
            ])
            state.inquiries = inquiriesRes?.data ?? []
            state.analytics = analyticsRes?.data ?? []
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
})
</script>
