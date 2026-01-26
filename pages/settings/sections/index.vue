<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('sections.sections') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('sections.sections') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/settings/sections/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('sections.addNewSection') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.sections"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.sections?.data?.length === 0))">
                                <tr v-for="(section, index) in state.sections?.data" :key="index">
                                    <td width="70%">
                                        <span>{{ section?.name }}</span>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/sections/${section.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('sections.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteSectionConfirmation(section)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('sections.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.sections" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteSectionOpen"
                :message="$t('sections.table.confirmation.deleteSectionConfirmation') + '?'"
                @close="state.modal.isDeleteSectionOpen = false" @confirm="deleteSection" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { sectionService } from '@/components/api/user/SectionService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'sections.sections',
        translate: true,
        href: '/settings/sections',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'sections.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteSectionOpen: false,
    },
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    sections: [] as any,
    selectedSection: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchSections()
})

async function fetchSections() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await sectionService.getSections(params)
        if (response) {
            state.sections = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchSections()
}

function next() {
    currentTablePage++
    fetchSections()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchSections()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchSections()
}

function deleteSectionConfirmation(section: any) {
    state.selectedSection = section
    state.modal.isDeleteSectionOpen = true
}

async function deleteSection() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await sectionService.deleteSection(state.selectedSection.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchSections()
            successAlert(`${t('alert.success')}!`, `${t('sections.alert.sectionSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
