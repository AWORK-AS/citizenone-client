<template>
    <div>
        <Modal size="lg" :title="$t('citizens.medicineJournals.viewMedicine')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3" v-if="state.selectedMedicine">
                        <div class="flex items-center gap-x-2">
                            <div v-if="state.selectedMedicine.is_pn_medicine">
                                <Badge type="primary" class="w-fit">
                                    <p class="text-xxs">
                                        {{
                                            $t('citizens.medicineJournals.table.pnMedicine')
                                        }}
                                    </p>
                                </Badge>
                            </div>
                            <div v-if="state.selectedMedicine.is_self_administered">
                                <Badge type="primary" class="w-fit">
                                    <p class="text-xxs">
                                        {{
                                            $t('citizens.medicineJournals.form.selfAdminister')
                                        }}
                                    </p>
                                </Badge>
                            </div>
                        </div>
                        <div class="flex items-center gap-x-2">
                            <p v-if="language.locale.value === 'en'">
                                {{ state.selectedMedicine?.medicine?.en_name }},
                                {{ state.selectedMedicine?.medicine?.ingredients }}
                            </p>
                            <p v-if="language.locale.value === 'dk'">
                                {{ state.selectedMedicine?.medicine?.dk_name }},
                                {{ state.selectedMedicine?.medicine?.ingredients }}
                            </p>
                            <Badge :type="state.selectedMedicine?.is_active ? 'active' : 'inactive'"
                                class="text-xxs truncate w-fit">
                                {{
                                    $t('citizens.medicineJournals.form.active')
                                }}
                            </Badge>
                        </div>
                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.medicine') }}:
                                {{ $t('citizens.medicineJournals.form.dosageForm') }}:
                            </span>
                            {{ state.selectedMedicine?.dosage?.name }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.currentStocks') }}:
                            </span>
                            {{ state.selectedMedicine?.current_stocks }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.strength') }}:
                            </span>
                            {{ state.selectedMedicine?.strength }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.maxDailyDose') }}:
                            </span>
                            {{ state.selectedMedicine?.max_daily_dose }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.packageLeafletLink') }}:
                            </span>
                            {{ state.selectedMedicine?.package_leaflet_link }}
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-1">
                            <p>
                                <span class="font-semibold">
                                    {{ $t('citizens.medicineJournals.form.startDate') }}:
                                </span>
                                <span v-if="state.selectedMedicine?.start_date">
                                    {{ formatDateToReadable(state.selectedMedicine?.start_date) }}
                                </span>
                            </p>
                            <p>
                                <span class="font-semibold">
                                    {{ $t('citizens.medicineJournals.form.endDate') }}:
                                </span>
                                <span v-if="state.selectedMedicine?.end_date">
                                    {{ formatDateToReadable(state.selectedMedicine?.end_date) }}
                                </span>
                            </p>
                        </div>
                        <p>
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.doctor') }}:
                            </span>
                            {{ state.selectedMedicine?.doctor?.firstname }}
                            {{ state.selectedMedicine?.doctor?.lastname }}
                        </p>
                        <p class="break-words">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.treatmentReason') }}:
                            </span>
                            {{ state.selectedMedicine?.treatment_reason }}
                        </p>
                        <p class="break-words">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.medicineStorage') }}:
                            </span>
                            {{ state.selectedMedicine?.medication_storage }}
                        </p>
                        <p class="break-words">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.activeIngredients') }}:
                            </span>
                            {{ state.selectedMedicine?.active_ingredients }}
                        </p>
                        <p class="break-words">
                            <span class="font-semibold">
                                {{ $t('citizens.medicineJournals.form.description') }}:
                            </span>
                            {{ state.selectedMedicine?.description }}
                        </p>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="primary" class="rounded-md w-full"
                                @click="state.modal.isEditMedicineOpen = true">
                                {{ $t('citizens.medicineJournals.editMedicine') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md col-start-2"
                                @click="closeModal()">
                                {{ $t('close') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
                <ModulesUserCitizenMedicineModalEdit :isModalOpen="state.modal.isEditMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="state.modal.isEditMedicineOpen = false"
                    @refreshMedicines="fetchCitizenMedicines" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { medicineJournalService } from '@/components/api/user/MedicineJournalService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedMedicine: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshMedicines'])
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isEditMedicineOpen: false
    },
    selectedMedicine: {} as any,
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        fetchSelectedMedicine()
    }
})

function refreshMedicines() {
    emit('refreshMedicines')
}

function fetchCitizenMedicines() {
    fetchSelectedMedicine()
    refreshMedicines()
}

async function fetchSelectedMedicine() {
    state.error = {}
    state.isPageLoading = true
    try {
        const medicineUuid = props.selectedMedicine?.uuid
        const response = await medicineJournalService.getMedicine(medicineUuid)
        if (response?.data) {
            state.selectedMedicine = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateMedicine(medicineDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const medicineUuid = props.selectedMedicine?.uuid
        let params = new FormData()
        params.append('is_active', medicineDetails.is_active)
        params.append('is_self_administered', medicineDetails.is_self_administered)
        params.append('is_pn_medicine', medicineDetails.is_pn_medicine)
        params.append('medicine_uuid', medicineDetails.medicine)
        params.append('dosage_uuid', medicineDetails.dosage)
        if (!medicineDetails.is_pn_medicine) {
            params.append('schedule_frequency', medicineDetails.schedule_frequency)
        }
        params.append('current_stocks', medicineDetails.current_stocks)
        params.append('strength', medicineDetails.strength)
        params.append('max_daily_dose', medicineDetails.max_daily_dose.replace(',', '.'))
        params.append('max_dosage_per_time', JSON.stringify(medicineDetails.max_dosage_per_time))
        params.append('package_leaflet_link', medicineDetails.package_leaflet_link)
        params.append('start_date', medicineDetails.start_date)
        params.append('end_date', medicineDetails.end_date)
        params.append('doctor_uuid', medicineDetails.doctor)
        params.append('treatment_reason', medicineDetails.treatment_reason)
        params.append('medication_storage', medicineDetails.medication_storage)
        params.append('active_ingredients', medicineDetails.active_ingredients)
        params.append('description', medicineDetails.description)
        const response = await medicineJournalService.updateMedicine(medicineUuid, params)
        if (response?.data) {
            refreshMedicines()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.form.alert.successfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>