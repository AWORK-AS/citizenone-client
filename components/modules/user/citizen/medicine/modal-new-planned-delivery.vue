<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.newPlannedDelivery')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenMedicinePlannedDeliveryForm :medicines="props.medicines"
                        :preselectedMedicineUuid="props.preselectedMedicineUuid" :error="state.error"
                        @closeModal="closeModal" @submitForm="savePlannedDelivery" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { medicinePlannedDeliveryService } from '@/components/api/user/MedicinePlannedDeliveryService'
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

async function savePlannedDelivery(plannedDeliveryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await medicinePlannedDeliveryService.createPlannedDelivery(plannedDeliveryDetails.citizen_medicine_uuid, {
            amount: plannedDeliveryDetails.amount,
            period_start: plannedDeliveryDetails.period_start,
            period_end: plannedDeliveryDetails.period_end,
            comment: plannedDeliveryDetails.comment,
        })
        if (response?.data) {
            emit('refreshMedicines')
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.plannedDelivery.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
