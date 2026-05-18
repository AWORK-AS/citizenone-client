<template>
    <form @submit.prevent="submitForm()" id="formRiskAssessment">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="citizen_uuid" :label="$t('overview.quickRiskAssessment.form.citizen')" />
                <FormSelect id="citizen_uuid" v-model="state.formRiskAssessment.citizen_uuid"
                    :options="state.options.citizens" />
                <FormError :error="v$?.formRiskAssessment?.citizen_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-3" v-if="state.formRiskAssessment.citizen_uuid">
                <div class="grid md:grid-cols-2 gap-x-3">
                    <div class="md:col-span-2">
                        <button type="button" class="text-sm text-primary hover:text-primary-700"
                            @click="state.usePredefinedJournalTitle = !state.usePredefinedJournalTitle">
                            <span v-if="state.usePredefinedJournalTitle">
                                {{ $t('overview.quickRiskAssessment.form.enterJournalTitleManually') }}
                            </span>
                            <span v-else>
                                {{ $t('overview.quickRiskAssessment.form.usePredefinedJournalTitle') }}
                            </span>
                        </button>
                    </div>
                    <div class="space-y-1" v-if="state.usePredefinedJournalTitle">
                        <div class="flex justify-between items-center py-0.5">
                            <FormLabel for="predefined_title" :label="$t('overview.quickRiskAssessment.form.title')" />
                            <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="state.modal.isAddJournalTitleOpen = true">
                                {{ $t('journalTitles.addNewJournalTitle') }}
                            </span>
                        </div>
                        <FormSelect id="predefined_title" v-model="state.formRiskAssessment.title"
                            :options="state.options.journal_titles" />
                        <FormError :error="v$?.formRiskAssessment?.title?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.title?.[0]" />
                    </div>
                    <div class="space-y-1" v-else>
                        <FormLabel for="title" :label="$t('overview.quickRiskAssessment.form.title')" />
                        <FormTextField id="title" name="title"
                            :placeholder="$t('overview.quickRiskAssessment.form.title')"
                            v-model="state.formRiskAssessment.title" />
                        <FormError :error="v$?.formRiskAssessment?.title?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.title?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="date" :label="$t('overview.quickRiskAssessment.form.date')" />
                        <FormDateField id="date" name="date" placeholder="Date"
                            v-model="state.formRiskAssessment.date" />
                        <FormError :error="v$?.formRiskAssessment?.date?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.date?.[0]" />
                    </div>
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ customPagesStore.getCustomPagesName?.riskAssessment }}
                    </p>
                    <div>
                        <RadioGroup v-model="state.formRiskAssessment.assessment"
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
                                        {{ $t('overview.quickRiskAssessment.form.risk.none') }}
                                    </span>
                                    <span v-if="assessment.title === 'No risk'">
                                        {{ $t('overview.quickRiskAssessment.form.risk.noRisk') }}
                                    </span>
                                    <span v-if="assessment.title === 'Increased risk'">
                                        {{ $t('overview.quickRiskAssessment.form.risk.increasedRisk') }}
                                    </span>
                                    <span v-if="assessment.title === 'Acute increased risk'">
                                        {{ $t('overview.quickRiskAssessment.form.risk.acuteIncreasedRisk') }}
                                    </span>
                                </div>
                            </RadioGroupOption>
                        </RadioGroup>
                    </div>
                </div>
                <div class="space-y-1 text-xs">
                    <div v-if="state.formRiskAssessment.assessment === 'no risk' && state.options.citizens.find((citizen: any) => citizen.value === state.formRiskAssessment.citizen_uuid)?.green"
                        class="bg-green-700 text-white px-4 py-3 rounded-md">
                        {{
                            state.options.citizens.find((citizen: any) => citizen.value ===
                                state.formRiskAssessment.citizen_uuid)?.label
                        }}
                        <span class="lowercase">
                            {{
                                state.options.citizens.find((citizen: any) => citizen.value ===
                                    state.formRiskAssessment.citizen_uuid)?.green
                            }}.
                        </span>
                    </div>
                    <div v-if="state.formRiskAssessment.assessment === 'increased risk' && state.options.citizens.find((citizen: any) => citizen.value === state.formRiskAssessment.citizen_uuid)?.yellow"
                        class="bg-yellow-500 text-white px-4 py-3 rounded-md">
                        {{
                            state.options.citizens.find((citizen: any) => citizen.value ===
                                state.formRiskAssessment.citizen_uuid)?.label
                        }}
                        <span class="lowercase">
                            {{
                                state.options.citizens.find((citizen: any) => citizen.value ===
                                    state.formRiskAssessment.citizen_uuid)?.yellow
                            }}.
                        </span>
                    </div>
                    <div v-if="state.formRiskAssessment.assessment === 'acute increased risk' && state.options.citizens.find((citizen: any) => citizen.value === state.formRiskAssessment.citizen_uuid)?.red"
                        class="bg-red-600 text-white px-4 py-3 rounded-md">
                        {{
                            state.options.citizens.find((citizen: any) => citizen.value ===
                                state.formRiskAssessment.citizen_uuid)?.label
                        }}
                        <span class="lowercase">
                            {{
                                state.options.citizens.find((citizen: any) => citizen.value ===
                                    state.formRiskAssessment.citizen_uuid)?.red
                            }}.
                        </span>
                    </div>
                </div>
                <div class="space-y-1" v-if="state.formRiskAssessment.assessment !== null">
                    <div class="flex items-center">
                        <p class="text-sm text-gray-600">
                            {{ $t('overview.quickRiskAssessment.form.note') }}
                        </p>
                        <div class="flex-1 flex items-center gap-x-4 justify-end">
                            <input ref="riskAssessmentFileInput" type="file" @change="handleRiskAssessmentFileChange"
                                class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerRiskAssessmentFileInput">
                                <div class="flex items-center">
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('overview.quickRiskAssessment.form.attachFile') }}
                            </div>
                            <FormButton buttonStyle="AI" buttonSize="xs" class="px-4"
                                v-if="userStore.getUser?.has_ai_access" @click="generateNoteForRiskAssessmentNote">
                                <div class="flex items-center">
                                    <Icon name="ph:arrows-clockwise" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('overview.quickRiskAssessment.form.prepareWithAI') }}
                            </FormButton>
                        </div>
                    </div>
                    <ckeditor :editor="editor" v-model="state.formRiskAssessment.note" :config="editorNoteConfig">
                    </ckeditor>
                    <FormError :error="v$?.formRiskAssessment?.note?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formRiskAssessment.is_draft = !state.formRiskAssessment.is_draft">
                        <FormCheckbox :value="state.formRiskAssessment.is_draft" />
                        {{ $t('overview.quickRiskAssessment.form.draft') }}
                    </div>
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
        <ModulesUserJournalTitleModalNew :isModalOpen="state.modal.isAddJournalTitleOpen"
            @close="state.modal.isAddJournalTitleOpen = false" @refreshJournalTitles="fetchAllJournalTitles" />
        <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen"
            :title="$t('citizens.documents.upgradeStorage')"
            :message="state.error?.message + ' ' + $t('citizens.documents.confirmation.upgradeStorageConfirmation') + '?'"
            @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
    </form>
