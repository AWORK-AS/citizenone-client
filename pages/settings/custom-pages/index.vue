<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('customPages.customPages') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('customPages.customPages') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsOtherSubTab id="sub-tab-other" class="mt-5" />

            <div class="mt-8">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.customPages"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.customPages?.data?.length === 0))">
                                <tr v-for="(customPages, index) in state.customPages?.data" :key="index">
                                    <td width="35%">
                                        <div>
                                            {{ customPages?.en_name }}
                                        </div>
                                    </td>
                                    <td width="35%">
                                        <div>
                                            {{ customPages?.dk_name }}
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/custom-pages/${customPages.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('customPages.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.customPages" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { customPagesService } from '@/components/api/user/CustomPagesService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'customPages.customPages',
        translate: true,
        href: '/settings/custom-pages',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'customPages.table.nameEnglish', isTranslateName: true, sorter: true, key: 'en_name' },
        { name: 'customPages.table.nameDanish', isTranslateName: true, sorter: true, key: 'dk_name' },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    customPages: [] as any,
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    isTableLoading: false,
    selectedJournalNoteTag: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchCustomPages()
})

async function fetchCustomPages() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await customPagesService.getCustomPages(params)
        if (response) {
            state.customPages = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCustomPages()
}

function next() {
    currentTablePage++
    fetchCustomPages()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCustomPages()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchCustomPages()
}

</script>
