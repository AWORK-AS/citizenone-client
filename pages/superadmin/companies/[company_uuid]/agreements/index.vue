<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.agreements.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.agreements.title') }}</template>

            <div class="p-1">
                <!-- Back -->
                <NuxtLink to="/superadmin/companies"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-5 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    {{ $t('superadmin.companies.accounts.allCompanies') }}
                </NuxtLink>

                <!-- Sub-nav tabs -->
                <div class="flex items-center gap-1 mb-6 border-b border-[#EAECF0]">
                    <button v-for="tab in detailTabs" :key="tab.href"
                        class="px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px" :class="$route.path === tab.href
                            ? 'border-[#42AED9] text-[#205E77]'
                            : 'border-transparent text-[#5C6478] hover:text-[#1F2533]'" @click="navigateTo(tab.href)">
                        <div class="flex items-center gap-1.5">
                            <Icon :name="tab.icon" class="w-4 h-4" />
                            {{ tab.label }}
                        </div>
                    </button>
                </div>

                <div class="space-y-4">
                    <ModulesSuperadminAgreementInternalNotice />

                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-[18px] font-semibold text-[#1F2533]">{{ $t('superadmin.agreements.title') }}</h1>
                            <p class="text-sm text-[#5C6478] mt-0.5">{{ $t('superadmin.agreements.subtitle') }}</p>
                        </div>
                        <Tooltip :text="$t('superadmin.agreements.newHelp')" position="left">
                            <FormButton buttonStyle="primary" @click="openCreate">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('superadmin.agreements.new') }}
                            </FormButton>
                        </Tooltip>
                    </div>

                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div class="flex flex-wrap items-center gap-2">
                        <Tooltip :text="$t('superadmin.companies.form.economicCustomerNumberHelp')" position="top" wrap>
                            <span class="co-badge co-badge-gray">
                                <Icon name="ph:hash" class="w-3 h-3" aria-hidden="true" />
                                {{ state.company?.economic_customer_number
                                    ? $t('superadmin.companies.economicCustomerNumber', { number: state.company.economic_customer_number })
                                    : $t('superadmin.companies.economicCustomerNumberNone') }}
                            </span>
                        </Tooltip>
                    </div>
                    <Tooltip v-if="showMissingNumber" :text="$t('superadmin.companies.form.economicCustomerNumberHelp')"
                        position="top" wrap class="!block">
                        <Alert type="warning" :text="$t('superadmin.agreements.economic.missingNumber')" />
                    </Tooltip>

                    <div class="overflow-x-auto">
                    <div class="min-w-[1100px]">
                    <SuperadminTable :columnHeaders="columnHeaders" :data="{ data: state.agreements }"
                        :isLoading="state.isLoading" :emptyMessage="$t('superadmin.agreements.empty')"
                        :emptySubMessage="$t('superadmin.agreements.emptyHint')" emptyIcon="ph:handshake" rowKey="uuid">
                        <template #body>
                            <tr v-for="agreement in state.agreements" :key="agreement.uuid"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                                @click="openDetail(agreement)">
                                <td class="co-td">
                                    <p class="text-[14px] font-medium text-[#1F2533]">{{ agreement.name }}</p>
                                    <p class="text-[11px] text-[#8891A4]">
                                        {{ $t('superadmin.agreements.months', { count: agreement.term_months }) }}
                                        <template v-if="agreement.auto_renews"> · {{ $t('superadmin.agreements.autoRenews') }}</template>
                                        <Tooltip v-if="agreement.renewals_count > 0"
                                            :text="$t('superadmin.agreements.renewedHelp')" position="top" wrap>
                                            <span> · {{ $t('superadmin.agreements.renewed', { count: agreement.renewals_count }) }}</span>
                                        </Tooltip>
                                    </p>
                                </td>
                                <td class="co-td text-[13px] text-[#1F2533] whitespace-nowrap">
                                    {{ formatDateToReadable(agreement.starts_on) }} -
                                    {{ formatDateToReadable(agreement.ends_on) }}
                                </td>
                                <td class="co-td">
                                    <Tooltip :text="$t('superadmin.agreements.help.billingPlanBadge')" position="top" wrap>
                                        <span class="co-badge co-badge-navy">
                                            {{ $t(`superadmin.agreements.plans.${agreement.billing_plan}`) }}
                                        </span>
                                    </Tooltip>
                                </td>
                                <td class="co-td text-[13px] font-medium text-[#1F2533] text-right">
                                    {{ formatAmount(agreement.contract_value, 'DKK') }}
                                </td>
                                <td class="co-td text-[13px] text-[#1F2533] text-right whitespace-nowrap">
                                    {{ formatAmount(agreement.contract_mrr, 'DKK') }}
                                    <span class="block text-[11px] text-[#8891A4]">
                                        {{ $t('superadmin.agreements.perYear', { amount: formatAmount(agreement.contract_arr, 'DKK') }) }}
                                    </span>
                                </td>
                                <td class="co-td text-[13px] text-[#1F2533] text-right">
                                    {{ formatAmount(agreement.backlog, 'DKK') }}
                                </td>
                                <td class="co-td">
                                    <Tooltip :text="$t('superadmin.agreements.help.status')" position="top" wrap>
                                        <span class="co-badge" :class="statusClass(agreement.status)">
                                            {{ $t(`superadmin.agreements.statuses.${agreement.status}`) }}
                                        </span>
                                    </Tooltip>
                                </td>
                                <td class="co-td">
                                    <ModulesSuperadminAgreementNoticeBadge
                                        v-if="agreement.status === 'active'"
                                        :deadline="agreement.notice_deadline" :autoRenews="agreement.auto_renews" />
                                </td>
                                <td class="co-td" @click.stop>
                                    <div class="flex items-center gap-1.5 justify-end">
                                        <Tooltip :text="$t('superadmin.agreements.detail.openHelp')" position="top">
                                            <SuperadminTableButton @click="openDetail(agreement)">
                                                <Icon name="ph:eye" class="w-3.5 h-3.5" aria-hidden="true" />
                                                {{ $t('superadmin.invoices.table.actions.view') }}
                                            </SuperadminTableButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('superadmin.agreements.detail.editHelp')" position="top">
                                            <SuperadminTableButton @click="openEdit(agreement)">
                                                <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" aria-hidden="true" />
                                                {{ $t('superadmin.agreements.detail.edit') }}
                                            </SuperadminTableButton>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </SuperadminTable>
                    </div>
                    </div>
                </div>

                <ModulesSuperadminAgreementModalDetail :isModalOpen="state.detail.open" :companyUuid="companyUuid"
                    :agreementUuid="state.detail.uuid" @close="state.detail.open = false" @edit="openEdit"
                    @changed="fetchAgreements" @deleted="onDeleted" />
                <ModulesSuperadminAgreementModalForm :isModalOpen="state.form.open" :companyUuid="companyUuid"
                    :agreement="state.form.agreement" @close="state.form.open = false" @saved="onSaved" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { agreementService } from '@/components/api/superadmin/AgreementService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { missingEconomicNumber, unwrapData } from '@/composables/agreements'
