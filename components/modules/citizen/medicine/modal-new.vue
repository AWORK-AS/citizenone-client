<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.form.medicineDetails')" :show="props.isModalOpen"
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
        id: '',
        uuid: '',
        name: '',
        date_given: '',
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
        const params = {
            citizen_uuid: citizenUuid,
            name: medicineDetails.name,
            date_given: medicineDetails.date_given,
            description: medicineDetails.description,
        }
        const response = await medicineJournalService.saveMedicine(params)
        if (response?.data) {
            refreshMedicines()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>