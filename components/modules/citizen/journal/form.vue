<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="grid md:grid-cols-2 gap-x-3">
                <div class="space-y-1">
                    <FormLabel for="title" :label="$t('citizens.citizenJournals.form.title')" />
                    <FormTextField id="title" name="title" :placeholder="$t('citizens.citizenJournals.form.title')"
                        v-model="state.formJournal.title" />
                    <FormError :error="v$?.formJournal?.title?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.title?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date" :label="$t('citizens.citizenJournals.form.date')" />
                    <FormDateField id="date" name="date" placeholder="Date" v-model="state.formJournal.date" />
                    <FormError :error="v$?.formJournal?.date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date?.[0]" />
                </div>
            </div>
            <div v-if="props.formType === 'create'">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formJournal.copy_journal_note_to_plan_or_goal = !state.formJournal.copy_journal_note_to_plan_or_goal">
                    <FormCheckbox :value="state.formJournal.copy_journal_note_to_plan_or_goal" />
                    {{ $t('citizens.citizenJournals.form.copyJournalNoteToPlanOrGoal') }}
                </div>
            </div>
            <div class="space-y-1">
                <div class="flex items-center">
                    <p class="text-sm text-gray-600">
                        {{ $t('citizens.citizenJournals.form.content') }}
                    </p>
                    <div class="flex-1 flex justify-end">
                        <input ref="contentFileInput" type="file" @change="handleContentFileChange" class="hidden" />
                        <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                            @click="triggerContentFileInput">
                            <div>
                                <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                            </div>
                            {{ $t('citizens.citizenJournals.form.attachFile') }}
                        </div>
                    </div>
                </div>
                <ckeditor :editor="editor" v-model="state.formJournal.content" :config="editorContentConfig"></ckeditor>
                <FormError :error="v$?.formJournal?.content?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.content?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('citizens.citizenJournals.form.riskAssessment') }}
                </p>
                <div>
                    <RadioGroup v-model="state.formJournal.assessment"
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <RadioGroupOption as="template" v-for="(assessment, index) in state.options.assessments"
                            :key="index" :value="assessment.value" v-slot="{ active, checked }">
                            <div :class="[
                                active ? 'ring-1 ring-offset-2' : '',
                                assessment.title === 'None' && 'ring-primary',
                                assessment.title === 'No risk' && 'ring-green-700',
                                assessment.title === 'Increased risk' && 'ring-yellow-500',
                                assessment.title === 'Acute increased risk' && 'ring-red-600',
                                checked && assessment.title === 'None' && 'bg-primary text-white ring-0 hover:bg-primary',
                                checked && assessment.title === 'No risk' && 'bg-green-700 text-white ring-0 hover:bg-green-700',
                                checked && assessment.title === 'Increased risk' && 'bg-yellow-500 text-white ring-0 hover:bg-yellow-500',
                                checked && assessment.title === 'Acute increased risk' && 'bg-red-600 text-white ring-0 hover:bg-red-600',
                                !active && !checked && assessment.title === 'None' && 'border border-primary ring-inset',
                                !active && !checked && assessment.title === 'No risk' && 'border border-green-700 ring-inset',
                                !active && !checked && assessment.title === 'Increased risk' && 'border border-yellow-500 ring-inset',
                                !active && !checked && assessment.title === 'Acute increased risk' && 'border border-red-600 ring-inset',
                                active && checked ? 'text-white ring-1' : '',
                                'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
                                <span v-if="assessment.title === 'None'">
                                    {{ $t('citizens.citizenJournals.form.risk.none') }}
                                </span>
                                <span v-if="assessment.title === 'No risk'">
                                    {{ $t('citizens.citizenJournals.form.risk.noRisk') }}
                                </span>
                                <span v-if="assessment.title === 'Increased risk'">
                                    {{ $t('citizens.citizenJournals.form.risk.increasedRisk') }}
                                </span>
                                <span v-if="assessment.title === 'Acute increased risk'">
                                    {{ $t('citizens.citizenJournals.form.risk.acuteIncreasedRisk') }}
                                </span>
                            </div>
                        </RadioGroupOption>
                    </RadioGroup>
                </div>
            </div>
            <div class="space-y-1" v-if="state.formJournal.assessment !== null">
                <div class="flex justify-end">
                    <input ref="riskAssessmentFileInput" type="file" @change="handleRiskAssessmentFileChange"
                        class="hidden" />
                    <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                        @click="triggerRiskAssessmentFileInput">
                        <div>
                            <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                        </div>
                        {{ $t('citizens.citizenJournals.form.attachFile') }}
                    </div>
                </div>
                <ckeditor :editor="editor" v-model="state.formJournal.note" :config="editorNoteConfig"></ckeditor>
                <FormError :error="props?.error?.errors?.note?.[0]" />
            </div>
            <div class="flex md:items-center flex-col md:flex-row justify-between gap-3">
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formJournal.copy_risk_assessment_to_plan_or_goal = !state.formJournal.copy_risk_assessment_to_plan_or_goal"
                        v-if="props.formType === 'create'">
                        <FormCheckbox :value="state.formJournal.copy_risk_assessment_to_plan_or_goal" />
                        {{ $t('citizens.citizenJournals.form.copyRiskAssessmentToPlanOrGoal') }}
                    </div>
                </div>
                <div class="space-y-1">
                    <div class="flex items-center gap-x-2">
                        <p>
                            {{ $t('citizens.citizenJournals.form.chooseScoreFrom1to5') }}
                        </p>
                        <div class="relative w-12">
                            <select
                                class="block w-full appearance-none rounded-md border border-primary bg-white pl-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-primary"
                                v-model="state.formJournal.score">
                                <option :value="1">1</option>
                                <option :value="2">2</option>
                                <option :value="3">3</option>
                                <option :value="4">4</option>
                                <option :value="5">5</option>
                            </select>
                            <div class="absolute inset-y-0 right-2 top-1 flex items-center pointer-events-none">
                                <svg class="h-3 w-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <FormError :error="props?.error?.errors?.score?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formJournal.is_draft = !state.formJournal.is_draft">
                    <FormCheckbox :value="state.formJournal.is_draft" />
                    {{ $t('citizens.citizenJournals.form.draft') }}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
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
import { journalService } from '@/components/api/JournalService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
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
    selectedJournal: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const contentFileInput = ref(null) as any
