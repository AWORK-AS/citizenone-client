<template>
    <div>
        <Modal size="md" :title="$t('drive.createTemplate.createTemplate')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formTemplate">
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="folder" :label="$t('drive.createTemplate.form.folderName')" />
                                <FormSelect id="folder" :options="state.options.folders"
                                    v-model="state.formTemplate.folder_uuid" />
                                <FormError :error="v$?.formTemplate?.folder_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.folder_uuid?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <TemplateSourcePicker v-model="state.formSource"
                                    :communityCount="state.options.communityForms.length" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="form" :label="$t('drive.createTemplate.form.form')" />
                                <FormSelect id="form" :placeholder="$t('forms.community.searchTemplates')"
                                    :options="state.formSource === 'community' ? state.options.communityForms : state.options.forms"
                                    v-model="state.formTemplate.form_uuid" />
                                <FormError :error="v$?.formTemplate?.form_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.form_uuid?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal()">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full">
                                    {{ $t('proceed') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
                <ModulesUserDocumentStatusTemplateModalRespond :isModalOpen="state.modal.isRespondOpen"
                    :selectedFormStatusTemplate="state.formTemplate" :variant="props.variant"
                    :parentFolderId="state.formTemplate.folder_uuid" @close="state.modal.isRespondOpen = false"
                    @closeModalNew="closeModal()" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { documentService } from '@/components/api/user/DocumentService'
import { formService } from '@/components/api/user/FormService'
import TemplateSourcePicker from '@/components/modules/user/document/status-template/source-picker.vue'
import { fetchCommunityTemplateOptions, isCommunityTemplateValue, resolvePickedFormUuid } from '@/composables/useCommunityFormTemplates'
import { googledriveService } from '~/components/api/user/GoogleDriveService'
import { useI18n } from "vue-i18n"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    variant: {
        type: String,
        default: undefined
    },
    parentFolderId: {
        type: String,
        default: undefined
    },
    onedriveFolders: {
        type: Array as () => { value: string, label: string }[],
        default: () => []
    }
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formTemplate: {
        folder_uuid: '',
        form_uuid: '',
    },
    modal: {
        isRespondOpen: false,
    },
    // 'own' lists the company's forms, 'community' the templates shared by other organisations
    formSource: 'own',
    options: {
        forms: [],
        communityForms: [] as any[],
        folders: [],
    }
})

function closeModal() {
    emit('close')
    resetForm()
}

function resetForm() {
    state.formSource = 'own'
    state.formTemplate = {
        folder_uuid: '',
        form_uuid: '',
    }
    v$.value.$reset()
}

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchAllFolders()
        fetchAllForms()
    }
})

const rules = computed(() => {
    return {
        formTemplate: {
            folder_uuid: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            form_uuid: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

watch(() => state.formSource, () => {
    state.formTemplate.form_uuid = ''
})

async function fetchAllFolders() {
    state.error = {}
    state.isPageLoading = true
    try {
        let options: any = []

        if (props.variant === 'onedrive') {
            options.push({
                value: '',
                label: t('drive.form.rootFolder') || 'Root',
            })
            props.onedriveFolders.forEach((folder: any) => options.push(folder))
        } else if (props.variant === 'google-drive') {
            // include root explicitly so user can select it
            options.push({
                value: 'root',
                label: t('drive.form.rootFolder') || 'My Drive',
            })

            const folders = await googledriveService.getGoogleDriveFolders(props.parentFolderId || undefined)
            folders.forEach((folder: any) => options.push({
                value: folder.id,
                label: folder.name,
            }))
        } else {
            // include app-level root if backend doesn't return it
            options.push({
                value: '',
                label: t('drive.form.rootFolder') || 'Root',
            })

            const response = await documentService.getAllFolders()
            if (response) {
                response.data.forEach(
                    (item: any) => options.push({
                        value: item.uuid,
                        label: folderOptionLabel(item),
                    }))
            }
        }
        state.options.folders = options
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllForms() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await formService.getAllForms()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (form: any) => options.push({
                    value: form?.uuid,
                    label: form?.title,
                })
            )
            state.options.forms = options
            // Templates shared with the CitizenOne community, listed when that source is picked.
            try {
                state.options.communityForms = await fetchCommunityTemplateOptions()
            } catch {
                // The company's own forms stay usable without them.
                state.options.communityForms = []
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        // A community template is copied into the company first; the report is
        // then filled in on the company's own copy like any other form.
        if (isCommunityTemplateValue(state.formTemplate.form_uuid)) {
            state.isPageLoading = true
            try {
                const importedUuid = await resolvePickedFormUuid(state.formTemplate.form_uuid)
                await fetchAllForms()
                state.formSource = 'own'
                await nextTick()
                state.formTemplate.form_uuid = importedUuid
            } catch (error: any) {
                state.error = error
                state.isPageLoading = false
                return
            }
            state.isPageLoading = false
        }
        state.modal.isRespondOpen = true
    }
}
</script>

<style>
#formTemplate .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>