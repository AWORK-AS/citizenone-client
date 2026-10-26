<template>
    <div>
        <Modal size="4xl" :title="$t('citizens.interventionHours.interventionHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <button class="text-sm text-primary hover:text-primary-700 hover:underline"
                        @click="state.modal.isTimeAccountDateRangeOpen = true">
                        {{ $t('citizens.interventionHours.timeAccount.date') }}:
                        {{ formatDateToReadable(state.timeAccountFilter.formDateRange.date_start) }} -
                        {{ formatDateToReadable(state.timeAccountFilter.formDateRange.date_end) }}
                    </button>
                    <!-- Left out where the company keeps the rate from this person
                         (Settings -> Company); the server sends neither figure then. -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-if="!ratesHidden">
                        <LoadingSpinner :isActive="state.isTimeAccountLoading">
                            <div class="border-l-4 border-secondary shadow-md rounded-md px-4 py-3">
                                <p class="text-xs">
                                    {{ $t('citizens.interventionHours.timeAccount.hourlyRate') }}
                                </p>
                                <p class="text-sm">
                                    {{
                                        formatNumber(language.locale.value, citizenStore.getSelectedCitizen?.hourly_rate)
                                    }}
                                </p>
                            </div>
                        </LoadingSpinner>
                        <LoadingSpinner :isActive="state.isContributionMarginLoading">
                            <div class="border-l-4 border-secondary shadow-md rounded-md px-4 py-3">
                                <p class="text-xs">
                                    {{ $t('citizens.interventionHours.contributionMargin') }}
                                </p>
                                <p class="text-sm">
                                    {{
                                        state.contributionMargin?.data?.contribution_margin
                                    }}
                                </p>
                            </div>
                        </LoadingSpinner>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <LoadingSpinner :isActive="state.isTimeAccountLoading">
                            <div class="border-l-4 border-secondary shadow-md rounded-md px-4 py-3">
                                <p class="text-xs">
                                    {{ $t('citizens.interventionHours.timeAccount.timeAccount') }}
                                </p>
                                <p class="text-sm">
                                    {{ state.timeAccount?.data?.total_hours || 0 }}
                                </p>
                            </div>
                        </LoadingSpinner>
                        <LoadingSpinner :isActive="state.isTimeAccountLoading">
                            <div :class="[
                                state.timeAccount?.data?.daily_flag === 1 && 'border-orange-400',
                                state.timeAccount?.data?.daily_flag === 2 && 'border-secondary',
                                state.timeAccount?.data?.daily_flag === 3 && 'border-red-600',
                                'border-l-4 shadow-md rounded-md px-4 py-3'
                            ]">
                                <p class="text-xs">
                                    {{ $t('citizens.interventionHours.timeAccount.dailyAllocation') }}
                                    ({{ formatNumber(language.locale.value,
                                        citizenStore.getSelectedCitizen?.allocated_daily_hours) }})
                                </p>
                                <p :class="[
                                    state.timeAccount?.data?.daily_flag === 1 && 'text-orange-400',
                                    state.timeAccount?.data?.daily_flag === 2 && 'text-secondary',
                                    state.timeAccount?.data?.daily_flag === 3 && 'text-red-600',
                                    'text-sm'
                                ]">
                                    {{ state.timeAccount?.data?.daily ?? '-' }}
                                </p>
                                <p v-if="state.timeAccount?.data?.daily_remaining != null" class="text-xs text-gray-500 tabular-nums">
                                    {{ remainingLabel(state.timeAccount.data.daily_remaining) }}
                                </p>
                            </div>
                        </LoadingSpinner>
                        <LoadingSpinner :isActive="state.isTimeAccountLoading">
                            <div :class="[
                                state.timeAccount?.data?.weekly_flag === 1 && 'border-orange-400',
                                state.timeAccount?.data?.weekly_flag === 2 && 'border-secondary',
                                state.timeAccount?.data?.weekly_flag === 3 && 'border-red-600',
                                'border-l-4 shadow-md rounded-md px-4 py-3'
                            ]">
                                <p class="text-xs">
                                    {{ $t('citizens.interventionHours.timeAccount.weeklyAllocation') }}
                                    ({{ formatNumber(language.locale.value,
                                        citizenStore.getSelectedCitizen?.allocated_weekly_hours) }})
                                </p>
                                <p :class="[
                                    state.timeAccount?.data?.weekly_flag === 1 && 'text-orange-400',
                                    state.timeAccount?.data?.weekly_flag === 2 && 'text-secondary',
                                    state.timeAccount?.data?.weekly_flag === 3 && 'text-red-600',
                                    'text-sm'
                                ]">
                                    {{ state.timeAccount?.data?.weekly ?? '-' }}
                                </p>
                                <p v-if="state.timeAccount?.data?.weekly_remaining != null" class="text-xs text-gray-500 tabular-nums">
                                    {{ remainingLabel(state.timeAccount.data.weekly_remaining) }}
                                </p>
                            </div>
                        </LoadingSpinner>
                        <LoadingSpinner :isActive="state.isTimeAccountLoading">
                            <div :class="[
                                state.timeAccount?.data?.monthly_flag === 1 && 'border-orange-400',
                                state.timeAccount?.data?.monthly_flag === 2 && 'border-secondary',
                                state.timeAccount?.data?.monthly_flag === 3 && 'border-red-600',
                                'border-l-4 shadow-md rounded-md px-4 py-3'
                            ]">
                                <p class="text-xs">
                                    {{ $t('citizens.interventionHours.timeAccount.monthlyAllocation') }}
                                    ({{ formatNumber(language.locale.value,
                                        citizenStore.getSelectedCitizen?.allocated_monthly_hours) }})
                                </p>
                                <p :class="[
                                    state.timeAccount?.data?.monthly_flag === 1 && 'text-orange-400',
                                    state.timeAccount?.data?.monthly_flag === 2 && 'text-secondary',
                                    state.timeAccount?.data?.monthly_flag === 3 && 'text-red-600',
                                    'text-sm'
                                ]">
                                    {{ state.timeAccount?.data?.monthly ?? '-' }}
                                </p>
                                <p v-if="state.timeAccount?.data?.monthly_remaining != null" class="text-xs text-gray-500 tabular-nums">
                                    {{ remainingLabel(state.timeAccount.data.monthly_remaining) }}
                                </p>
                            </div>
                        </LoadingSpinner>
                    </div>
                </div>
                <!-- Hours per hour type in the period and filters: the figure a municipality
                     asks for, e.g. contact time (ATA) apart from supervision. -->
                <div v-if="hoursByType.length" class="mt-4 flex flex-wrap items-center gap-2">
                    <span class="text-xs font-medium text-gray-500">{{ $t('citizens.interventionHours.byType.title') }}</span>
                    <span v-for="entry in hoursByType" :key="entry.uuid ?? (entry.is_transportation ? 'transport' : 'work')"
                        class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 tabular-nums">
                        <span class="font-medium">{{ hoursByTypeLabel(entry, $t('citizens.interventionHours.table.work'), $t('citizens.interventionHours.table.transport')) }}</span>
                        {{ formatNumber(language.locale.value, entry.hours) }} t
                    </span>
                </div>
                <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div v-if="hourTypeOptions.length > 1" class="space-y-1">
                        <FormLabel for="filter_hour_types" :label="$t('citizens.interventionHours.filters.hourTypes')" />
                        <FormSelectMultiple id="filter_hour_types" :options="hourTypeOptions" v-model="state.filters.types" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="filter_kind" :label="$t('citizens.interventionHours.filters.kind')" />
                        <FormSelect id="filter_kind" :options="kindOptions" :searchable="false" v-model="state.filters.kind" />
                    </div>
                    <div v-if="employeeOptions.length > 1" class="space-y-1">
                        <FormLabel for="filter_users" :label="$t('citizens.interventionHours.filters.employees')" />
                        <FormSelectMultiple id="filter_users" :options="employeeOptions" v-model="state.filters.users" />
                    </div>
                </div>
                <div v-if="activeFilters" class="mt-2 flex justify-end">
                    <button type="button" class="text-xs font-medium text-primary hover:underline" @click="clearFilters">
                        {{ $t('citizens.interventionHours.filters.clear') }}
                    </button>
                </div>
                <div class="mt-6 flex items-center gap-x-2 justify-end">
                    <FormButton buttonStyle="action" @click="openTimeLogsModal">
                        <Icon name="ph:list-checks" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.timeLogs.timeLogs') }}
                    </FormButton>
                    <FormButton buttonStyle="action" @click="state.modal.isAddInterventionHoursOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.interventionHours.newInterventionHours') }}
                    </FormButton>
                    <FormButton buttonStyle="action" @click="state.modal.isDownloadInterventionHoursOpen = true">
                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.interventionHours.download.download') }}
                    </FormButton>
                </div>
                <div class="mt-5 space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.interventionHours"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.interventionHours?.data?.length === 0))">
                                <tr v-for="(inteventionHours, index) in state.interventionHours?.data" :key="index">
                                    <td width="15%">
                                        {{ inteventionHours?.date_time_start ?
                                            formatDateTimeToReadable(inteventionHours?.date_time_start) : '' }}
                                    </td>
                                    <td width="15%">
                                        {{ inteventionHours?.date_time_end ?
                                            formatDateTimeToReadable(inteventionHours?.date_time_end) : '' }}
                                    </td>
                                    <td width="20%">
                                        {{ inteventionHours?.note }}
                                    </td>
                                    <td width="10%">
                                        <div class="truncate">
                                            {{ formatNumber(language.locale.value, inteventionHours?.total_hours) }}
                                            <Badge type="primary" class="text-xxs"
                                                v-if="inteventionHours?.is_from_duty_schedule">
                                                {{ $t('citizens.interventionHours.table.fromDutySchedule') }}
                                            </Badge>
                                            <!-- Migrated from the previous system: history, read only. -->
                                            <Badge type="harmless" class="text-xxs" v-if="inteventionHours?.is_historical">
                                                {{ $t('citizens.interventionHours.table.historical') }}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <!-- The hour type itself (Kontakttimer (ATA), Sparring...), else work or transport. -->
                                        <div :class="[
                                            inteventionHours?.is_transportation ? 'bg-green-100 text-green-800' : 'bg-teal-100 text-tertiary-800',
                                            'rounded-xl px-2 py-1 text-xs font-semibold text-center w-fit',
                                        ]">
                                            {{ careHourTypeLabel(inteventionHours, $t('citizens.interventionHours.table.work'), $t('citizens.interventionHours.table.transport')) }}</div>
                                    </td>
                                    <td width="20%">
                                        {{ inteventionHours?.user?.firstname + ' ' + inteventionHours?.user?.lastname }}
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="viewInterventionHourLog(inteventionHours)"
                                                v-if="!inteventionHours?.is_historical">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('citizens.interventionHours.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action"
                                                @click="editInterventionHours(inteventionHours)"
                                                v-if="inteventionHours?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.interventionHours.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action"
                                                @click="deleteInterventionHoursConfirmation(inteventionHours)"
                                                v-if="inteventionHours?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizens.interventionHours.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.interventionHours" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenInterventionHoursModalNew :isModalOpen="state.modal.isAddInterventionHoursOpen"
                    @close="state.modal.isAddInterventionHoursOpen = false"
                    @refreshInterventionHours="refreshInterventionHours()" />
                <ModulesUserCitizenInterventionHoursModalEdit :isModalOpen="state.modal.isEditInterventionHoursOpen"
                    :selectedInterventionHours="state.selectedInterventionHours"
                    @close="state.modal.isEditInterventionHoursOpen = false"
                    @refreshInterventionHours="refreshInterventionHours()" />
                <ModulesUserCitizenInterventionHoursModalDownload
                    :isModalOpen="state.modal.isDownloadInterventionHoursOpen" :filters="state.filters"
                    @close="state.modal.isDownloadInterventionHoursOpen = false" />
                <ModulesUserCitizenInterventionHoursModalDateRange :isModalOpen="state.modal.isTimeAccountDateRangeOpen"
                    :dateRange="state.timeAccountFilter.formDateRange"
                    @close="state.modal.isTimeAccountDateRangeOpen = false" @filterDate="filterTimeAccountByDate" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteInterventionHoursOpen"
                    :message="$t('citizens.interventionHours.table.confirmation.deleteInterventionHoursConfirmation') + '?'"
                    @close="state.modal.isDeleteInterventionHoursOpen = false" @confirm="deleteInterventionHours" />
                <ModulesUserCitizenInterventionHoursModalViewLog :selectedCareHour="state.selectedInterventionHours"
                    :isModalOpen="state.modal.isViewInterventionHourLogOpen"
                    @close="state.modal.isViewInterventionHourLogOpen = false" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
import { areCitizenRatesHidden } from '@/composables/citizenRates'
import { useCareHourTypes } from '@/composables/careHourTypeList'
import { activeCareHourFilterCount, careHourFilterParams, careHourTypeLabel, emptyCareHourFilters, hourTypeFilterOptions, hoursByTypeLabel, type CareHourFilters } from '@/composables/careHourFilters'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useCitizenStore } from '@/store/citizen'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const citizenStore = useCitizenStore() as any
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
const { successAlert } = useAlert()
const emit = defineEmits(['close', 'refreshCitizenDetails', 'openTimeLogs'])
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'citizens.interventionHours.table.datetimeStart', isTranslateName: true, sorter: true, key: 'date_time_start' },
        { name: 'citizens.interventionHours.table.datetimeEnd', isTranslateName: true, sorter: true, key: 'date_time_end' },
        { name: 'citizens.interventionHours.table.note', isTranslateName: true, },
        { name: 'citizens.interventionHours.table.totalHours', isTranslateName: true, },
        { name: 'citizens.interventionHours.table.type', isTranslateName: true, key: 'is_transportation' },
        { name: 'citizens.interventionHours.table.createdBy', isTranslateName: true, },
        { name: '' },
    ],
    contributionMargin: {} as any,
    // Hour type, work/transport and employee: the list, totals and download follow them.
    filters: emptyCareHourFilters() as CareHourFilters,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isContributionMarginLoading: false,
    isTimeAccountLoading: false,
    isTableLoading: false,
    modal: {
        isAddInterventionHoursOpen: false,
        isDeleteInterventionHoursOpen: false,
        isDownloadInterventionHoursOpen: false,
        isEditInterventionHoursOpen: false,
        isTimeAccountDateRangeOpen: false,
        isViewInterventionHourLogOpen: false,
    },
    interventionHours: [] as any,
    selectedInterventionHours: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    timeAccount: {} as any,
    timeAccountFilter: {
        formDateRange: {
            date_start: moment().startOf('month').format('YYYY-MM-DD'),
            date_end: moment().endOf('month').format('YYYY-MM-DD'),
        }
    },
})

