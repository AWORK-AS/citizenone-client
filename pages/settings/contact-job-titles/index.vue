<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('contactJobTitles.contactJobTitles') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('contactJobTitles.contactJobTitles') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/contact-job-titles/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('contactJobTitles.addNewContactJobTitle') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.contactJobTitles"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.contactJobTitles?.data?.length === 0))">
                                <tr v-for="(contactJobTitle, index) in state.contactJobTitles?.data" :key="index">
                                    <td width="30%">
                                        <span>{{ contactJobTitle?.en_title }}</span>
                                    </td>
                                    <td width="30%">
                                        <span>{{ contactJobTitle?.dk_title }}</span>
                                    </td>
                                    <td width="40%">
                                        <div class="flex items-center justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/contact-job-titles/${contactJobTitle.uuid}/edit`)"
                                                v-if="contactJobTitle?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('contactJobTitles.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteContactJobTitleConfirmation(contactJobTitle)"
                                                v-if="contactJobTitle?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('contactJobTitles.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.contactJobTitles" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteContactJobTitleOpen"
                :message="$t('contactJobTitles.table.confirmation.deleteContactJobTitleConfirmation') + '?'"
                @close="state.modal.isDeleteContactJobTitleOpen = false" @confirm="deleteContactJobTitle" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { contactJobTitlesService } from '@/components/api/user/ContactJobTitlesService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'contactJobTitles.contactJobTitles',
        translate: true,
        href: '/settings/contact-job-titles',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'contactJobTitles.table.titleEnglish', sorter: true, key: 'en_title' },
        { name: 'contactJobTitles.table.titleDanish', sorter: true, key: 'dk_title' },
        { name: '' }
    ],
    contactJobTitles: [] as any,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteContactJobTitleOpen: false,
    },
    selectedContactJobTitle: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchContactJobTitles()
})

async function fetchContactJobTitles() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await contactJobTitlesService.getContactJobTitles(params)
        if (response) {
            state.contactJobTitles = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchContactJobTitles()
}

function next() {
    currentTablePage++
    fetchContactJobTitles()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchContactJobTitles()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchContactJobTitles()
}

function deleteContactJobTitleConfirmation(contactJobTitle: any) {
    state.selectedContactJobTitle = contactJobTitle
    state.modal.isDeleteContactJobTitleOpen = true
}

async function deleteContactJobTitle() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await contactJobTitlesService.deleteContactJobTitle(state.selectedContactJobTitle.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchContactJobTitles()
            successAlert(`${t('alert.success')}!`, `${t('contactJobTitles.alert.contactJobTitleSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
