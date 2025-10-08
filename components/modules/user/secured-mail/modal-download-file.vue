<template>
    <div>
        <Modal size="md" :title="$t('mail.download')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form id="formDownloadFile">
                        <div class="space-y-3">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <fieldset class="space-y-1">
                                <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                                    <label
                                        v-for="(downloadFile, downloadFileIndex) in state.options.downloadFileOptions"
                                        :key="downloadFileIndex" :aria-label="downloadFile.title"
                                        class="group relative flex rounded-lg border border-gray-300 bg-white p-4 has-[:disabled]:border-gray-400 has-[:disabled]:bg-gray-200 has-[:disabled]:opacity-25 has-[:checked]:outline has-[:focus-visible]:outline has-[:checked]:outline-2 has-[:focus-visible]:outline-[3px] has-[:checked]:-outline-offset-2 has-[:focus-visible]:-outline-offset-1 has-[:checked]:outline-secondary">
                                        <input type="radio" name="mailing-list" :value="downloadFile.id"
                                            :checked="downloadFile === state.options.downloadFileOptions[0]"
                                            class="absolute inset-0 appearance-none focus:outline focus:outline-0"
                                            v-model="state.formDownload.fileOption" />
                                        <div class="flex-1">
                                            <p class="block text-sm font-medium text-gray-900">
                                                <span v-if="downloadFile.title === 'Download file to my computer'">
                                                    {{ $t('mail.downloadFile.downloadFileToMyComputer') }}
                                                </span>
                                                <span
                                                    v-if="downloadFile.title === 'Download file to citizen\'s folder'">
                                                    {{ $t('mail.downloadFile.downloadFileToCitizensFolder') }}
                                                </span>
                                                <span
                                                    v-if="downloadFile.title === 'Download file to organization\'s folder'">
                                                    {{
                                                        $t('mail.downloadFile.downloadFileToOrganizationsFolder')
                                                    }}
                                                </span>
                                            </p>
                                        </div>
                                        <Icon name="heroicons:check-circle-20-solid"
                                            class="invisible size-5 text-secondary group-has-[:checked]:visible"
                                            aria-hidden="true" />
                                    </label>
                                </div>
                            </fieldset>
                            <div class="space-y-1"
                                v-if="state.formDownload.fileOption === 'Download file to citizen\'s folder'">
                            </div>
                            <div class="space-y-1"
                                v-if="state.formDownload.fileOption === 'Download file to organization\'s folder'">
                                <FormLabel for="company_folder"
                                    :label="$t('mail.downloadFile.downloadFileToOrganizationsFolder')" />
                                <FormSelect id="company_folders" v-model="state.formDownload.company_folder_uuid"
                                    :options="state.options.company_folders" />
                                <FormError :error="state?.error?.errors?.company_folder?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="emit('close')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('mail.download') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { securedMailService } from '@/components/api/user/SecuredMailService'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedAttachment: {
        type: String,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    formDownload: {
        company_folder_uuid: '',
        fileOption: 'Download file to my computer',
    },
    error: {} as Error,
    isPageLoading: false,
    options: {
        company_folders: [] as any,
        downloadFileOptions: [
            { id: 'Download file to my computer', title: 'Download file to my computer' },
            { id: 'Download file to citizen\'s folder', title: 'Download file to citizen\'s folder' },
            { id: 'Download file to organization\'s folder', title: 'Download file to organization\'s folder' },
        ],
    }
})

function closeModal() {
    emit('close')
}

async function downloadFile() {
    // state.isPageLoading = true
    // state.error = {}
    // try {
    //     const params = {
    //         file_url: props?.attachment
    //     }
    //     const response = await securedMailService.downloadFile(params)
    //     if (response) {
    //         saveAs(response)
    //     }
    // } catch (error: any) {
    //     state.error.message = error?.message || 'An error occurred during the download.'
    // }
    // state.isPageLoading = false
}
</script>

<style>
#formDownloadFile .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>