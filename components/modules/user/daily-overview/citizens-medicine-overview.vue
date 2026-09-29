<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="p-5" v-if="state.medicines?.data?.length === 0">
            <div
                class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-80 max-h-80 text-sm mt-2">
                {{ $t('overview.noMedicinesToShow') }}
            </div>
        </div>

        <div class="text-sm space-y-2 divide-y overflow-scroll min-h-96 max-h-96 px-5 py-4" v-else>
            <div v-for="(medicine, index) in state.medicines?.data" :key="index"
                class="pl-4 pr-3 py-3 cursor-pointer hover:bg-gray-100" @click="viewMedicineHistory(medicine)">
                <div>
                    <div>
                        <div>
                            <div class="flex items-center gap-x-2">
                                <img :src="medicine?.citizen?.image ?? avatarUrl(`${medicine?.citizen?.firstname + ' ' + (medicine?.citizen?.lastname ?? '')}`)"
                                    :class="[
                                        medicine?.citizen.latest_risk_assessment === null && 'border-secondary',
                                        medicine?.citizen.latest_risk_assessment?.assessment === 'no risk' && 'border-green-700',
                                        medicine?.citizen.latest_risk_assessment?.assessment === 'increased risk' && 'border-yellow-500',
                                        medicine?.citizen.latest_risk_assessment?.assessment === 'acute increased risk' && 'border-red-600',
                                        'rounded-full w-12 h-12 object-cover border-2'
                                    ]" />
                                <span>{{ medicine?.citizen?.firstname + ' ' + (medicine?.citizen?.lastname ?? '')
                                    }}</span>
                            </div>
                            <Badge type="primary" class="flex items-center w-fit mt-1" v-if="medicine?.is_pn_medicine">
                                <p class="text-xxs px-2">
                                    {{ $t('citizens.medicineJournals.table.pnMedicine') }}
                                </p>
                            </Badge>
                            <div class="mt-1">
                                <Badge type="primary" class="w-fit" v-if="medicine.is_self_administered">
                                    <p class="text-xxs">
                                        {{
                                            $t('citizens.medicineJournals.form.selfAdminister')
                                        }}
                                    </p>
                                </Badge>
                            </div>
                            <h3 class="text-base font-semibold">
                                {{ language.locale.value === 'en' ? medicine?.medicine?.en_name
                                    : medicine?.medicine?.dk_name }}
                            </h3>
                            <p>
                                {{ medicine?.medicine?.ingredients }}
                            </p>
                            <div class="mt-1 text-xxs flex flex-wrap gap-x-1 gap-y-1.5 py-1"
                                v-if="medicine.due_dates?.length > 0">
                                <Tooltip v-for="(due_date, dueDateIndex) in medicine.due_dates" :key="dueDateIndex"
                                    :text="(() => {
                                        switch (due_date?.status) {
                                            case 'delivered':
                                                return $t('overview.medicationOverview.delivered');
                                            case 'deviated':
                                                return $t('overview.medicationOverview.deviated');
                                            case 'given':
                                                return customPagesStore.getCustomPagesName?.giveMedicine;
                                            default:
                                                return $t('overview.medicationOverview.not') + ' ' + customPagesStore.getCustomPagesName?.giveMedicine?.toLowerCase();
                                        }
                                    })()">
                                    <span :class="[dueDateColorClass(due_date), 'px-2 py-1 text-white rounded-md']">
                                        {{ formatDateToReadable(due_date?.date) }} @
                                        {{ due_date?.time }}
                                    </span>
                                </Tooltip>
                            </div>
                            <p class="text-xxs mt-0.5" v-if="medicine?.user?.firstname && medicine?.user?.lastname">
                                {{ $t('overview.createdBy') }}
                                {{ medicine?.user?.firstname + ' ' + (medicine?.user?.lastname ?? '') }}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="mt-2 px-1 space-y-1">
                    <div class="text-xxs flex flex-wrap gap-1" v-if="medicine.time?.length > 0">
                        <span v-for="(time, index) in JSON.parse(medicine.time)" :key=index
                            class="bg-primary px-2 py-1 text-white rounded-md">
                            {{ medicine?.daily_dose }} @
                            {{ time }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <ModulesUserCitizenMedicineHistoryModalHistory :isModalOpen="state.modal.isViewMedicineOpen"
            :selectedMedicine="state.selectedMedicine" @close="state.modal.isViewMedicineOpen = false" />

        <div class="border-t px-5 py-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {{ $t('overview.medicationOverview.effectEvaluations') }}
            </p>
            <div v-if="!state.evaluationOverview?.data?.length"
                class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-24 text-sm text-gray-400">
                {{ $t('overview.medicationOverview.noEvaluationsToShow') }}
            </div>
            <div v-else class="space-y-2 overflow-scroll max-h-72">
                <div v-for="(history, historyIndex) in state.evaluationOverview?.data" :key="historyIndex"
                    :class="[history.citizen_medicine?.uuid && 'cursor-pointer hover:bg-gray-100', 'border rounded-md px-3 py-2 text-xs space-y-1.5']"
                    @click="viewEvaluationHistory(history)">
                    <div class="flex items-center justify-between">
                        <span class="font-medium">
                            {{ history.citizen?.firstname }} {{ history.citizen?.lastname }}
                            —
                            {{ evaluationMedicineName(history) }}
                        </span>
                        <span class="text-gray-400">{{ formatDateToReadable(history.date) }}</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                        <button type="button" v-for="(slot, slotIndex) in history.slots" :key="slotIndex" :class="[
                            slot.status === 'remembered' && 'bg-green-100 text-green-700 hover:bg-green-200',
                            slot.status === 'forgotten' && 'bg-red-100 text-red-700 hover:bg-red-200',
                            slot.status === 'pending' && 'bg-amber-100 text-amber-700 hover:bg-amber-200',
                            'px-2 py-1 rounded-md inline-flex items-center gap-1 transition-colors cursor-pointer'
                        ]" :title="slot.status === 'remembered' ? formatDateTimeToReadable(slot.evaluated_at) : $t('overview.medicationOverview.clickToEvaluate')"
                            @click.stop="openSlotEvaluation(history, slot)">
                            {{ slot.time }} ·
                            {{
                                slot.status === 'remembered' ? $t('overview.medicationOverview.remembered')
                                    : slot.status === 'forgotten' ? $t('overview.medicationOverview.forgotten')
                                        : $t('overview.medicationOverview.pending')
                            }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <ModulesUserCitizenMedicineEvaluationModalNew :isModalOpen="state.modal.isAddEvaluationOpen"
            :selectedMedicineEvaluation="state.selectedEvaluation" @close="state.modal.isAddEvaluationOpen = false"
            @refreshEvaluations="fetchEvaluationOverview" />
        <ModulesUserCitizenMedicineEvaluationModalEdit :isModalOpen="state.modal.isEditEvaluationOpen"
            :selectedMedicineEvaluation="state.selectedEvaluation" @close="state.modal.isEditEvaluationOpen = false"
            @refreshEvaluations="fetchEvaluationOverview" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { effectEvaluationService } from '@/components/api/user/EffectEvaluationService'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from "vue-i18n"
import { useCustomPagesStore } from '@/store/custom-pages'
import { medicineDoseTiming } from '@/composables/medicineDoseTiming'
import type { Error } from '@/types'

const { isMissed, isDueSoon } = medicineDoseTiming()

const props = defineProps({
    dateRange: {
        type: Object,
        required: false,
    },
})

const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const customPagesStore = useCustomPagesStore() as any
const departmentStore = useDepartmentStore()
const language = useI18n()

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    medicines: [] as any,
    evaluationOverview: [] as any,
    modal: {
        isAddEvaluationOpen: false,
        isEditEvaluationOpen: false,
        isViewMedicineOpen: false,
    },
    selectedEvaluation: {} as any,
    selectedMedicine: {} as any,
    now: new Date(),
})

