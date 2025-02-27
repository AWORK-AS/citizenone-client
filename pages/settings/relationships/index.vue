<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('relationships.relationships') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('relationships.relationships') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/relationships/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('relationships.addNewRelationship') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.relationships"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.relationships?.data?.length === 0))">
                                <tr v-for="(relationship, index) in state.relationships?.data" :key="index">
                                    <td width="70%">
                                        <span>{{ relationship?.name }}</span>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/relationships/${relationship.uuid}/edit`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('relationships.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="deleteRelationshipConfirmation(relationship)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('relationships.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.relationships" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteRelationshipOpen"
                :message="$t('relationships.table.confirmation.deleteRelationshipConfirmation') + '?'"
                @close="state.modal.isDeleteRelationshipOpen = false" @confirm="deleteRelationship" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { relationshipService } from '@/components/api/user/RelationshipService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'relationships.relationships',
        translate: true,
        href: '/settings/relationships',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'relationships.table.name', sorter: true, key: 'name' },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteRelationshipOpen: false,
    },
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    relationships: [] as any,
    selectedRelationship: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchRelationships()
})

async function fetchRelationships() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await relationshipService.getRelationships(params)
        if (response) {
            state.relationships = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchRelationships()
}

function next() {
    currentTablePage++
    fetchRelationships()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchRelationships()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchRelationships()
}

function deleteRelationshipConfirmation(relationship: any) {
    state.selectedRelationship = relationship
    state.modal.isDeleteRelationshipOpen = true
}

async function deleteRelationship() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await relationshipService.deleteRelationship(state.selectedRelationship.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchRelationships()
            successAlert(`${t('alert.success')}!`, `${t('relationships.alert.relationshipSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
