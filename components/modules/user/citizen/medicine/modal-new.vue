<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.newMedicine')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenMedicineForm formType="create" :selectedMedicine="state.formMedicine"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveMedicine" />
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
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshMedicines'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formMedicine: {
        citizen_uuid: '',
        is_active: true,
        is_self_administered: false,
        is_pn_medicine: false,
        medicine: '',
        dosage: '',
        current_stocks: '',
        strength: '',
        unit: '',
        max_daily_dose: '',
        max_dosage_per_time: [
            { time: '', dosage: '' },
        ],
        package_leaflet_link: '',
        start_date: '',
        end_date: '',
        doctor: '',
        treatment_reason: '',
        medication_storage: '',
        ingredients: '',
        description: '',
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
})

function closeModal() {
    emit('close')
}

function refreshMedicines() {
    emit('refreshMedicines')
}

async function saveMedicine(medicineDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('citizen_uuid', citizenUuid.toString())
        params.append('is_active', medicineDetails.is_active)
        params.append('is_self_administered', medicineDetails.is_self_administered)
        params.append('is_pn_medicine', medicineDetails.is_pn_medicine)
        params.append('medicine_uuid', medicineDetails.medicine)
        params.append('dosage_uuid', medicineDetails.dosage)
        params.append('current_stocks', medicineDetails.current_stocks)
        params.append('strength', medicineDetails.strength)
        params.append('mass_unit_uuid', medicineDetails.unit)
        params.append('max_daily_dose', medicineDetails.max_daily_dose.replace(',', '.'))
        params.append('max_dosage_per_time', JSON.stringify(medicineDetails.max_dosage_per_time))
        params.append('package_leaflet_link', medicineDetails.package_leaflet_link)
        params.append('start_date', medicineDetails.start_date)
        params.append('end_date', medicineDetails.end_date)
        params.append('doctor_uuid', medicineDetails.doctor)
        params.append('treatment_reason', medicineDetails.treatment_reason)
        params.append('medication_storage', medicineDetails.medication_storage)
        params.append('ingredients', medicineDetails.ingredients)
        params.append('description', medicineDetails.description)

        if (!medicineDetails.is_pn_medicine) {
            params.append('schedule_frequency', medicineDetails.schedule_frequency.recurring)
            params.append('recurring_until', medicineDetails.schedule_frequency.recurring_until)

            if (medicineDetails.schedule_frequency.recurring === 'custom') {
            params.append('frequency', medicineDetails.schedule_frequency.frequency)
            params.append('every', medicineDetails.schedule_frequency.every)
            if (medicineDetails.schedule_frequency.frequency === 'weekly') {
                params.append('weekly_on', medicineDetails.schedule_frequency.weekly_on)
            } else if (medicineDetails.schedule_frequency.frequency === 'monthly') {
                params.append('monthly_on_the_enabled', medicineDetails.schedule_frequency.monthly_on_the_enabled)
                if (!medicineDetails.schedule_frequency.monthly_on_the_enabled) {
                    params.append('monthly_each', medicineDetails.schedule_frequency.monthly_each)
                } else {
                    params.append('monthly_on_the_sequence', medicineDetails.schedule_frequency.monthly_on_the_sequence)
                    params.append('monthly_on_the_day', medicineDetails.schedule_frequency.monthly_on_the_day)
                }
            } else if (medicineDetails.schedule_frequency.frequency === 'yearly') {
                params.append('yearly_in_months', medicineDetails.schedule_frequency.yearly_in_months)
                if (medicineDetails.schedule_frequency.yearly_on_the_enabled) {
                    params.append('yearly_on_the_sequence', medicineDetails.schedule_frequency.yearly_on_the_sequence)
                    params.append('yearly_on_the_day', medicineDetails.schedule_frequency.yearly_on_the_day)
                }
            }
        }
        }


        const response = await medicineJournalService.saveMedicine(params)
        if (response?.data) {
            refreshMedicines()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.form.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>