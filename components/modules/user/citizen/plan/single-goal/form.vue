<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('plansandgoals.form.goalName')" />
                    <FormTextField id="name" name="name" :placeholder="$t('plansandgoals.form.goalName')"
                        v-model="state.formGoal.name" />
                    <FormError :error="v$?.formGoal?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="completion_date" :label="$t('plansandgoals.form.completionDate')" />
                    <FormDateField id="completion_date" name="completion_date"
                        :placeholder="$t('plansandgoals.form.completionDate')"
                        v-model="state.formGoal.completion_date" />
                    <FormError :error="v$?.formGoal?.completion_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.completion_date?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="score" :label="$t('plansandgoals.form.expectedLevels.expectedLevel')" />
                <FormSelect id="score" :options="state.options.scores" v-model="state.formGoal.score" />
                <FormError :error="v$?.formGoal?.score?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.score?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('plansandgoals.form.description') }}
                </p>
                <ckeditor :editor="editor" v-model="state.formGoal.description" :config="editorDescriptionConfig">
                </ckeditor>
                <FormError :error="v$?.formGoal?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="w-fit flex items-center cursor-pointer"
                @click="state.formGoal.enable_reminder = !state.formGoal.enable_reminder">
                <FormCheckbox :value="state.formGoal.enable_reminder" />
                {{ $t('plansandgoals.form.enableReminder') }}
            </div>
            <div v-if="props.formType === 'update'">
                <div class="w-fit flex items-center cursor-pointer" @click="changeIsCompletedCheckbox">
                    <FormCheckbox :value="state.formGoal.is_completed" />
                    {{ $t('plansandgoals.form.completed') }}
                </div>
            </div>
            <div class="space-y-1" v-if="state.formGoal.is_completed">
                <FormLabel for="date_completed" :label="$t('plansandgoals.form.dateCompleted')" />
                <FormDateField id="date_completed" name="date_completed"
                    :placeholder="$t('plansandgoals.form.dateCompleted')" v-model="state.formGoal.date_completed" />
                <FormError :error="v$?.formGoal?.date_completed?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_completed?.[0]" />
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
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
        ]
    },
    height: 500  // Set the editor height here
}) as any

const state = reactive({
    formGoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        enable_reminder: false,
        completion_date: '',
        date_completed: '',
        is_completed: false,
        score: '',
    },
    options: {
        scores: [
            { value: 1, label: `1. ${t('plansandgoals.form.expectedLevels.minorChallenges')}` },
            { value: 2, label: `2. ${t('plansandgoals.form.expectedLevels.moderateChallenges')}` },
            { value: 3, label: `3. ${t('plansandgoals.form.expectedLevels.significantChallenges')}` },
            { value: 4, label: `4. ${t('plansandgoals.form.expectedLevels.severeChallenges')}` },
            { value: 5, label: `5. ${t('plansandgoals.form.expectedLevels.verySubstantialChallenges')}` },
        ],
    },
})

onMounted(() => {
    state.formGoal = {
        id: props.selectedGoal.id,
        uuid: props.selectedGoal.uuid,
        name: props.selectedGoal.name,
        description: props.selectedGoal.description ?? '',
        enable_reminder: props.selectedGoal.enable_reminder,
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
            name: newValue.name,
            description: newValue.description ?? '',
            enable_reminder: newValue.enable_reminder,
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
            name: {
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