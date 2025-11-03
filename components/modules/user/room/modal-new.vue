<template>
    <div>
        <Modal size="xs" :title="$t('rooms.newRoom')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserRoomModalForm formType="create" :selectedRoom="state.formRoom" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveRoom" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { roomService } from '@/components/api/user/RoomService'
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
const emit = defineEmits(['close', 'refreshRooms'])

const state = reactive({
    error: {} as Error,
    formRoom: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshRooms() {
    emit('refreshRooms')
}

async function saveRoom(roomDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: roomDetails.name,
        }
        const response = await roomService.saveRoom(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('rooms.form.alert.newRoomSuccessfullySaved')}.`)
            refreshRooms()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>