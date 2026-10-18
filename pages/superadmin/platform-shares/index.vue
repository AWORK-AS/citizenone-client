<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.platformShares.header') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.platformShares.header') }}
            </template>

            <!-- Task #16: how many have shared CitizenOne, and who signed up through a shared link. -->
            <div class="p-1" data-testid="superadmin-platform-shares">
                <div class="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.platformShares.header') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">
                            {{ $t('superadmin.platformShares.subtitle') }}
                        </p>
                    </div>

                    <div class="flex flex-wrap items-end gap-2">
                        <select v-model="state.period" @change="load"
                            class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#5C6478] outline-none focus:border-[#42AED9] transition-colors">
                            <option v-for="period in PERIODS" :key="period" :value="period">
                                {{ $t(`superadmin.platformShares.periods.${period}`) }}
                            </option>
                        </select>
                    </div>
                </div>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
                        <div v-for="card in cards" :key="card.key" :data-testid="`platform-shares-card-${card.key}`"
                            class="bg-white border border-[#EAECF0] rounded-xl shadow-sm px-4 py-4">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-[#8891A4]">{{ card.label }}</p>
                            <p class="mt-1 text-2xl font-semibold text-[#1F2533] tabular-nums">{{ card.value }}</p>
                            <p class="mt-1 text-xs text-[#8891A4]">{{ card.hint }}</p>
                        </div>
                    </div>

                    <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm px-4 py-4 mb-5">
                        <p class="text-[11px] font-semibold uppercase tracking-wide text-[#8891A4] mb-3">
                            {{ $t('superadmin.platformShares.byMethod') }}
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="(count, method) in state.summary.by_method" :key="method"
                                class="co-badge" :class="count ? 'co-badge-navy' : ''">
                                {{ methodLabel(String(method)) }}: <span class="tabular-nums">{{ count }}</span>
                            </span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
                        <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                        <th class="co-th">{{ $t('superadmin.platformShares.company') }}</th>
                                        <th class="co-th text-right">{{ $t('superadmin.platformShares.shares') }}</th>
                                        <th class="co-th text-right">{{ $t('superadmin.platformShares.users') }}</th>
                                        <th class="co-th text-right">{{ $t('superadmin.platformShares.signups') }}</th>
                                        <th class="co-th">{{ $t('superadmin.platformShares.lastShared') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in state.companies" :key="row.company_uuid"
                                        class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                        <td class="co-td text-[13px] text-[#1F2533]">
                                            <NuxtLink :to="`/superadmin/companies/${row.company_uuid}/overview`" class="hover:underline">
                                                {{ row.company_name }}
                                            </NuxtLink>
                                        </td>
                                        <td class="co-td text-right text-[13px] font-semibold text-[#1F2533] tabular-nums">{{ row.shares }}</td>
                                        <td class="co-td text-right text-[13px] text-[#5C6478] tabular-nums">{{ row.users }}</td>
                                        <td class="co-td text-right text-[13px] tabular-nums"
                                            :class="row.signups ? 'font-semibold text-[#2E9E33]' : 'text-[#5C6478]'">{{ row.signups }}</td>
                                        <td class="co-td text-[13px] text-[#5C6478] whitespace-nowrap">{{ formatDate(row.last_shared_at) }}</td>
                                    </tr>
                                    <tr v-if="!state.companies.length">
                                        <td class="co-td text-[13px] text-[#8891A4]" colspan="5">
                                            {{ $t('superadmin.platformShares.empty') }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                        <th class="co-th" colspan="3">{{ $t('superadmin.platformShares.signupsTitle') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in state.signups" :key="row.company_uuid"
                                        class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                        <td class="co-td text-[13px] text-[#1F2533]">
                                            <NuxtLink :to="`/superadmin/companies/${row.company_uuid}/overview`" class="hover:underline">
                                                {{ row.company_name }}
                                            </NuxtLink>
                                        </td>
                                        <td class="co-td text-[13px] text-[#5C6478]">
                                            {{ $t('superadmin.platformShares.sharedBy', {
                                                name: row.shared_by_user_name || '—',
                                                company: row.shared_by_company_name || '—',
                                            }) }}
                                        </td>
                                        <td class="co-td text-[13px] text-[#5C6478] whitespace-nowrap">{{ formatDate(row.created_at) }}</td>
                                    </tr>
                                    <tr v-if="!state.signups.length">
                                        <td class="co-td text-[13px] text-[#8891A4]" colspan="3">
                                            {{ $t('superadmin.platformShares.noSignups') }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                    <th class="co-th">{{ $t('superadmin.platformShares.recent') }}</th>
                                    <th class="co-th">{{ $t('superadmin.platformShares.company') }}</th>
                                    <th class="co-th">{{ $t('superadmin.platformShares.method') }}</th>
                                    <th class="co-th">{{ $t('superadmin.platformShares.when') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in state.recent" :key="row.uuid" class="border-b border-[#F5F6F8]">
                                    <td class="co-td text-[13px] text-[#1F2533]">{{ row.user_name || '—' }}</td>
                                    <td class="co-td text-[13px] text-[#5C6478]">{{ row.company_name || '—' }}</td>
                                    <td class="co-td text-[13px] text-[#5C6478]">{{ methodLabel(row.method) }}</td>
                                    <td class="co-td text-[13px] text-[#5C6478] whitespace-nowrap">{{ formatDate(row.created_at, true) }}</td>
                                </tr>
                                <tr v-if="!state.recent.length">
                                    <td class="co-td text-[13px] text-[#8891A4]" colspan="4">
                                        {{ $t('superadmin.platformShares.empty') }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { superadminPlatformShareService } from '@/components/api/superadmin/PlatformShareService'

const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()

const PERIODS = ['all', '30d', 'month', 'year'] as const
type Period = typeof PERIODS[number]

const state = reactive({
    period: 'all' as Period,
    summary: { shares: 0, users: 0, companies: 0, signups: 0, by_method: {} as Record<string, number> },
    companies: [] as any[],
    recent: [] as any[],
    signups: [] as any[],
    isLoading: true,
    error: '',
})

const cards = computed(() => [
    { key: 'users', label: t('superadmin.platformShares.cards.users'), value: state.summary.users, hint: t('superadmin.platformShares.cards.usersHint') },
    { key: 'companies', label: t('superadmin.platformShares.cards.companies'), value: state.summary.companies, hint: t('superadmin.platformShares.cards.companiesHint') },
    { key: 'shares', label: t('superadmin.platformShares.cards.shares'), value: state.summary.shares, hint: t('superadmin.platformShares.cards.sharesHint') },
    { key: 'signups', label: t('superadmin.platformShares.cards.signups'), value: state.summary.signups, hint: t('superadmin.platformShares.cards.signupsHint') },
])

function periodRange(period: Period): { date_from?: string, date_to?: string } {
    const today = moment()
    if (period === '30d') return { date_from: today.clone().subtract(29, 'days').format('YYYY-MM-DD'), date_to: today.format('YYYY-MM-DD') }
    if (period === 'month') return { date_from: today.clone().startOf('month').format('YYYY-MM-DD'), date_to: today.format('YYYY-MM-DD') }
    if (period === 'year') return { date_from: today.clone().startOf('year').format('YYYY-MM-DD'), date_to: today.format('YYYY-MM-DD') }
    return {}
}

function methodLabel(method: string): string {
    return t(`superadmin.platformShares.methods.${method}`)
}

function formatDate(value: string | null, withTime = false): string {
    if (!value) return '—'
    return moment(value).locale(locale.value === 'en' ? 'en-gb' : 'da').format(withTime ? 'D. MMM YYYY HH:mm' : 'D. MMM YYYY')
}

async function load() {
    state.error = ''
    state.isLoading = true
    try {
        const response = await superadminPlatformShareService.getOverview(periodRange(state.period))
        const data = response?.data
        if (data) {
            state.summary = data.summary
            state.companies = data.companies || []
            state.recent = data.recent || []
            state.signups = data.signups || []
        }
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isLoading = false
    }
}

onMounted(() => load())
</script>
