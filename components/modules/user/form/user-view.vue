<template>
    <div>
        <div class="space-y-5">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <TableSearch @search="handleSearch" />
            <div class="table-responsive">
                <Table :columnHeaders="state.columnHeaders" :data="state.forms" :isLoading="state.isTableLoading"
                    :sortData="state.sortData" @sort="sort">
                    <template #body v-if="!(state.isTableLoading || (state.forms?.data?.length === 0))">
                        <tr v-for="(form, index) in state.forms?.data" :key="index">
                            <td width="50%">
                                <p>{{ form?.title }}</p>
                            </td>
                            <td width="50%">
                                <p>{{ form?.description }}</p>
                            </td>
                            <!-- <td width="20%">
                                <div class="flex items-end gap-2">
                                    <FormButton type="button" buttonStyle="action" 
                                        @click="navigateTo(`/forms/${form.uuid}/respond`)">
                                        <Icon name="ph:pencil-simple" class="size-4" />
                                        {{ $t('forms.table.actions.createResponse') }}
                                    </FormButton>
                                </div>
                            </td> -->
                        </tr>
                    </template>
                </Table>
            </div>
            <Pagination :data="state.forms" @previous="previous" @next="next" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { formService } from '@/components/api/user/FormService'
import type { Error } from '@/types'

let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'forms.table.title', isTranslateName: true, sorter: true, key: 'title' },
        { name: 'forms.table.description', isTranslateName: true, },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    forms: [] as any,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchForms()
})

async function fetchForms() {
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
    fetchForms()
}

function next() {
    currentTablePage++
    fetchForms()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchForms()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchForms()
}
</script>