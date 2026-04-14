<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.medicineCard') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.medicineCard') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div>
                    <div class="flex justify-between flex-col-reverse md:flex-row gap-3">
                        <button class="flex items-center gap-x-1 text-sm text-primary group"
                            @click="state.modal.isFilterMedicineOpen = true">
                            <Icon name="ic:outline-filter-list"
                                class="text-primary w-6 h-6 group-hover:text-primary-700" />
                            <span class="group-hover:text-primary-700">
                                {{ $t('filter') }}
                            </span>
                        </button>
                        <div class="flex items-center gap-x-2 justify-end">
                            <FormButton buttonStyle="action"
                                @click="navigateToExternalLink('https://fmk-online.dk/fmk')">
                                <Icon name="mdi:cloud-refresh-outline" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('citizens.medicineJournals.synchronizeWithFMK') }}
                            </FormButton>
                            <FormButton buttonStyle="action" @click="state.modal.isAddMedicineOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('citizens.medicineJournals.newMedicine') }}
                            </FormButton>
                            <FormButton buttonStyle="action" @click="state.modal.isDownloadMedicineOverviewOpen = true">
                                <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('citizens.medicineJournals.downloadOverview') }}
                            </FormButton>
                        </div>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div v-if="citizenMedicineStore.getSelectedMedicines?.length > 0">
                        <FormButton buttonStyle="action" @click="state.modal.isGiveMedicinesOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.medicineJournals.history.giveAllMedicines') }}
                        </FormButton>
                    </div>
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.medicines"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.medicines?.data?.length === 0))">
                                <tr v-for="(medicine, index) in state.medicines?.data" :key="index">
                                    <td width="30%">
                                        <div class="flex flex-col gap-2">
                                            <div class="flex">
                                                <div>
                                                    <FormCheckbox :id="`medicine_${medicine?.uuid}`"
                                                        :value="citizenMedicineStore.getSelectedMedicines?.includes(medicine?.uuid)"
                                                        @click="addRemoveMedicine(medicine)" />
                                                </div>
                                                <div>
                                                    <img :src="medicine?.medicine?.image_url" alt="Image failed to load"
                                                        class="w-28" v-if="medicine?.medicine?.image_url">
                                                    <div class="space-y-1">
                                                        <p class="truncate" v-if="language.locale.value === 'en'">
                                                            {{ medicine?.medicine?.en_name }},
                                                            {{ medicine?.medicine?.ingredients }}
                                                        </p>
                                                        <p class="truncate" v-if="language.locale.value === 'dk'">
                                                            {{ medicine?.medicine?.dk_name }},
                                                            {{ medicine?.medicine?.ingredients }}
                                                        </p>
                                                        <div v-if="medicine.is_pn_medicine">
                                                            <Badge type="primary" class="w-fit">
                                                                <p class="text-xxs">
                                                                    {{
                                                                        $t('citizens.medicineJournals.table.pnMedicine')
                                                                    }}
                                                                </p>
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <span>{{ medicine?.strength }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ medicine?.max_daily_dose }}</span>
                                    </td>
                                    <td width="30%">
                                        <div>
                                            <p>{{ medicine?.dosage?.name }}</p>
                                            <div class="space-y-1">
                                                <div class="text-xs">
                                                    <span v-if="medicine?.schedule_frequency === 'everyday'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.everyday')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'every_other_day'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.every2Days')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'every_third_day'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.every3Days')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'every_four_days'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.every4Days')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'every_five_days'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.every5Days')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'every_six_days'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.every6Days')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'weekly'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.weekly')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'biweekly'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.biweekly')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'monthly'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.monthly')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'bimonthly'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.bimonthly')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'quarterly'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.quarterly')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'annually'">
                                                        {{
                                                            $t('citizens.medicineJournals.scheduleFrequencies.annually')
                                                        }}
                                                    </span>
                                                    <span v-if="medicine?.schedule_frequency === 'custom'">
                                                        {{
                                                            formatCustomFrequency(medicine?.recurring_rules)
                                                        }}
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="mt-2 text-xxs flex flex-wrap gap-x-1 gap-y-3 cursor-default"
                                                v-if="!medicine.is_pn_medicine">
                                                <div v-for="(dosage, index) in medicine?.max_dosage_per_time"
                                                    :key="index">
                                                    <Tooltip :text="(() => {
                                                        switch (dosage?.status) {
                                                            case 'delivered':
                                                                return $t('citizens.medicineJournals.history.form.type.delivered');
                                                            case 'deviated':
                                                                return $t('citizens.medicineJournals.history.form.type.deviated');
                                                            case 'given':
                                                                return customPagesStore.getCustomPagesName?.giveMedicine;
                                                            default:
                                                                return $t('citizens.medicineJournals.history.form.type.not') + ' ' + customPagesStore.getCustomPagesName?.giveMedicine?.toLowerCase();
                                                        }
                                                    })()">
                                                        <span :class="[
                                                            !dosage.status && 'bg-secondary',
                                                            dosage?.status === null && 'bg-secondary',
                                                            dosage?.status === 'delivered' && 'bg-primary',
                                                            dosage?.status === 'deviated' && 'bg-red-600',
                                                            dosage?.status === 'given' && 'bg-green-700',
                                                            'p-1 text-white rounded-md'
                                                        ]">
                                                            {{ dosage?.dosage }} @ {{ dosage?.time }}
                                                        </span>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <span>{{ medicine?.current_stocks }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-end justify-end gap-2">
                                            <Tooltip :text="`${$t('citizens.medicineJournals.table.actions.view')}`">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="viewMedicine(medicine)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip
                                                :text="`${$t('citizens.medicineJournals.table.actions.giveMedicine')}`">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="giveMedicine(medicine)">
                                                    <Icon name="ph:plus" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip
                                                :text="`${$t('citizens.medicineJournals.table.actions.medicineHistory')}`">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="viewMedicineHistory(medicine)">
                                                    <Icon name="ph:files" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="`${$t('citizens.medicineJournals.table.actions.edit')}`"
                                                v-if="medicine?.is_editable">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="editMedicine(medicine)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="`${$t('citizens.medicineJournals.table.actions.activate')}`"
                                                v-if="medicine?.is_deactivated">
                                                <FormButton type="button" buttonStyle="primary"
                                                    @click="confirmMedicineActivation(medicine)">
                                                    <Icon name="ph:check" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip
                                                :text="`${$t('citizens.medicineJournals.table.actions.deactivate')}`"
                                                v-else>
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="confirmMedicineDeactivation(medicine)">
                                                    <Icon name="ph:x" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <!-- <Tooltip :text="`${$t('citizens.medicineJournals.table.actions.delete')}`"
                                                v-if="medicine?.is_deletable">
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="confirmMedicineDeletion(medicine)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip> -->
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.medicines" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenMedicineModalFilter :isModalOpen="state.modal.isFilterMedicineOpen"
                    @close="state.modal.isFilterMedicineOpen = false" @setFilter="setFilter" />
                <ModulesUserCitizenMedicineModalView :isModalOpen="state.modal.isViewMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="closeViewMedicineModal"
                    @refreshMedicines="fetchCitizenMedicines" />
                <ModulesUserCitizenMedicineModalNew :isModalOpen="state.modal.isAddMedicineOpen"
                    @close="state.modal.isAddMedicineOpen = false" @refreshMedicines="fetchCitizenMedicines" />
                <ModulesUserCitizenMedicineModalEdit :isModalOpen="state.modal.isEditMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="closeEditMedicineModal"
                    @refreshMedicines="fetchCitizenMedicines" />
                <ModulesUserCitizenMedicineHistoryModalNew :isModalOpen="state.modal.isGiveMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="state.modal.isGiveMedicineOpen = false"
                    @refreshMedicines="fetchCitizenMedicines()" />
                <ModulesUserCitizenMedicineHistoryModalGiveMultipleMedicine
                    :isModalOpen="state.modal.isGiveMedicinesOpen" @close="state.modal.isGiveMedicinesOpen = false"
                    @refreshMedicines="fetchCitizenMedicines()" />
                <ModulesUserCitizenMedicineHistoryModalHistory :isModalOpen="state.modal.isViewMedicineHistoryOpen"
                    :selectedMedicine="state.selectedMedicine" @close="state.modal.isViewMedicineHistoryOpen = false" />
                <ModulesUserCitizenMedicineModalDownload :isModalOpen="state.modal.isDownloadMedicineOverviewOpen"
                    @close="state.modal.isDownloadMedicineOverviewOpen = false" />
                <!-- <DialogConfirmation :isModalOpen="state.modal.isActivateMedicineOpen"
                    :message="$t('citizens.medicineJournals.confirmation.activateConfirmation') + '?'"
                    @close="state.modal.isActivateMedicineOpen = false" @confirm="toggleActivateDeactivateMedicine" /> -->
                <DialogConfirmation :isModalOpen="state.modal.isDeactivateMedicineOpen"
                    :message="$t('citizens.medicineJournals.confirmation.deactivateConfirmation') + '?'"
                    @close="state.modal.isDeactivateMedicineOpen = false" @confirm="toggleActivateDeactivateMedicine" />
                <!-- <DialogConfirmation :isModalOpen="state.modal.isDeleteMedicineOpen"
                    :message="$t('citizens.medicineJournals.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteMedicineOpen = false" @confirm="deleteMedicine" /> -->
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { medicineJournalService } from '@/components/api/user/MedicineJournalService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useCitizenMedicineStore } from '@/store/citizen-medicines'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const citizenMedicineStore = useCitizenMedicineStore() as any
const language = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'citizens.tabs.medicineCard',
        translate: true,
        href: `/citizens/${citizenUuid}/medicine-journals`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizens.medicineJournals.table.medicine', isTranslateName: true, },
        { name: 'citizens.medicineJournals.table.strength', isTranslateName: true, },
        { name: 'citizens.medicineJournals.table.maxDailyDose', isTranslateName: true, },
        { name: 'citizens.medicineJournals.table.dosageForm', isTranslateName: true, },
        { name: 'citizens.medicineJournals.table.currentStocks', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    medicines: [] as any,
    modal: {
        isAddMedicineOpen: false,
        isActivateMedicineOpen: false,
        isDeactivateMedicineOpen: false,
        isDeleteMedicineOpen: false,
        isDownloadMedicineOverviewOpen: false,
        isEditMedicineOpen: false,
        isFilterMedicineOpen: false,
        isGiveMedicineOpen: false,
        isGiveMedicinesOpen: false,
        isViewMedicineOpen: false,
        isViewMedicineHistoryOpen: false,
    },
    selectedMedicine: {} as any,
    sortData: {
        sortField: '',
        sortOrder: '',
    },
})

