<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="date" :label="$t('citizens.nursingAreas.statuses.form.date')" />
                <FormDateField id="date" name="date" :placeholder="$t('citizens.nursingAreas.statuses.form.date')"
                    v-model="state.formStatus.date" />
                <FormError :error="v$?.formStatus?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="area_type" :label="$t('citizens.nursingAreas.statuses.areaTypes.areaType')" />
                <FormSelect id="area_type" :options="state.options.area_types" v-model="state.formStatus.area_type" />
                <FormError :error="v$?.formStatus?.area_type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.area_type?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="score" :label="$t('citizens.nursingAreas.statuses.form.currentLevels.currentLevel')" />
                <FormSelect id="score" :options="state.options.scores" v-model="state.formStatus.score" />
                <FormError :error="v$?.formStatus?.score?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.score?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('citizens.nursingAreas.statuses.form.status') }}
                </p>
                <ckeditor :editor="editor" v-model="state.formStatus.status" :config="editorStatusConfig"></ckeditor>
                <FormError :error="v$?.formStatus?.status?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.status?.[0]" />
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
    selectedStatus: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()
const editor = ref(ClassicEditor)
const editorStatusConfig = ref({
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
}) as any

const state = reactive({
    formStatus: {
        date: '',
        area_type: '',
        score: '',
        status: '',
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
            { value: 1, label: `1. ${t('citizens.nursingAreas.statuses.form.currentLevels.minorChallenges')}` },
            { value: 2, label: `2. ${t('citizens.nursingAreas.statuses.form.currentLevels.moderateChallenges')}` },
            { value: 3, label: `3. ${t('citizens.nursingAreas.statuses.form.currentLevels.significantChallenges')}` },
            { value: 4, label: `4. ${t('citizens.nursingAreas.statuses.form.currentLevels.severeChallenges')}` },
            { value: 5, label: `5. ${t('citizens.nursingAreas.statuses.form.currentLevels.verySubstantialChallenges')}` },
        ]
    },
})

onMounted(() => {
    state.formStatus = {
        date: props.selectedStatus.date,
        area_type: props.selectedStatus.area_type,
        score: props.selectedStatus.score,
        status: props.selectedStatus.status,
    }
})

watch(() => props.selectedStatus, (newValue: any) => {
    if (newValue != null) {
        state.formStatus = {
            date: newValue.date,
            area_type: newValue.area_type,
            score: newValue.score,
            status: newValue.status,
        }
    }
})

const rules = computed(() => {
    return {
        formStatus: {
            date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            status: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formStatus)
    }
}
</script>