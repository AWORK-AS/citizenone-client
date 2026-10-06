<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('whistleblower.inbox.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('whistleblower.inbox.title') }}</template>

            <div class="mt-8 space-y-5">
                <p class="max-w-3xl text-sm text-slate-600">{{ $t('whistleblower.inbox.intro') }}</p>

                <div class="flex flex-wrap items-center gap-2" role="group" :aria-label="$t('whistleblower.inbox.filter')">
                    <button v-for="option in statusFilters" :key="option.value" type="button"
                        :aria-pressed="state.status === option.value" @click="setStatus(option.value)"
                        :class="['rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                            state.status === option.value ? 'border-primary bg-primary text-white' : 'border-surface-200 bg-white text-slate-600 hover:border-primary/40']">
                        {{ option.label }}
                    </button>
                </div>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <div class="table-responsive">
                    <Table :columnHeaders="columnHeaders" :data="state.reports" :isLoading="state.isLoading"
                        :emptyMessage="$t('whistleblower.inbox.empty')">
                        <template #body v-if="!(state.isLoading || state.reports?.data?.length === 0)">
                            <tr v-for="report in state.reports?.data" :key="report.uuid"
                                class="cursor-pointer hover:bg-surface-50" @click="open(report)">
                                <td class="font-mono text-sm">{{ report.reference }}</td>
                                <td>
                                    <p class="font-medium text-slate-900">{{ report.subject }}</p>
                                    <p class="text-xs text-slate-500">{{ $t(`whistleblower.categories.${report.category}`) }}</p>
                                </td>
                                <td><ModulesUserWhistleblowerStatusBadge :status="report.status" /></td>
                                <td class="text-sm text-slate-600">
                                    {{ formatDateToReadable(report.received_on) }}
                                    <span v-if="isOverdueForAcknowledgement(report)" class="badge badge-red ml-1">
                                        {{ $t('whistleblower.inbox.acknowledgeOverdue') }}
                                    </span>
                                </td>
                                <td class="text-right">
                                    <FormButton type="button" buttonStyle="action" @click.stop="open(report)">
                                        <Icon name="ph:eye" class="size-4" aria-hidden="true" />
                                        {{ $t('whistleblower.inbox.open') }}
                                    </FormButton>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.reports" @previous="previous" @next="next" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { whistleblowerService } from '@/components/api/user/WhistleblowerService'
import { useWhistleblowerHandlerGuard } from '@/composables/useWhistleblowerHandlerGuard'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()
useWhistleblowerHandlerGuard()

let currentPage = 1
const breadcrumbLinks = [{ name: 'whistleblower.inbox.title', translate: true, href: '/whistleblower-reports' }]

const columnHeaders = [
    { name: 'whistleblower.inbox.columns.reference', isTranslateName: true },
    { name: 'whistleblower.inbox.columns.subject', isTranslateName: true },
    { name: 'whistleblower.inbox.columns.status', isTranslateName: true },
    { name: 'whistleblower.inbox.columns.received', isTranslateName: true },
    { name: '' },
]

const statusFilters = computed(() => [
    { value: '', label: t('whistleblower.inbox.all') },
    { value: 'received', label: t('whistleblower.statuses.received') },
    { value: 'acknowledged', label: t('whistleblower.statuses.acknowledged') },
    { value: 'investigating', label: t('whistleblower.statuses.investigating') },
    { value: 'closed', label: t('whistleblower.statuses.closed') },
])

const state = reactive({
    isLoading: false,
    error: {} as any,
    status: '',
    reports: {} as any,
})

onMounted(fetchReports)

async function fetchReports() {
    state.error = {}
    state.isLoading = true
    try {
        const params: Record<string, any> = { page: currentPage }
        if (state.status) params.status = state.status
        state.reports = await whistleblowerService.getReports(params)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function setStatus(status: string) {
    state.status = status
    currentPage = 1
    fetchReports()
}

function previous() {
    currentPage--
    fetchReports()
}

function next() {
    currentPage++
    fetchReports()
}

function open(report: any) {
    navigateTo(`/whistleblower-reports/${report.uuid}`)
}

/** The reporter should hear within 7 days that the report arrived. */
function isOverdueForAcknowledgement(report: any) {
    return report.status === 'received' && moment().diff(moment(report.received_on), 'days') >= 7
}
</script>
