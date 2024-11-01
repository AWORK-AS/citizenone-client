<template>
    <div>
        <div class="flex justify-end items-center mb-5">
            <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/forms/new')">
                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                {{ $t('forms.newForm') }}
            </FormButton>
        </div>
        <div class="space-y-5">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                @handleFilter="handleFilter" />
            <div class="table-responsive">
                <Table :columnHeaders="state.columnHeaders" :data="state.forms" :isLoading="state.isTableLoading"
                    :sortData="state.sortData" @sort="sort">
                    <template #body v-if="!(state.isTableLoading || (state.forms?.data?.length === 0))">
                        <tr v-for="(form, index) in state.forms?.data" :key="index">
                            <td width="30%">
                                <p>{{ form?.title }}</p>
                            </td>
                            <td width="50%">
                                <p>{{ form?.descriotion }}</p>
                            </td>
                            <td width="20%">
                                <div class="flex items-end gap-2">
                                    <FormButton type="button" buttonStyle="action" class="rounded-md"
                                        @click="navigateTo(`/forms/${form.uuid}/responses`)">
                                        <Icon name="ph:eye" class="size-4" />
                                        {{ $t('forms.table.actions.viewResponses') }}
                                    </FormButton>
                                </div>
                            </td>
                        </tr>
                    </template>
                </Table>
            </div>
            <Pagination :data="state.forms" @previous="previous" @next="next" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { formService } from '@/components/api/FormService'
import type { Error } from '@/types'

let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'title' },
    ],
    columnHeaders: [
        { name: 'forms.table.title', sorter: true, key: 'title' },
        { name: 'forms.table.description' },
        { name: '' },
    ],
    dataFilter: [],
    error: {} as Error,
    forms: [] as any,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchNews()
})

async function fetchNews() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await formService.getForms(params)
        if (response) {
            state.forms = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchNews()
}

function next() {
    currentTablePage++
    fetchNews()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchNews()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchNews()
}
</script>