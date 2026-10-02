<template>
    <div>
        <Modal size="sm" :title="$t('mail.pdf.saveToDrive')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="relative">
                    <form @submit.prevent="submitForm" id="formSavePdfToDrive">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="folder" :label="$t('mail.pdf.chooseFolder')" />
                                <FormSelect id="folder" :options="state.options.folders" :appendToBody="true"
                                    v-model="state.form.folder_uuid" :disabled="state.isPageLoading" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="state.isSaving">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                    <div v-if="state.isPageLoading"
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
import { mailPdfService } from '@/components/api/user/MailPdfService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { t } = useI18n()
const { successAlert } = useAlert()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    messageId: {
        type: String,
        required: true,
    },
    folder: {
        type: String as () => 'inbox' | 'sent',
        required: true,
    },
})

const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isSaving: false,
    form: {
        folder_uuid: '',
    },
    options: {
        folders: [] as Array<{ value: string; label: string }>,
    },
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        state.form.folder_uuid = ''
        fetchAllFolders()
    }
})

async function fetchAllFolders() {
    state.isPageLoading = true
    try {
        const response = await documentService.getAllFolders()
        if (response) {
            state.options.folders = [
                { value: '', label: t('mail.pdf.rootFolder') },
                ...response.data.map((item: any) => ({ value: item.uuid, label: item.name })),
            ]
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function closeModal() {
    emit('close')
}

function submitForm() {
    saveToDrive()
}

async function saveToDrive() {
    state.error = {}
    state.isSaving = true
    try {
        const params: any = {
            // The inbox/sent views bind the raw uid straight from the API
            // response, which for SMTP/IMAP is a JSON number, not a string -
            // coerce it, or the backend's `message_id` string validation
            // rejects it (same fix as ModulesUserMailSmtpModalDownloadFile).
            message_id: String(props.messageId),
            folder: props.folder,
        }
        if (state.form.folder_uuid) {
            params.folder_uuid = state.form.folder_uuid
        }
        const response = await mailPdfService.saveToDrive(params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('mail.pdf.savedToDrive')}.`)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
