<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('socialWelfare.customerDepartments.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('socialWelfare.customerDepartments.title') }}</template>

            <div class="mt-8 space-y-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <p class="text-sm text-slate-500 max-w-2xl">{{ $t('socialWelfare.customerDepartments.intro') }}</p>
                    <div class="flex items-center gap-2">
                        <Tooltip :text="$t('socialWelfare.customerDepartments.import.buttonHelp')" wrap position="bottom">
                            <FormButton buttonStyle="action" @click="state.isImportOpen = true">
                                <Icon name="ph:upload-simple" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('socialWelfare.customerDepartments.import.button') }}
                            </FormButton>
                        </Tooltip>
                        <FormButton buttonStyle="action" @click="openModal(null)">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('socialWelfare.customerDepartments.new') }}
                        </FormButton>
                    </div>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="flex items-center gap-3">
                    <Tooltip :text="$t('socialWelfare.customerDepartments.searchHelp')" wrap position="bottom">
                        <input type="search" class="co-cell-input w-80" v-model="state.search"
                            :aria-label="$t('socialWelfare.customerDepartments.search')"
                            :placeholder="$t('socialWelfare.customerDepartments.search')" />
                    </Tooltip>
                    <p class="text-[13px] text-slate-400">
                        {{ $t('socialWelfare.customerDepartments.shown', { shown: filtered.length, total: state.departments.length }) }}
                    </p>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!filtered.length"
                        class="bg-white border border-surface-200 rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:buildings" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p class="text-slate-400 text-sm">{{ $t('socialWelfare.customerDepartments.empty') }}</p>
                    </div>

                    <!-- One card per customer, because a customer buys through
                         several departments and each has its own EAN. -->
                    <div v-else class="space-y-5">
                        <div v-for="customer in grouped" :key="customer.label"
                            class="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
                            <div class="px-5 py-3 border-b border-surface-200 bg-slate-50">
                                <p class="text-sm font-semibold text-slate-900">
                                    {{ customer.label || $t('socialWelfare.customerDepartments.noCustomer') }}
                                </p>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="border-b border-surface-200">
                                        <tr>
                                            <th class="co-th">{{ $t('socialWelfare.customerDepartments.externalId') }}</th>
                                            <th class="co-th">{{ $t('socialWelfare.customerDepartments.name') }}</th>
                                            <th class="co-th">{{ $t('socialWelfare.customerDepartments.municipalityRegion') }}</th>
                                            <th class="co-th">{{ $t('socialWelfare.customerDepartments.address') }}</th>
                                            <th class="co-th">{{ $t('socialWelfare.customerDepartments.eanAndCustomerNumber') }}</th>
                                            <th class="co-th">{{ $t('socialWelfare.customerDepartments.paymentTermsDays') }}</th>
                                            <th class="co-th sticky right-0 bg-white"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="department in customer.departments" :key="department.uuid"
                                            class="border-b border-surface-200 last:border-0"
                                            :class="department.is_active ? '' : 'bg-slate-50 text-slate-400'">
                                            <td class="co-td text-slate-500 tabular-nums">{{ department.external_id || '-' }}</td>
                                            <td class="co-td">
                                                <p class="font-medium" :class="department.is_active ? 'text-slate-900' : 'text-slate-500'">
                                                    {{ department.name }}
                                                    <Tooltip v-if="!department.is_active" :text="$t('socialWelfare.customerDepartments.inactiveHelp')" wrap position="top">
                                                        <span class="co-badge co-badge-gray text-[11px] ml-1">{{ $t('socialWelfare.customerDepartments.inactive') }}</span>
                                                    </Tooltip>
                                                </p>
                                                <p v-if="department.email" class="text-[12px] text-slate-400">{{ department.email }}</p>
                                            </td>
                                            <td class="co-td text-slate-500 text-[13px]">
                                                {{ [department.municipality_name, department.region].filter(Boolean).join(' · ') || '-' }}
                                            </td>
                                            <td class="co-td text-slate-500">{{ department.address || '-' }}</td>
                                            <td class="co-td text-slate-500 text-[13px]">
                                                <p class="tabular-nums">{{ department.ean_number || '-' }}</p>
                                                <p v-if="department.customer_number" class="text-[12px] text-slate-400">
                                                    {{ $t('socialWelfare.customerDepartments.customerNumber') }} {{ department.customer_number }}
                                                </p>
                                            </td>
                                            <td class="co-td text-slate-500 text-[13px]">
                                                {{ department.payment_terms_days === null ? '-' : $t('socialWelfare.customerDepartments.days', { days: department.payment_terms_days }) }}
                                            </td>
                                            <td class="co-td sticky right-0" :class="department.is_active ? 'bg-white' : 'bg-slate-50'">
                                                <div class="flex items-center justify-end gap-2">
                                                    <FormButton type="button" buttonStyle="action" @click="openModal(department)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                        {{ $t('edit') }}
                                                    </FormButton>
                                                    <FormButton type="button" buttonStyle="danger" @click="confirmDelete(department)">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
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

            <ModulesUserEconomyCustomerDepartmentImportModal :isModalOpen="state.isImportOpen"
                @close="state.isImportOpen = false" @imported="fetchDepartments" />
            <ModulesUserEconomyCustomerDepartmentModal :isModalOpen="state.isModalOpen" :department="state.selected"
                @close="state.isModalOpen = false" @saved="fetchDepartments" />
            <DialogConfirmation :isModalOpen="state.isDeleteOpen"
                :message="$t('socialWelfare.customerDepartments.confirmDelete')"
                @close="state.isDeleteOpen = false" @confirm="deleteDepartment" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { filterDepartments } from '@/composables/customerDepartment'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    { name: 'socialWelfare.customerDepartments.title', translate: true, href: '/settings/customer-departments' },
]

const state = reactive({
    departments: [] as any[],
    error: {} as Error,
    isLoading: false,
    isModalOpen: false,
    isDeleteOpen: false,
    isImportOpen: false,
    selected: null as any,
    search: '',
})

const filtered = computed(() => filterDepartments(state.departments, state.search))

const grouped = computed(() => {
    const groups: Record<string, { label: string, departments: any[] }> = {}

    for (const department of filtered.value) {
        const label = department.customer_label || ''
        groups[label] ??= { label, departments: [] }
        groups[label].departments.push(department)
    }

    return Object.values(groups).sort((a, b) => a.label.localeCompare(b.label))
})

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'social_welfare') {
        navigateTo('/settings/expense-categories')

        return
    }

    fetchDepartments()
})

async function fetchDepartments() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await socialWelfareService.getCustomerDepartments({})
        state.departments = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openModal(department: any) {
    state.selected = department
    state.isModalOpen = true
}

function confirmDelete(department: any) {
    state.selected = department
    state.isDeleteOpen = true
}

async function deleteDepartment() {
    state.isDeleteOpen = false
    state.error = {} as Error
    try {
        await socialWelfareService.deleteCustomerDepartment(state.selected.uuid)
        successAlert(`${t('alert.success')}!`, t('socialWelfare.customerDepartments.deleted'))
        fetchDepartments()
    } catch (error: any) {
        state.error = error
    }
}
</script>
