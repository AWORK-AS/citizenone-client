<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.editMedicine')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenMedicineForm formType="update" :selectedMedicine="state.formMedicine"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateMedicine" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { medicineJournalService } from '@/components/api/user/MedicineJournalService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

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

const state = reactive({
    error: {} as Error,
    formMedicine: {
        is_active: true,
        is_self_administered: false,
        is_pn_medicine: false,
        medicine: '',
        dosage: '',
        current_stocks: '',
        strength: '',
        unit: '',
        max_dose_per_administration: '',
        max_daily_dose: '',
        max_dosage_per_time: [],
        package_leaflet_link: '',
        start_date: '',
        end_date: '',
        doctor: '',
        treatment_reason: '',
        medication_storage: '',
        ingredients: '',
        description: '',
        recurring_until: '',
        schedule_frequency: {
            is_recurring: true,
            recurring: '',
            recurring_until: '',
            frequency: '',
            every: '',
            weekly_on: [],
            monthly_on_the_enabled: false,
            monthly_each: [],
            monthly_on_the_sequence: '',
            monthly_on_the_day: '',
            yearly_in_months: [],
            yearly_on_the_enabled: false,
            yearly_on_the_sequence: '',
            yearly_on_the_day: '',
            is_apply_to_all: false,
        },
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshMedicines() {
    emit('refreshMedicines')
}

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        state.formMedicine = {
            is_active: props.selectedMedicine?.is_active,
            is_self_administered: props.selectedMedicine?.is_self_administered,
            is_pn_medicine: props.selectedMedicine?.is_pn_medicine,
            medicine: props.selectedMedicine?.medicine?.uuid,
            dosage: props.selectedMedicine?.dosage?.uuid,
            current_stocks: props.selectedMedicine?.current_stocks ?? '',
            strength: props.selectedMedicine?.strength,
            unit: props.selectedMedicine?.mass_unit?.uuid ?? '',
            max_dose_per_administration: props.selectedMedicine?.max_dose_per_administration,
            max_daily_dose: props.selectedMedicine?.max_daily_dose,
            max_dosage_per_time: props.selectedMedicine?.max_dosage_per_time,
            package_leaflet_link: props.selectedMedicine?.package_leaflet_link,
            start_date: props.selectedMedicine?.start_date ?? '',
            end_date: props.selectedMedicine?.end_date ?? '',
            doctor: props.selectedMedicine?.doctor ?? '',
            treatment_reason: props.selectedMedicine?.treatment_reason ?? '',
            medication_storage: props.selectedMedicine?.medication_storage,
            ingredients: props.selectedMedicine?.ingredients,
            description: props.selectedMedicine?.description,
            recurring_until: props.selectedMedicine?.recurring_until || '',
            schedule_frequency: {
                is_recurring: true,
                recurring: props.selectedMedicine?.schedule_frequency,
                recurring_until: props.selectedMedicine?.recurring_until,
                frequency: props.selectedMedicine?.recurring_rules?.frequency,
                every: props.selectedMedicine?.recurring_rules?.every,
                weekly_on: props.selectedMedicine?.recurring_rules?.weekly_on || [],
                monthly_on_the_enabled: props.selectedMedicine?.recurring_rules?.monthly_on_the_enabled || false,
                monthly_each: props.selectedMedicine?.recurring_rules?.monthly_each || [],
                monthly_on_the_sequence: props.selectedMedicine?.recurring_rules?.monthly_on_the_sequence || '',
                monthly_on_the_day: props.selectedMedicine?.recurring_rules?.monthly_on_the_day || '',
                yearly_in_months: props.selectedMedicine?.recurring_rules?.yearly_in_months || [],
                yearly_on_the_enabled: props.selectedMedicine?.recurring_rules?.yearly_on_the_enabled || false,
                yearly_on_the_sequence: props.selectedMedicine?.recurring_rules?.yearly_on_the_sequence || '',
                yearly_on_the_day: props.selectedMedicine?.recurring_rules?.yearly_on_the_day || '',
                is_apply_to_all: false,
            },
        }
    }
})

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
            params.append('schedule_frequency', medicineDetails.schedule_frequency.recurring ?? '')
            params.append('recurring_until', medicineDetails.schedule_frequency.recurring_until ?? '')

            if (medicineDetails.schedule_frequency.recurring === 'custom') {
                params.append('frequency', medicineDetails.schedule_frequency.frequency)
                params.append('every', medicineDetails.schedule_frequency.every)
                if (medicineDetails.schedule_frequency.frequency === 'weekly') {
                    params.append('weekly_on', JSON.stringify(medicineDetails.schedule_frequency.weekly_on))
                } else if (medicineDetails.schedule_frequency.frequency === 'monthly') {
                    params.append('monthly_on_the_enabled', medicineDetails.schedule_frequency.monthly_on_the_enabled)
                    if (!medicineDetails.schedule_frequency.monthly_on_the_enabled) {
                        params.append('monthly_each', JSON.stringify(medicineDetails.schedule_frequency.monthly_each))
                    } else {
                        params.append('monthly_on_the_sequence', medicineDetails.schedule_frequency.monthly_on_the_sequence)
                        params.append('monthly_on_the_day', medicineDetails.schedule_frequency.monthly_on_the_day)
                    }
                } else if (medicineDetails.schedule_frequency.frequency === 'yearly') {
                    params.append('yearly_in_months', JSON.stringify(medicineDetails.schedule_frequency.yearly_in_months))
                    if (medicineDetails.schedule_frequency.yearly_on_the_enabled) {
                        params.append('yearly_on_the_sequence', medicineDetails.schedule_frequency.yearly_on_the_sequence)
                        params.append('yearly_on_the_day', medicineDetails.schedule_frequency.yearly_on_the_day)
                    }
                }
            }
        }
        params.append('current_stocks', medicineDetails.current_stocks)
        params.append('strength', medicineDetails.strength)
        params.append('mass_unit_uuid', medicineDetails.unit)
        params.append('max_dose_per_administration', medicineDetails.max_dose_per_administration.replace(',', '.'))
        params.append('max_daily_dose', medicineDetails.max_daily_dose.replace(',', '.'))
        params.append('max_dosage_per_time', JSON.stringify(medicineDetails.max_dosage_per_time))
        params.append('package_leaflet_link', medicineDetails.package_leaflet_link)
        params.append('start_date', medicineDetails.start_date)
        params.append('end_date', medicineDetails.end_date)
        params.append('doctor_uuid', medicineDetails.doctor ?? '')
        params.append('treatment_reason', medicineDetails.treatment_reason)
        params.append('medication_storage', medicineDetails.medication_storage)
        params.append('ingredients', medicineDetails.ingredients)
        params.append('description', medicineDetails.description)
        params.append('extra_dates', JSON.stringify(medicineDetails.extra_dates ?? []))
        params.append('treatment_periods', JSON.stringify(medicineDetails.treatment_periods ?? []))
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