// hidden_fields names the rate when the company keeps it from this person;
// the margin endpoint says so too, for a citizen loaded before the switch.
const ratesHidden = computed(() => areCitizenRatesHidden(citizenStore.getSelectedCitizen, state.contributionMargin))

const { types: hourTypes, loadHourTypes } = useCareHourTypes()
const hoursByType = computed(() => state.timeAccount?.data?.hours_by_type ?? [])
const hourTypeOptions = computed(() => hourTypes.value.length
    ? hourTypeFilterOptions(hourTypes.value, t('citizens.interventionHours.filters.withoutType'))
    : [])
const kindOptions = computed(() => [
    { value: '', label: t('citizens.interventionHours.filters.all') },
    { value: 'work', label: t('citizens.interventionHours.table.work') },
    { value: 'transport', label: t('citizens.interventionHours.table.transport') },
])
const employeeOptions = computed(() => (state.timeAccount?.data?.registered_by ?? [])
    .map((person: any) => ({ value: person.uuid, label: person.name })))
const activeFilters = computed(() => activeCareHourFilterCount(state.filters))

function clearFilters() {
    state.filters = emptyCareHourFilters()
}

// A changed filter reloads the list from page 1 and the totals.
watch(() => careHourFilterParams(state.filters), () => {
    currentTablePage = 1
    fetchInterventionHours()
    fetchTimeAccount()
}, { deep: true })

