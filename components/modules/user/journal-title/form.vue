<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-1">
            <FormLabel for="title" :label="$t('journalTitles.form.title')" />
            <FormTextField id="title" name="title" :placeholder="$t('journalTitles.form.title')"
                v-model="state.formJournalTitle.title" />
            <FormError :error="v$?.formJournalTitle?.title?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.title?.[0]" />
        </div>

        <div class="mt-6 space-y-3">
            <div class="flex items-center justify-between">
                <FormLabel :label="$t('journalTitles.form.fields')" />
                <button type="button"
                    class="text-sm text-primary hover:text-primary-700 flex items-center gap-x-1"
                    @click="addField">
                    <Icon name="ph:plus" size="16" />
                    {{ $t('journalTitles.form.addField') }}
                </button>
            </div>

            <div v-if="state.formJournalTitle.journal_fields.length === 0"
                class="text-sm text-gray-400 italic">
                {{ $t('journalTitles.form.noFieldsYet') }}
            </div>

            <div v-for="(field, index) in state.formJournalTitle.journal_fields" :key="index"
                class="border border-gray-200 rounded-md p-3 space-y-2 bg-gray-50">
                <div class="flex items-start gap-x-2">
                    <div class="flex-1 space-y-1">
                        <FormLabel :for="`field_label_${index}`" :label="$t('journalTitles.form.fieldLabel')" />
                        <FormTextField :id="`field_label_${index}`"
                            :name="`field_label_${index}`"
                            :placeholder="$t('journalTitles.form.fieldLabelPlaceholder')"
                            v-model="field.label" />
                    </div>
                    <div class="w-36 space-y-1">
                        <FormLabel :for="`field_type_${index}`" :label="$t('journalTitles.form.fieldType')" />
                        <FormSelect :options="fieldTypeOptions"
                            v-model="field.field_type" />
                    </div>
                    <div class="flex flex-col items-center pt-6">
                        <button type="button" class="text-red-500 hover:text-red-700"
                            @click="removeField(index)">
                            <Icon name="ph:trash" size="18" />
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-x-2 cursor-pointer w-fit"
                    @click="field.is_required = !field.is_required">
                    <FormCheckbox :id="`field_required_${index}`" :value="field.is_required" />
                    <span class="text-sm text-gray-600">{{ $t('journalTitles.form.required') }}</span>
                </div>
            </div>
        </div>

        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/settings/journal-titles')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
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
    selectedJournalTitle: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const fieldTypeOptions = [
    { value: 'text', label: t('journalTitles.form.fieldTypeText') },
    { value: 'textarea', label: t('journalTitles.form.fieldTypeTextarea') },
]

const state = reactive({
    error: {} as Error,
    formJournalTitle: {
        title: '',
        journal_fields: [] as Array<{ uuid: string | null, label: string, field_type: string, is_required: boolean }>,
    },
})

watch(() => props.selectedJournalTitle, (newValue: any) => {
    if (newValue != null) {
        state.formJournalTitle = {
            title: newValue.title,
            journal_fields: (newValue.journal_fields ?? []).map((f: any) => ({
                uuid: f.uuid ?? null,
                label: f.label ?? '',
                field_type: f.field_type ?? 'text',
                is_required: !!f.is_required,
            })),
        }
    }
})

function addField() {
    state.formJournalTitle.journal_fields.push({
        uuid: null,
        label: '',
        field_type: 'text',
        is_required: false,
    })
}

function removeField(index: number) {
    state.formJournalTitle.journal_fields.splice(index, 1)
}

const rules = computed(() => {
    return {
        formJournalTitle: {
            title: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        const payload = {
            title: state.formJournalTitle.title,
            journal_fields: state.formJournalTitle.journal_fields.map((f, i) => ({
                uuid: f.uuid,
                label: f.label,
                field_type: f.field_type,
                is_required: f.is_required,
                field_order: i,
            })),
        }
        emit('submitForm', payload)
    }
}
</script>