import { companyService } from '@/components/api/superadmin/CompanyService'
import type { Agreement } from '@/types/agreement'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const companyUuid = String(router?.currentRoute?.value?.params?.company_uuid)
const { t } = useI18n()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()

const detailTabs = computed(() => [
    { label: t('superadmin.companies.accounts.tabs.overview'), href: `/superadmin/companies/${companyUuid}/accounts`, icon: 'ph:house' },
    { label: t('superadmin.sidebar.licenses'), href: `/superadmin/companies/${companyUuid}/license-overview`, icon: 'ph:key' },
    { label: t('superadmin.sidebar.apps'), href: `/superadmin/companies/${companyUuid}/apps`, icon: 'ph:squares-four' },
    { label: t('superadmin.sidebar.invoices'), href: `/superadmin/companies/${companyUuid}/invoices`, icon: 'ph:invoice' },
    { label: t('superadmin.companies.tabs.agreements'), href: `/superadmin/companies/${companyUuid}/agreements`, icon: 'ph:handshake' },
    { label: t('superadmin.companies.tabs.migration'), href: `/superadmin/companies/${companyUuid}/migration`, icon: 'ph:arrows-merge' },
    { label: t('superadmin.companies.table.actions.edit'), href: `/superadmin/companies/${companyUuid}/edit`, icon: 'ph:pencil-simple' },
])

const columnHeaders = computed(() => [
    { key: 'name', name: t('superadmin.agreements.table.name') },
    { key: 'period', name: t('superadmin.agreements.table.period') },
    { key: 'plan', name: t('superadmin.agreements.table.billingPlan') },
    { key: 'value', name: t('superadmin.agreements.table.contractValue'), textAlign: 'right' as const },
    { key: 'mrr', name: t('superadmin.agreements.table.mrrArr'), textAlign: 'right' as const },
    { key: 'backlog', name: t('superadmin.agreements.table.backlog'), textAlign: 'right' as const },
    { key: 'status', name: t('superadmin.agreements.table.status') },
    { key: 'notice', name: t('superadmin.agreements.table.notice') },
    { key: 'actions', name: '' },
])

const state = reactive({
    agreements: [] as Agreement[],
    company: null as any,
    isLoading: false,
    error: {} as Error,
    detail: { open: false, uuid: '' },
    form: { open: false, agreement: null as Agreement | null },
})

function statusClass(status: string) {
    return status === 'active' ? 'co-badge-green' : status === 'cancelled' ? 'co-badge-red' : status === 'ended' ? 'bg-[#FEF3C7] text-[#B45309]' : 'co-badge-gray'
}

const showMissingNumber = computed(() => missingEconomicNumber(state.company, state.agreements))

async function fetchCompany() {
    try {
        const response = await companyService.getCompany(companyUuid)
        state.company = unwrapData(response)
    } catch (_) {
        // The header chip and the warning are extras: the list still works without them.
        state.company = null
    }
}

onMounted(() => {
    fetchAgreements()
    fetchCompany()
})

async function fetchAgreements() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await agreementService.getCompanyAgreements(companyUuid)
        state.agreements = unwrapData<Agreement[]>(response) ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openDetail(agreement: Agreement) {
    state.detail.uuid = agreement.uuid
    state.detail.open = true
}

function openCreate() {
    state.form.agreement = null
    state.form.open = true
}

// The list may carry a lighter resource than the detail, so the form always
// starts from the full agreement (installments with their invoices).
async function openEdit(agreement: Agreement) {
    state.detail.open = false
    state.error = {}
    try {
        state.form.agreement = Array.isArray(agreement.installments)
            ? agreement
            : unwrapData<Agreement>(await agreementService.getAgreement(agreement.uuid))
        state.form.open = true
    } catch (error: any) {
        state.error = error
    }
}

async function onSaved(saved: Agreement) {
    state.form.open = false
    successAlert(`${t('alert.success')}!`, t('superadmin.agreements.saved'))
    await fetchAgreements()
    if (saved?.uuid) openDetail(saved)
}

async function onDeleted() {
    state.detail.open = false
    successAlert(`${t('alert.success')}!`, t('superadmin.agreements.deleted'))
    await fetchAgreements()
}
</script>
