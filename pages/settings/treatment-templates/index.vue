<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('treatmentTemplates.treatmentTemplates') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('treatmentTemplates.treatmentTemplates') }}
            </template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action"
                        @click="navigateTo('/settings/treatment-templates/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('treatmentTemplates.newTemplate') }}
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
                                    <td width="40%">
                                        <div class="flex flex-wrap gap-1">
                                            <span v-for="field in getRequiredFields(template)" :key="field"
                                                class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xxs font-medium text-red-700">
                                                {{ field }}
                                            </span>
                                            <span v-if="getRequiredFields(template).length === 0"
                                                class="text-xs text-gray-400">—</span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/treatment-templates/${template.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('treatmentTemplates.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteTemplateConfirmation(template)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('treatmentTemplates.table.actions.delete') }}
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

            <DialogConfirmation :isModalOpen="state.modal.isDeleteTemplateOpen"
                :message="$t('treatmentTemplates.table.confirmation.deleteTemplateConfirmation') + '?'"
                @close="state.modal.isDeleteTemplateOpen = false" @confirm="deleteTemplate" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { treatmentTemplateService } from '@/components/api/user/TreatmentTemplateService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'treatmentTemplates.treatmentTemplates',
        translate: true,
        href: '/settings/treatment-templates',
    },
]

const fieldKeys = ['area_type', 'title', 'completion_date', 'score', 'description']

const fieldLabels = computed<Record<string, string>>(() => ({
    area_type: t('citizens.treatments.form.areaTypes.areaType'),
    title: t('citizens.treatments.form.titleOfTheTreatment'),
    completion_date: t('citizens.treatments.form.completionDate'),
    score: t('citizens.treatments.form.expectedLevels.expectedLevel'),
    description: t('citizens.treatments.form.description'),
}))

const state = reactive({
    columnHeaders: [
        { name: 'treatmentTemplates.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'treatmentTemplates.table.requiredFields', isTranslateName: true },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    templates: [] as any,
    modal: {
        isDeleteTemplateOpen: false,
    },
    selectedTemplate: {} as any,
    sortData: {
        sortField: 'name',
        sortOrder: 'ascend',
    },
})

onMounted(() => {
    fetchTemplates()
})

function getRequiredFields(template: any): string[] {
    return fieldKeys
        .filter(key => template[key] === 'required')
        .map(key => fieldLabels.value[key])
}

async function fetchTemplates() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await treatmentTemplateService.getTemplates(params)
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

function deleteTemplateConfirmation(template: any) {
    state.selectedTemplate = template
    state.modal.isDeleteTemplateOpen = true
}

async function deleteTemplate() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await treatmentTemplateService.deleteTemplate(state.selectedTemplate.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchTemplates()
            successAlert(`${t('alert.success')}!`, `${t('treatmentTemplates.table.alert.templateSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
