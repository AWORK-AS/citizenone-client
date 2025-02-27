<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('jobSpecialties.jobSpecialties') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('jobSpecialties.jobSpecialties') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/job-titles">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
            </div>

            <div class="mt-5">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo(`/settings/job-titles/${jobTitleUuid}/new`)">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('jobSpecialties.newJobSpecialty') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.jobSpecialties"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.jobSpecialties?.data?.length === 0))">
                                <tr v-for="(jobSpecialty, index) in state.jobSpecialties?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ jobSpecialty?.title }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/job-titles/${jobTitleUuid}/${jobSpecialty.uuid}/edit`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('jobSpecialties.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.jobSpecialties" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { jobSpecialtyService } from '@/components/api/JobSpecialtyService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const jobTitleUuid = router?.currentRoute?.value?.params?.job_title_uuid
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'jobTitles.jobTitles',
        translate: true,
        href: '/settings/job-titles',
    },
    {
        name: 'jobSpecialties.jobSpecialties',
        translate: true,
        href: `/settings/job-titles/${jobTitleUuid}`,
    },
]

const state = reactive({
    columnFilter: [
        { column: 'title' },
    ],
    columnHeaders: [
        { name: 'jobSpecialties.table.title', sorter: true, key: 'title' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    jobSpecialties: [] as any,
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchJobSpecialties()
})

async function fetchJobSpecialties() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            job_title_uuid: jobTitleUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await jobSpecialtyService.getJobSpecialties(params)
        if (response) {
            state.jobSpecialties = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchJobSpecialties()
}

function next() {
    currentTablePage++
    fetchJobSpecialties()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchJobSpecialties()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchJobSpecialties()
}
</script>