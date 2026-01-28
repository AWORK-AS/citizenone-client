<template>
    <div>
        <Modal size="xs" :title="$t('shifts.newShift')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserShiftModalForm formType="create" :selectedShift="state.formShift" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveShift" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { shiftService } from '@/components/api/user/ShiftService'
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
const emit = defineEmits(['close', 'refreshShifts'])

const state = reactive({
    error: {} as Error,
    formShift: {
        en_name: '',
        dk_name: '',
        pay_code: '',
        time_in: '',
        time_out: '',
        color: '#000000',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshShifts() {
    emit('refreshShifts')
}

async function saveShift(shiftDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            en_name: shiftDetails.en_name,
            dk_name: shiftDetails.dk_name,
            pay_code: shiftDetails.pay_code,
            time_in: shiftDetails.time_in ?? '',
            time_out: shiftDetails.time_out ?? '',
            color: shiftDetails.color,
        }
        const response = await shiftService.saveShift(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('shifts.form.alert.newShiftSuccessfullySaved')}.`)
            refreshShifts()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>