// Hours left of an allocation after the chosen period, or how far over it went.
function remainingLabel(remaining: number) {
    const hours = formatNumber(language.locale.value, Math.abs(remaining))
    return remaining < 0
        ? language.t('citizens.interventionHours.timeAccount.overBy', { hours })
        : language.t('citizens.interventionHours.timeAccount.remaining', { hours })
}

function closeModal() {
    emit('close')
}

function refreshInterventionHours() {
    fetchInterventionHours()
    emit('refreshCitizenDetails')
}

function openTimeLogsModal() {
    emit('openTimeLogs')
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        loadHourTypes()
        fetchContributionMargin()
        fetchTimeAccount()
        fetchInterventionHours()
    }
})

async function fetchContributionMargin() {
    if (areCitizenRatesHidden(citizenStore.getSelectedCitizen)) {
        return
    }
    state.error = {}
    state.isContributionMarginLoading = true
    try {
        const params = {
            date_start: state.timeAccountFilter.formDateRange.date_start,
            date_end: state.timeAccountFilter.formDateRange.date_end,
        }
        const response = await interventionHoursService.getContributionMargin(citizenUuid, params)
        if (response) {
            state.contributionMargin = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isContributionMarginLoading = false
}

async function fetchTimeAccount() {
    state.error = {}
    state.isTimeAccountLoading = true
    try {
        const params = {
            date_start: state.timeAccountFilter.formDateRange.date_start,
            date_end: state.timeAccountFilter.formDateRange.date_end,
            ...careHourFilterParams(state.filters),
        }
        const response = await interventionHoursService.getTimeAccount(citizenUuid, params)
        if (response) {
            state.timeAccount = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTimeAccountLoading = false
}

function filterTimeAccountByDate(formDateRange: any) {
    state.timeAccountFilter.formDateRange.date_start = formDateRange.date_start
    state.timeAccountFilter.formDateRange.date_end = formDateRange.date_end
    fetchTimeAccount()
}

async function fetchInterventionHours() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
            ...careHourFilterParams(state.filters),
        }
        const response = await interventionHoursService.getInterventionHours(params)
        if (response) {
            state.interventionHours = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchInterventionHours()
}

function next() {
    currentTablePage++
    fetchInterventionHours()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchInterventionHours()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchInterventionHours()
}

function viewInterventionHourLog(inteventionHours: any) {
    state.selectedInterventionHours = inteventionHours
    state.modal.isViewInterventionHourLogOpen = true
}

function editInterventionHours(inteventionHours: any) {
    state.selectedInterventionHours = inteventionHours
    state.modal.isEditInterventionHoursOpen = true
}

function deleteInterventionHoursConfirmation(inteventionHours: any) {
    state.selectedInterventionHours = inteventionHours
    state.modal.isDeleteInterventionHoursOpen = true
}

async function deleteInterventionHours() {
    state.error = {}
    state.isTableLoading = true
    try {
        const interventionHoursUuid = state.selectedInterventionHours.uuid
        const response = await interventionHoursService.deleteInterventionHours(interventionHoursUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('citizens.interventionHours.table.alert.interventionHoursSuccessfullyDeleted')}.`)
            refreshInterventionHours()
            fetchTimeAccount()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>