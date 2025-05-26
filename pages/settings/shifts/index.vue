<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('shifts.shifts') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('shifts.shifts') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/settings/shifts/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('shifts.addNewShift') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.shifts"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.shifts?.data?.length === 0))">
                                <tr v-for="(shift, index) in state.shifts?.data" :key="index">
                                    <td width="30%">
                                        <span>{{ shift?.en_name }}</span>
                                    </td>
                                    <td width="30%">
                                        <span>{{ shift?.dk_name }}</span>
                                    </td>
                                    <td width="10%">
                                        <span :style="{ backgroundColor: shift?.color }"
                                            class="inline-block w-8 h-8 rounded" />
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/shifts/${shift.uuid}/edit`)"
                                                v-if="shift?.is_editable">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('shifts.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="deleteShiftConfirmation(shift)" v-if="shift?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('shifts.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.shifts" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteShiftOpen"
                :message="$t('shifts.table.confirmation.deleteShiftConfirmation') + '?'"
                @close="state.modal.isDeleteShiftOpen = false" @confirm="deleteShift" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { shiftService } from '@/components/api/user/ShiftService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'shifts.shifts',
        translate: true,
        href: '/settings/shifts',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'shifts.table.nameEnglish', sorter: true, key: 'en_name' },
        { name: 'shifts.table.nameDanish', sorter: true, key: 'dk_name' },
        { name: 'shifts.table.color' },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteShiftOpen: false,
    },
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    shifts: [] as any,
    selectedShift: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchShifts()
})

async function fetchShifts() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await shiftService.getShifts(params)
        if (response) {
            state.shifts = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchShifts()
}

function next() {
    currentTablePage++
    fetchShifts()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchShifts()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchShifts()
}

function deleteShiftConfirmation(shift: any) {
    state.selectedShift = shift
    state.modal.isDeleteShiftOpen = true
}

async function deleteShift() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await shiftService.deleteShift(state.selectedShift.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchShifts()
            successAlert(`${t('alert.success')}!`, `${t('shifts.alert.shiftSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
