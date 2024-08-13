<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="grid grid-cols-2 gap-x-3">
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
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('citizens.citizenJournals.form.content') }}
                </p>
                <ckeditor :editor="editor" v-model="state.formJournal.content" :config="editorConfig"></ckeditor>
                <FormError :error="v$?.formJournal?.content?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.content?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('citizens.citizenJournals.form.assessment') }}
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
                <ckeditor :editor="editor" v-model="state.formJournal.note" :config="editorConfig"></ckeditor>
                <FormError :error="props?.error?.errors?.note?.[0]" />
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
    </form>
</template>

<script setup lang="ts">
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
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
    selectedJournal: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const editor = ref(ClassicEditor);
const editorConfig = ref({
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
    formJournal: {
        id: '',
        uuid: '',
        content: '',
        date: '',
        title: '',
        is_draft: false,
        assessment: null,
        note: ''
    },
    options: {
        assessments: [
            { value: null, title: 'None' },
            { value: 'no risk', title: 'No risk' },
            { value: 'increased risk', title: 'Increased risk' },
            { value: 'acute increased risk', title: 'Acute increased risk' },
        ]
    }
})

onMounted(() => {
    state.formJournal = {
        id: props.selectedJournal.id,
        uuid: props.selectedJournal.uuid,
        content: props.selectedJournal.content,
        date: props.selectedJournal.date,
        title: props.selectedJournal.title,
        is_draft: props.selectedJournal.is_draft,
        assessment: props.selectedJournal.assessment,
        note: props.selectedJournal.note === null ? '' : props.selectedJournal.note,
    }
})

watch(() => props.selectedJournal, (newValue: any) => {
    if (newValue != null) {
        state.formJournal = {
            id: newValue.id,
            uuid: newValue.uuid,
            content: newValue.content,
            date: newValue.date,
            title: newValue.title,
            is_draft: newValue.is_draft,
            assessment: newValue.assessment,
            note: newValue.note === null ? '' : newValue.note,
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
            content: {
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
</script>