<template>
    <div>
        <Modal size="md" :title="tt('drive.sendToCitizen.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="relative">
                    <form @submit.prevent="submitForm" id="formSendToCitizen">
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-4">
                            <div class="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                                <Icon name="ph:file-text" class="size-5 shrink-0 text-gray-500" aria-hidden="true" />
                                <span class="truncate text-sm font-medium text-gray-900">{{ props.selectedDocument?.name }}</span>
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="send_citizen_select" :label="tt('drive.sendToCitizen.citizens')" />
                                <!-- Mounted per opening, so the search field has focus. -->
                                <FormCitizenPicker v-if="props.isModalOpen && !state.isCitizensLoading"
                                    id="send_citizen_select" :options="state.options.citizens"
                                    v-model="state.citizenUuids" />
                                <FormError :error="state.validationError" />
                                <FormError :error="state.error?.errors?.citizen_uuids?.[0]" />
                            </div>
                            <p class="text-sm text-gray-600">{{ tt('drive.sendToCitizen.note') }}</p>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full"
                                    :disabled="state.isSending || state.citizenUuids.length === 0">
                                    {{ $t('drive.sendToCitizen.send') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                    <div v-if="state.isSending || state.isCitizensLoading"
                        class="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-60">
                        <Spinner :isActive="true" />
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import Modal from '@/components/modal/index.vue'
import Spinner from '@/components/loading/Spinner.vue'
import { documentService } from '@/components/api/user/DocumentService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useDepartmentStore } from '@/store/department'
import { useAlert } from '@/composables/alert'
import { useTerminology } from '@/composables/useTerminology'
import type { PickerOption } from '@/utils/citizenPicker'
import type { Error } from '@/types'

// The backend takes at most this many patients per send.
const MAX_CITIZENS = 50
// The citizen list's "all citizens" pseudo row is a filter choice, not a patient.
const ALL_CITIZENS_SENTINEL = 'all-citizens'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDocument: {
        type: Object as () => Record<string, any>,
        required: true,
    },
})
const emit = defineEmits(['close', 'sent'])

const { tt } = useTerminology()
const { successAlert } = useAlert()
const departmentStore = useDepartmentStore() as any

const state = reactive({
    error: {} as Error,
    validationError: '',
    isSending: false,
    isCitizensLoading: false,
    citizenUuids: [] as string[],
    options: {
        citizens: [] as PickerOption[],
    },
})

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        state.error = {} as Error
        state.validationError = ''
        state.citizenUuids = []
        fetchCitizens()
    }
}, { immediate: true })

async function fetchCitizens() {
    state.isCitizensLoading = true
    try {
        const response = await citizenService.getAllCitizens({
            department: departmentStore.getSelectedDepartmentName,
        })
        state.options.citizens = (response?.data ?? [])
            .filter((citizen: any) => citizen?.uuid && citizen.uuid !== ALL_CITIZENS_SENTINEL)
            .map((citizen: any) => ({
                value: citizen.uuid,
                label: `${citizen.firstname ?? ''} ${citizen.lastname ?? ''}`.trim(),
                pinned: !!citizen?.is_pinned,
                departments: citizen?.departments ?? [],
            }))
    } catch (error: any) {
        state.error = error
    }
    state.isCitizensLoading = false
}

async function submitForm() {
    state.error = {} as Error
    state.validationError = ''

    if (state.citizenUuids.length === 0) {
        state.validationError = tt('drive.sendToCitizen.required')
        return
    }
    if (state.citizenUuids.length > MAX_CITIZENS) {
        state.validationError = tt('drive.sendToCitizen.tooMany', { max: MAX_CITIZENS })
        return
    }

    state.isSending = true
    try {
        const response = await documentService.sendToCitizens(props.selectedDocument?.uuid, {
            citizen_uuids: state.citizenUuids,
        })
        const sent = Number(response?.meta?.sent ?? response?.data?.length ?? 0)
        const notified = Number(response?.meta?.notified ?? 0)
        const notNotified = Math.max(sent - notified, 0)

        const summary = sent === 1
            ? tt('drive.sendToCitizen.sentOne')
            : tt('drive.sendToCitizen.sentMany', { count: sent })
        const message = notNotified > 0
            ? `${summary} ${tt('drive.sendToCitizen.notNotified', { count: notNotified })}`
            : summary

        successAlert(tt('drive.sendToCitizen.sentTitle'), message)
        emit('sent', response?.data ?? [])
        closeModal()
    } catch (error: any) {
        state.error = error
    }
    state.isSending = false
}

function closeModal() {
    emit('close')
}
</script>
