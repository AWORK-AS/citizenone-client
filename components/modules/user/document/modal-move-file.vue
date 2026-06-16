<template>
    <div>
        <Modal size="sm" :title="$t('drive.form.moveFile')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="relative">

                    <form @submit.prevent="submitForm" id="formDirectory">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="folder" :label="$t('drive.form.folderName')" />
                                <FormSelect id="folder" :options="state.options.folders"
                                    v-model="state.formFile.folder_uuid" :disabled="state.isPageLoading" />
                                <FormError :error="v$?.formFile?.folder_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.folder_uuid?.[0]" />

                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full">
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
import { nextTick } from 'vue'
import { useAlert } from '@/composables/alert'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useRouter } from 'vue-router'
import type { Error } from '@/types'

const { successAlert } = useAlert()
type FolderOption = { value: string; label: string; uuid?: string; name?: string }
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDocument: {
        type: Object as () => Record<string, any>,
        required: true,
    },
    companyFolders: {
        type: Array as () => Array<FolderOption>,
        required: false,
        default: () => []
    },
    onedriveFolders: {
        type: Array as () => Array<FolderOption>,
        required: false,
        default: () => []
    },
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const { t } = useI18n()
const emit = defineEmits(['close', 'refreshDocuments', 'moveOneDriveFile'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formFile: {
        folder_uuid: '',
    },
    options: {
        folders: [] as FolderOption[],
    }
})

watch(
    (): [boolean, FolderOption[], FolderOption[]] => [props.isModalOpen, props.onedriveFolders, props.companyFolders],
    ([isModalOpen, onedriveFolders, companyFolders]: [boolean, FolderOption[], FolderOption[]]) => {
        if (isModalOpen) {
            state.formFile.folder_uuid = '';
            state.options.folders = [];
            state.isPageLoading = true;
            if (props.selectedDocument?.is_onedrive) {
                if (Array.isArray(onedriveFolders) && onedriveFolders.length > 0) {
                    state.options.folders = onedriveFolders;
                    state.isPageLoading = false;
                } else {
                    state.options.folders = [];
                }

            } else if (Array.isArray(companyFolders) && companyFolders.length > 0) {
                state.options.folders = companyFolders.map((item: FolderOption) => ({ value: item.uuid || item.value, label: item.name || item.label }));
                state.isPageLoading = false;

            } else {

                fetchAllFolders().finally(() => {
                    state.isPageLoading = false;
                });
            }
        }
    },
    { immediate: true, deep: true }
);

async function fetchAllFolders() {
    state.error = {}
    state.isPageLoading = true
    await nextTick()
    try {
        const response = await documentService.getAllFolders()
        if (response) {
            state.options.folders = response.data.map((item: any) => ({ value: item.uuid, label: item.name }))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function closeModal() {
    emit('close')
}

function refreshDocuments() {
    emit('refreshDocuments')
}

const rules = computed(() => {
    return {
        formFile: {
            folder_uuid: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
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
    try {
        if (props.selectedDocument?.is_onedrive) {
            emit('moveOneDriveFile', state.formFile.folder_uuid)
            closeModal()
        } else {
            const fileUuid = props?.selectedDocument?.uuid
            let params = {
                folder_uuid: state.formFile.folder_uuid
            }
            const response = await documentService.moveFile(fileUuid, params)
            if (response?.data) {
                refreshDocuments()
                closeModal()
                successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyMoved')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>