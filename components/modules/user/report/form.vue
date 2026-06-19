<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error && props.error.length > 0 || props.error?.message" />
        <div class="grid grid-cols-1 gap-y-3">
            <div v-if="props.formType === 'create' && !props.citizenUuid" class="space-y-1">
                <FormLabel for="citizen_uuid" :label="$t('citizenReports.form.citizen')" />
                <FormSelect id="citizen_uuid" name="citizen_uuid" :options="state.options.citizens"
                    v-model="state.form.citizen_uuid" />
                <FormError :error="v$?.form?.citizen_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.citizen_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('citizenReports.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('citizenReports.form.title')"
                    v-model="state.form.title" />
                <FormError :error="v$?.form?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="report_template_uuid" :label="$t('citizenReports.form.template')" />
                <FormSelect id="report_template_uuid" name="report_template_uuid"
                    :options="state.options.templates"
                    v-model="state.form.report_template_uuid" />
                <FormError :error="props?.error?.errors?.report_template_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="case_type_uuid" :label="$t('citizenReports.form.agreementType')" />
                <FormSelect id="case_type_uuid" name="case_type_uuid" :options="state.options.caseTypes"
                    v-model="state.form.case_type_uuid" />
                <FormError :error="props?.error?.errors?.case_type_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="caseworker_uuid" :label="$t('citizenReports.form.caseworker')" />
                <FormSelect id="caseworker_uuid" name="caseworker_uuid" :options="state.options.users"
                    v-model="state.form.caseworker_uuid" />
                <FormError :error="props?.error?.errors?.caseworker_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="consultant_uuid" :label="$t('citizenReports.form.consultant')" />
                <FormSelect id="consultant_uuid" name="consultant_uuid" :options="state.options.users"
                    v-model="state.form.consultant_uuid" />
                <FormError :error="props?.error?.errors?.consultant_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="body" :label="$t('citizenReports.form.body')" />
                <p v-if="props.formType === 'create' && state.form.report_template_uuid" class="text-xs text-gray-500">
                    {{ $t('citizenReports.form.bodyTemplateHint') }}
                </p>
                <ckeditor :editor="editor" v-model="state.form.body" :config="editorConfig" />
                <FormError :error="props?.error?.errors?.body?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/reports')">
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
import { reportTemplateService } from '@/components/api/user/ReportTemplateService'
import { citizenService } from '@/components/api/user/CitizenService'
import { employeeService } from '@/components/api/user/EmployeeService'
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
    selectedReport: {
        type: Object,
        required: false,
    },
    citizenUuid: {
        type: String,
        required: false,
    },
})
const emit = defineEmits(['submitForm'])

const { t } = useI18n()
const editor = ref(ClassicEditor)
const editorConfig = ref({ height: 400 })

const state = reactive({
    options: {
        citizens: [] as any[],
        templates: [] as any[],
        users: [] as any[],
        caseTypes: [] as any[],
    },
    rawTemplates: [] as any[],
    form: {
        citizen_uuid: props.citizenUuid ?? '',
        title: '',
        report_template_uuid: '',
        case_type_uuid: '',
        body: '',
        caseworker_uuid: '',
        consultant_uuid: '',
    },
})

watch(() => props.selectedReport, (newValue: any) => {
    if (newValue != null) {
        state.form = {
            citizen_uuid: newValue.citizen?.uuid ?? props.citizenUuid ?? '',
            title: newValue.title ?? '',
            report_template_uuid: newValue.report_template?.uuid ?? '',
            case_type_uuid: newValue.case_type?.uuid ?? '',
            body: newValue.body ?? '',
            caseworker_uuid: newValue.caseworker?.uuid ?? '',
            consultant_uuid: newValue.consultant?.uuid ?? '',
        }
    }
}, { immediate: true })

watch(() => state.form.report_template_uuid, (uuid: string) => {
    if (!uuid || props.formType !== 'create') return
    const template = state.rawTemplates.find((t: any) => t.uuid === uuid)
    if (template?.body) {
        state.form.body = template.body
    }
})

const rules = computed(() => ({
    form: {
        citizen_uuid: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        title: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        const payload: any = { ...state.form }
        if (!payload.report_template_uuid) delete payload.report_template_uuid
        else delete payload.body
        if (!payload.caseworker_uuid) delete payload.caseworker_uuid
        if (!payload.consultant_uuid) delete payload.consultant_uuid
        if (!payload.case_type_uuid) delete payload.case_type_uuid
        if (!payload.body) delete payload.body
        emit('submitForm', payload)
    }
}

onMounted(() => {
    fetchTemplates()
    fetchUsers()
    fetchCaseTypes()
    if (props.formType === 'create' && !props.citizenUuid) {
        fetchCitizens()
    }
})

async function fetchTemplates() {
    try {
        const response = await reportTemplateService.getAllReportTemplates({ is_active: true })
        if (response?.data) {
            state.rawTemplates = response.data
            state.options.templates = response.data.map((t: any) => ({
                value: t.uuid,
                label: t.name + (t.case_type?.name ? ` (${t.case_type.name})` : ''),
            }))
        }
    } catch {}
}

async function fetchUsers() {
    try {
        const response = await employeeService.getEmployees({})
        if (response?.data) {
            state.options.users = [
                ...response.data.map((u: any) => ({
                    value: u.uuid,
                    label: u.firstname + ' ' + (u.lastname ?? ''),
                })),
            ]
        }
    } catch {}
}

async function fetchCitizens() {
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.options.citizens = response.data.map((c: any) => ({
                value: c.uuid,
                label: c.firstname + ' ' + (c.lastname ?? ''),
            }))
        }
    } catch {}
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
