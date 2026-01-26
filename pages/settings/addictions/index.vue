<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ customPagesStore.getCustomPagesName?.addictions }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ customPagesStore.getCustomPagesName?.addictions }}
            </template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/settings/addictions/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('addictions.new') }}
                        {{ customPagesStore.getCustomPagesName?.addictions?.toLowerCase() }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.addictions"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.addictions?.data?.length === 0))">
                                <tr v-for="(addiction, index) in state.addictions?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ addiction?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/addictions/${addiction.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('addictions.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteAddictionConfirmation(addiction)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('addictions.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.addictions" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteAddictionOpen"
                :message="$t('addictions.table.confirmation.deleteAddictionConfirmation') + '?'"
                @close="state.modal.isDeleteAddictionOpen = false" @confirm="deleteAddiction" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { addictionService } from '@/components/api/user/AddictionService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: customPagesStore.getCustomPagesName?.addictions,
        translate: false,
        href: '/settings/addictions',
    },
]

const state = reactive({
    addictions: [] as any,
    columnHeaders: [
        { name: 'addictions.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteAddictionOpen: false,
    },
    selectedAddiction: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchAddictions()
})

async function fetchAddictions() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await addictionService.getAddictions(params)
        if (response) {
            state.addictions = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchAddictions()
}

function next() {
    currentTablePage++
    fetchAddictions()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchAddictions()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchAddictions()
}

function deleteAddictionConfirmation(addiction: any) {
    state.selectedAddiction = addiction
    state.modal.isDeleteAddictionOpen = true
}

async function deleteAddiction() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await addictionService.deleteAddiction(state.selectedAddiction.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchAddictions()
            successAlert(`${t('alert.success')}!`, `${t('addictions.table.alert.addictionSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>