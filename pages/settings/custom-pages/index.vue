<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('customPages.customPages') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('customPages.customPages') }}</template>

            <ModulesSettingsTab />

            <LazyModulesCustomPagesTab />

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
                                    <td width="40%">
                                        <span v-if="customPages?.custom_name === 'Citizens'">
                                            {{ $t('customPages.table.citizens') }}
                                        </span>
                                        <span v-else-if="customPages?.custom_name === 'Duty schedules'">
                                            {{ $t('customPages.table.dutySchedules') }}
                                        </span>
                                        <span v-else-if="customPages?.custom_name === 'Risk assessments'">
                                            {{ $t('customPages.table.riskAssessments') }}
                                        </span>
                                        <span v-else>
                                            {{ customPages?.custom_name }}
                                        </span>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/custom-pages/edit/${customPages.uuid}`)">
                                                <Icon name="ph:pencil" class="size-4" />
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
import { customPagesService } from '@/components/api/CustomPagesService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'customPages.table.name', sorter: true, key: 'name' },
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