onMounted(() => {
    fetchCitizenMedicines()
})

onUnmounted(() => {
    citizenMedicineStore.resetSelectedMedicine()
})

watch(() => state.modal.isViewMedicineHistoryOpen, (isViewMedicineHistoryOpen: any) => {
    if (!isViewMedicineHistoryOpen) {
        fetchCitizenMedicines()
    }
})

watch(() => language.locale.value, (newValue: any) => {
    if (newValue != null) {
        fetchCitizenMedicines()
    }
})

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

interface FrequencyRule {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    every: number;
    weekly_on?: string[];
    monthly_on_day?: number;
    monthly_on_the_enabled?: boolean;
    monthly_on_the_sequence?: string;
    monthly_on_the_day?: string;
    yearly_on?: {
        month: string;
        day: number;
    };
    yearly_on_the_enabled?: boolean;
    yearly_on_the_sequence?: string;
    yearly_on_the_day?: string;
    yearly_on_the_month?: string;
}

function formatCustomFrequency(rule: FrequencyRule): string {
    if (!rule || !rule.frequency || !rule.every) {
        return '';
    }
    const { frequency, every } = rule;

    // Helper function to capitalize first letter
    const capitalize = (str: string): string => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    // Helper function to format day names
    const formatDay = (day: string): string => {
        const dayMap: { [key: string]: string } = {
            'monday': t('recurring.days.monday'),
            'tuesday': t('recurring.days.tuesday'),
            'wednesday': t('recurring.days.wednesday'),
            'thursday': t('recurring.days.thursday'),
            'friday': t('recurring.days.friday'),
            'saturday': t('recurring.days.saturday'),
            'sunday': t('recurring.days.sunday'),
            'weekday': t('recurring.days.weekday'),
            'weekend_day': t('recurring.days.weekendDay'),
        };
        return dayMap[day] || capitalize(day);
    };

    // Helper function to format month names
    const formatMonth = (month: string): string => {
        const monthMap: { [key: string]: string } = {
            'january': t('recurring.frequency.yearly.january'),
            'february': t('recurring.frequency.yearly.february'),
            'march': t('recurring.frequency.yearly.march'),
            'april': t('recurring.frequency.yearly.april'),
            'may': t('recurring.frequency.yearly.may'),
            'june': t('recurring.frequency.yearly.june'),
            'july': t('recurring.frequency.yearly.july'),
            'august': t('recurring.frequency.yearly.august'),
            'september': t('recurring.frequency.yearly.september'),
            'october': t('recurring.frequency.yearly.october'),
            'november': t('recurring.frequency.yearly.november'),
            'december': t('recurring.frequency.yearly.december'),
        };
        return monthMap[month] || capitalize(month);
    };

    // Helper function to format sequence
    const formatSequence = (sequence: string): string => {
        const sequenceMap: { [key: string]: string } = {
            'first': t('recurring.frequency.onThe.first'),
            'second': t('recurring.frequency.onThe.second'),
            'third': t('recurring.frequency.onThe.third'),
            'fourth': t('recurring.frequency.onThe.fourth'),
            'fifth': t('recurring.frequency.onThe.fifth'),
            'next_to_last': t('recurring.frequency.onThe.nextToLast'),
            'last': t('recurring.frequency.onThe.last'),
        };
        return sequenceMap[sequence] || capitalize(sequence.replace('_', ' '));
    };

    // Build the frequency string using translations
    let result = '';
    const everyText = t('recurring.every');

    if (frequency === 'daily') {
        const unitText = every === 1
            ? t('recurring.frequency.daily.day').toLowerCase()
            : t('recurring.frequency.daily.days').toLowerCase();
        result = `${everyText} ${every} ${unitText}`;
    } else if (frequency === 'weekly') {
        const unitText = every === 1
            ? t('recurring.frequency.weekly.week').toLowerCase()
            : t('recurring.frequency.weekly.weeks').toLowerCase();
        result = `${everyText} ${every} ${unitText}`;
    } else if (frequency === 'monthly') {
        const unitText = every === 1
            ? t('recurring.frequency.monthly.month').toLowerCase()
            : t('recurring.frequency.monthly.months').toLowerCase();
        result = `${everyText} ${every} ${unitText}`;
    } else if (frequency === 'yearly') {
        const unitText = every === 1
            ? t('recurring.frequency.yearly.year').toLowerCase()
            : t('recurring.frequency.yearly.years').toLowerCase();
        result = `${everyText} ${every} ${unitText}`;
    }

    // Handle weekly frequency
    if (frequency === 'weekly' && rule.weekly_on && rule.weekly_on.length > 0) {
        const days = rule.weekly_on.map(formatDay).join(', ');
        result += ` on ${days}`;
    }

    // Handle monthly frequency
    if (frequency === 'monthly') {
        if (rule.monthly_on_the_enabled && rule.monthly_on_the_sequence && rule.monthly_on_the_day) {
            const onTheText = t('recurring.frequency.onThe.onThe').toLowerCase();
            result += ` ${onTheText} ${formatSequence(rule.monthly_on_the_sequence)} ${formatDay(rule.monthly_on_the_day)}`;
        } else if (rule.monthly_on_day) {
            const dayText = t('recurring.frequency.monthly.day').toLowerCase();
            result += ` on ${dayText} ${rule.monthly_on_day}`;
        }
    }

    // Handle yearly frequency
    if (frequency === 'yearly') {
        if (rule.yearly_on_the_enabled && rule.yearly_on_the_sequence && rule.yearly_on_the_day && rule.yearly_on_the_month) {
            const onTheText = t('recurring.frequency.onThe.onThe').toLowerCase();
            result += ` ${onTheText} ${formatSequence(rule.yearly_on_the_sequence)} ${formatDay(rule.yearly_on_the_day)} of ${formatMonth(rule.yearly_on_the_month)}`;
        } else if (rule.yearly_on) {
            const { month, day } = rule.yearly_on;
            result += ` on ${formatMonth(month)} ${day}`;
        }
    }

    return result;
}

