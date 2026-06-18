<template>
    <div>
        <NuxtLayout name="employer">

            <Head>
                <Title>{{ $t('employer.employmentCases') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <BreadcrumbEmployer>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/employer/employment-cases')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('employer.employmentCases') }}
                            </button>
                        </div>
                    </template>
                </BreadcrumbEmployer>
            </template>

            <template #header>{{ $t('employer.employmentCases') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.cases"
                        :isLoading="state.isTableLoading">
                        <template #body v-if="!(state.isTableLoading || (state.cases?.length === 0))">
                            <tr v-for="(item, index) in state.cases" :key="index"
                                class="cursor-pointer hover:bg-gray-50"
                                @click="navigateTo(`/employer/employment-cases/${item.uuid}`)">
                                <td width="20%">
                                    <span>{{ item?.citizen?.name }}</span>
                                </td>
                                <td width="25%">
                                    <span>{{ item?.agreement?.name }}</span>
                                </td>
                                <td width="15%">
                                    <span>{{ item?.start_date }}</span>
                                </td>
                                <td width="15%">
                                    <span>{{ item?.end_date ?? item?.calculated_end_date }}</span>
                                </td>
                                <td width="10%">
                                    <span>{{ item?.weeks_used }} / {{ item?.duration_weeks }}</span>
                                </td>
                                <td width="15%">
                                    <span :class="statusClass(item?.status)"
                                        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                                        {{ $t(`employment.cases.status.${item?.status}`) }}
                                    </span>
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
import { employmentCaseService } from '@/components/api/employer/EmploymentCaseService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    columnHeaders: [
        { name: 'employment.cases.citizen', isTranslateName: true },
        { name: 'employment.cases.agreement', isTranslateName: true },
        { name: 'employment.cases.startDate', isTranslateName: true },
        { name: 'employment.cases.endDate', isTranslateName: true },
        { name: 'employment.cases.weeksUsed', isTranslateName: true },
        { name: 'employment.cases.status.status', isTranslateName: true },
    ],
    error: {} as Error,
    isTableLoading: false,
    cases: [] as any[],
})

onMounted(() => {
    fetchCases()
})

async function fetchCases() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employmentCaseService.getEmploymentCases()
        if (response?.data) {
            state.cases = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function statusClass(status: string) {
    const map: Record<string, string> = {
        active: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800',
    }
    return map[status] ?? 'bg-gray-100 text-gray-800'
}
</script>
