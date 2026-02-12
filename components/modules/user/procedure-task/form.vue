<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl space-y-3">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="space-y-1">
            <FormLabel for="title" :label="$t('tasks.form.title')" />
            <FormTextField id="title" name="title" :placeholder="$t('tasks.form.title')"
                v-model="state.formProcedureTask.title" />
            <FormError :error="v$?.formProcedureTask?.title?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.title?.[0]" />
        </div>
        <div class="space-y-1">
            <div class="flex items-center">
                <p class="text-sm text-gray-600">
                    {{ $t('tasks.form.content') }}
                </p>
                <div class="flex-1 flex justify-end">
                    <input ref="contentFileInput" type="file" @change="handleContentFileChange" class="hidden" />
                    <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                        @click="triggerContentFileInput">
                        <div>
                            <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                        </div>
                        {{ $t('tasks.form.attachFile') }}
                    </div>
                </div>
            </div>
            <ckeditor :editor="editor" v-model="state.formProcedureTask.content" :config="editorContentConfig">
            </ckeditor>
            <FormError :error="v$?.formProcedureTask?.content?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.content?.[0]" />
        </div>
        <div class="space-y-1">
            <div class="w-fit flex items-center cursor-pointer"
                @click="state.formProcedureTask.is_active = !state.formProcedureTask.is_active">
                <FormCheckbox :value="state.formProcedureTask.is_active" />
                {{ $t('tasks.form.isActive') }}
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo(`/procedures/${procedureUuid}`)">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen"
            :title="$t('citizens.documents.upgradeStorage')"
            :message="state.error?.message + ' ' + $t('citizens.documents.confirmation.upgradeStorageConfirmation') + '?'"
            @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
    </form>
</template>

<script setup lang="ts">
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { procedureTaskService } from '@/components/api/user/ProcedureTaskService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedProcedureTask: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])
const router = useRouter()
const procedureUuid = router?.currentRoute?.value?.params?.procedure_uuid
const { t } = useI18n()
const editor = ref(ClassicEditor)
const editorContentConfig = ref({
    // Add your custom configuration here
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'imageUpload'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
        ]
    },
    extraPlugins: [ContentUploadAdapterPlugin],
    height: 500  // Set the editor height here
}) as any
const contentFileInput = ref(null) as any

const state = reactive({
    error: {} as Error,
    formProcedureTask: {
        title: '',
        content: '',
        is_active: true,
    },
    modal: {
        isUpgradeStorageOpen: false,
    }
})

watch(() => props.selectedProcedureTask, (newValue: any) => {
    if (newValue != null) {
        state.formProcedureTask = {
            title: newValue.title,
            content: newValue.content,
            is_active: newValue.is_active,
        }
    }
})

const rules = computed(() => {
    return {
        formProcedureTask: {
            title: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            content: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formProcedureTask)
    }
}

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

const triggerContentFileInput = () => {
    contentFileInput.value?.click()
}

const handleContentFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadContentAttachment(file)
    }
}

const uploadContentAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        const response = await procedureTaskService.uploadFile(params)
        if (response) {
            state.formProcedureTask.content += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
        resetFileInput()
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const resetFileInput = () => {
    if (contentFileInput.value) {
        contentFileInput.value.value = null
    }
}

function ContentUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new ContentUploadAdapter(loader)
    }
}

class ContentUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            const response = await procedureTaskService.uploadFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}
</script>