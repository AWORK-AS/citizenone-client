<template>
    <div>
        <NuxtLayout name="employer">

            <Head>
                <Title>{{ $t('employer.employmentCase') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <BreadcrumbEmployer :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employer.employmentCase') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div v-if="state.isLoading" class="flex justify-center py-10">
                    <Icon name="ph:spinner" class="h-8 w-8 animate-spin text-primary" />
                </div>

                <div v-else-if="state.case" class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <!-- Case info -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 class="text-base font-semibold text-gray-900 mb-4">{{ $t('employment.cases.caseDetails') }}</h3>
                        <dl class="divide-y divide-gray-100">
                            <div class="py-3 grid grid-cols-3 gap-4">
                                <dt class="text-sm font-medium text-gray-500">{{ $t('employment.cases.citizen') }}</dt>
                                <dd class="text-sm text-gray-900 col-span-2">{{ state.case.citizen?.name }}</dd>
                            </div>
                            <div class="py-3 grid grid-cols-3 gap-4">
                                <dt class="text-sm font-medium text-gray-500">{{ $t('employment.cases.status.status') }}</dt>
                                <dd class="col-span-2">
                                    <span :class="statusClass(state.case.status)"
                                        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                                        {{ $t(`employment.cases.status.${state.case.status}`) }}
                                    </span>
                                </dd>
                            </div>
                            <div class="py-3 grid grid-cols-3 gap-4">
                                <dt class="text-sm font-medium text-gray-500">{{ $t('employment.cases.startDate') }}</dt>
                                <dd class="text-sm text-gray-900 col-span-2">{{ state.case.start_date }}</dd>
                            </div>
                            <div class="py-3 grid grid-cols-3 gap-4">
                                <dt class="text-sm font-medium text-gray-500">{{ $t('employment.cases.endDate') }}</dt>
                                <dd class="text-sm text-gray-900 col-span-2">{{ state.case.end_date ?? state.case.calculated_end_date }}</dd>
                            </div>
                            <div class="py-3 grid grid-cols-3 gap-4">
                                <dt class="text-sm font-medium text-gray-500">{{ $t('employment.cases.weeksUsed') }}</dt>
                                <dd class="text-sm text-gray-900 col-span-2">{{ state.case.weeks_used }} / {{ state.case.duration_weeks }}</dd>
                            </div>
                            <div class="py-3 grid grid-cols-3 gap-4" v-if="state.case.notes">
                                <dt class="text-sm font-medium text-gray-500">{{ $t('employment.cases.notes') }}</dt>
                                <dd class="text-sm text-gray-900 col-span-2">{{ state.case.notes }}</dd>
                            </div>
                        </dl>
                    </div>

                    <!-- Agreement & Jobcenter -->
                    <div class="space-y-5">
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6" v-if="state.case.agreement">
                            <h3 class="text-base font-semibold text-gray-900 mb-4">{{ $t('employment.agreements.agreement') }}</h3>
                            <dl class="divide-y divide-gray-100">
                                <div class="py-3 grid grid-cols-3 gap-4">
                                    <dt class="text-sm font-medium text-gray-500">{{ $t('settings.name') }}</dt>
                                    <dd class="text-sm text-gray-900 col-span-2">{{ state.case.agreement.name }}</dd>
                                </div>
                                <div class="py-3 grid grid-cols-3 gap-4" v-if="state.case.agreement.description">
                                    <dt class="text-sm font-medium text-gray-500">{{ $t('settings.description') }}</dt>
                                    <dd class="text-sm text-gray-900 col-span-2">{{ state.case.agreement.description }}</dd>
                                </div>
                                <div class="py-3 grid grid-cols-3 gap-4" v-if="state.case.agreement.default_duration_weeks">
                                    <dt class="text-sm font-medium text-gray-500">{{ $t('employment.agreements.defaultDurationWeeks') }}</dt>
                                    <dd class="text-sm text-gray-900 col-span-2">{{ state.case.agreement.default_duration_weeks }}</dd>
                                </div>
                            </dl>
                        </div>

                        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6" v-if="state.case.agreement?.jobcenter">
                            <h3 class="text-base font-semibold text-gray-900 mb-4">{{ $t('employment.jobcenters.jobcenter') }}</h3>
                            <dl class="divide-y divide-gray-100">
                                <div class="py-3 grid grid-cols-3 gap-4">
                                    <dt class="text-sm font-medium text-gray-500">{{ $t('settings.name') }}</dt>
                                    <dd class="text-sm text-gray-900 col-span-2">{{ state.case.agreement.jobcenter.name }}</dd>
                                </div>
                                <div class="py-3 grid grid-cols-3 gap-4" v-if="state.case.agreement.jobcenter.municipality">
                                    <dt class="text-sm font-medium text-gray-500">{{ $t('employment.jobcenters.municipality') }}</dt>
                                    <dd class="text-sm text-gray-900 col-span-2">{{ state.case.agreement.jobcenter.municipality }}</dd>
                                </div>
                                <div class="py-3 grid grid-cols-3 gap-4" v-if="state.case.agreement.jobcenter.contact_person">
                                    <dt class="text-sm font-medium text-gray-500">{{ $t('employment.jobcenters.contactPerson') }}</dt>
                                    <dd class="text-sm text-gray-900 col-span-2">{{ state.case.agreement.jobcenter.contact_person }}</dd>
                                </div>
                                <div class="py-3 grid grid-cols-3 gap-4" v-if="state.case.agreement.jobcenter.email">
                                    <dt class="text-sm font-medium text-gray-500">{{ $t('employees.table.email') }}</dt>
                                    <dd class="text-sm text-gray-900 col-span-2">{{ state.case.agreement.jobcenter.email }}</dd>
                                </div>
                                <div class="py-3 grid grid-cols-3 gap-4" v-if="state.case.agreement.jobcenter.phone">
                                    <dt class="text-sm font-medium text-gray-500">{{ $t('employees.table.phone') }}</dt>
                                    <dd class="text-sm text-gray-900 col-span-2">{{ state.case.agreement.jobcenter.phone }}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentCaseService } from '@/components/api/employer/EmploymentCaseService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const breadcrumbLinks = [
    { name: 'employer.employmentCases', href: '/employer/employment-cases', translate: true },
    { name: 'employer.employmentCase', href: '', translate: true },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    case: null as any,
})

onMounted(() => {
    fetchCase()
})

async function fetchCase() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await employmentCaseService.getEmploymentCase(route.params.uuid as string)
        if (response?.data) {
            state.case = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
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
