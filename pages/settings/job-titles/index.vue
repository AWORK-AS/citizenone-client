<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('jobTitles.jobTitles') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('jobTitles.jobTitles') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/settings/job-titles/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('jobTitles.newJobTitle') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.jobTitles"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.jobTitles?.data?.length === 0))">
                                <tr v-for="(jobTitle, index) in state.jobTitles?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ jobTitle?.title }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/job-titles/${jobTitle.uuid}`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('jobTitles.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/job-titles/${jobTitle.uuid}/edit`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('jobTitles.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.jobTitles" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { jobTitleService } from '@/components/api/JobTitleService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'jobTitles.jobTitles',
        translate: true,
        href: '/settings/job-titles',
    },
]

const state = reactive({
    columnFilter: [
        { column: 'title' },
    ],
    columnHeaders: [
        { name: 'jobTitles.table.title', sorter: true, key: 'title' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    jobTitles: [] as any,
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchJobTitles()
})

async function fetchJobTitles() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await jobTitleService.getJobTitles(params)
        if (response) {
            state.jobTitles = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchJobTitles()
}

function next() {
    currentTablePage++
    fetchJobTitles()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchJobTitles()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchJobTitles()
}
</script>