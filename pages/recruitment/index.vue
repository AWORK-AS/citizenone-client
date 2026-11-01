<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('recruitment.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('recruitment.title') }}</template>

            <div class="space-y-5">
                <p class="text-sm text-slate-500">{{ $t('recruitment.description') }}</p>

                <div class="flex flex-wrap items-end justify-between gap-3">
                    <div class="flex flex-wrap items-end gap-3">
                        <div class="w-52 space-y-1">
                            <FormLabel for="recruitment-filter-type" :label="$t('recruitment.fields.type')" />
                            <FormSelect id="recruitment-filter-type" v-model="state.filters.type" :options="typeOptions"
                                :placeholder="$t('recruitment.allTypes')" />
                        </div>
                        <div class="w-44 space-y-1">
                            <FormLabel for="recruitment-filter-status" :label="$t('recruitment.fields.status')" />
                            <FormSelect id="recruitment-filter-status" v-model="state.filters.status"
                                :options="statusOptions" :placeholder="$t('recruitment.allStatuses')" />
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <FormButton buttonStyle="action" :disabled="state.isExporting" @click="exportCases">
                            <Icon name="ph:file-arrow-down" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('recruitment.export') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" @click="state.isNewOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('recruitment.new') }}
                        </FormButton>
                    </div>
                </div>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <div class="table-responsive">
                    <Table :columnHeaders="columnHeaders" :data="state.cases" :isLoading="state.isLoading">
                        <template #body v-if="!(state.isLoading || state.cases?.data?.length === 0)">
                            <tr v-for="item in state.cases?.data" :key="item.uuid" class="cursor-pointer hover:bg-surface-50"
                                @click="router.push(`/recruitment/${item.uuid}`)">
                                <td>{{ $t('recruitment.types.' + item.type) }}</td>
                                <td class="font-semibold text-gray-900">{{ item.title }}</td>
                                <td>{{ personName(item.citizen) }}</td>
                                <td>{{ personName(item.responsible) }}</td>
                                <td>
                                    <span class="rounded-full px-2.5 py-[3px] text-[11.5px] font-bold"
                                        :class="statusClass(item.status)">
                                        {{ $t('recruitment.statuses.' + item.status) }}
                                    </span>
                                </td>
                                <td>{{ formatDateToReadable(item.created_at) }}</td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.cases" @previous="changePage(-1)" @next="changePage(1)" />
            </div>

            <ModulesUserRecruitmentModalForm :isModalOpen="state.isNewOpen" @close="state.isNewOpen = false"
                @saved="openCreated" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
/**
 * Recruitment outside an ordinary new inquiry: acute, strategic and re-match.
 * An ordinary new inquiry still uses the recruitment phase on the inquiry.
 */
import { recruitmentCaseService } from '@/components/api/user/RecruitmentCaseService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from 'vue-i18n'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

// The endpoints are part of the inquiry pipeline, so the same gate.
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const breadcrumbLinks = [
    { name: 'recruitment.title', translate: true, href: '/recruitment' },
]

const columnHeaders = [
    { name: 'recruitment.fields.type', isTranslateName: true },
    { name: 'recruitment.fields.title', isTranslateName: true },
    { name: 'recruitment.fields.citizen', isTranslateName: true },
    { name: 'recruitment.fields.responsible', isTranslateName: true },
    { name: 'recruitment.fields.status', isTranslateName: true },
    { name: 'recruitment.fields.createdAt', isTranslateName: true },
]

const typeOptions = computed(() => ['acute', 'strategic', 'rematch']
    .map(type => ({ value: type, label: t('recruitment.types.' + type) })))
const statusOptions = computed(() => ['open', 'solved', 'not_solved']
    .map(status => ({ value: status, label: t('recruitment.statuses.' + status) })))

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isExporting: false,
    isNewOpen: false,
    page: 1,
    cases: {} as any,
    filters: {
        type: null as string | null,
        status: 'open' as string | null,
    },
})

function personName(person: any): string {
    return person ? `${person.firstname ?? ''} ${person.lastname ?? ''}`.trim() : ''
}

function statusClass(status: string): string {
    if (status === 'solved') return 'bg-[#e6f4ee] text-[#1f7a55]'
    if (status === 'not_solved') return 'bg-surface-100 text-slate-600'
    return 'bg-[#eef6fb] text-secondary'
}

function filterParams() {
    return {
        ...(state.filters.type ? { type: state.filters.type } : {}),
        ...(state.filters.status ? { status: state.filters.status } : {}),
    }
}

async function fetchCases() {
    state.error = {}
    state.isLoading = true
    try {
        state.cases = await recruitmentCaseService.getCases({ ...filterParams(), page: state.page })
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function changePage(step: number) {
    state.page = Math.max(1, state.page + step)
    fetchCases()
}

watch(() => [state.filters.type, state.filters.status], () => {
    state.page = 1
    fetchCases()
})

function openCreated(recruitmentCase: any) {
    state.isNewOpen = false
    if (recruitmentCase?.uuid) router.push(`/recruitment/${recruitmentCase.uuid}`)
}

async function exportCases() {
    state.error = {}
    state.isExporting = true
    try {
        const blob = await recruitmentCaseService.exportCases(filterParams())
        if (blob) saveAs(blob, `${t('recruitment.title')}.xlsx`)
    } catch (error: any) {
        state.error = error
    }
    state.isExporting = false
}

onMounted(fetchCases)
</script>
