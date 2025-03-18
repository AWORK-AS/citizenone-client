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
        image: '',
        is_pn_medicine: false,
        medicine: '',
        dosage: '',
        schedule_frequency: [],
        current_stocks: '',
        strength: '',
        max_daily_dose: '',
        max_dosage_per_time: [],
        package_leaflet_link: '',
        active_ingredients: '',
        description: '',
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
            image: props.selectedMedicine?.image_url,
            is_pn_medicine: props.selectedMedicine?.image_url,
            medicine: props.selectedMedicine?.medicine_name?.uuid,
            dosage: props.selectedMedicine?.dosage?.uuid,
            schedule_frequency: props.selectedMedicine?.schedule_frequency,
            current_stocks: props.selectedMedicine?.current_stocks,
            strength: props.selectedMedicine?.strength,
            max_daily_dose: props.selectedMedicine?.max_daily_dose,
            max_dosage_per_time: JSON.parse(props.selectedMedicine?.max_dosage_per_time),
            package_leaflet_link: props.selectedMedicine?.package_leaflet_link,
            active_ingredients: props.selectedMedicine?.active_ingredients,
            description: props.selectedMedicine?.description,
        }
    }
})

async function updateMedicine(medicineDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const medicineUuid = props.selectedMedicine?.uuid
        let params = new FormData()
        if (medicineDetails.image) {
            params.append('image', medicineDetails.image)
        }
        params.append('is_pn_medicine', medicineDetails.is_pn_medicine)
        params.append('medicine_uuid', medicineDetails.medicine)
        params.append('dosage_uuid', medicineDetails.dosage)
        params.append('schedule_frequency', medicineDetails.schedule_frequency)
        params.append('current_stocks', medicineDetails.current_stocks)
        params.append('strength', medicineDetails.strength)
        params.append('max_daily_dose', medicineDetails.max_daily_dose.replace(',', '.'))
        params.append('max_dosage_per_time', JSON.stringify(medicineDetails.max_dosage_per_time))
        params.append('package_leaflet_link', medicineDetails.package_leaflet_link)
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