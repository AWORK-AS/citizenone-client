<template>
    <div>
        <Modal size="sm" :title="$t('drive.form.newFolder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm" class="space-y-4">
                        <div>
                            <Label :label="$t('drive.form.folderName')" />
                            <input 
                                v-model="state.folderName" 
                                type="text" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                :placeholder="$t('drive.form.folderName')"
                                required
                            />
                            <p v-if="state.error?.message" class="mt-2 text-sm text-red-600">
                                {{ state.error.message }}
                            </p>
                        </div>
                        <div class="flex gap-2 justify-end">
                            <FormButton 
                                type="button" 
                                buttonStyle="secondary" 
                                @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton 
                                type="submit" 
                                buttonStyle="action"
                                :disabled="!state.folderName || state.isPageLoading">
                                {{ $t('drive.form.create') }}
                            </FormButton>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { googledriveService } from '@/components/api/user/GoogleDriveService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const emit = defineEmits(['close', 'folderCreated'])

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    parentFolderId: {
        type: String,
        required: false,
    },
})

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    folderName: '',
})

function closeModal() {
    state.folderName = ''
    state.error = {}
    emit('close')
}

async function submitForm() {
    state.error = {}
    state.isPageLoading = true
    try {
        await googledriveService.createGoogleDriveFolder(state.folderName, props.parentFolderId)
        successAlert(`${t('alert.success')}!`, `${t('drive.alert.folderSuccessfullyAdded')}.`)
        emit('folderCreated')
        closeModal()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
