<template>
    <div>
        <Modal size="sm" :title="$t('drive.form.moveFile')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm" id="formDirectory">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="folder" :label="$t('drive.form.folderName')" />
                                <FormSelect id="folder" :options="state.options.folders"
                                    v-model="state.formFile.folder_id" />
                                <FormError :error="v$?.formFile?.folder_id?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.folder_id?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="emit('close')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                    {{ $t('save') }}
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
import { googledriveService } from '@/components/api/user/GoogleDriveService'
import { useAlert } from '@/composables/alert'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDocument: {
        type: Object,
        required: true,
    },
    parentFolderId: {
        type: [String, null],
        requried: false,
        default: null,
    }
})

const { t } = useI18n()
const emit = defineEmits(['close', 'refreshDocuments'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formFile: {
        folder_id: '',
    },
    options: {
        folders: [] as any[],
    }
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        state.formFile.folder_id = ''
        fetchAllFolders(props.parentFolderId || undefined)
    }
})

async function fetchAllFolders(parentFolderId?: string) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await googledriveService.getGoogleDriveFiles(parentFolderId || undefined)
        const files = Array.isArray(response) ? response : (response?.files || response?.data || [])
        const options = files
            .filter((item: any) => item?.mimeType?.includes('folder'))
            .map((item: any) => ({
                value: item.id,
                label: item.name,
            }))

        if (parentFolderId) {
            options.unshift({
                value: 'root',
                label: t('drive.form.rootFolder'),
            })
        }

        state.options.folders = options
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

watch(() => props.parentFolderId, (newId) => {
    if (props.isModalOpen) {
        fetchAllFolders(newId || undefined)
    }
})

function closeModal() {
    emit('close')
}

function refreshDocuments() {
    emit('refreshDocuments')
}

const rules = computed(() => {
    return {
        formFile: {
            folder_id: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        moveFile()
    }
}

async function moveFile() {
    state.error = {}
    state.isPageLoading = true
    try {
        const fileId = props?.selectedDocument?.id
        const response = await googledriveService.moveGoogleDriveFile(fileId, state.formFile.folder_id)
        if (response) {
            refreshDocuments()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyMoved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
