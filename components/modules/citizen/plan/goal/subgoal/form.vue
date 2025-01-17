<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="grid grid-cols-2 gap-x-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('plansandgoals.form.subgoalName')" />
                    <FormTextField id="name" name="name" :placeholder="$t('plansandgoals.form.subgoalName')"
                        v-model="state.formSubgoal.name" />
                    <FormError :error="v$?.formSubgoal?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="completion_date" :label="$t('plansandgoals.form.completionDate')" />
                    <FormDateField id="completion_date" name="completion_date"
                        :placeholder="$t('plansandgoals.form.completionDate')"
                        v-model="state.formSubgoal.completion_date" />
                    <FormError :error="v$?.formSubgoal?.completion_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.completion_date?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="score" :label="$t('plansandgoals.form.expectedLevels.expectedLevel')" />
                <FormSelect id="score" :options="state.options.scores" v-model="state.formSubgoal.score" />
                <FormError :error="v$?.formSubgoal?.score?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.score?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('plansandgoals.form.description') }}
                </p>
                <ckeditor :editor="editor" v-model="state.formSubgoal.description" :config="editorDescriptionConfig">
                </ckeditor>
                <FormError :error="v$?.formSubgoal?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div v-if="props.formType === 'update'">
                <div class="w-fit flex items-center cursor-pointer" @click="changeIsCompletedCheckbox">
                    <FormCheckbox :value="state.formSubgoal.is_completed" />
                    {{ $t('plansandgoals.form.completed') }}
                </div>
            </div>
            <div class="space-y-1" v-if="state.formSubgoal.is_completed">
                <FormLabel for="date_completed" :label="$t('plansandgoals.form.dateCompleted')" />
                <FormDateField id="date_completed" name="date_completed"
                    :placeholder="$t('plansandgoals.form.dateCompleted')" v-model="state.formSubgoal.date_completed" />
                <FormError :error="v$?.formSubgoal?.date_completed?.$errors[0]?.$message.toString()" />
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
    selectedSubgoal: {
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
    formSubgoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        status: '',
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
    state.formSubgoal = {
        id: props.selectedSubgoal.id,
        uuid: props.selectedSubgoal.uuid,
        name: props.selectedSubgoal.name,
        description: props.selectedSubgoal.description ?? '',
        status: props.selectedSubgoal.status,
        completion_date: props.selectedSubgoal.completion_date,
        date_completed: props.selectedSubgoal.date_completed,
        is_completed: props.selectedSubgoal.is_completed,
        score: props.selectedSubgoal.score,
    }
    if (props.selectedSubgoal.date_completed) {
        state.formSubgoal.is_completed = true
    } else {
        state.formSubgoal.is_completed = false
    }
})

watch(() => props.selectedSubgoal, (newValue: any) => {
    if (newValue != null) {
        state.formSubgoal = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            description: newValue.description ?? '',
            status: newValue.status,
            completion_date: newValue.completion_date,
            date_completed: newValue.date_completed,
            is_completed: newValue.is_completed,
            score: newValue.score,
        }
    }
})

const rules = computed(() => {
    return {
        formSubgoal: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            completion_date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            score: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formSubgoal)
    }
}

function changeIsCompletedCheckbox() {
    state.formSubgoal.is_completed = !state.formSubgoal.is_completed
    state.formSubgoal.date_completed = ''
}
</script>