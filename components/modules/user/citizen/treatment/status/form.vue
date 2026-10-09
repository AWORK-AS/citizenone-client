<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div v-if="props.formType === 'create'" class="mb-3">
            <FormButton type="button" buttonStyle="secondary" buttonSize="xs" @click="emit('fetchPreviousStatus')">
                {{ $t('citizens.treatments.statuses.form.getFromPreviousStatus') }}
            </FormButton>
        </div>
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="date" :label="$t('citizens.treatments.statuses.form.date')" />
                <FormDateField id="date" name="date" :placeholder="$t('citizens.treatments.statuses.form.date')"
                    v-model="state.formStatus.date" />
                <FormError :error="v$?.formStatus?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
            </div>
            <div class="space-y-1" v-if="careAreaText">
                <FormLabel for="area_type" :label="$t('citizens.treatments.statuses.form.careArea')" />
                <p id="area_type" data-testid="status-care-area"
                    class="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700">
                    {{ careAreaText }}
                </p>
                <p class="text-xs text-gray-500">{{ $t('citizens.treatments.statuses.form.careAreaInherited') }}</p>
            </div>
            <div class="space-y-1">
                <FormLabel for="score" :label="$t('citizens.treatments.statuses.form.currentLevels.currentLevel')" />
                <FormSelect id="score" :options="state.options.scores" v-model="state.formStatus.score" />
                <FormError :error="v$?.formStatus?.score?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.score?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('citizens.treatments.statuses.form.status') }}
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
import ClassicEditor from '@/utils/editor'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { careAreaLabel } from '@/composables/careAreaOptions'
import { defaultCareNoteTemplate, isUnfilledTemplate } from '@/composables/careNoteTemplate'

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
    careArea: {
        type: String,
        required: false,
        default: '',
    },
    statusTemplate: {
        type: String,
        required: false,
        default: '',
    },
})
const emit = defineEmits(['closeModal', 'submitForm', 'fetchPreviousStatus'])
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

// The care area belongs to the health case; it is shown read-only and never sent.
const careAreaText = computed(() => careAreaLabel(props.careArea || props.selectedStatus?.area_type, t))

const state = reactive({
    formStatus: {
        date: '',
        score: '',
        status: '',
    },
    options: {
        scores: [
            { value: 1, label: `1. ${t('citizens.treatments.statuses.form.currentLevels.minorChallenges')}` },
            { value: 2, label: `2. ${t('citizens.treatments.statuses.form.currentLevels.moderateChallenges')}` },
            { value: 3, label: `3. ${t('citizens.treatments.statuses.form.currentLevels.significantChallenges')}` },
            { value: 4, label: `4. ${t('citizens.treatments.statuses.form.currentLevels.severeChallenges')}` },
            { value: 5, label: `5. ${t('citizens.treatments.statuses.form.currentLevels.verySubstantialChallenges')}` },
        ]
    },
})

onMounted(() => {
    state.formStatus = {
        date: props.selectedStatus.date,
        score: props.selectedStatus.score,
        status: props.selectedStatus.status,
    }
})

watch(() => props.selectedStatus, (newValue: any) => {
    if (newValue != null) {
        state.formStatus = {
            date: newValue.date,
            score: newValue.score,
            status: newValue.status,
        }
    }
})

const rules = computed(() => {
    return {
        formStatus: {
            date: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            status: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                template: helpers.withMessage(
                    () => `${t('validation.pleaseCompleteTemplate')}.`,
                    (value: string) => props.formType !== 'create'
                        || !isUnfilledTemplate(value, props.statusTemplate || defaultCareNoteTemplate(t)),
                ),
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