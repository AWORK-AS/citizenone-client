<template>
    <div>
        <Modal size="sm" :title="$t('approvedDevices.addDevice')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsApprovedDeviceForm
                        formType="create"
                        :error="state.error"
                        @closeModal="closeModal"
                        @submitForm="addApprovedDevice" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { approvedDeviceService } from '@/components/api/user/ApprovedDeviceService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { t } = useI18n()
const { successAlert } = useAlert()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'refresh'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    state.error = {}
    emit('close')
}

async function addApprovedDevice(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        await approvedDeviceService.create(formData)
        successAlert(`${t('alert.success')}!`, `${t('approvedDevices.alert.added')}.`)
        emit('refresh')
        closeModal()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
