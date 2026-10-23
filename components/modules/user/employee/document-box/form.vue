<template>
    <form @submit.prevent="submitForm()" class="mt-6 space-y-3">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-1" v-if="props.formType === 'create'">
            <div class="flex flex-col items-center">
                <input type="file" ref="file" @change="onFileChange" class="hidden" />
                <div class="relative cursor-pointer" @click="triggerFileInput">
                    <Icon name="ic:outline-drive-folder-upload" class="h-36 w-36" aria-hidden="true" />
                    <div
                        class="rounded-full absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                        <div class="flex items-center w-full h-full justify-center text-xs">
                            {{ $t('selectFile') }}
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="state.formEmployeeDocument.file" class="mt-2 text-center text-sm text-gray-700">
                {{ state.formEmployeeDocument?.file?.name }}
            </div>
            <FormError :error="props?.error?.errors?.file?.[0]" class="text-center" />
        </div>
        <div class="space-y-1" v-if="props.formType === 'update'">
            <FormLabel for="name" :label="$t('employees.documents.form.name')" />
            <FormTextField id="name" name="name" :placeholder="$t('employees.documents.form.name')"
                v-model="state.formEmployeeDocument.name" />
            <FormError :error="v$?.formEmployeeDocument?.name?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.name?.[0]" />
        </div>
        <div class="space-y-1" v-if="props.dateField">
            <FormLabel :for="props.dateField" :label="$t(props.dateLabel)" />
            <FormDateField :id="props.dateField" :name="props.dateField" v-model="state.formEmployeeDocument.date" />
            <p v-if="props.dateHelp" class="text-xs text-gray-500">{{ $t(props.dateHelp) }}</p>
            <FormError :error="props?.error?.errors?.[props.dateField]?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="note" :label="$t('employees.documents.form.note')" />
            <FormTextArea id="note" name="note" :placeholder="$t('employees.documents.form.note')"
                v-model="state.formEmployeeDocument.note" />
            <FormError :error="props?.error?.errors?.note?.[0]" />
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
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
    selectedEmployeeDocument: {
        type: Object,
        required: false,
    },
    // Optional: the one date this box asks for, 'issued_at' (e.g. when a CV
    // was written) or 'expires_at' (e.g. a work permit's end date), with the
    // translation keys of its label and help text. Without it, no date.
    dateField: {
        type: String,
        default: '',
    },
    dateLabel: {
        type: String,
        default: '',
    },
    dateHelp: {
        type: String,
        default: '',
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])
const file = ref<HTMLInputElement | null>(null)
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formEmployeeDocument: {
        file: '',
        name: props.selectedEmployeeDocument?.name,
        note: props.selectedEmployeeDocument?.note,
        date: (props.dateField && props.selectedEmployeeDocument?.[props.dateField]) || '',
    } as any,
})

const rules = computed(() => {
    if (props.formType === 'update') {
        return {
            formEmployeeDocument: {
                name: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

watch(() => props.selectedEmployeeDocument, (newValue: any) => {
    if (newValue != null) {
        state.formEmployeeDocument = {
            file: '',
            name: newValue.name,
            note: newValue.note,
            date: (props.dateField && newValue[props.dateField]) || '',
        }
    }
})

function closeModal() {
    emit('closeModal')
}

function triggerFileInput() {
    if (file.value) {
        file.value.click()
    }
}

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formEmployeeDocument.file = event.target.files[0]
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formEmployeeDocument)
    }
}
</script>