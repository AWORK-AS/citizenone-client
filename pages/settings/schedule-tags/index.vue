<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('scheduleTags.scheduleTags') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('scheduleTags.scheduleTags') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/schedule-tags/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('scheduleTags.addNewScheduleTag') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.scheduleTags"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.scheduleTags?.data?.length === 0))">
                                <tr v-for="(scheduleTag, index) in state.scheduleTags?.data" :key="index">
                                    <td width="20%">
                                        <span>{{ scheduleTag?.tag }}</span>
                                    </td>
                                    <td width="20%">
                                        <span :style="{ backgroundColor: scheduleTag?.color }"
                                            class="inline-block w-8 h-8 rounded" />
                                    </td>
                                    <td width="30%">
                                        <div class="text-xxs flex flex-wrap gap-1">
                                            <span v-for="(department, index) in scheduleTag?.departments" :key=index
                                                class="bg-primary px-2 py-1 text-white rounded-md">
                                                {{ department?.name }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/schedule-tags/${scheduleTag.uuid}/edit`)"
                                                v-if="scheduleTag?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('scheduleTags.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteScheduleTagConfirmation(scheduleTag)"
                                                v-if="scheduleTag?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('scheduleTags.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.scheduleTags" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteScheduleTagOpen"
                :message="$t('scheduleTags.table.confirmation.deleteScheduleTagConfirmation') + '?'"
                @close="state.modal.isDeleteScheduleTagOpen = false" @confirm="deleteScheduleTag" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { scheduleTagService } from '@/components/api/user/ScheduleTagService'
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
        name: 'scheduleTags.scheduleTags',
        translate: true,
        href: '/settings/scheduleTags',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'scheduleTags.table.name', isTranslateName: true, sorter: true, key: 'tag' },
        { name: 'scheduleTags.table.color', isTranslateName: true, },
        { name: customPagesStore.getCustomPagesName?.department, isTranslateName: false },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteScheduleTagOpen: false,
    },
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    scheduleTags: [] as any,
    selectedScheduleTag: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchScheduleTags()
})

watch(() => customPagesStore.getCustomPagesName, (newValue: any) => {
    if (newValue) {
        state.columnHeaders = [
            { name: 'scheduleTags.table.name', isTranslateName: true, sorter: true, key: 'tag' },
            { name: 'scheduleTags.table.color', isTranslateName: true, },
            { name: customPagesStore.getCustomPagesName?.department, isTranslateName: false },
            { name: '' }
        ]
    }
}, { deep: true })

async function fetchScheduleTags() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await scheduleTagService.getScheduleTags(params)
        if (response) {
            state.scheduleTags = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchScheduleTags()
}

function next() {
    currentTablePage++
    fetchScheduleTags()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchScheduleTags()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchScheduleTags()
}

function deleteScheduleTagConfirmation(scheduleTag: any) {
    state.selectedScheduleTag = scheduleTag
    state.modal.isDeleteScheduleTagOpen = true
}

async function deleteScheduleTag() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await scheduleTagService.deleteScheduleTag(state.selectedScheduleTag.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchScheduleTags()
            successAlert(`${t('alert.success')}!`, `${t('scheduleTags.alert.scheduleTagSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
