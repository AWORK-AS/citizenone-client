<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('plansandgoals.VUMTemplates.templates') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('plansandgoals.VUMTemplates.templates') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isAddNewTemplateOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('plansandgoals.VUMTemplates.newTemplate') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.templates"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.templates?.data?.length === 0))">
                                <tr v-for="(template, index) in state.templates?.data" :key="index">
                                    <td width="40%">
                                        <span>{{ template?.name }}</span>
                                    </td>
                                    <td width="35%">
                                        <span>{{ template?.status }}</span>
                                    </td>
                                    <td width="25%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('plansandgoals.VUMTemplates.table.actions.viewPlans') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editTemplate(template)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('plansandgoals.VUMTemplates.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="confirmTemplateDeletion(template)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('plansandgoals.VUMTemplates.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.templates" @previous="previous" @next="next" />
                </div>
            </div>
            <ModulesVumTemplateModalNew :isModalOpen="state.modal.isAddNewTemplateOpen"
                @close="state.modal.isAddNewTemplateOpen = false" @refreshTemplates="fetchTemplates" />
            <ModulesVumTemplateModalEdit :isModalOpen="state.modal.isEditTemplateOpen"
                :selectedTemplate="state.selectedTemplate" @close="state.modal.isEditTemplateOpen = false"
                @refreshTemplates="fetchTemplates" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteTemplateOpen"
                :message="$t('plansandgoals.VUMTemplates.table.confirmation.deleteTemplateConfirmation') + '?'"
                @close="state.modal.isDeleteTemplateOpen = false" @confirm="deleteTemplate" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { vumTemplateService } from '@/components/api/VUMTemplateService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'plansandgoals.VUMTemplates.table.templateName', sorter: true, key: 'name' },
        { name: 'plansandgoals.VUMTemplates.table.status' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    templates: [] as any,
    modal: {
        isAddNewTemplateOpen: false,
        isEditTemplateOpen: false,
        isDeleteTemplateOpen: false,
    },
    selectedTemplate: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchTemplates()
})

async function fetchTemplates() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await vumTemplateService.getTemplates(params)
        if (response) {
            state.templates = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchTemplates()
}

function next() {
    currentTablePage++
    fetchTemplates()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchTemplates()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchTemplates()
}

function editTemplate(template: any) {
    state.selectedTemplate = template
    state.modal.isEditTemplateOpen = true
}

function confirmTemplateDeletion(template: any) {
    state.selectedTemplate = template
    state.modal.isDeleteTemplateOpen = true
}

async function deleteTemplate() {
    state.error = {}
    state.isTableLoading = true
    try {
        const selectedTemplateUuid = state.selectedTemplate.uuid
        const response = await vumTemplateService.deleteTemplate(selectedTemplateUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.VUMTemplates.table.alert.templateSuccessfullyDeleted')}.`)
            fetchTemplates()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>