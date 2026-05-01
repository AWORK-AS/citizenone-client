<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('consentDeclarationTypes.consentDeclarationTypes') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('consentDeclarationTypes.consentDeclarationTypes') }}
            </template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/consent-declaration-types/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('consentDeclarationTypes.newConsentDeclarationType') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.consentDeclarationTypes"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.consentDeclarationTypes?.data?.length === 0))">
                                <tr v-for="(type, index) in state.consentDeclarationTypes?.data" :key="index">
                                    <td width="50%">
                                        <span>
                                            {{ type?.name }}
                                        </span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/consent-declaration-types/${type.uuid}/edit`)"
                                                v-if="type?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('consentDeclarationTypes.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteConfirmation(type)" v-if="type?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('consentDeclarationTypes.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.consentDeclarationTypes" @previous="previous" @next="next" />
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('consentDeclarationTypes.table.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteConsentDeclarationType" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { consentDeclarationTypeService } from '@/components/api/user/ConsentDeclarationTypeService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'consentDeclarationTypes.consentDeclarationTypes',
        translate: true,
        href: '/settings/consent-declaration-types',
    },
]

const state = reactive({
    consentDeclarationTypes: [] as any,
    columnHeaders: [
        { name: 'consentDeclarationTypes.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: '',
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteOpen: false,
    },
    selectedConsentDeclarationType: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchConsentDeclarationTypes()
})

async function fetchConsentDeclarationTypes() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await consentDeclarationTypeService.getConsentDeclarationTypes(params)
        if (response) {
            state.consentDeclarationTypes = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchConsentDeclarationTypes()
}

function next() {
    currentTablePage++
    fetchConsentDeclarationTypes()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchConsentDeclarationTypes()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchConsentDeclarationTypes()
}

function deleteConfirmation(type: any) {
    state.selectedConsentDeclarationType = type
    state.modal.isDeleteOpen = true
}

async function deleteConsentDeclarationType() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await consentDeclarationTypeService.deleteConsentDeclarationType(
            state.selectedConsentDeclarationType.uuid
        )
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchConsentDeclarationTypes()
            successAlert(`${t('alert.success')}!`, `${t('consentDeclarationTypes.table.alert.successfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
