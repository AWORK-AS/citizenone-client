<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('plansandgoals.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('plansandgoals.form.title')"
                    v-model="state.formStatus.title" />
                <FormError :error="v$?.formStatus?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="score" :label="$t('plansandgoals.form.currentLevel')" />
                <FormSelect id="score" :options="state.options.scores" v-model="state.formStatus.score" />
                <FormError :error="v$?.formStatus?.score?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.score?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('plansandgoals.form.notes') }}
                </p>
                <ckeditor :editor="editor" v-model="state.formStatus.status" :config="editorStatusConfig"></ckeditor>
                <FormError :error="v$?.formStatus?.status?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.status?.[0]" />
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
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
        ]
    },
    height: 500  // Set the editor height here
}) as any

const state = reactive({
    formStatus: {
        title: '',
        score: '',
        status: '',
    },
    options: {
        scores: [
            { value: 1, label: `1. ${t('plansandgoals.form.expectedLevels.minorChallenges')}` },
            { value: 2, label: `2. ${t('plansandgoals.form.expectedLevels.moderateChallenges')}` },
            { value: 3, label: `3. ${t('plansandgoals.form.expectedLevels.significantChallenges')}` },
            { value: 4, label: `4. ${t('plansandgoals.form.expectedLevels.severeChallenges')}` },
            { value: 5, label: `5. ${t('plansandgoals.form.expectedLevels.verySubstantialChallenges')}` },
        ]
    },
})

onMounted(() => {
    state.formStatus = {
        title: props.selectedStatus.title,
        score: props.selectedStatus.score,
        status: props.selectedStatus.status,
    }
})

watch(() => props.selectedStatus, (newValue: any) => {
    if (newValue != null) {
        state.formStatus = {
            title: newValue.title,
            score: newValue.score,
            status: newValue.status,
        }
    }
})

const rules = computed(() => {
    return {
        formStatus: {
            title: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            status: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
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