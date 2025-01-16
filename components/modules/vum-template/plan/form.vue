<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('plansandgoals.VUMTemplates.form.plan.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('plansandgoals.VUMTemplates.form.plan.name')"
                    v-model="state.formPlan.name" />
                <FormError :error="v$?.formPlan?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="completion_date" :label="$t('plansandgoals.VUMTemplates.form.plan.completionDate')" />
                <FormDateField id="completion_date" name="completion_date"
                    :placeholder="$t('plansandgoals.form.completionDate')" v-model="state.formPlan.completion_date" />
                <FormError :error="v$?.formPlan?.completion_date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.completion_date?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('plansandgoals.VUMTemplates.form.plan.description') }}
                </p>
                <ckeditor :editor="editor" v-model="state.formPlan.description" :config="editorDescriptionConfig">
                </ckeditor>
                <FormError :error="v$?.formPlan?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
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
    selectedTemplate: {
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
    formPlan: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
    },
})

onMounted(() => {
    state.formPlan = {
        id: props.selectedTemplate.id,
        uuid: props.selectedTemplate.uuid,
        name: props.selectedTemplate.name,
        description: props.selectedTemplate.description ?? '',
        completion_date: props.selectedTemplate.completion_date,
    }
})

watch(() => props.selectedTemplate, (newValue: any) => {
    if (newValue != null) {
        state.formPlan = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            description: newValue.description ?? '',
            completion_date: newValue.completion_date,
        }
    }
})

const rules = computed(() => {
    return {
        formPlan: {
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
        emit('submitForm', state.formPlan)
    }
}
</script>