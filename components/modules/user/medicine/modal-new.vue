<template>
    <div>
        <Modal size="xs" :title="$t('medicines.newMedicine')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserMedicineModalForm formType="create" :selectedMedicine="state.formMedicine"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveMedicine" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { medicineService } from '@/components/api/user/MedicineService'
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
const emit = defineEmits(['close', 'refreshMedicines'])

const state = reactive({
    error: {} as Error,
    formMedicine: {
        en_name: '',
        dk_name: '',
    },
    isPageLoading: false,
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
            en_name: medicineDetails.en_name,
            dk_name: medicineDetails.dk_name,
        }
        const response = await medicineService.saveMedicine(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('medicines.form.alert.newMedicineSuccessfullySaved')}.`)
            refreshMedicines()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>