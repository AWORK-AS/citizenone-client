<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.referrals.header') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.referrals.header') }}</template>

            <!--
                "Giv en måned, få en måned": companies that signed up through a customer's share link,
                and the free months both sides earned once the new one paid. Free months are applied
                by hand, so this is also the list of months still to take off an invoice.
            -->
            <div class="p-1" data-testid="superadmin-referrals">
                <div class="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">{{ $t('superadmin.referrals.header') }}</h1>
                        <p class="text-sm text-[#5C6478] mt-0.5 max-w-2xl">{{ $t('superadmin.referrals.subtitle') }}</p>
                    </div>
                    <div class="flex flex-wrap items-end gap-2">
                        <select v-model="state.status" @change="load" :aria-label="$t('superadmin.referrals.statusColumn')"
                            class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#5C6478] outline-none focus:border-[#42AED9]">
                            <option value="">{{ $t('superadmin.referrals.allStatuses') }}</option>
                            <option v-for="status in REFERRAL_STATUSES" :key="status" :value="status">
                                {{ $t(`superadmin.referrals.status.${status}`) }}
                            </option>
                        </select>
                    </div>
                </div>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <p class="mb-4 rounded-lg border border-[#FDE7C7] bg-[#FFFAF2] px-4 py-3 text-[13px] text-[#7A4B0B]">
                    {{ $t('superadmin.referrals.manualHint') }}
                </p>

                <LoadingSpinner :isActive="state.isLoading">
                    <div class="grid grid-cols-2 gap-4 mb-5 xl:grid-cols-5">
                        <div v-for="card in cards" :key="card.key" class="bg-white border border-[#EAECF0] rounded-xl shadow-sm px-4 py-4">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-[#8891A4]">{{ card.label }}</p>
                            <p class="mt-1 text-2xl font-semibold text-[#1F2533] tabular-nums">{{ card.value }}</p>
                        </div>
                    </div>

                    <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-x-auto">
                        <p v-if="!state.referrals.length" class="p-8 text-center text-sm text-[#8891A4]">{{ $t('superadmin.referrals.empty') }}</p>
                        <table v-else class="w-full">
                            <thead>
                                <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                    <th class="co-th">{{ $t('superadmin.referrals.referrer') }}</th>
                                    <th class="co-th">{{ $t('superadmin.referrals.referred') }}</th>
                                    <th class="co-th">{{ $t('superadmin.referrals.signedUp') }}</th>
                                    <th class="co-th">{{ $t('superadmin.referrals.statusColumn') }}</th>
                                    <th class="co-th">{{ $t('superadmin.referrals.credits') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in state.referrals" :key="row.uuid" class="border-b border-[#F5F6F8] align-top">
                                    <td class="co-td text-[13px]">
                                        <NuxtLink v-if="row.referrer.uuid" :to="`/superadmin/companies/${row.referrer.uuid}/overview`" class="hover:underline">{{ row.referrer.name }}</NuxtLink>
                                    </td>
                                    <td class="co-td text-[13px]">
                                        <NuxtLink v-if="row.referred.uuid" :to="`/superadmin/companies/${row.referred.uuid}/overview`" class="hover:underline">{{ row.referred.name }}</NuxtLink>
                                    </td>
                                    <td class="co-td text-[13px] text-[#5C6478] whitespace-nowrap">{{ formatDate(row.created_at) }}</td>
                                    <td class="co-td text-[13px]">
                                        <span class="co-badge" :class="row.status === 'rewarded' ? 'co-badge-navy' : ''">{{ $t(`superadmin.referrals.status.${row.status}`) }}</span>
                                        <p v-if="row.rejection_reason" class="mt-1 text-[12px] text-[#8891A4]">{{ $t(`superadmin.referrals.reasons.${row.rejection_reason}`) }}</p>
                                        <p v-if="row.status === 'rewarded' && row.referrer_rewarded === false" class="mt-1 text-[12px] text-[#8891A4] max-w-[16rem]">{{ $t('superadmin.referrals.capped') }}</p>
                                    </td>
                                    <td class="co-td text-[13px]">
                                        <div v-for="credit in row.credits" :key="credit.uuid" class="mb-2 last:mb-0">
                                            <p class="text-[#1F2533]">
                                                {{ credit.company_name }} · {{ $t(`superadmin.referrals.role.${credit.role}`) }}
                                            </p>
                                            <p class="text-[12px] text-[#5C6478]">
                                                {{ credit.amount !== null ? $t('superadmin.referrals.amount', { amount: formatAmount(credit.amount) }) : $t('superadmin.referrals.noAmount') }}
                                                · {{ $t(`superadmin.referrals.creditStatus.${credit.status}`) }}
                                                <template v-if="credit.applied_note"> · {{ credit.applied_note }}</template>
                                            </p>
                                            <template v-if="credit.status === 'earned' && canManage">
                                                <div v-if="state.settling === credit.uuid" class="mt-1 flex flex-wrap items-center gap-2">
                                                    <input v-model="state.note" type="text" maxlength="255" :placeholder="$t('superadmin.referrals.notePlaceholder')"
                                                        :aria-label="$t('superadmin.referrals.notePlaceholder')"
                                                        class="min-w-[14rem] flex-1 rounded-lg border border-[#EAECF0] px-2.5 py-1.5 text-[12px]" />
                                                    <button type="button" class="text-[12px] font-semibold text-[#205E77] disabled:opacity-50" :disabled="!state.note.trim() || state.saving"
                                                        @click="settle(credit.uuid)">{{ $t('superadmin.referrals.save') }}</button>
                                                    <button type="button" class="text-[12px] text-[#5C6478]" @click="state.settling = null">{{ $t('superadmin.referrals.cancel') }}</button>
                                                </div>
                                                <div v-else class="mt-1 flex gap-3">
                                                    <button type="button" class="text-[12px] font-semibold text-[#205E77]" @click="startSettling(credit.uuid, 'applied')">{{ $t('superadmin.referrals.apply') }}</button>
                                                    <button type="button" class="text-[12px] text-[#B42318]" @click="startSettling(credit.uuid, 'void')">{{ $t('superadmin.referrals.void') }}</button>
                                                </div>
                                            </template>
                                        </div>
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
import { superadminCompanyReferralService } from '@/components/api/superadmin/CompanyReferralService'
import { usePermissions } from '@/composables/usePermissions'
import { REFERRAL_STATUSES } from '@/composables/referralProgram'

const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()
const { can } = usePermissions()

// Viewing is view_financials (the route's gate); booking a month as given is manage_financials.
const canManage = computed(() => can('manage_financials'))

const state = reactive({
    status: '' as string,
    summary: { referrals: 0, pending: 0, rewarded: 0, rejected: 0, credits_to_apply: 0 },
    referrals: [] as any[],
    isLoading: true,
    error: '',
    settling: null as string | null,
    settleStatus: 'applied' as 'applied' | 'void',
    note: '',
    saving: false,
})

const cards = computed(() => [
    { key: 'referrals', label: t('superadmin.referrals.cards.referrals'), value: state.summary.referrals },
    { key: 'pending', label: t('superadmin.referrals.cards.pending'), value: state.summary.pending },
    { key: 'rewarded', label: t('superadmin.referrals.cards.rewarded'), value: state.summary.rewarded },
    { key: 'rejected', label: t('superadmin.referrals.cards.rejected'), value: state.summary.rejected },
    { key: 'toApply', label: t('superadmin.referrals.cards.toApply'), value: state.summary.credits_to_apply },
])

function formatDate(value: string | null): string {
    if (!value) return '-'
    return moment(value).locale(locale.value === 'en' ? 'en-gb' : 'da').format('D. MMM YYYY')
}

function formatAmount(value: number): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function startSettling(uuid: string, status: 'applied' | 'void') {
    state.settling = uuid
    state.settleStatus = status
    state.note = ''
}

async function settle(uuid: string) {
    state.saving = true
    state.error = ''
    try {
        await superadminCompanyReferralService.settleCredit(uuid, { status: state.settleStatus, note: state.note.trim() })
        state.settling = null
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
    state.saving = false
}

async function load() {
    state.error = ''
    state.isLoading = true
    try {
        const response = await superadminCompanyReferralService.getOverview(state.status ? { status: state.status } : {})
        state.summary = response?.data?.summary ?? state.summary
        state.referrals = response?.data?.referrals ?? []
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isLoading = false
    }
}

onMounted(() => load())
</script>
