<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.migration.pageTitle') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('superadmin.companies.migration.pageTitle') }}</template>

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

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Start a migration -->
                <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                    <div class="flex items-start gap-x-4">
                        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#42AED9]/10">
                            <Icon name="ph:arrows-merge" class="h-6 w-6 text-[#205E77]" />
                        </div>
                        <div class="min-w-0">
                            <h2 class="text-[15px] font-semibold text-[#1F2533]">
                                {{ state.company?.name || $t('superadmin.companies.migration.pageTitle') }}
                            </h2>
                            <p class="mt-1 text-sm text-[#5C6478]">
                                {{ $t('superadmin.companies.migration.description') }}
                            </p>
                            <div class="mt-4 flex flex-wrap items-center gap-3">
                                <button @click="state.importOpen = true" :disabled="!companyUuid"
                                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#205E77] hover:bg-[#184A5E] disabled:opacity-50 transition-colors">
                                    <Icon name="ph:upload-simple" class="w-4 h-4" />
                                    {{ $t('superadmin.companies.migration.startMigration') }}
                                </button>
                                <span class="text-xs text-[#8891A4]">
                                    {{ $t('superadmin.companies.migration.checkFirst') }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Previous runs -->
                <div class="mt-6">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-[15px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.companies.migration.previousRuns') }}
                        </h3>
                        <button @click="loadBatches" class="text-xs font-medium text-[#205E77] hover:underline">
                            {{ $t('superadmin.companies.migration.refresh') }}
                        </button>
                    </div>

                    <div class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                        <div v-if="state.isTableLoading" class="flex justify-center py-12">
                            <Icon name="ph:spinner" class="w-6 h-6 text-[#42AED9] animate-spin" />
                        </div>
                        <div v-else-if="!state.batches.length"
                            class="flex flex-col items-center gap-3 py-12 text-[#8891A4]">
                            <Icon name="ph:clock-counter-clockwise" class="w-10 h-10 opacity-30" />
                            <p class="text-sm">{{ $t('superadmin.companies.migration.noRuns') }}</p>
                        </div>
                        <table v-else class="w-full">
                            <thead>
                                <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                    <th class="co-th">{{ $t('superadmin.companies.migration.colEntity') }}</th>
                                    <th class="co-th">{{ $t('superadmin.companies.migration.colRows') }}</th>
                                    <th class="co-th">{{ $t('superadmin.companies.migration.colRunBy') }}</th>
                                    <th class="co-th">{{ $t('superadmin.companies.migration.colWhen') }}</th>
                                    <th class="co-th">{{ $t('superadmin.companies.migration.colStatus') }}</th>
                                    <th class="co-th"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="batch in state.batches" :key="batch.batch_ref"
                                    class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                    <td class="co-td text-[13px] text-[#1F2533]">{{ batch.entity }}</td>
                                    <td class="co-td text-[13px] text-[#1F2533]">{{ batch.count }}</td>
                                    <td class="co-td text-[13px] text-[#5C6478]">{{ batch.imported_by || '-' }}</td>
                                    <td class="co-td text-[13px] text-[#5C6478]">{{ formatDate(batch.created_at) }}</td>
                                    <td class="co-td">
                                        <span v-if="batch.undone_at" class="co-badge co-badge-red">
                                            {{ $t('superadmin.companies.migration.undone') }}
                                        </span>
                                        <span v-else class="co-badge co-badge-green">
                                            {{ $t('superadmin.companies.migration.active') }}
                                        </span>
                                    </td>
                                    <td class="co-td text-right">
                                        <button v-if="!batch.undone_at" @click="undoBatch(batch)"
                                            :disabled="state.undoing === batch.batch_ref"
                                            class="inline-flex items-center gap-1.5 text-xs font-medium text-[#CC3B2D] hover:underline disabled:opacity-50">
                                            <Icon name="ph:arrow-counter-clockwise" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.companies.migration.undo') }}
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <ModulesUserCitizenModalImportMapper :isModalOpen="state.importOpen" :companyUuid="companyUuid"
                    @close="state.importOpen = false" @imported="loadBatches" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { companyImportService } from '@/components/api/superadmin/CompanyImportService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t } = useI18n()
const { successAlert } = useAlert()
const companyUuid = String(route.params.company_uuid ?? '')

const detailTabs = computed(() => [
    { label: t('superadmin.companies.accounts.tabs.overview'), href: `/superadmin/companies/${companyUuid}/accounts`, icon: 'ph:house' },
    { label: t('superadmin.sidebar.licenses'), href: `/superadmin/companies/${companyUuid}/license-overview`, icon: 'ph:key' },
    { label: t('superadmin.sidebar.apps'), href: `/superadmin/companies/${companyUuid}/apps`, icon: 'ph:squares-four' },
    { label: t('superadmin.sidebar.invoices'), href: `/superadmin/companies/${companyUuid}/invoices`, icon: 'ph:invoice' },
    { label: t('superadmin.companies.tabs.agreements'), href: `/superadmin/companies/${companyUuid}/agreements`, icon: 'ph:handshake' },
    { label: t('superadmin.companies.tabs.migration'), href: `/superadmin/companies/${companyUuid}/migration`, icon: 'ph:arrows-merge' },
    { label: t('superadmin.companies.table.actions.edit'), href: `/superadmin/companies/${companyUuid}/edit`, icon: 'ph:pencil-simple' },
])

const state = reactive({
    company: null as any,
    batches: [] as any[],
    importOpen: false,
    isTableLoading: false,
    undoing: '',
    error: {} as Error,
})

function formatDate(value: string) {
    if (!value) return '-'
    return new Date(value).toLocaleString('da-DK', { dateStyle: 'short', timeStyle: 'short' })
}

async function loadCompany() {
    try {
        const response: any = await companyService.getCompany(companyUuid)
        state.company = response?.data ?? response
    } catch (error: any) {
        state.error = error
    }
}

async function loadBatches() {
    state.isTableLoading = true
    try {
        const response: any = await companyImportService.getImportBatches(companyUuid)
        state.batches = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function undoBatch(batch: any) {
    state.undoing = batch.batch_ref
    try {
        const response: any = await companyImportService.undoImport(companyUuid, { batch_ref: batch.batch_ref })
        successAlert(`${t('alert.success')}!`, t('superadmin.companies.migration.undoneCount', { count: response?.deleted ?? 0 }))
        await loadBatches()
    } catch (error: any) {
        state.error = error
    }
    state.undoing = ''
}

onMounted(() => {
    loadCompany()
    loadBatches()
})
</script>