</template>

<script setup lang="ts">
import { aIAssistantService } from '@/components/api/user/AIAssistantService'
import { citizenService } from '@/components/api/user/CitizenService'
import { journalService } from '@/components/api/user/JournalService'
import { journalTitleService } from '@/components/api/user/JournalTitleService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useCitizenStore } from '@/store/citizen'
import { useDepartmentStore } from '@/store/department'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { useCustomPagesStore } from '@/store/custom-pages'

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
const citizenStore = useCitizenStore() as any
const departmentStore = useDepartmentStore()
const userStore = useUserStore() as any

const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const contentFileInput = ref(null) as any
const riskAssessmentFileInput = ref(null) as any

const editor = ref(ClassicEditor)
const editorNoteConfig = ref({
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
    extraPlugins: [NoteUploadAdapterPlugin],
    height: 500  // Set the editor height here
}) as any

const state = reactive({
    error: {} as Error,
    formRiskAssessment: {
        id: '',
        uuid: '',
        citizen_uuid: '',
        date: '',
        title: '',
        is_draft: false,
        assessment: null,
        note: '',
    } as any,
    modal: {
        isAddJournalTitleOpen: false,
        isUpgradeStorageOpen: false,
    },
    options: {
        assessments: [
            { value: null, title: 'None' },
            { value: 'no risk', title: 'No risk' },
            { value: 'increased risk', title: 'Increased risk' },
            { value: 'acute increased risk', title: 'Acute increased risk' },
        ] as any,
        citizens: [] as any,
        journal_titles: [],
    },
    usePredefinedJournalTitle: false,
})

onMounted(() => {
    fetchAllCitizens()
    fetchAllJournalTitles()
})

const rules = computed(() => {
    return {
        formRiskAssessment: {
            citizen_uuid: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            title: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            date: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formRiskAssessment)
    }
}

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
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
        params.append('citizen_uuid', String(state.formRiskAssessment.citizen_uuid))
        const response = await journalService.uploadJournalFile(params)
        if (response) {
            state.formRiskAssessment.note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
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

function NoteUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new NoteUploadAdapter(loader)
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
            params.append('citizen_uuid', String(state.formRiskAssessment.citizen_uuid))
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

async function fetchAllCitizens() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName
        }
        const response = await citizenService.getAllCitizens(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (citizen: any) => options.push({
                    value: citizen?.uuid,
                    label: citizen?.firstname + " " + (citizen?.lastname ?? ''),
                    green: citizen?.green,
                    yellow: citizen?.yellow,
                    red: citizen?.red,
                })
            )
            options.shift()
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllJournalTitles() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await journalTitleService.getAllJournalTitles()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.title,
                    label: item?.title,
                })
            )
            state.options.journal_titles = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function generateNoteForRiskAssessmentNote() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            citizen_uuid: state.formRiskAssessment.citizen_uuid,
            prompt: state.formRiskAssessment.note,
        }
        const response = await aIAssistantService.generateNote(params)
        if (response?.data) {
            state.formRiskAssessment.note = response?.data?.answer
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}
</script>

<style>
#formRiskAssessment .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>