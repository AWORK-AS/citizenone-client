<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.certificates.certificates') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employees.certificates.certificates') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="{ data: state.certificates }"
                        :isLoading="state.isLoading" :emptyMessage="$t('employees.certificates.empty')">
                        <template #body v-if="!(state.isLoading || state.certificates.length === 0)">
                            <tr v-for="certificate in state.certificates" :key="certificate.uuid">
                                <td width="30%">
                                    <NuxtLink class="text-tertiary hover:text-tertiary-700"
                                        :to="`/employees/${certificate.employee.uuid}/view-details`">
                                        {{ certificate.employee.firstname }} {{ certificate.employee.lastname }}
                                    </NuxtLink>
                                </td>
                                <td width="25%">
                                    {{ $t(`consultantProfile.documentTypes.${certificate.file_type}`) }}
                                </td>
                                <td width="20%">
                                    {{ certificate.expires_at ? formatDateToReadable(certificate.expires_at) : '-' }}
                                </td>
                                <td width="25%">
                                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                        :class="statusClasses(certificate.status)">
                                        {{ $t(`employees.certificates.statuses.${certificate.status}`) }}
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
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { employeeDocumentService } from '@/components/api/user/EmployeeDocumentService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()

const breadcrumbLinks = [
    { name: 'employees.certificates.certificates', translate: true, href: '/employees/certificates' },
]

const state = reactive({
    columnHeaders: [
        { name: 'employees.certificates.columns.employee', isTranslateName: true },
        { name: 'employees.certificates.columns.type', isTranslateName: true },
        { name: 'employees.certificates.columns.expiresAt', isTranslateName: true },
        { name: 'employees.certificates.columns.status', isTranslateName: true },
    ],
    isLoading: false,
    certificates: [] as any[],
    error: {} as Error,
})

function statusClasses(status: string) {
    switch (status) {
        case 'expired': return 'bg-red-100 text-red-800'
        case 'expiring_soon': return 'bg-amber-100 text-amber-800'
        case 'valid': return 'bg-green-100 text-green-800'
        default: return 'bg-gray-100 text-gray-600'
    }
}

async function fetchOverview() {
    state.isLoading = true
    try {
        const response = await employeeDocumentService.getExpiryOverview()
        state.certificates = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

onMounted(() => {
    fetchOverview()
})
</script>