async function fetchCitizenMedicines() {
    state.error = {}
    state.isTableLoading = true
    try {
        let params = {}
        if (citizenMedicineStore.getFilterByActiveInactiveDeactivated === 'deactivated') {
            params = {
                citizen_uuid: citizenUuid,
                is_deactivated: citizenMedicineStore.getFilterByActiveInactiveDeactivated === 'deactivated' ? true : false,
                page: currentTablePage,
                sortField: state.sortData.sortField,
                sortOrder: state.sortData.sortOrder,
                ...state.dataFilter
            }
        } else {
            params = {
                citizen_uuid: citizenUuid,
                is_active: citizenMedicineStore.getFilterByActiveInactiveDeactivated === 'active' ? true : false,
                page: currentTablePage,
                sortField: state.sortData.sortField,
                sortOrder: state.sortData.sortOrder,
                ...state.dataFilter
            }
        }
        const response = await medicineJournalService.getMedicines(params)
        if (response) {
            state.medicines = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCitizenMedicines()
}

function next() {
    currentTablePage++
    fetchCitizenMedicines()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCitizenMedicines()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchCitizenMedicines()
}

function setFilter(filter: any) {
    citizenMedicineStore.setFilterByActiveInactiveDeactivated(filter.isActive.value)
    fetchCitizenMedicines()
}

function addRemoveMedicine(medicine: any) {
    citizenMedicineStore.addRemoveSelectedMedicine(medicine)
}

function viewMedicine(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isViewMedicineOpen = true
}

function closeViewMedicineModal() {
    state.modal.isViewMedicineOpen = false
    state.selectedMedicine = {}
}

function giveMedicine(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isGiveMedicineOpen = true
}

function viewMedicineHistory(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isViewMedicineHistoryOpen = true
}

function editMedicine(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isEditMedicineOpen = true
}

function closeEditMedicineModal() {
    state.modal.isEditMedicineOpen = false
    state.selectedMedicine = {}
}

function confirmMedicineActivation(journal: any) {
    state.selectedMedicine = journal
    state.modal.isActivateMedicineOpen = true
}

function confirmMedicineDeactivation(journal: any) {
    state.selectedMedicine = journal
    state.modal.isDeactivateMedicineOpen = true
}

function confirmMedicineDeletion(journal: any) {
    state.selectedMedicine = journal
    state.modal.isDeleteMedicineOpen = true
}

async function toggleActivateDeactivateMedicine() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await medicineJournalService.activateDeactivateMedicine(state.selectedMedicine.uuid)
        if (response?.data) {
            fetchCitizenMedicines()
            if (response?.data?.is_deactivated) {
                successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.alert.successfullyDeactivated')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.alert.successfullyActivated')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function deleteMedicine() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await medicineJournalService.deleteMedicine(state.selectedMedicine.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            if (state.selectedMedicine?.data?.length === 1) {
                currentTablePage = 1
            }
            fetchCitizenMedicines()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.alert.successfullyDeleted')}.`)
            state.modal.isDeleteMedicineOpen = false
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>