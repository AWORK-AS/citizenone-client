<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('citizens.incidents.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('citizens.incidents.form.title')"
                    v-model="state.formIncident.title" />
                <FormError :error="v$?.formIncident?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date" :label="$t('citizens.incidents.form.date')" />
                <FormDateField id="date" name="date" :placeholder="$t('citizens.incidents.form.date')"
                    v-model="state.formIncident.date" />
                <FormError :error="v$?.formIncident?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex items-center">
                    <p class="text-sm text-gray-600">
                        {{ $t('citizens.incidents.form.description') }}
                    </p>
                    <div class="flex-1 flex justify-end">
                        <input ref="descriptionFileInput" type="file" @change="handleDescriptionFileChange"
                            class="hidden" />
                        <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                            @click="triggerDescriptionFileInput">
                            <div>
                                <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                            </div>
                            {{ $t('citizens.citizenJournals.form.attachFile') }}
                        </div>
                    </div>
                </div>
                <ckeditor :editor="editor" v-model="state.formIncident.description" :config="editorDescriptionConfig">
                </ckeditor>
                <FormError :error="v$?.formIncident?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('citizens.incidents.form.riskLevel.riskLevel') }}
                </p>
                <div>
                    <RadioGroup v-model="state.formIncident.risk_level"
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <RadioGroupOption as="template" v-for="(type, index) in state.options.risk_levels" :key="index"
                            :value="type.value" v-slot="{ active, checked }">
                            <div :class="[
                                active ? 'ring-1 ring-offset-2' : '',
                                type.title === 'Harmless' && 'ring-primary',
                                type.title === 'Low Risk' && 'ring-yellow-500',
                                type.title === 'Moderate Risk' && 'ring-orange-500',
                                type.title === 'High Risk' && 'ring-red-500',
                                checked && type.title === 'Harmless' && 'bg-primary text-white ring-0 hover:bg-primary',
                                checked && type.title === 'Low Risk' && 'bg-yellow-500 text-white ring-0 hover:bg-yellow-500',
                                checked && type.title === 'Moderate Risk' && 'bg-orange-500 text-white ring-0 hover:bg-orange-500',
                                checked && type.title === 'High Risk' && 'bg-red-500 text-white ring-0 hover:bg-red-500',
                                !active && !checked && type.title === 'Harmless' && 'border border-primary ring-inset',
                                !active && !checked && type.title === 'Low Risk' && 'border border-yellow-500 ring-inset',
                                !active && !checked && type.title === 'Moderate Risk' && 'border border-orange-500 ring-inset',
                                !active && !checked && type.title === 'High Risk' && 'border border-red-500 ring-inset',
                                active && checked ? 'text-white ring-1' : '',
                                'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
                                <span v-if="type.title === 'Harmless'">
                                    {{ $t('citizens.incidents.form.riskLevel.category.harmless') }}
                                </span>
                                <span v-if="type.title === 'Low Risk'">
                                    {{ $t('citizens.incidents.form.riskLevel.category.lowRisk') }}
                                </span>
                                <span v-if="type.title === 'Moderate Risk'">
                                    {{ $t('citizens.incidents.form.riskLevel.category.moderateRisk') }}
                                </span>
                                <span v-if="type.title === 'High Risk'">
                                    {{ $t('citizens.incidents.form.riskLevel.category.highRisk') }}
                                </span>
                            </div>
                        </RadioGroupOption>
                    </RadioGroup>
                </div>
                <FormError :error="v$?.formIncident?.risk_level?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.risk_level?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formIncident.is_draft = !state.formIncident.is_draft">
                    <FormCheckbox :value="state.formIncident.is_draft" />
                    {{ $t('citizens.incidents.form.draft') }}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="w-full">
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
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { incidentService } from '@/components/api/user/IncidentService'
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
    selectedIncident: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const editor = ref(ClassicEditor)
const editorDescriptionConfig = ref({
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
    extraPlugins: [DescriptionUploadAdapterPlugin],
    height: 500  // Set the editor height here
}) as any
const { t } = useI18n()
const descriptionFileInput = ref(null) as any

const state = reactive({
    error: {} as Error,
    formIncident: {
        citizen_uuid: citizenUuid,
        id: '',
        uuid: '',
        title: '',
        date: '',
        description: '',
        risk_level: '',
        is_draft: false,
    },
    modal: {
        isUpgradeStorageOpen: false
    },
    options: {
        risk_levels: [
            { value: 'harmless', title: 'Harmless' },
            { value: 'low-risk', title: 'Low Risk' },
            { value: 'moderate-risk', title: 'Moderate Risk' },
            { value: 'high-risk', title: 'High Risk' },
        ] as any
    },
})

onMounted(() => {
    state.formIncident = {
        citizen_uuid: citizenUuid,
        id: props.selectedIncident.id,
        uuid: props.selectedIncident.uuid,
        title: props.selectedIncident.title,
        date: props.selectedIncident.date,
        description: props.selectedIncident.description,
        risk_level: props.selectedIncident.risk_level,
        is_draft: props.selectedIncident.is_draft,
    }
})

watch(() => props.selectedIncident, (newValue: any) => {
    if (newValue != null) {
        state.formIncident = {
            citizen_uuid: citizenUuid,
            id: newValue.id,
            uuid: newValue.uuid,
            title: newValue.title,
            date: newValue.date,
            description: newValue.description,
            risk_level: newValue.risk_level,
            is_draft: newValue.is_draft,
        }
    }
})

const rules = computed(() => {
    return {
        formIncident: {
            title: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            date: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            description: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            risk_level: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formIncident)
    }
}

const triggerDescriptionFileInput = () => {
    descriptionFileInput.value?.click()
}

const handleDescriptionFileChange = (event: Event) => {
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
        params.append('citizen_uuid', String(citizenUuid))
        const response = await incidentService.uploadIncidentFile(params)
        if (response) {
            state.formIncident.description += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
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

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

const resetFileInput = () => {
    if (descriptionFileInput.value) {
        descriptionFileInput.value.value = null
    }
}

function DescriptionUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new DescriptionUploadAdapter(loader)
    }
}

class DescriptionUploadAdapter {
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
            params.append('citizen_uuid', String(citizenUuid))
            const response = await incidentService.uploadIncidentFile(params)
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