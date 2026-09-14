<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.newPouring')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenMedicinePouringForm :medicines="props.medicines"
                        :preselectedMedicineUuid="props.preselectedMedicineUuid" :error="state.error"
                        @closeModal="closeModal" @submitForm="savePouring" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { medicinePouringService } from '@/components/api/user/MedicinePouringService'
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
    medicines: {
        type: Array,
        default: () => [],
    },
    preselectedMedicineUuid: {
        type: String,
        default: null,
    },
})
const emit = defineEmits(['close', 'refreshMedicines'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    state.error = {}
    emit('close')
}

async function savePouring(pouringDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await medicinePouringService.createPouring(pouringDetails.citizen_medicine_uuid, {
            amount: pouringDetails.amount,
            period_start: pouringDetails.period_start,
            period_end: pouringDetails.period_end,
            comment: pouringDetails.comment,
        })
        if (response?.data) {
            emit('refreshMedicines')
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.pouring.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
