<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <!-- Template selector -->
            <div class="space-y-1">
                <FormLabel for="template_uuid" :label="$t('citizens.treatments.form.template')" />
                <FormSelect id="template_uuid" :options="templateOptions" v-model="state.formTreatment.template_uuid" />
                <!-- Field configuration preview -->
                <div v-if="activeTemplate"
                    class="mt-2 flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <span v-for="field in templateFields" :key="field.key" :class="[
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xxs font-medium',
                        activeTemplate[field.key] === 'required'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-200 text-gray-500',
                    ]">
                        {{ field.label }}
                        <span class="font-normal opacity-75">
                            · {{ activeTemplate[field.key] === 'required'
                                ? $t('citizens.treatments.form.required')
                                : $t('citizens.treatments.form.optional') }}
                        </span>
                    </span>
                </div>
            </div>

            <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                    <FormLabel for="area_type" :label="$t('citizens.treatments.form.areaTypes.areaType')"
                        class="mb-0" />
                    <span v-if="getFieldConfig('area_type')"
                        :class="getFieldConfig('area_type') === 'required' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'"
                        class="inline-flex items-center rounded-full px-1.5 py-0.5 text-xxs font-medium">
                        {{ getFieldConfig('area_type') === 'required' ? $t('citizens.treatments.form.required') :
                            $t('citizens.treatments.form.optional') }}
                    </span>
                </div>
                <FormSelect id="area_type" :options="state.options.area_types"
                    v-model="state.formTreatment.area_type" />
                <FormError :error="v$?.formTreatment?.area_type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.area_type?.[0]" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-1.5">
                        <FormLabel for="name" :label="$t('citizens.treatments.form.titleOfTheTreatment')"
                            class="mb-0" />
                        <span v-if="getFieldConfig('title')"
                            :class="getFieldConfig('title') === 'required' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'"
                            class="inline-flex items-center rounded-full px-1.5 py-0.5 text-xxs font-medium">
                            {{ getFieldConfig('title') === 'required' ? $t('citizens.treatments.form.required') :
                                $t('citizens.treatments.form.optional') }}
                        </span>
                    </div>
                    <FormTextField id="name" name="name"
                        :placeholder="$t('citizens.treatments.form.titleOfTheTreatment')"
                        v-model="state.formTreatment.name" />
                    <FormError :error="v$?.formTreatment?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex items-center gap-1.5">
                        <FormLabel for="completion_date" :label="$t('citizens.treatments.form.completionDate')"
                            class="mb-0" />
                        <span v-if="getFieldConfig('completion_date')"
                            :class="getFieldConfig('completion_date') === 'required' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'"
                            class="inline-flex items-center rounded-full px-1.5 py-0.5 text-xxs font-medium">
                            {{ getFieldConfig('completion_date') === 'required' ?
                                $t('citizens.treatments.form.required') : $t('citizens.treatments.form.optional') }}
                        </span>
                    </div>
                    <FormDateField id="completion_date" name="completion_date"
                        :placeholder="$t('citizens.treatments.form.completionDate')"
                        v-model="state.formTreatment.completion_date" />
                    <FormError :error="v$?.formTreatment?.completion_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.completion_date?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                    <p class="text-sm text-gray-600">{{ $t('citizens.treatments.form.expectedLevels.expectedLevel') }}
                    </p>
                    <span v-if="getFieldConfig('score')"
                        :class="getFieldConfig('score') === 'required' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'"
                        class="inline-flex items-center rounded-full px-1.5 py-0.5 text-xxs font-medium">
                        {{ getFieldConfig('score') === 'required' ? $t('citizens.treatments.form.required') :
                            $t('citizens.treatments.form.optional') }}
                    </span>
                </div>
                <FormSelect id="score" :options="state.options.scores" v-model="state.formTreatment.score" />
                <FormError :error="v$?.formTreatment?.score?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.score?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                    <p class="text-sm text-gray-600">{{ $t('citizens.treatments.form.description') }}</p>
                    <span v-if="getFieldConfig('description')"
                        :class="getFieldConfig('description') === 'required' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'"
                        class="inline-flex items-center rounded-full px-1.5 py-0.5 text-xxs font-medium">
                        {{ getFieldConfig('description') === 'required' ? $t('citizens.treatments.form.required') :
                            $t('citizens.treatments.form.optional') }}
                    </span>
                </div>
                <ckeditor :editor="editor" v-model="state.formTreatment.description" :config="editorDescriptionConfig">
                </ckeditor>
                <FormError :error="v$?.formTreatment?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div v-if="props.formType === 'update'">
                <div class="w-fit flex items-center cursor-pointer" @click="changeIsCompletedCheckbox">
                    <FormCheckbox :value="state.formTreatment.is_completed" />
                    {{ $t('citizens.treatments.form.completed') }}
                </div>
            </div>
            <div class="space-y-1" v-if="state.formTreatment.is_completed">
                <FormLabel for="date_completed" :label="$t('citizens.treatments.form.dateCompleted')" />
                <FormDateField id="date_completed" name="date_completed"
                    :placeholder="$t('citizens.treatments.form.dateCompleted')"
                    v-model="state.formTreatment.date_completed" />
                <FormError :error="v$?.formTreatment?.date_completed?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_completed?.[0]" />
            </div>
            <div class="w-fit flex items-center cursor-pointer"
                @click="state.formTreatment.enable_reminder = !state.formTreatment.enable_reminder">
                <FormCheckbox :value="state.formTreatment.enable_reminder" />
                {{ $t('citizens.treatments.form.enableReminder') }}
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="w-full">
                    {{ props.formType === 'create' ? $t('save') : $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { treatmentTemplateService } from '@/components/api/user/TreatmentTemplateService'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedTreatment: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()
const editor = ref(ClassicEditor)
const editorDescriptionConfig = ref({
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
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
    height: 500,
}) as any

// Template fields that can be configured as required/optional
const templateFields = computed(() => [
    { key: 'area_type', label: t('citizens.treatments.form.areaTypes.areaType') },
    { key: 'title', label: t('citizens.treatments.form.titleOfTheTreatment') },
    { key: 'completion_date', label: t('citizens.treatments.form.completionDate') },
    { key: 'score', label: t('citizens.treatments.form.expectedLevels.expectedLevel') },
    { key: 'description', label: t('citizens.treatments.form.description') },
])

const state = reactive({
    formTreatment: {
        template_uuid: '',
        id: '',
        uuid: '',
        area_type: '',
        name: '',
        description: '',
        completion_date: '',
        date_completed: '',
        is_completed: false,
        score: '',
        enable_reminder: false,
    } as any,
    templates: [] as any[],
    options: {
        area_types: [
            { value: 'functional_level', label: `${t('citizens.treatments.form.areaTypes.functionalLevel')}` },
            { value: 'musculoskeletal_system', label: `${t('citizens.treatments.form.areaTypes.musculoskeletalSystem')}` },
            { value: 'nutrition', label: `${t('citizens.treatments.form.areaTypes.nutrition')}` },
            { value: 'skin_and_mucous_membranes', label: `${t('citizens.treatments.form.areaTypes.skinAndMucousMembranes')}` },
            { value: 'communication', label: `${t('citizens.treatments.form.areaTypes.communication')}` },
            { value: 'psychosocial_conditions', label: `${t('citizens.treatments.form.areaTypes.psychosocialConditions')}` },
            { value: 'respiration_and_circulation', label: `${t('citizens.treatments.form.areaTypes.respirationAndCirculation')}` },
            { value: 'sexuality', label: `${t('citizens.treatments.form.areaTypes.sexuality')}` },
            { value: 'pain_and_sensory_impressions', label: `${t('citizens.treatments.form.areaTypes.painAndSensoryImpressions')}` },
            { value: 'sleep_and_rest', label: `${t('citizens.treatments.form.areaTypes.sleepAndRest')}` },
            { value: 'knowledge_and_development', label: `${t('citizens.treatments.form.areaTypes.knowledgeAndDevelopment')}` },
            { value: 'excretion_of_waste', label: `${t('citizens.treatments.form.areaTypes.excretionOfWaste')}` },
        ],
        scores: [
            { value: 1, label: `1. ${t('citizens.treatments.form.expectedLevels.minorChallenges')}` },
            { value: 2, label: `2. ${t('citizens.treatments.form.expectedLevels.moderateChallenges')}` },
            { value: 3, label: `3. ${t('citizens.treatments.form.expectedLevels.significantChallenges')}` },
            { value: 4, label: `4. ${t('citizens.treatments.form.expectedLevels.severeChallenges')}` },
            { value: 5, label: `5. ${t('citizens.treatments.form.expectedLevels.verySubstantialChallenges')}` },
        ],
    },
})

// Resolved active template object
const activeTemplate = computed(() =>
    state.templates.find((tpl: any) => tpl.uuid === state.formTreatment.template_uuid) ?? null
)

// Select options including "No template" option
const templateOptions = computed(() => [
    { value: '', label: t('citizens.treatments.form.selectTemplate') },
    ...state.templates.map((tpl: any) => ({ value: tpl.uuid, label: tpl.name })),
])

// Returns 'required' | 'optional' | null for a given field key
function getFieldConfig(field: string): string | null {
    return activeTemplate.value ? (activeTemplate.value[field] ?? 'optional') : null
}

onMounted(async () => {
    await fetchTemplates()
    state.formTreatment = {
        id: props.selectedTreatment.id,
        uuid: props.selectedTreatment.uuid,
        area_type: props.selectedTreatment.area_type,
        name: props.selectedTreatment.name,
        description: props.selectedTreatment.description ?? '',
        completion_date: props.selectedTreatment.completion_date,
        date_completed: props.selectedTreatment.date_completed,
        is_completed: props.selectedTreatment.is_completed ? true : false,
        score: props.selectedTreatment.score,
        enable_reminder: props.selectedTreatment.enable_reminder ? true : false,
        template_uuid: props.selectedTreatment.template?.uuid ?? '',
    }
    if (props.selectedTreatment.date_completed) {
        state.formTreatment.is_completed = true
    } else {
        state.formTreatment.is_completed = false
    }
})

watch(() => props.selectedTreatment, (newValue: any) => {
    if (newValue != null) {
        state.formTreatment = {
            id: newValue.id,
            uuid: newValue.uuid,
            area_type: newValue.area_type,
            name: newValue.name,
            description: newValue.description ?? '',
            completion_date: newValue.completion_date,
            date_completed: newValue.date_completed,
            is_completed: newValue.is_completed,
            score: newValue.score,
            enable_reminder: newValue.enable_reminder,
            template_uuid: newValue.template_uuid ?? '',
        }
    }
})

async function fetchTemplates() {
    try {
        const response = await treatmentTemplateService.getAllTemplates()
        if (response) {
            state.templates = response?.data ?? response ?? []
        }
    } catch {
        // silently fail — form still works without templates
    }
}

// Dynamic validation: a field is required if explicitly marked required in the active template,
// or if no template is selected and it's always-required (name, completion_date).
function fieldRule(field: string) {
    const config = getFieldConfig(field)
    if (config === 'required') {
        return { required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required) }
    }
    return {}
}

// name is always required unless a template marks it optional; same for completion_date
function alwaysOrTemplateRule(field: string, templateKey: string) {
    const config = getFieldConfig(templateKey)
    if (config === null || config === 'required') {
        // no template selected → always required; or explicitly required in template
        return { required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required) }
    }
    return {}
}

const rules = computed(() => {
    if (state.formTreatment.is_completed) {
        return {
            formTreatment: {
                name: alwaysOrTemplateRule('name', 'title'),
                date_completed: { required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required) },
                area_type: fieldRule('area_type'),
                score: fieldRule('score'),
                description: fieldRule('description'),
            },
        }
    } else {
        return {
            formTreatment: {
                name: alwaysOrTemplateRule('name', 'title'),
                completion_date: alwaysOrTemplateRule('completion_date', 'completion_date'),
                area_type: fieldRule('area_type'),
                score: fieldRule('score'),
                description: fieldRule('description'),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formTreatment)
    }
}

function changeIsCompletedCheckbox() {
    state.formTreatment.is_completed = !state.formTreatment.is_completed
    state.formTreatment.date_completed = ''
}
</script>
