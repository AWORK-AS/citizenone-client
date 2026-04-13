<template>
    <div>
        <div class="flex justify-end items-center mb-5">
            <FormButton buttonStyle="action" @click="navigateTo('/forms/new')">
                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                {{ $t('forms.newForm') }}
            </FormButton>
        </div>
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
                            <td width="20%">
                                <div class="flex items-end justify-end gap-2">
                                    <FormButton type="button" buttonStyle="action"
                                        @click="navigateTo(`/forms/${form.uuid}/edit`)">
                                        <Icon name="ph:pencil-simple" class="size-4" />
                                        {{ $t('forms.table.actions.edit') }}
                                    </FormButton>
                                    <FormButton type="button" buttonStyle="action" @click="deleteConfirmation(form)">
                                        <Icon name="ph:trash" class="size-4" />
                                        {{ $t('forms.table.actions.delete') }}
                                    </FormButton>
                                    <!-- <FormButton type="button" buttonStyle="action" 
                                        @click="navigateTo(`/forms/${form.uuid}/responses`)">
                                        <Icon name="ph:eye" class="size-4" />
                                        {{ $t('forms.table.actions.viewResponses') }}
                                    </FormButton>
                                    <FormButton type="button" buttonStyle="action" 
                                        @click="navigateTo(`/forms/${form.uuid}/respond`)">
                                        <Icon name="ph:pencil-simple" class="size-4" />
                                        {{ $t('forms.table.actions.createResponse') }}
                                    </FormButton> -->
                                </div>
                            </td>
                        </tr>
                    </template>
                </Table>
            </div>
            <Pagination :data="state.forms" @previous="previous" @next="next" />
        </div>
        <DialogConfirmation :isModalOpen="state.modal.isDeleteFormOpen"
            :message="$t('forms.confirmation.deleteFormConfirmation') + '?'"
            @close="state.modal.isDeleteFormOpen = false" @confirm="deleteForm" />
    </div>
</template>

<script setup lang="ts">
import { formService } from '@/components/api/user/FormService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'forms.table.title', isTranslateName: true, sorter: true, key: 'title' },
        { name: 'forms.table.description', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    forms: [] as any,
    isTableLoading: false,
    modal: {
        isDeleteFormOpen: false,
    },
    selectedForm: {} as any,
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

function deleteConfirmation(form: any) {
    state.selectedForm = form
    state.modal.isDeleteFormOpen = true
}

async function deleteForm() {
    state.error = {}
    state.isTableLoading = true
    try {
        const formUuid = state.selectedForm?.uuid
        const response = await formService.deleteForm(formUuid)
        if (response) {
            fetchForms()
            successAlert(`${t('alert.success')}!`, `${t('forms.table.alert.formSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>