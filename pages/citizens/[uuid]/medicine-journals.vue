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

                <!-- <ModulesUserCitizenDetailsHeader /> -->
                <ModulesUserCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex justify-end items-center gap-x-2">
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="navigateToExternalLink('https://fmk-online.dk/fmk')">
                            <Icon name="mdi:cloud-refresh-outline" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.medicineJournals.synchronizeWithFMK') }}
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isAddMedicineOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.medicineJournals.newMedicine') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.medicines"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.medicines?.data?.length === 0))">
                                <tr v-for="(medicine, index) in state.medicines?.data" :key="index">
                                    <td width="15%">
                                        <img :src="medicine?.image_url" alt="Image failed to load" class="w-28"
                                            v-if="medicine?.image_url">
                                    </td>
                                    <td width="20%">
                                        <div class="space-y-1">
                                            <p v-if="language.locale.value === 'en'">
                                                {{ medicine?.medicine_name?.en_name }}
                                            </p>
                                            <p v-if="language.locale.value === 'dk'">
                                                {{ medicine?.medicine_name?.dk_name }}
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
                                    </td>
                                    <td width="10%">
                                        <span>{{ medicine?.strength }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ medicine?.max_daily_dose }}</span>
                                    </td>
                                    <td width="25%">
                                        <div class="space-y-3">
                                            <p>{{ medicine?.dosage?.name }}</p>
                                            <div class="text-xxs flex flex-wrap gap-2">
                                                <div v-for="(dosage, index) in JSON.parse(medicine?.max_dosage_per_time)"
                                                    :key="index">
                                                    <span class="bg-primary p-1 text-white rounded-md">
                                                        {{ dosage?.dosage }} @ {{ dosage?.time }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <span>{{ medicine?.current_stocks }}</span>
                                    </td>
                                    <!-- <td width="15%">
                                        <div class="space-y-1">
                                            <div class="text-xs">
                                                <span v-if="medicine?.schedule_frequency === 'everyday'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.everyday') }}
                                                </span>
                                                <span v-if="medicine?.schedule_frequency === 'every_other_day'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.every2Days') }}
                                                </span>
                                                <span v-if="medicine?.schedule_frequency === 'every_third_day'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.every3Days') }}
                                                </span>
                                                <span v-if="medicine?.schedule_frequency === 'every_four_days'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.every4Days') }}
                                                </span>
                                                <span v-if="medicine?.schedule_frequency === 'every_five_days'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.every5Days') }}
                                                </span>
                                                <span v-if="medicine?.schedule_frequency === 'every_six_days'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.every6Days') }}
                                                </span>
                                                <span v-if="medicine?.schedule_frequency === 'weekly'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.weekly') }}
                                                </span>
                                                <span v-if="medicine?.schedule_frequency === 'biweekly'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.biweekly') }}
                                                </span>
                                                <span v-if="medicine?.schedule_frequency === 'monthly'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.monthly') }}
                                                </span>
                                                <span v-if="medicine?.schedule_frequency === 'bimonthly'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.bimonthly') }}
                                                </span>
                                                <span v-if="medicine?.schedule_frequency === 'quarterly'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.quarterly') }}
                                                </span>
                                                <span v-if="medicine?.schedule_frequency === 'annually'">
                                                    {{ $t('citizens.medicineJournals.scheduleFrequencies.annually') }}
                                                </span>
                                            </div>
                                            <div class="text-xs flex flex-wrap gap-2" v-if="medicine.time?.length > 0">
                                                <span v-for="(time, index) in JSON.parse(medicine.time)" :key=index
                                                    class="bg-primary p-1 text-white rounded-md">
                                                    {{ time }}
                                                </span>
                                            </div>
                                        </div>
                                    </td> -->
                                    <td width="10%">
                                        <div class="flex items-end gap-2">
                                            <Tooltip
                                                :text="`${$t('citizens.medicineJournals.table.actions.giveMedicine')}`">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="giveMedicine(medicine)">
                                                    <Icon name="ph:plus" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip
                                                :text="`${$t('citizens.medicineJournals.table.actions.medicineHistory')}`">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewMedicineHistory(medicine)">
                                                    <Icon name="ph:files" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="`${$t('citizens.medicineJournals.table.actions.edit')}`"
                                                v-if="medicine?.is_editable">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editMedicine(medicine)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="`${$t('citizens.medicineJournals.table.actions.delete')}`"
                                                v-if="medicine?.is_deletable">
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="confirmMedicineDeletion(medicine)">
                                                    <Icon name="ph:trash-duotone" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.medicines" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenMedicineHistoryModalNew :isModalOpen="state.modal.isGiveMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="state.modal.isGiveMedicineOpen = false" />
                <ModulesUserCitizenMedicineHistoryModalHistory :isModalOpen="state.modal.isViewMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="state.modal.isViewMedicineOpen = false" />
                <ModulesUserCitizenMedicineModalNew :isModalOpen="state.modal.isAddMedicineOpen"
                    @close="state.modal.isAddMedicineOpen = false" @refreshMedicines="fetchCitizenMedicines" />
                <ModulesUserCitizenMedicineModalEdit :isModalOpen="state.modal.isEditMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="closeEditMedicineModal"
                    @refreshMedicines="fetchCitizenMedicines" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteMedicineOpen"
                    :message="$t('citizens.medicineJournals.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteMedicineOpen = false" @confirm="deleteMedicine" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { medicineJournalService } from '@/components/api/user/MedicineJournalService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const { formatNumber } = useNumberFormatter()
const customPagesStore = useCustomPagesStore() as any
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
    columnFilter: [
        { column: 'medicine' },
    ],
    columnHeaders: [
        { name: 'citizens.medicineJournals.table.image' },
        { name: 'citizens.medicineJournals.table.medicine', sorter: true, key: 'medicine' },
        { name: 'citizens.medicineJournals.table.strength' },
        { name: 'citizens.medicineJournals.table.maxDailyDose' },
        { name: 'citizens.medicineJournals.table.dosageForm' },
        { name: 'citizens.medicineJournals.table.currentStocks' },
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
        isDeleteMedicineOpen: false,
        isEditMedicineOpen: false,
        isGiveMedicineOpen: false,
        isViewMedicineOpen: false,
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

watch(() => state.modal.isViewMedicineOpen, (isViewMedicineOpen: any) => {
    if (!isViewMedicineOpen) {
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

async function fetchCitizenMedicines() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
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

function giveMedicine(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isGiveMedicineOpen = true
}

function viewMedicineHistory(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isViewMedicineOpen = true
}

function editMedicine(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isEditMedicineOpen = true
}

function closeEditMedicineModal() {
    state.modal.isEditMedicineOpen = false
    state.selectedMedicine = []
}

function confirmMedicineDeletion(journal: any) {
    state.selectedMedicine = journal
    state.modal.isDeleteMedicineOpen = true
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
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>