<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('extraHoursTags.extraHoursTags') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('extraHoursTags.extraHoursTags') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/extra-hours-tags/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('extraHoursTags.addNewExtraHoursTag') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.extraHoursTags"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.extraHoursTags?.data?.length === 0))">
                                <tr v-for="(extraHoursTag, index) in state.extraHoursTags?.data" :key="index">
                                    <td width="35%">
                                        <span>{{ extraHoursTag?.tag }}</span>
                                    </td>
                                    <td width="35%">
                                        <div class="text-xxs flex flex-wrap gap-1">
                                            <span v-for="(department, index) in extraHoursTag?.departments" :key=index
                                                class="bg-primary px-2 py-1 text-white rounded-md">
                                                {{ department?.name }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/extra-hours-tags/${extraHoursTag.uuid}/edit`)"
                                                v-if="extraHoursTag?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('extraHoursTags.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteExtraHoursTagConfirmation(extraHoursTag)"
                                                v-if="extraHoursTag?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('extraHoursTags.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.extraHoursTags" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteExtraHoursTagOpen"
                :message="$t('extraHoursTags.table.confirmation.deleteExtraHoursTagConfirmation') + '?'"
                @close="state.modal.isDeleteExtraHoursTagOpen = false" @confirm="deleteExtraHoursTag" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { extraHoursTagService } from '@/components/api/user/ExtraHoursTagService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'extraHoursTags.extraHoursTags',
        translate: true,
        href: '/settings/extraHoursTags',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'extraHoursTags.table.name', isTranslateName: true, sorter: true, key: 'tag' },
        { name: customPagesStore.getCustomPagesName?.department, isTranslateName: false },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteExtraHoursTagOpen: false,
    },
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    extraHoursTags: [] as any,
    selectedExtraHoursTag: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchExtraHoursTags()
})

watch(() => customPagesStore.getCustomPagesName, (newValue: any) => {
    if (newValue) {
        state.columnHeaders = [
            { name: 'extraHoursTags.table.name', isTranslateName: true, sorter: true, key: 'tag' },
            { name: customPagesStore.getCustomPagesName?.department, isTranslateName: false },
            { name: '' }
        ]
    }
}, { deep: true })

async function fetchExtraHoursTags() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await extraHoursTagService.getExtraHoursTags(params)
        if (response) {
            state.extraHoursTags = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchExtraHoursTags()
}

function next() {
    currentTablePage++
    fetchExtraHoursTags()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchExtraHoursTags()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchExtraHoursTags()
}

function deleteExtraHoursTagConfirmation(extraHoursTag: any) {
    state.selectedExtraHoursTag = extraHoursTag
    state.modal.isDeleteExtraHoursTagOpen = true
}

async function deleteExtraHoursTag() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await extraHoursTagService.deleteExtraHoursTag(state.selectedExtraHoursTag.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchExtraHoursTags()
            successAlert(`${t('alert.success')}!`, `${t('extraHoursTags.alert.extraHoursTagSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
