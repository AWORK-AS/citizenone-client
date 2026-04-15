<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.companies') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.companies.companies') }}</template>

            <div>
                <!-- Top bar -->
                <div class="flex flex-wrap justify-between items-center mb-5 gap-3">
                    <p class="text-sm text-gray-500">{{ state.companies?.total ?? 0 }} {{ $t('superadmin.companies.companies').toLowerCase() }}</p>
                    <div class="flex gap-2">
                        <FormButton buttonStyle="action" @click="state.modal.isImportCompanyOpen = true">
                            <Icon name="ph:upload-simple" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('superadmin.companies.importCompanies.importCompanies') }}
                        </FormButton>
                        <FormButton buttonStyle="action" @click="navigateTo('/superadmin/companies/new')">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('superadmin.companies.newCompany') }}
                        </FormButton>
                    </div>
                </div>

                <!-- Filters -->
                <div class="flex flex-wrap items-center gap-3 mb-5">
                    <TableSearch @search="handleSearch" />
                    <select v-model="state.dataFilter.status"
                        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        @change="handleFilterChange">
                        <option value="">{{ $t('superadmin.companies.table.status') }}: alle</option>
                        <option value="active">{{ $t('superadmin.companies.table.active') }}</option>
                        <option value="inactive">{{ $t('superadmin.companies.table.inactive') }}</option>
                    </select>
                    <select v-model="state.dataFilter.paying"
                        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        @change="handleFilterChange">
                        <option value="">Betaling: alle</option>
                        <option value="true">Betalende</option>
                        <option value="false">Ikke-betalende</option>
                    </select>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- Enhanced table -->
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div v-if="state.isTableLoading" class="p-10 flex justify-center">
                            <Icon name="ph:spinner" class="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                        <div v-else-if="!state.companies?.data?.length"
                            class="p-12 flex flex-col items-center gap-3 text-gray-400">
                            <Icon name="ph:buildings" class="w-12 h-12" />
                            <p class="text-sm font-medium">{{ $t('superadmin.companies.noCompaniesFound') }}</p>
                            <p class="text-xs">{{ $t('superadmin.companies.createYourFirstClient') }}</p>
                        </div>
                        <table v-else class="w-full text-sm">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-100">
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ $t('superadmin.companies.table.name') }}</th>
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Betaling</th>
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kortbetaling</th>
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Licenser</th>
                                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ $t('superadmin.companies.table.phone') }}</th>
                                    <th class="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(company, index) in state.companies?.data" :key="index"
                                    class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">

                                    <!-- Name + avatar -->
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span class="text-xs font-bold text-primary">
                                                    {{ (company?.name || '?').charAt(0).toUpperCase() }}
                                                </span>
                                            </div>
                                            <div>
                                                <p class="font-medium text-gray-900">{{ company?.name || '—' }}</p>
                                                <p class="text-xs text-gray-400">{{ company?.email || company?.website || '' }}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <!-- Account status -->
                                    <td class="px-4 py-3">
                                        <span v-if="company?.is_active"
                                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            {{ $t('superadmin.companies.table.active') }}
                                        </span>
                                        <span v-else
                                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                            <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                            {{ $t('superadmin.companies.table.inactive') }}
                                        </span>
                                    </td>

                                    <!-- Billing type: card or invoice -->
                                    <td class="px-4 py-3">
                                        <span v-if="company?.subscription?.payment_method === 'card'"
                                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            <Icon name="ph:credit-card" class="w-3 h-3" />
                                            Kort
                                        </span>
                                        <span v-else-if="company?.subscription?.payment_method === 'invoice'"
                                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                            <Icon name="ph:file-text" class="w-3 h-3" />
                                            Faktura
                                        </span>
                                        <span v-else class="text-xs text-gray-400">—</span>
                                    </td>

                                    <!-- Card payment active/stopped -->
                                    <td class="px-4 py-3">
                                        <span v-if="company?.subscription?.payment_method === 'card' && company?.subscription?.card_active === true"
                                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Aktiv
                                        </span>
                                        <span v-else-if="company?.subscription?.payment_method === 'card' && company?.subscription?.card_active === false"
                                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                            <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                            Stoppet
                                        </span>
                                        <span v-else class="text-xs text-gray-400">—</span>
                                    </td>

                                    <!-- Licence bar -->
                                    <td class="px-4 py-3">
                                        <div v-if="company?.license_count?.total > 0">
                                            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <span class="font-medium text-gray-700">{{ company?.license_count?.used ?? 0 }}/{{ company?.license_count?.total }}</span>
                                            </div>
                                            <div class="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div class="h-full bg-primary rounded-full transition-all"
                                                    :style="{ width: Math.min(100, Math.round(((company?.license_count?.used ?? 0) / company?.license_count?.total) * 100)) + '%' }">
                                                </div>
                                            </div>
                                        </div>
                                        <span v-else class="text-xs text-gray-400">—</span>
                                    </td>

                                    <!-- Phone -->
                                    <td class="px-4 py-3 text-gray-600 text-sm">{{ company?.phone || '—' }}</td>

                                    <!-- Actions -->
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-1.5 justify-end">
                                            <!-- Impersonate -->
                                            <button
                                                class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200"
                                                @click.stop="impersonateCompany(company)">
                                                <Icon name="ph:user-switch" class="w-3.5 h-3.5" />
                                                Log ind som
                                            </button>
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/superadmin/companies/${company.uuid}/accounts`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('superadmin.companies.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/superadmin/companies/${company.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                            </FormButton>
                                            <FormButton type="button"
                                                :buttonStyle="company.is_active ? 'danger' : 'success'"
                                                @click="activateDeactivateCompany(index, company)">
                                                <Icon name="ph:x" class="size-4" v-if="company.is_active" />
                                                <Icon name="ph:check" class="size-4" v-else />
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <Pagination :data="state.companies" @previous="previous" @next="next" />
                </div>
            </div>

            <ModulesSuperadminCompanyModalImport :isModalOpen="state.modal.isImportCompanyOpen"
                @close="state.modal.isImportCompanyOpen = false" />

            <!-- Impersonate confirm dialog -->
            <DialogConfirmation :isModalOpen="state.modal.isImpersonateOpen"
                :message="`Log ind som ${state.selectedCompany?.name}? Du vil blive viderestillet til deres konto.`"
                @close="state.modal.isImpersonateOpen = false" @confirm="confirmImpersonate" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const paying = router?.currentRoute?.value?.query?.paying
const { successAlert } = useAlert()
const { t } = useI18n()

let currentTablePage = 1

const state = reactive({
    companies: [] as any,
    dataFilter: {
        search: '',
        status: '',
        paying: paying ? String(paying) : '',
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isImportCompanyOpen: false,
        isImpersonateOpen: false,
    },
    selectedCompany: null as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchCompanies()
})

async function fetchCompanies() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            search: state.dataFilter.search,
        }
        if (state.dataFilter.paying !== '') params.paying = state.dataFilter.paying
        if (state.dataFilter.status !== '') params.status = state.dataFilter.status

        const response = await companyService.getCompanies(params)
        if (response) {
            state.companies = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() { currentTablePage--; fetchCompanies() }
function next() { currentTablePage++; fetchCompanies() }

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? '' : (value?.[0] ?? '')
    fetchCompanies()
}

function handleFilterChange() {
    currentTablePage = 1
    fetchCompanies()
}

async function activateDeactivateCompany(index: number, company: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await companyService.activateDeactiveCompany(company.uuid, { is_active: !company.is_active })
        if (response) {
            state.companies.data[index].is_active = response?.data?.is_active
            const key = response?.data?.is_active
                ? 'superadmin.companies.form.alert.companySuccessfullyActivated'
                : 'superadmin.companies.form.alert.companySuccessfullyDeactivated'
            successAlert(`${t('alert.success')}!`, `${t(key)}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function impersonateCompany(company: any) {
    state.selectedCompany = company
    state.modal.isImpersonateOpen = true
}

async function confirmImpersonate() {
    state.modal.isImpersonateOpen = false
    if (!state.selectedCompany?.uuid) return
    try {
        const response = await companyService.impersonateCompany(state.selectedCompany.uuid)
        if (response?.data?.token) {
            // Open the app as that company in a new tab
            const appUrl = useRuntimeConfig().public.appUserUrl || '/'
            window.open(`${appUrl}?impersonate_token=${response.data.token}`, '_blank')
        }
    } catch (_) {
        // Fallback: navigate directly if no token endpoint yet
        window.open(`/?company=${state.selectedCompany.uuid}`, '_blank')
    }
}
</script>
