<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-6">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('treatmentTemplates.form.name')" />
                <FormTextField id="name" name="name"
                    :placeholder="$t('treatmentTemplates.form.name')"
                    v-model="state.formTemplate.name" />
                <FormError :error="v$?.formTemplate?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>

            <div>
                <p class="text-sm font-medium text-gray-700 mb-3">
                    {{ $t('treatmentTemplates.form.fieldConfiguration') }}
                </p>
                <div class="overflow-hidden ring-1 ring-gray-200 rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                                    {{ $t('treatmentTemplates.form.field') }}
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                    {{ $t('treatmentTemplates.form.required') }}
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                    {{ $t('treatmentTemplates.form.optional') }}
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-100">
                            <tr v-for="field in templateFields" :key="field.key"
                                :class="state.formTemplate[field.key] === 'required' ? 'bg-red-50/40' : ''">
                                <td class="px-4 py-3 text-sm text-gray-700">
                                    {{ field.label }}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <input type="radio" :name="field.key" value="required"
                                        v-model="state.formTemplate[field.key]"
                                        class="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500 cursor-pointer" />
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <input type="radio" :name="field.key" value="optional"
                                        v-model="state.formTemplate[field.key]"
                                        class="h-4 w-4 text-primary border-gray-300 focus:ring-primary cursor-pointer" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="space-y-1">
                <FormLabel for="description_template" :label="$t('treatmentTemplates.form.descriptionTemplate')" />
                <p class="text-xs text-gray-500">{{ $t('treatmentTemplates.form.descriptionTemplateHint') }}</p>
                <ckeditor :editor="editor" v-model="state.formTemplate.description_template" :config="editorConfig">
                </ckeditor>
                <FormError :error="props?.error?.errors?.description_template?.[0]" />
            </div>

            <div class="space-y-1">
                <FormLabel for="status_template" :label="$t('treatmentTemplates.form.statusTemplate')" />
                <p class="text-xs text-gray-500">{{ $t('treatmentTemplates.form.statusTemplateHint') }}</p>
                <ckeditor :editor="editor" v-model="state.formTemplate.status_template" :config="editorConfig">
                </ckeditor>
                <FormError :error="props?.error?.errors?.status_template?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel"
                    @click="navigateTo('/settings/treatment-templates')">
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
import ClassicEditor from '@/utils/editor'
import { defaultCareNoteTemplate } from '@/composables/careNoteTemplate'
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
const emit = defineEmits(['submitForm'])
const { t } = useI18n()
const editor = ref(ClassicEditor)
const editorConfig = ref({
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
    height: 300,
}) as any

const templateFields = computed(() => [
    { key: 'area_type', label: t('citizens.treatments.form.areaTypes.areaType') },
    { key: 'title', label: t('citizens.treatments.form.titleOfTheTreatment') },
    { key: 'completion_date', label: t('citizens.treatments.form.completionDate') },
    { key: 'score', label: t('citizens.treatments.form.expectedLevels.expectedLevel') },
    { key: 'description', label: t('citizens.treatments.form.description') },
])

const state = reactive({
    formTemplate: {
        name: '',
        title: 'optional' as string,
        completion_date: 'optional' as string,
        area_type: 'optional' as string,
        score: 'optional' as string,
        description: 'optional' as string,
        description_template: '' as string,
        status_template: '' as string,
    } as Record<string, string>,
})

onMounted(() => {
    syncFromProps(props.selectedTemplate)
    if (props.formType === 'create') {
        state.formTemplate.description_template ||= defaultCareNoteTemplate(t)
        state.formTemplate.status_template ||= defaultCareNoteTemplate(t)
    }
})

watch(() => props.selectedTemplate, (newValue: any) => {
    if (newValue != null) {
        syncFromProps(newValue)
    }
})

function syncFromProps(tpl: any) {
    state.formTemplate = {
        name: tpl.name ?? '',
        title: tpl.title ?? 'optional',
        completion_date: tpl.completion_date ?? 'optional',
        area_type: tpl.area_type ?? 'optional',
        score: tpl.score ?? 'optional',
        description: tpl.description ?? 'optional',
        description_template: tpl.description_template ?? '',
        status_template: tpl.status_template ?? '',
    }
}

const rules = computed(() => ({
    formTemplate: {
        name: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formTemplate)
    }
}
</script>
