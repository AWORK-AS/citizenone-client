<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error && props.error.length > 0 || props.error?.message" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('reportTemplates.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('reportTemplates.form.name')"
                    v-model="state.form.name" />
                <FormError :error="v$?.form?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="case_type_uuid" :label="$t('reportTemplates.form.agreementType')" />
                <FormSelect id="case_type_uuid" name="case_type_uuid" :options="state.options.caseTypes"
                    v-model="state.form.case_type_uuid" />
                <FormError :error="props?.error?.errors?.case_type_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="body" :label="$t('reportTemplates.form.body')" />
                <ckeditor :editor="editor" v-model="state.form.body" :config="editorConfig" />
                <FormError :error="props?.error?.errors?.body?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.form.is_active = !state.form.is_active">
                    <FormCheckbox :value="state.form.is_active" />
                    {{ $t('reportTemplates.form.isActive') }}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel"
                    @click="navigateTo('/settings/report-templates')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') : $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { employmentService } from '@/components/api/user/EmploymentService'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
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
    selectedTemplate: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['submitForm'])

const { t } = useI18n()
const editor = ref(ClassicEditor)
const editorConfig = ref({ height: 400 })

const state = reactive({
    options: {
        caseTypes: [] as any[],
    },
    form: {
        name: '',
        case_type_uuid: '',
        body: '',
        is_active: true,
    },
})

watch(() => props.selectedTemplate, (newValue: any) => {
    if (newValue != null) {
        state.form = {
            name: newValue.name ?? '',
            case_type_uuid: newValue.case_type?.uuid ?? '',
            body: newValue.body ?? '',
            is_active: newValue.is_active ?? true,
        }
    }
}, { immediate: true })

const rules = computed(() => ({
    form: {
        name: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchCaseTypes()
})

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        const payload: any = { ...state.form }
        if (!payload.case_type_uuid) delete payload.case_type_uuid
        emit('submitForm', payload)
    }
}

async function fetchCaseTypes() {
    try {
        const response = await employmentService.getAllCaseTypes()
        if (response?.data) {
            state.options.caseTypes = response.data.map((c: any) => ({ value: c.uuid, label: c.name }))
        }
    } catch {}
}
</script>