const riskAssessmentFileInput = ref(null) as any

const editor = ref(ClassicEditor)
const editorContentConfig = ref({
    // Add your custom configuration here
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'imageUpload'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
        ]
    },
    extraPlugins: [ContentUploadAdapterPlugin],
    height: 500  // Set the editor height here
})
const editorNoteConfig = ref({
    // Add your custom configuration here
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'imageUpload'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
        ]
    },
    extraPlugins: [NoteUploadAdapterPlugin],
    height: 500  // Set the editor height here
})

const state = reactive({
    error: {} as Error,
    formJournal: {
        id: '',
        uuid: '',
        content: '',
        date: '',
        copy_journal_note_to_plan_or_goal: false,
        copy_risk_assessment_to_plan_or_goal: false,
        title: '',
        is_draft: false,
        assessment: null,
        note: '',
        score: ''
    } as any,
    modal: {
        isUpgradeStorageOpen: false
    },
    options: {
        assessments: [
            { value: null, title: 'None' },
            { value: 'no risk', title: 'No risk' },
            { value: 'increased risk', title: 'Increased risk' },
            { value: 'acute increased risk', title: 'Acute increased risk' },
        ] as any,
        score: [
            { value: 1, label: 1 },
            { value: 2, label: 2 },
            { value: 3, label: 3 },
            { value: 4, label: 4 },
            { value: 5, label: 5 },
        ]
    }
})

onMounted(() => {
    state.formJournal = {
        id: props.selectedJournal.id,
        uuid: props.selectedJournal.uuid,
        content: props.selectedJournal.content,
        date: props.selectedJournal.date,
        copy_journal_note_to_plan_or_goal: props.selectedJournal.copy_journal_note_to_plan_or_goal,
        copy_risk_assessment_to_plan_or_goal: props.selectedJournal.copy_risk_assessment_to_plan_or_goal,
        title: props.selectedJournal.title,
        is_draft: props.selectedJournal.is_draft,
        assessment: props.selectedJournal.assessment,
        note: props.selectedJournal.note === null ? '' : props.selectedJournal.note,
        score: props.selectedJournal.score,
    }
})

watch(() => props.selectedJournal, (newValue: any) => {
    if (newValue != null) {
        state.formJournal = {
            id: newValue.id,
            uuid: newValue.uuid,
            content: newValue.content,
            date: newValue.date,
            copy_journal_note_to_plan_or_goal: newValue.copy_journal_note_to_plan_or_goal,
            copy_risk_assessment_to_plan_or_goal: newValue.copy_risk_assessment_to_plan_or_goal,
            title: newValue.title,
            is_draft: newValue.is_draft,
            assessment: newValue.assessment,
            note: newValue.note === null ? '' : newValue.note,
            score: newValue.score,
        }
    }
})

const rules = computed(() => {
    return {
        formJournal: {
            title: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formJournal)
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
        params.append('citizen_uuid', String(citizenUuid))
        const response = await journalService.uploadJournalFile(params)
        if (response) {
            state.formJournal.content += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
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

const triggerRiskAssessmentFileInput = () => {
    riskAssessmentFileInput.value?.click()
}

const handleRiskAssessmentFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadRiskAssessmentAttachment(file)
    }
}

const uploadRiskAssessmentAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await journalService.uploadJournalFile(params)
        if (response) {
            state.formJournal.note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
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
    if (riskAssessmentFileInput.value) {
        riskAssessmentFileInput.value.value = null
    }
}

function ContentUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new ContentUploadAdapter(loader)
    }
}

function NoteUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new NoteUploadAdapter(loader)
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
            params.append('citizen_uuid', String(citizenUuid))
            const response = await journalService.uploadJournalFile(params)
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

class NoteUploadAdapter {
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
            const response = await journalService.uploadAssessmentFile(params)
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