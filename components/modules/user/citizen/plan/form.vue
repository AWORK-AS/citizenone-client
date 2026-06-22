<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="space-y-3">
            <div class="w-fit flex items-center cursor-pointer"
                @click="state.formPlan.is_use_template = !state.formPlan.is_use_template"
                v-if="props.formType === 'create'">
                <FormCheckbox :value="state.formPlan.is_use_template" />
                {{ $t('plansandgoals.form.useTemplate') }}
            </div>
            <div v-if="state.formPlan.is_use_template">
                <div class="space-y-3">
                    <div class="space-y-1">
                        <FormLabel for="template" :label="$t('plansandgoals.form.template')" />
                        <FormSelect id="template" :options="state.options.templates"
                            v-model="state.formPlan.template" />
                        <FormError :error="v$?.formPlan?.template?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.template_uuid?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="plan_completion_date" :label="$t('plansandgoals.form.planCompletionDate')" />
                        <FormDateField id="plan_completion_date" name="plan_completion_date"
                            :placeholder="$t('plansandgoals.form.planCompletionDate')"
                            v-model="state.formPlan.plan_completion_date" />
                        <FormError :error="v$?.formPlan?.plan_completion_date?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.plan_completion_date?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="goal_completion_date" :label="$t('plansandgoals.form.goalCompletionDate')" />
                        <FormDateField id="goal_completion_date" name="goal_completion_date"
                            :placeholder="$t('plansandgoals.form.goalCompletionDate')"
                            v-model="state.formPlan.goal_completion_date" />
                        <FormError :error="v$?.formPlan?.goal_completion_date?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.goal_completion_date?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="subgoal_completion_date"
                            :label="$t('plansandgoals.form.subgoalCompletionDate')" />
                        <FormDateField id="subgoal_completion_date" name="subgoal_completion_date"
                            :placeholder="$t('plansandgoals.form.subgoalCompletionDate')"
                            v-model="state.formPlan.subgoal_completion_date" />
                        <FormError :error="v$?.formPlan?.subgoal_completion_date?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.subgoal_completion_date?.[0]" />
                    </div>
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formPlan.enable_reminder = !state.formPlan.enable_reminder">
                        <FormCheckbox :value="state.formPlan.enable_reminder" />
                        {{ $t('plansandgoals.form.enableReminder') }}
                    </div>
                </div>
            </div>
            <div class="space-y-3" v-else>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="name" :label="$t('plansandgoals.form.planName')" />
                        <FormTextField id="name" name="name" :placeholder="$t('plansandgoals.form.planName')"
                            v-model="state.formPlan.name" />
                        <FormError :error="v$?.formPlan?.name?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.name?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="completion_date" :label="$t('plansandgoals.form.completionDate')" />
                        <FormDateField id="completion_date" name="completion_date"
                            :placeholder="$t('plansandgoals.form.completionDate')"
                            v-model="state.formPlan.completion_date" />
                        <FormError :error="v$?.formPlan?.completion_date?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.completion_date?.[0]" />
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="score" :label="$t('plansandgoals.form.expectedLevels.expectedLevel')" />
                    <FormSelect id="score" :options="state.options.scores" v-model="state.formPlan.score" />
                    <FormError :error="v$?.formPlan?.score?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.score?.[0]" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ $t('plansandgoals.form.description') }}
                    </p>
                    <ckeditor :editor="editor" v-model="state.formPlan.description" :config="editorDescriptionConfig">
                    </ckeditor>
                    <FormError :error="v$?.formPlan?.description?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.description?.[0]" />
                </div>
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formPlan.enable_reminder = !state.formPlan.enable_reminder">
                    <FormCheckbox :value="state.formPlan.enable_reminder" />
                    {{ $t('plansandgoals.form.enableReminder') }}
                </div>
                <div v-if="props.formType === 'update'">
                    <div class="w-fit flex items-center cursor-pointer" @click="changeIsCompletedCheckbox">
                        <FormCheckbox :value="state.formPlan.is_completed" />
                        {{ $t('plansandgoals.form.completed') }}
                    </div>
                </div>
                <div class="space-y-1" v-if="state.formPlan.is_completed">
                    <FormLabel for="date_completed" :label="$t('plansandgoals.form.dateCompleted')" />
                    <FormDateField id="date_completed" name="date_completed"
                        :placeholder="$t('plansandgoals.form.dateCompleted')" v-model="state.formPlan.date_completed" />
                    <FormError :error="v$?.formPlan?.date_completed?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_completed?.[0]" />
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
    </form>
</template>

<script setup lang="ts">
import { planGoalSubgoalTemplateService } from '@/components/api/user/PlanGoalSubgoalTemplateService'
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
    selectedPlan: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['closeModal', 'submitForm', 'isPageLoading'])
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
    error: {} as Error,
    formPlan: {
        id: '',
        uuid: '',
        name: '',
        completion_date: '',
        score: '',
        description: '',
        enable_reminder: false,
        date_completed: '',
        is_completed: false,
        is_use_template: false,
        template: '',
        plan_completion_date: '',
        goal_completion_date: '',
        subgoal_completion_date: '',
    },
    options: {
        templates: [] as any,
        scores: [
            { value: 1, label: `1. ${t('plansandgoals.form.expectedLevels.minorChallenges')}` },
            { value: 2, label: `2. ${t('plansandgoals.form.expectedLevels.moderateChallenges')}` },
            { value: 3, label: `3. ${t('plansandgoals.form.expectedLevels.significantChallenges')}` },
            { value: 4, label: `4. ${t('plansandgoals.form.expectedLevels.severeChallenges')}` },
            { value: 5, label: `5. ${t('plansandgoals.form.expectedLevels.verySubstantialChallenges')}` },
        ],
    }
})

onMounted(() => {
    state.formPlan = {
        id: props.selectedPlan.id,
        uuid: props.selectedPlan.uuid,
        name: props.selectedPlan.name,
        completion_date: props.selectedPlan.completion_date,
        score: props.selectedPlan.score,
        description: props.selectedPlan.description ?? '',
        enable_reminder: props.selectedPlan.enable_reminder ? true : false,
        date_completed: props.selectedPlan.date_completed,
        is_completed: props.selectedPlan.is_completed,
        is_use_template: false,
        template: '',
        plan_completion_date: '',
        goal_completion_date: '',
        subgoal_completion_date: '',
    }
    fetchTemplates()
})

watch(() => props.selectedPlan, (newValue: any) => {
    if (newValue != null) {
        state.formPlan = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            completion_date: newValue.completion_date,
            score: newValue.score,
            description: newValue.description ?? '',
            enable_reminder: newValue.enable_reminder ? true : false,
            date_completed: newValue.date_completed,
            is_completed: newValue.is_completed,
            is_use_template: false,
            template: '',
            plan_completion_date: '',
            goal_completion_date: '',
            subgoal_completion_date: '',
        }
    }
})

const rules = computed(() => {
    if (state.formPlan.is_use_template) {
        return {
            formPlan: {
                template: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                plan_completion_date: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                goal_completion_date: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                subgoal_completion_date: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formPlan: {
                name: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                completion_date: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formPlan)
    }
}

async function fetchTemplates() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await planGoalSubgoalTemplateService.getAllTemplates()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.templates = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

function changeIsCompletedCheckbox() {
    state.formPlan.is_completed = !state.formPlan.is_completed
    state.formPlan.date_completed = ''
}
</script>