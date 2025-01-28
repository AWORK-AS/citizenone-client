<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="area_type" :label="$t('citizens.treatments.form.areaTypes.areaType')" />
                <FormSelect id="area_type" :options="state.options.area_types" v-model="state.formGoal.area_type" />
                <FormError :error="v$?.formGoal?.area_type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.area_type?.[0]" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="title" :label="$t('citizens.treatments.form.title')" />
                    <FormTextField id="title" name="title" :placeholder="$t('citizens.treatments.form.title')"
                        v-model="state.formGoal.title" />
                    <FormError :error="v$?.formGoal?.title?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.title?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="completion_date" :label="$t('citizens.treatments.form.completionDate')" />
                    <FormDateField id="completion_date" name="completion_date"
                        :placeholder="$t('citizens.treatments.form.completionDate')"
                        v-model="state.formGoal.completion_date" />
                    <FormError :error="v$?.formGoal?.completion_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.completion_date?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="score" :label="$t('citizens.treatments.form.expectedLevels.expectedLevel')" />
                <FormSelect id="score" :options="state.options.scores" v-model="state.formGoal.score" />
                <FormError :error="v$?.formGoal?.score?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.score?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('citizens.treatments.form.description') }}
                </p>
                <ckeditor :editor="editor" v-model="state.formGoal.description" :config="editorDescriptionConfig">
                </ckeditor>
                <FormError :error="v$?.formGoal?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div v-if="props.formType === 'update'">
                <div class="w-fit flex items-center cursor-pointer" @click="changeIsCompletedCheckbox">
                    <FormCheckbox :value="state.formGoal.is_completed" />
                    {{ $t('citizens.treatments.form.completed') }}
                </div>
            </div>
            <div class="space-y-1" v-if="state.formGoal.is_completed">
                <FormLabel for="date_completed" :label="$t('citizens.treatments.form.dateCompleted')" />
                <FormDateField id="date_completed" name="date_completed"
                    :placeholder="$t('citizens.treatments.form.dateCompleted')"
                    v-model="state.formGoal.date_completed" />
                <FormError :error="v$?.formGoal?.date_completed?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_completed?.[0]" />
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
    </form>
</template>

<script setup lang="ts">
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedGoal: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()
const editor = ref(ClassicEditor)
const editorDescriptionConfig = ref({
    // Add your custom configuration here
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
        ]
    },
    height: 500  // Set the editor height here
})

const state = reactive({
    formGoal: {
        id: '',
        uuid: '',
        area_type: '',
        title: '',
        description: '',
        completion_date: '',
        date_completed: '',
        is_completed: false,
        score: '',
    },
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

onMounted(() => {
    state.formGoal = {
        id: props.selectedGoal.id,
        uuid: props.selectedGoal.uuid,
        area_type: props.selectedGoal.area_type,
        title: props.selectedGoal.title,
        description: props.selectedGoal.description ?? '',
        completion_date: props.selectedGoal.completion_date,
        date_completed: props.selectedGoal.date_completed,
        is_completed: props.selectedGoal.is_completed,
        score: props.selectedGoal.score,
    }
    if (props.selectedGoal.date_completed) {
        state.formGoal.is_completed = true
    } else {
        state.formGoal.is_completed = false
    }
})

watch(() => props.selectedGoal, (newValue: any) => {
    if (newValue != null) {
        state.formGoal = {
            id: newValue.id,
            uuid: newValue.uuid,
            area_type: newValue.area_type,
            title: newValue.title,
            description: newValue.description ?? '',
            completion_date: newValue.completion_date,
            date_completed: newValue.date_completed,
            is_completed: newValue.is_completed,
            score: newValue.score,
        }
    }
})

const rules = computed(() => {
    return {
        formGoal: {
            title: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            completion_date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formGoal)
    }
}

function changeIsCompletedCheckbox() {
    state.formGoal.is_completed = !state.formGoal.is_completed
    state.formGoal.date_completed = ''
}
</script>