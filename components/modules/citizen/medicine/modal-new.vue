<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.newMedicine')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenMedicineForm formType="create" :selectedMedicine="state.formMedicine"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveMedicine" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { medicineJournalService } from '@/components/api/MedicineJournalService'
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
        medicine: '',
        strength: '',
        dosage_uuid: '',
        daily_dose: '',
        active_ingredients: '',
        description: '',
        schedule_frequency: [],
        time: [],
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
        params.append('dosage_uuid', medicineDetails.dosage_uuid)
        params.append('medicine', medicineDetails.medicine)
        params.append('strength', medicineDetails.strength)
        params.append('daily_dose', medicineDetails.daily_dose.replace(',', '.'))
        params.append('active_ingredients', medicineDetails.active_ingredients)
        params.append('description', medicineDetails.description)
        params.append('schedule_frequency', medicineDetails.schedule_frequency)
        params.append('time', JSON.stringify(medicineDetails.time))
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