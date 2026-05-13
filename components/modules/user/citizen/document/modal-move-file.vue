<template>
    <div>
        <Modal size="sm" :title="$t('citizens.documents.form.moveFile')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm" id="formDirectory">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="folder" :label="$t('citizens.documents.form.folderName')" />
                                <FormSelect id="folder" :options="state.options.folders"
                                    v-model="state.formFile.folder_uuid" />
                                <FormError :error="v$?.formDirectory?.folder_uuid?.$errors[0]?.$message.toString()" />
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
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenDocumentService } from '@/components/api/user/CitizenDocumentService'
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
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const { t } = useI18n()
const emit = defineEmits(['close', 'refreshDocuments'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formFile: {
        folder_uuid: '',
    },
    options: {
        folders: [],
    }
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchAllFolders()
    }
})

async function fetchAllFolders() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenDocumentService.getAllFolders(citizenUuid)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.folders = options
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
    state.isPageLoading = true
    try {
        const fileUuid = props?.selectedDocument?.uuid
        let params = {
            folder_uuid: state.formFile.folder_uuid
        }
        const response = await citizenDocumentService.moveFile(fileUuid, params)
        if (response?.data) {
            refreshDocuments()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.alert.fileSuccessfullyMoved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>