<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('staffWorkloadReport.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('staffWorkloadReport.title') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="text-sm text-gray-500">{{ $t('staffWorkloadReport.description') }}</p>

                <div class="inline-flex flex-wrap gap-1 rounded-lg bg-gray-100 p-0.5">
                    <button type="button" v-for="option in periodOptions" :key="option.value"
                        @click="setPeriod(option.value)" :class="[
                            'rounded-md px-3 py-1.5 text-sm font-medium transition',
                            state.period === option.value ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        ]">
                        {{ option.label }}
                    </button>
                </div>

                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.employees" :isLoading="state.isTableLoading">
                        <template #body v-if="!(state.isTableLoading || (state.employees?.data?.length === 0))">
                            <tr v-for="employee in state.employees?.data" :key="employee.user_id">
                                <td width="30%">
                                    <span>{{ employee?.name ?? '-' }}</span>
                                </td>
                                <td width="17.5%">
                                    <Badge type="no-risk">{{ employee?.no_risk }}</Badge>
                                </td>
                                <td width="17.5%">
                                    <Badge type="increased-risk">{{ employee?.increased_risk }}</Badge>
                                </td>
                                <td width="17.5%">
                                    <Badge type="acute-increased-risk">{{ employee?.acute_increased_risk }}</Badge>
                                </td>
                                <td width="17.5%">
                                    <span class="font-semibold">{{ employee?.total }}</span>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { isAtLeast } = usePermissions()

const breadcrumbLinks = [
    { name: 'staffWorkloadReport.title', translate: true, href: '/reports/staff-workload' },
]

const periodOptions = computed(() => [
    { value: 1, label: t('citizens.riskHistory.period1') },
    { value: 3, label: t('citizens.riskHistory.period3') },
    { value: 6, label: t('citizens.riskHistory.period6') },
])

const state = reactive({
    columnHeaders: [
        { name: 'staffWorkloadReport.table.employee', isTranslateName: true, sorter: false, key: 'name' },
        { name: 'staffWorkloadReport.table.noRisk', isTranslateName: true, sorter: false, key: 'no_risk' },
        { name: 'staffWorkloadReport.table.increasedRisk', isTranslateName: true, sorter: false, key: 'increased_risk' },
        { name: 'staffWorkloadReport.table.acuteIncreasedRisk', isTranslateName: true, sorter: false, key: 'acute_increased_risk' },
        { name: 'staffWorkloadReport.table.total', isTranslateName: true, sorter: false, key: 'total' },
    ],
    error: {} as Error,
    isTableLoading: false,
    period: 3,
    employees: { data: [] } as any,
})

onMounted(() => {
    if (!isAtLeast('Admin')) {
        navigateTo('/reports')
        return
    }
    fetchEmployees()
})

function setPeriod(period: number) {
    state.period = period
    fetchEmployees()
}

async function fetchEmployees() {
    state.error = {} as Error
    state.isTableLoading = true
    try {
        const response = await journalService.getRiskAssessmentHistoryByEmployee(state.period)
        state.employees = { data: response?.data ?? [] }
    } catch (error: any) {
        state.error = error
        state.employees = { data: [] }
    }
    state.isTableLoading = false
}
</script>
