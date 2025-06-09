<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('calendarTags.calendarTags') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('calendarTags.calendarTags') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/calendar-tags/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('calendarTags.addNewCalendarTag') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.calendarTags"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.calendarTags?.data?.length === 0))">
                                <tr v-for="(calendarTag, index) in state.calendarTags?.data" :key="index">
                                    <td width="35%">
                                        <span>{{ calendarTag?.tag }}</span>
                                    </td>
                                    <td width="35%">
                                        <span :style="{ backgroundColor: calendarTag?.color }"
                                            class="inline-block w-8 h-8 rounded" />
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/calendar-tags/${calendarTag.uuid}/edit`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('calendarTags.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="deleteCalendarTagConfirmation(calendarTag)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('calendarTags.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.calendarTags" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteCalendarTagOpen"
                :message="$t('calendarTags.table.confirmation.deleteCalendarTagConfirmation') + '?'"
                @close="state.modal.isDeleteCalendarTagOpen = false" @confirm="deleteCalendarTag" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { calendarTagService } from '@/components/api/user/CalendarTagService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'calendarTags.calendarTags',
        translate: true,
        href: '/settings/calendarTags',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'calendarTags.table.name', sorter: true, key: 'tag' },
        { name: 'calendarTags.table.color' },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteCalendarTagOpen: false,
    },
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    calendarTags: [] as any,
    selectedCalendarTag: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchCalendarTags()
})

async function fetchCalendarTags() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await calendarTagService.getCalendarTags(params)
        if (response) {
            state.calendarTags = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCalendarTags()
}

function next() {
    currentTablePage++
    fetchCalendarTags()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCalendarTags()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchCalendarTags()
}

function deleteCalendarTagConfirmation(calendarTag: any) {
    state.selectedCalendarTag = calendarTag
    state.modal.isDeleteCalendarTagOpen = true
}

async function deleteCalendarTag() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await calendarTagService.deleteCalendarTag(state.selectedCalendarTag.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchCalendarTags()
            successAlert(`${t('alert.success')}!`, `${t('calendarTags.alert.calendarTagSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