let clockInterval: ReturnType<typeof setInterval> | null = null

watch(() => props.dateRange, () => {
    fetchCitizensMedicines()
    fetchEvaluationOverview()
}, { deep: true })

watch(() => state.modal.isViewMedicineOpen, (isViewMedicineOpen: boolean) => {
    if (!isViewMedicineOpen) {
        fetchCitizensMedicines()
        fetchEvaluationOverview()
    }
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizensMedicines()
        fetchEvaluationOverview()
    }
})

// A handled slot keeps its status colour; the overdue/due-soon timing only
// applies to slots nobody has handled yet, anchored to the chip's own date
// (AW-2026-6579: a delivered "06:00 - 10:00" dose turned red after 10:00).
function dueDateColorClass(dueDate: any): string {
    if (dueDate?.status === 'given') return 'bg-green-700'
    if (dueDate?.status === 'delivered') return 'bg-primary'
    if (dueDate?.status === 'deviated') return 'bg-red-600'
    if (isMissed(dueDate?.time, state.now, dueDate?.date)) return 'bg-red-600'
    if (isDueSoon(dueDate?.time, state.now, dueDate?.date)) return 'bg-amber-500'
    return 'bg-secondary'
}

onMounted(() => {
    fetchCitizensMedicines()
    fetchEvaluationOverview()
    clockInterval = setInterval(() => {
        state.now = new Date()
    }, 60_000)
})

onUnmounted(() => {
    if (clockInterval) clearInterval(clockInterval)
})

async function fetchCitizensMedicines() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        if (props.dateRange) {
            params.end_date = props.dateRange.end_date
            params.start_date = props.dateRange.start_date
        }
        const response = await dailyOverviewService.getCitizenDailyMedicineOverview(params)
        if (response) {
            state.medicines = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchEvaluationOverview() {
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        if (props.dateRange) {
            params.end_date = props.dateRange.end_date
            params.start_date = props.dateRange.start_date
        }
        const response = await effectEvaluationService.getEffectEvaluationOverview(params)
        if (response) {
            state.evaluationOverview = response
        }
    } catch (error: any) {
        state.error = error
    }
}

function viewMedicineHistory(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isViewMedicineOpen = true
}

function evaluationMedicineName(history: any): string {
    return language.locale.value === 'en' ? history.medicine?.en_name : history.medicine?.dk_name
}

function viewEvaluationHistory(history: any) {
    if (!history.citizen_medicine?.uuid) return
    viewMedicineHistory(history.citizen_medicine)
}

function openSlotEvaluation(history: any, slot: any) {
    if (slot.status === 'remembered') {
        // Older API responses don't carry the evaluation uuid; editing without it would PUT to /undefined
        if (!slot.evaluation_uuid) return
        state.selectedEvaluation = {
            entry: { uuid: slot.evaluation_uuid, evaluation: slot.evaluation },
            medicine_name: evaluationMedicineName(history),
            time: slot.time,
        }
        state.modal.isEditEvaluationOpen = true
        return
    }

    state.selectedEvaluation = {
        entry: { uuid: history.uuid },
        medicine_name: evaluationMedicineName(history),
        time: slot.time,
    }
    state.modal.isAddEvaluationOpen = true
}
</script>