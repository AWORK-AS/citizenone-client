<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('socialWelfare.contract.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400" aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('socialWelfare.contract.title') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />
                <ModulesUserCitizenWalletTabs />

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div class="mt-6 space-y-5">
                        <!-- The terms that apply today, and who is billed -->
                        <div class="bg-white border border-surface-200 rounded-xl p-5 shadow-sm">
                            <div class="flex flex-wrap items-start justify-between gap-4">
                                <div class="space-y-1">
                                    <p class="text-xs text-slate-400 uppercase tracking-wide">{{ $t('socialWelfare.contract.billedTo') }}</p>
                                    <template v-if="current?.customer_department">
                                        <p class="text-base font-semibold text-slate-900">
                                            {{ [current.customer_department.customer_name, current.customer_department.name].filter(Boolean).join(', ') }}
                                        </p>
                                        <p class="text-sm text-slate-500">
                                            {{ [current.customer_department.address, current.customer_department.ean_number ? `EAN ${current.customer_department.ean_number}` : null]
                                                .filter(Boolean).join(' · ') }}
                                        </p>
                                    </template>
                                    <p v-else class="text-sm text-slate-400">{{ $t('socialWelfare.contract.noDepartmentYet') }}</p>
                                </div>
                                <FormButton v-if="canWrite" buttonStyle="action" @click="openNew">
                                    <Icon name="ph:plus" class="h-4 w-4" />
                                    {{ $t('socialWelfare.contract.newPeriod') }}
                                </FormButton>
                            </div>

                            <div v-if="current" class="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p class="text-xs text-slate-400">{{ $t('socialWelfare.contract.agreedPrice') }}</p>
                                    <p class="text-lg font-semibold text-slate-900">{{ priceLabel(current) }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-slate-400">{{ $t('socialWelfare.contract.grantedHours') }}</p>
                                    <p class="text-lg font-semibold text-slate-900">
                                        {{ formatHours(current.granted_hours) }}
                                        <span class="text-xs font-normal text-slate-400">{{ intervalLabel(current.hours_interval) }}</span>
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-slate-400">{{ $t('socialWelfare.contract.billingFrequency') }}</p>
                                    <p class="text-lg font-semibold text-slate-900">{{ $t(`socialWelfare.contract.frequencies.${current.billing_frequency}`) }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-slate-400">{{ $t('socialWelfare.contract.paymentTermsDays') }}</p>
                                    <p class="text-lg font-semibold text-slate-900">
                                        {{ termsOf(current) === null ? '-' : $t('socialWelfare.customerDepartments.days', { days: termsOf(current) }) }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-slate-400">{{ $t('socialWelfare.contract.billingTiming') }}</p>
                                    <p class="text-lg font-semibold text-slate-900">{{ timingLabel(current) }}</p>
                                </div>
                                <div>
                                    <Tooltip :text="$t('socialWelfare.contract.specialLanguageHelp')" wrap position="top">
                                        <p class="text-xs text-slate-400">{{ $t('socialWelfare.contract.specialLanguage') }}</p>
                                    </Tooltip>
                                    <p class="text-lg font-semibold text-slate-900">{{ specialLanguageOf(current) ? $t('yes') : $t('no') }}</p>
                                </div>
                                <div v-for="field in shownFields(current)" :key="field.field_uuid">
                                    <p class="text-xs text-slate-400">{{ field.label }}</p>
                                    <p class="text-lg font-semibold text-slate-900">{{ field.value }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- The stay's own contract fields, until a real period exists -->
                        <div v-if="!state.periods.length && state.fallback.length"
                            class="rounded-xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-900 space-y-2">
                            <p class="font-medium">{{ $t('socialWelfare.contract.fallbackTitle') }}</p>
                            <p>{{ $t('socialWelfare.contract.fallbackText') }}</p>
                            <ul class="list-disc pl-5">
                                <li v-for="period in state.fallback" :key="period.stay_uuid">
                                    {{ period.stay_journal_number || $t('socialWelfare.billing.stayWithoutNumber') }}:
                                    {{ period.start_date }} - {{ period.end_date || '...' }},
                                    {{ $t('socialWelfare.contract.agreedPrice') }} {{ period.agreed_price === null ? '-' : formatAmount(period.agreed_price) }},
                                    {{ $t('socialWelfare.contract.grantedHours') }} {{ formatHours(period.granted_hours) }} {{ intervalLabel(period.hours_interval) }}
                                </li>
                            </ul>
                        </div>

                        <!-- History: every period, newest first -->
                        <div class="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
                            <div class="px-5 py-3 border-b border-surface-200 bg-slate-50">
                                <p class="text-sm font-semibold text-slate-900">{{ $t('socialWelfare.contract.history') }}</p>
                            </div>
                            <p v-if="!state.periods.length" class="px-5 py-8 text-center text-sm text-slate-400">
                                {{ $t('socialWelfare.contract.noPeriods') }}
                            </p>
                            <div v-else class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="border-b border-surface-200">
                                        <tr>
                                            <th class="co-th">{{ $t('socialWelfare.contract.period') }}</th>
                                            <th class="co-th">{{ $t('socialWelfare.contract.department') }}</th>
                                            <th class="co-th">{{ $t('socialWelfare.contract.agreedPrice') }}</th>
                                            <th class="co-th">{{ $t('socialWelfare.contract.hoursSplit') }}</th>
                                            <th class="co-th">{{ $t('socialWelfare.contract.billingFrequency') }}</th>
                                            <th class="co-th">{{ $t('socialWelfare.contract.onInvoice') }}</th>
                                            <th class="co-th">{{ $t('socialWelfare.contract.lines') }}</th>
                                            <th class="co-th"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="period in state.periods" :key="period.uuid"
                                            class="border-b border-surface-200 last:border-0 align-top">
                                            <td class="co-td">
                                                <p class="font-medium text-slate-900 whitespace-nowrap">
                                                    {{ period.start_date }} - {{ period.end_date || '...' }}
                                                </p>
                                                <p v-if="period.uuid === state.currentUuid" class="co-badge co-badge-green text-[11px] mt-1 inline-block">
                                                    {{ $t('socialWelfare.contract.current') }}
                                                </p>
                                                <p v-if="period.stay_journal_number" class="text-[12px] text-slate-400">{{ period.stay_journal_number }}</p>
                                            </td>
                                            <td class="co-td text-slate-600">
                                                {{ period.customer_department
                                                    ? [period.customer_department.customer_name, period.customer_department.name].filter(Boolean).join(', ')
                                                    : '-' }}
                                            </td>
                                            <td class="co-td text-slate-900 whitespace-nowrap">{{ priceLabel(period) }}</td>
                                            <td class="co-td text-slate-600 text-[13px]">
                                                <template v-if="period.hours?.length">
                                                    <p v-for="row in period.hours" :key="row.hour_type_uuid">
                                                        {{ row.name }}: {{ formatHours(row.hours) }}
                                                        <span class="text-[11px] text-slate-400">({{ $t(`socialWelfare.hourTypes.basis.${row.billing_basis}`) }})</span>
                                                    </p>
                                                </template>
                                                <template v-else>
                                                    <p>{{ $t('socialWelfare.contract.contactHoursShort') }}: {{ formatHours(period.contact_hours) }}</p>
                                                    <p>{{ $t('socialWelfare.contract.adminHoursShort') }}: {{ formatHours(period.admin_hours) }}</p>
                                                    <p>{{ $t('socialWelfare.contract.transportHoursShort') }}: {{ formatHours(period.transport_hours) }}</p>
                                                </template>
                                                <p class="text-slate-400">{{ intervalLabel(period.hours_interval) }}</p>
                                            </td>
                                            <td class="co-td text-slate-600">
                                                <p>{{ $t(`socialWelfare.contract.frequencies.${period.billing_frequency}`) }}</p>
                                                <p class="text-[12px] text-slate-400">{{ timingLabel(period) }}</p>
                                            </td>
                                            <td class="co-td text-slate-600 text-[13px]">
                                                <p v-if="period.show_cpr_on_invoice">{{ $t('socialWelfare.contract.cpr') }}</p>
                                                <p v-if="period.show_case_number_on_invoice">{{ $t('socialWelfare.contract.caseNumber') }}</p>
                                                <p v-if="period.economic_customer_number">{{ $t('socialWelfare.contract.economicCustomerNumberShort') }} {{ period.economic_customer_number }}</p>
                                                <p v-if="period.economic_product_number">{{ $t('socialWelfare.contract.economicProductNumberShort') }} {{ period.economic_product_number }}</p>
                                                <p v-if="specialLanguageOf(period)">{{ $t('socialWelfare.contract.specialLanguage') }}</p>
                                                <p v-for="field in shownFields(period)" :key="field.field_uuid">{{ field.label }}: {{ field.value }}</p>
                                            </td>
                                            <td class="co-td text-slate-600 text-[13px]">
                                                <p v-for="line in period.lines" :key="line.uuid">
                                                    <span v-if="line.kind && line.kind !== 'custom'" class="co-badge text-[11px] mr-1">
                                                        {{ $t(`socialWelfare.contract.presetKinds.${line.kind}`) }}
                                                    </span>
                                                    {{ line.description }}: {{ formatAmount(line.amount) }}
                                                    <span class="text-slate-400">({{ $t(`socialWelfare.contract.recurrences.${line.recurrence}`) }})</span>
                                                </p>
                                                <span v-if="!period.lines.length">-</span>
                                            </td>
                                            <td class="co-td">
                                                <div v-if="canWrite" class="flex items-center justify-end gap-2">
                                                    <Tooltip :text="$t('edit')" position="left">
                                                        <button type="button" class="text-slate-400 hover:text-primary transition"
                                                            :aria-label="$t('edit')" @click="openEdit(period)">
                                                            <Icon name="ph:pencil-simple" class="w-4 h-4" />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip :text="$t('delete')" position="left">
                                                        <button type="button" class="text-slate-400 hover:text-red-600 transition"
                                                            :aria-label="$t('delete')" @click="confirmDelete(period)">
                                                            <Icon name="ph:trash" class="w-4 h-4" />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <ModulesUserCitizenContractPeriodModal :isModalOpen="state.isModalOpen" :citizenUuid="citizenUuid"
                :citizen="state.citizen" :period="state.editing" :previous="previousForNew" :template="state.template"
                :stays="state.stays" :departments="state.departments"
                @close="state.isModalOpen = false" @saved="fetchContract" />
            <DialogConfirmation :isModalOpen="state.isDeleteOpen" :message="$t('socialWelfare.contract.confirmDelete')"
                @close="state.isDeleteOpen = false" @confirm="deletePeriod" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useCustomPagesStore } from '@/store/custom-pages'
import { usePermissions } from '@/composables/usePermissions'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const { isAtLeast, can } = usePermissions()
const { formatAmount } = useAmountFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const route = useRoute()
const citizenUuid = String(route.params.uuid)

const breadcrumbLinks = [
    { name: 'socialWelfare.contract.title', translate: true, href: `/citizens/${citizenUuid}/contract` },
]

const canWrite = computed(() => isAtLeast('Admin') || can('create_citizen_economy') || can('update_citizen_economy'))

const state = reactive({
    error: {} as Error,
    isLoading: false,
    citizen: null as any,
    periods: [] as any[],
    fallback: [] as any[],
    stays: [] as any[],
    departments: [] as any[],
    template: null as any,
    currentUuid: null as string | null,
    isModalOpen: false,
    isDeleteOpen: false,
    editing: null as any,
    deleting: null as any,
})

const current = computed(() =>
    state.periods.find((p: any) => p.uuid === state.currentUuid) ?? state.periods[0] ?? null
)

// A new period is prefilled from the newest one, or from the stay's own
// contract fields when there is no period yet.
const previousForNew = computed(() => state.periods[0] ?? state.fallback[0] ?? null)

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'social_welfare') {
        navigateTo(`/citizens/${citizenUuid}/wallets`)

        return
    }

    fetchContract()
    fetchDepartments()
})

async function fetchContract() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await socialWelfareService.getContractPeriods(citizenUuid)
        const data = response?.data ?? {}
        state.citizen = data.citizen ?? null
        state.periods = data.periods ?? []
        state.fallback = data.fallback_periods ?? []
        state.stays = data.stays ?? []
        state.currentUuid = data.current_period_uuid ?? null
        state.template = data.new_period_template ?? null
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function fetchDepartments() {
    try {
        const response = await socialWelfareService.getCustomerDepartments({ active_only: 1 })
        state.departments = response?.data ?? []
    } catch (error: any) {
        // The contract can be saved without a department.
    }
}

function openNew() {
    state.editing = null
    state.isModalOpen = true
}

function openEdit(period: any) {
    state.editing = period
    state.isModalOpen = true
}

function confirmDelete(period: any) {
    state.deleting = period
    state.isDeleteOpen = true
}

async function deletePeriod() {
    state.isDeleteOpen = false
    state.error = {} as Error
    try {
        await socialWelfareService.deleteContractPeriod(state.deleting.uuid)
        successAlert(`${t('alert.success')}!`, t('socialWelfare.contract.deleted'))
        fetchContract()
    } catch (error: any) {
        state.error = error
    }
}

function formatHours(hours: any): string {
    if (hours === null || hours === undefined) return '-'

    return Number(hours).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function intervalLabel(interval: string): string {
    return interval ? t(`socialWelfare.contract.intervals.${interval}`) : ''
}

function priceLabel(period: any): string {
    if (period.price === null || period.price === undefined) return '-'

    let suffix = t('socialWelfare.contract.perHour')

    if (period.price_type === 'fixed') suffix = t(`socialWelfare.contract.perFrequency.${period.billing_frequency}`)
    if (period.price_type === 'one_off') suffix = t('socialWelfare.contract.onceOnly')

    return `${formatAmount(period.price)} ${suffix}`
}

function timingLabel(period: any): string {
    return t(`socialWelfare.contract.billingTimings.${period?.billing_timing || 'in_arrears'}`)
}

// The flag is on the citizen; each period carries the same value read-only.
function specialLanguageOf(period: any): boolean {
    return !!(period?.has_special_language ?? state.citizen?.has_special_language)
}

// Only the custom fields that are meant for the contract, and only filled ones.
function shownFields(period: any): any[] {
    return (period?.custom_fields ?? []).filter((field: any) =>
        field.show_on_contract && field.value !== null && field.value !== undefined && field.value !== ''
    )
}

function termsOf(period: any): number | null {
    return period.payment_terms_days ?? period.customer_department?.payment_terms_days ?? null
}
</script>
