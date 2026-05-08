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
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/shifts/new')">
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
                                    <td width="15%">
                                        <div class="flex items-center gap-x-1">
                                            <Tooltip :text="$t('shifts.table.standard')" position="right"
                                                @click="state.modal.isStandardShiftOpen = true"
                                                v-if="shift?.is_standard">
                                                <div class="flex items-center gap-x-1 text-sm cursor-pointer">
                                                    <Icon name="ph:question" class="size-4 cursor-pointer text-gray-700"
                                                        aria-hidden="true" />
                                                </div>
                                            </Tooltip>
                                            <span>{{ shift?.en_name }}</span>
                                        </div>
                                        <Badge type="primary" class="w-fit text-xxs" v-if="shift?.is_leave_shift_type">
                                            {{ $t('shifts.table.markedAsLeave') }}
                                        </Badge>
                                    </td>
                                    <td width="15%">
                                        <span>{{ shift?.dk_name }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ shift?.pay_code }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ shift?.time_in }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ shift?.time_out }}</span>
                                    </td>
                                    <td width="10%">
                                        <span v-if="shift?.working_hours_factor">{{ shift.working_hours_factor }}</span>
                                        <span v-else class="text-gray-400">—</span>
                                    </td>
                                    <td width="10%">
                                        <span :style="{ backgroundColor: shift?.color }"
                                            class="inline-block w-8 h-8 rounded" />
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-center justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/shifts/${shift.uuid}/edit`)"
                                                v-if="shift?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('shifts.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
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
            <ModulesUserDutyScheduleShiftModalStandard :isModalOpen="state.modal.isStandardShiftOpen"
                @close="state.modal.isStandardShiftOpen = false" />
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
        { name: 'shifts.table.nameEnglish', isTranslateName: true, sorter: true, key: 'en_name' },
        { name: 'shifts.table.nameDanish', isTranslateName: true, sorter: true, key: 'dk_name' },
        { name: 'shifts.table.paycode', isTranslateName: true, sorter: true, key: 'pay_code' },
        { name: 'shifts.table.timeIn', isTranslateName: true, },
        { name: 'shifts.table.timeOut', isTranslateName: true, },
        { name: 'shifts.table.workingHoursFactor', isTranslateName: true, },
        { name: 'shifts.table.color', isTranslateName: true, },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteShiftOpen: false,
        isStandardShiftOpen: false,
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
