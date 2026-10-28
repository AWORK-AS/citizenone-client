<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.funnel.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.funnel.title') }}</template>

            <div class="p-1 space-y-5">

                <ModulesSuperadminDashboardTab />

                <div v-if="!canView" class="bg-white border border-[#EAECF0] rounded-xl p-10 text-center">
                    <Icon name="ph:lock-simple" class="w-8 h-8 text-[#D5D9E2] mx-auto" />
                    <p class="text-[14px] font-semibold text-[#1F2533] mt-3">{{ $t('superadmin.report.noAccess.title') }}</p>
                    <p class="text-[12px] text-[#8891A4] mt-1">{{ $t('superadmin.report.noAccess.hint') }}</p>
                </div>

                <template v-else>
                    <!-- Header + period -->
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 class="text-[22px] font-bold text-[#1F2533]">{{ $t('superadmin.funnel.title') }}</h1>
                            <p class="text-sm text-[#5C6478] mt-0.5 max-w-2xl">{{ $t('superadmin.funnel.subtitle') }}</p>
                        </div>

                        <div class="flex flex-wrap items-end gap-3">
                            <div class="flex items-center gap-1 bg-white border border-[#EAECF0] rounded-lg p-1">
                                <button v-for="preset in presets" :key="preset"
                                    class="px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                                    :class="state.activePreset === preset ? 'bg-[#205E77] text-white' : 'text-[#5C6478] hover:bg-[#F5F6F8]'"
                                    @click="applyPreset(preset)">
                                    {{ $t(`superadmin.report.presets.${preset}`) }}
                                </button>
                            </div>
                            <div class="flex items-end gap-2">
                                <label class="flex flex-col gap-1">
                                    <span class="text-[11px] font-semibold text-[#8891A4] uppercase tracking-wide">{{ $t('superadmin.report.from') }}</span>
                                    <input type="date" v-model="state.from" @change="onRangeChanged"
                                        class="border border-[#EAECF0] rounded-lg px-2.5 py-1.5 text-[13px] text-[#1F2533]" />
                                </label>
                                <label class="flex flex-col gap-1">
                                    <span class="text-[11px] font-semibold text-[#8891A4] uppercase tracking-wide">{{ $t('superadmin.report.to') }}</span>
                                    <input type="date" v-model="state.to" @change="onRangeChanged"
                                        class="border border-[#EAECF0] rounded-lg px-2.5 py-1.5 text-[13px] text-[#1F2533]" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message && state.error.message.length > 0" />

                    <LoadingSpinner :isActive="state.isLoading">
                        <!-- The whole cohort -->
                        <div v-if="state.totals" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            <div v-for="stage in FUNNEL_STAGES" :key="stage" class="bg-white border border-[#EAECF0] rounded-xl p-4">
                                <p class="text-[12px] font-medium text-[#8891A4]">{{ $t(`superadmin.funnel.stages.${stage}`) }}</p>
                                <p class="text-[24px] font-bold text-[#1F2533] mt-1 tabular-nums">{{ state.totals[stage] }}</p>
                                <p v-if="stage !== 'signed_up'" class="text-[12px] text-[#5C6478] mt-0.5 tabular-nums">
                                    {{ pct(shareOfSignups(state.totals, stage)) }} {{ $t('superadmin.funnel.ofSignups') }}
                                    <template v-if="state.totals.median_days?.[stage] != null">
                                        · {{ $t('superadmin.funnel.medianDays', { days: state.totals.median_days[stage] }) }}
                                    </template>
                                </p>
                            </div>
                        </div>

                        <!-- Per channel -->
                        <div class="mt-5 bg-white border border-[#EAECF0] rounded-xl overflow-x-auto">
                            <p v-if="!state.channels.length" class="p-8 text-center text-sm text-[#8891A4]">{{ $t('superadmin.funnel.empty') }}</p>
                            <table v-else class="w-full text-sm">
                                <thead class="bg-[#F9FAFB] text-left text-[12px] text-[#5C6478]">
                                    <tr>
                                        <th class="px-4 py-3 font-medium">{{ $t('superadmin.funnel.channel') }}</th>
                                        <th v-for="stage in FUNNEL_STAGES" :key="stage" class="px-4 py-3 font-medium text-right">
                                            {{ $t(`superadmin.funnel.stages.${stage}`) }}
                                        </th>
                                        <th class="px-4 py-3 font-medium">{{ $t('superadmin.funnel.toPaying') }}</th>
                                        <th class="px-4 py-3 font-medium">{{ $t('superadmin.funnel.biggestDrop') }}</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-[#EAECF0]">
                                    <tr v-for="row in state.channels" :key="row.channel">
                                        <td class="px-4 py-3">
                                            <span class="font-medium text-[#1F2533]">{{ channelLabel(row) }}</span>
                                            <span v-if="isSmallSample(row)" class="ml-2 text-[11px] text-[#8891A4]">{{ $t('superadmin.funnel.smallSample') }}</span>
                                        </td>
                                        <td v-for="stage in FUNNEL_STAGES" :key="stage" class="px-4 py-3 text-right tabular-nums">
                                            <span class="text-[#1F2533]">{{ row[stage] }}</span>
                                            <span v-if="stage !== 'signed_up'" class="ml-1 text-[12px] text-[#8891A4]">{{ pct(shareOfSignups(row, stage)) }}</span>
                                        </td>
                                        <td class="px-4 py-3 min-w-[9rem]">
                                            <div class="h-2 rounded-full bg-[#F2F4F7]" aria-hidden="true">
                                                <div class="h-2 rounded-full bg-[#205E77]" :style="{ width: `${shareOfSignups(row, 'paying') ?? 0}%` }" />
                                            </div>
                                        </td>
                                        <td class="px-4 py-3 text-[12px] text-[#5C6478]">
                                            <template v-if="biggestDrop(row)">
                                                {{ $t(`superadmin.funnel.stages.${biggestDrop(row)}`) }} ({{ pct(stepRate(row, biggestDrop(row)!)) }})
                                            </template>
                                            <template v-else>-</template>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot v-if="state.totals" class="bg-[#F9FAFB] font-semibold">
                                    <tr>
                                        <td class="px-4 py-3 text-[#1F2533]">{{ $t('superadmin.funnel.all') }}</td>
                                        <td v-for="stage in FUNNEL_STAGES" :key="stage" class="px-4 py-3 text-right tabular-nums text-[#1F2533]">{{ state.totals[stage] }}</td>
                                        <td class="px-4 py-3" colspan="2" />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <p class="mt-3 text-[12px] text-[#8891A4] max-w-3xl">{{ $t('superadmin.funnel.footnote') }}</p>

                        <!-- Growth loops: "suggest to my manager" and shared links, per period. -->
                        <section v-if="state.loops" class="mt-8" data-testid="funnel-growth-loops">
                            <h2 class="text-[17px] font-semibold text-[#1F2533]">{{ $t('superadmin.funnel.loops.title') }}</h2>
                            <p class="text-sm text-[#5C6478] mt-0.5 max-w-2xl">{{ $t('superadmin.funnel.loops.subtitle') }}</p>

                            <div class="mt-4 grid grid-cols-1 gap-5 xl:grid-cols-2">
                                <div class="bg-white border border-[#EAECF0] rounded-xl p-4" data-testid="funnel-loop-suggestions">
                                    <div class="flex flex-wrap items-baseline justify-between gap-2">
                                        <p class="text-[14px] font-semibold text-[#1F2533]">{{ $t('superadmin.funnel.loops.suggestions.title') }}</p>
                                        <p class="text-[13px] text-[#5C6478] tabular-nums">
                                            {{ $t('superadmin.funnel.loops.suggestions.rate', { days: state.loops.suggestions.window_days }) }}:
                                            <span class="font-semibold text-[#1F2533]">{{ pct(suggestionConversion(state.loops.suggestions.totals)) }}</span>
                                        </p>
                                    </div>
                                    <p class="mt-1 text-[12px] text-[#8891A4]">{{ $t('superadmin.funnel.loops.suggestions.hint', { days: state.loops.suggestions.window_days }) }}</p>
                                    <div class="mt-3 overflow-x-auto">
                                        <table class="w-full text-sm">
                                            <thead class="text-left text-[12px] text-[#5C6478]">
                                                <tr>
                                                    <th class="py-2 pr-3 font-medium">{{ $t('superadmin.funnel.loops.period') }}</th>
                                                    <th v-for="col in SUGGESTION_COLUMNS" :key="col.field" class="py-2 px-2 font-medium text-right">{{ $t(`superadmin.funnel.loops.suggestions.${col.label}`) }}</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-[#EAECF0]">
                                                <tr v-if="!suggestionRows.length"><td :colspan="SUGGESTION_COLUMNS.length + 1" class="py-4 text-center text-[#8891A4]">{{ $t('superadmin.funnel.loops.empty') }}</td></tr>
                                                <tr v-for="row in suggestionRows" :key="row.key">
                                                    <td class="py-2 pr-3 text-[#1F2533]">{{ row.key }}</td>
                                                    <td v-for="col in SUGGESTION_COLUMNS" :key="col.field" class="py-2 px-2 text-right tabular-nums">{{ row[col.field] }}</td>
                                                </tr>
                                            </tbody>
                                            <tfoot class="font-semibold">
                                                <tr>
                                                    <td class="py-2 pr-3 text-[#1F2533]">{{ $t('superadmin.funnel.all') }}</td>
                                                    <td v-for="col in SUGGESTION_COLUMNS" :key="col.field" class="py-2 px-2 text-right tabular-nums">{{ state.loops.suggestions.totals[col.field] }}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                <div class="bg-white border border-[#EAECF0] rounded-xl p-4" data-testid="funnel-loop-referrals">
                                    <div class="flex flex-wrap items-baseline justify-between gap-2">
                                        <p class="text-[14px] font-semibold text-[#1F2533]">{{ $t('superadmin.funnel.loops.referrals.title') }}</p>
                                        <p class="text-[13px] text-[#5C6478] tabular-nums">
                                            {{ $t('superadmin.funnel.loops.referrals.rate') }}:
                                            <span class="font-semibold text-[#1F2533]">{{ pct(referralPaidRate(state.loops.referrals.totals)) }}</span>
                                            <template v-if="state.loops.referrals.totals.median_days_to_paid != null">
                                                · {{ $t('superadmin.funnel.loops.referrals.medianDays', { days: state.loops.referrals.totals.median_days_to_paid }) }}
                                            </template>
                                        </p>
                                    </div>
                                    <p class="mt-1 text-[12px] text-[#8891A4]">{{ $t('superadmin.funnel.loops.referrals.hint') }}</p>
                                    <div class="mt-3 overflow-x-auto">
                                        <table class="w-full text-sm">
                                            <thead class="text-left text-[12px] text-[#5C6478]">
                                                <tr>
                                                    <th class="py-2 pr-3 font-medium">{{ $t('superadmin.funnel.loops.period') }}</th>
                                                    <th v-for="col in REFERRAL_COLUMNS" :key="col.field" class="py-2 px-2 font-medium text-right">{{ $t(`superadmin.funnel.loops.referrals.${col.label}`) }}</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-[#EAECF0]">
                                                <tr v-if="!referralRows.length"><td :colspan="REFERRAL_COLUMNS.length + 1" class="py-4 text-center text-[#8891A4]">{{ $t('superadmin.funnel.loops.empty') }}</td></tr>
                                                <tr v-for="row in referralRows" :key="row.key">
                                                    <td class="py-2 pr-3 text-[#1F2533]">{{ row.key }}</td>
                                                    <td v-for="col in REFERRAL_COLUMNS" :key="col.field" class="py-2 px-2 text-right tabular-nums">{{ row[col.field] }}</td>
                                                </tr>
                                            </tbody>
                                            <tfoot class="font-semibold">
                                                <tr>
                                                    <td class="py-2 pr-3 text-[#1F2533]">{{ $t('superadmin.funnel.all') }}</td>
                                                    <td v-for="col in REFERRAL_COLUMNS" :key="col.field" class="py-2 px-2 text-right tabular-nums">{{ state.loops.referrals.totals[col.field] }}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <!-- Cody nudges for admins: impression -> click -> trial started -> bought, per surface and week. -->
                        <section v-if="state.nudges" class="mt-8" data-testid="funnel-cody-nudges">
                            <h2 class="text-[17px] font-semibold text-[#1F2533]">{{ $t('superadmin.funnel.codyNudges.title') }}</h2>
                            <p class="text-sm text-[#5C6478] mt-0.5 max-w-2xl">{{ $t('superadmin.funnel.codyNudges.subtitle', { days: state.nudges.attribution_days }) }}</p>
                            <div class="mt-4 bg-white border border-[#EAECF0] rounded-xl p-4 overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead class="text-left text-[12px] text-[#5C6478]">
                                        <tr>
                                            <th class="py-2 pr-3 font-medium">{{ $t('superadmin.funnel.codyNudges.week') }}</th>
                                            <th class="py-2 pr-3 font-medium">{{ $t('superadmin.funnel.codyNudges.surface') }}</th>
                                            <th v-for="col in NUDGE_COLUMNS" :key="col" class="py-2 px-2 font-medium text-right">{{ $t(`superadmin.funnel.codyNudges.columns.${col}`) }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-[#EAECF0]">
                                        <tr v-if="!nudgeRows.length"><td :colspan="NUDGE_COLUMNS.length + 2" class="py-4 text-center text-[#8891A4]">{{ $t('superadmin.funnel.loops.empty') }}</td></tr>
                                        <tr v-for="row in nudgeRows" :key="`${row.week}-${row.surface}`">
                                            <td class="py-2 pr-3 text-[#1F2533]">{{ row.week }}</td>
                                            <td class="py-2 pr-3 text-[#1F2533]">{{ $t(`superadmin.funnel.codyNudges.surfaces.${row.surface}`) }}</td>
                                            <td v-for="col in NUDGE_COLUMNS" :key="col" class="py-2 px-2 text-right tabular-nums">{{ row[col] }}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot class="font-semibold">
                                        <tr v-for="surface in state.nudges.surfaces" :key="surface">
                                            <td class="py-2 pr-3 text-[#1F2533]">{{ $t('superadmin.funnel.all') }}</td>
                                            <td class="py-2 pr-3 text-[#1F2533]">{{ $t(`superadmin.funnel.codyNudges.surfaces.${surface}`) }}</td>
                                            <td v-for="col in NUDGE_COLUMNS" :key="col" class="py-2 px-2 text-right tabular-nums">{{ state.nudges.totals?.[surface]?.[col] ?? 0 }}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <p class="mt-2 text-[12px] text-[#8891A4] max-w-3xl">{{ $t('superadmin.funnel.codyNudges.footnote') }}</p>
                        </section>
                    </LoadingSpinner>
                </template>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
// Superadmin growth funnel: signups in a range, per signup channel, and how far they got.
// The numbers come from GET /superadmin/analytics/funnel (AnalyticsService::funnel); the rates are
// worked out in composables/growthFunnel.ts.
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { analyticsService } from '@/components/api/superadmin/AnalyticsService'
import { usePermissions } from '@/composables/usePermissions'
import { FUNNEL_STAGES, activeBuckets, biggestDrop, isSmallSample, referralPaidRate, shareOfSignups, stepRate, suggestionConversion, type FunnelRow } from '@/composables/growthFunnel'
import { nudgeReportRows } from '@/composables/codyNudge'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t, te } = useI18n()
const { can } = usePermissions()

const canView = computed(() => can('view_management'))
const presets = ['thisQuarter', 'thisYear', 'lastTwelveMonths', 'lastYear']

const state = reactive({
    from: moment().subtract(11, 'months').startOf('month').format('YYYY-MM-DD'),
    to: moment().format('YYYY-MM-DD'),
    activePreset: 'lastTwelveMonths' as string | null,
    channels: [] as FunnelRow[],
    totals: null as FunnelRow | null,
    loops: null as any,
    nudges: null as any,
    isLoading: false,
    error: {} as Error,
})

const SUGGESTION_COLUMNS = [
    { field: 'sends', label: 'sends' },
    { field: 'recipients', label: 'recipients' },
    { field: 'suggested_apps', label: 'apps' },
    { field: 'converted', label: 'converted' },
    { field: 'open', label: 'open' },
] as const
const REFERRAL_COLUMNS = [
    { field: 'shares', label: 'shares' },
    { field: 'signed_up', label: 'signedUp' },
    { field: 'paid', label: 'paid' },
] as const

const NUDGE_COLUMNS = ['impressions', 'viewers', 'clicks', 'try_free', 'buy', 'companies', 'trial_started', 'bought'] as const
const nudgeRows = computed(() => nudgeReportRows(state.nudges))

const suggestionRows = computed(() => activeBuckets(state.loops?.suggestions?.buckets, ['sends', 'suggested_apps', 'converted']))
const referralRows = computed(() => activeBuckets(state.loops?.referrals?.buckets, ['shares', 'signed_up', 'paid']))

function pct(value: number | null): string {
    return value === null ? '-' : `${value}%`
}

/** The superadmin companies list's channel names where there is one, else the backend's label. */
function channelLabel(row: FunnelRow): string {
    const key = `superadmin.companies.source.${row.channel}`
    return te(key) ? t(key) : row.label
}

function applyPreset(key: string) {
    const now = moment()
    switch (key) {
        case 'thisQuarter':
            state.from = now.clone().startOf('quarter').format('YYYY-MM-DD')
            state.to = now.format('YYYY-MM-DD')
            break
        case 'thisYear':
            state.from = now.clone().startOf('year').format('YYYY-MM-DD')
            state.to = now.format('YYYY-MM-DD')
            break
        case 'lastYear':
            state.from = now.clone().subtract(1, 'year').startOf('year').format('YYYY-MM-DD')
            state.to = now.clone().subtract(1, 'year').endOf('year').format('YYYY-MM-DD')
            break
        default:
            state.from = now.clone().subtract(11, 'months').startOf('month').format('YYYY-MM-DD')
            state.to = now.format('YYYY-MM-DD')
    }
    state.activePreset = key
    fetchFunnel()
}

function onRangeChanged() {
    state.activePreset = null
    fetchFunnel()
}

async function fetchFunnel() {
    if (!canView.value) return
    state.error = {}
    state.isLoading = true
    try {
        const response = await analyticsService.getFunnel({ from: state.from, to: state.to })
        state.channels = response?.channels ?? []
        state.totals = response?.totals ?? null
        // An older backend has no growth_loops; the section then stays hidden.
        state.loops = response?.growth_loops ?? null
    } catch (error: any) {
        state.error = error
    }
    // Its own request, so an older backend without it leaves the rest of the page alone.
    try {
        state.nudges = await analyticsService.getCodyNudges({ from: state.from, to: state.to })
    } catch (_) {
        state.nudges = null
    }
    state.isLoading = false
}

onMounted(fetchFunnel)
</script>
