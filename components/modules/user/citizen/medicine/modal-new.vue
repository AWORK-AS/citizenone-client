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
        image: '',
        is_pn_medicine: false,
        medicine: '',
        dosage: '',
        schedule_frequency: [],
        current_stocks: '',
        strength: '',
        max_daily_dose: '',
        max_dosage_per_time: [
            { time: '', dosage: '' },
        ],
        package_leaflet_link: '',
        active_ingredients: '',
        description: '',
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
        if (medicineDetails.image) {
            params.append('image', medicineDetails.image)
        }
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
        params.append('active_ingredients', medicineDetails.active_ingredients)
        params.append('description', medicineDetails.description)
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