<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('inquiryFieldSettings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('inquiryFieldSettings.title') }}</template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-2xl text-sm text-gray-500">
                    {{ $t('inquiryFieldSettings.description') }}
                </p>

                <div class="flex justify-end">
                    <FormButton type="button" buttonStyle="action" @click="openNew">
                        <Icon name="ph:plus" class="size-4" />
                        {{ $t('inquiryFieldSettings.addField') }}
                    </FormButton>
                </div>

                <!-- Grouped by stage, because "which fields does this stage ask
                     for" is the question the page exists to answer. -->
                <div v-for="group in groups" :key="group.key"
                    class="rounded-lg border border-gray-200 bg-white">
                    <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                        <span v-if="group.color" class="size-[9px] rounded-[3px]" :style="{ background: group.color }" />
                        <p class="text-sm font-semibold text-gray-900">{{ group.title }}</p>
                        <span class="ml-auto text-xs text-gray-400">
                            {{ $t('inquiryFieldSettings.fieldCount', { count: group.fields.length }) }}
                        </span>
                    </div>

                    <p v-if="!group.fields.length" class="px-4 py-5 text-sm text-gray-400">
                        {{ $t('inquiryFieldSettings.noFieldsInStage') }}
                    </p>

                    <div v-for="(field, index) in group.fields" :key="field.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <p class="text-sm font-semibold text-gray-900" :class="!field.is_active && 'opacity-50'">
                                    {{ field.label }}
                                </p>
                                <span class="rounded-full bg-surface-100 px-2 py-px text-[11px] font-semibold text-slate-500">
                                    {{ $t('inquiryFieldSettings.types.' + field.type) }}
                                </span>
                                <span v-if="field.service_type"
                                    class="rounded-full bg-[#eee9fb] px-2 py-px text-[11px] font-semibold text-[#6b54c9]">
                                    {{ field.service_type.label }}
                                </span>
                                <Tooltip v-if="field.form" :text="$t('inquiryFieldSettings.form.formHint')">
                                    <span class="rounded-full bg-primary/10 px-2 py-px text-[11px] font-semibold text-primary">
                                        {{ formLabel(field.form, builtinNames) }}
                                    </span>
                                </Tooltip>
                                <span v-if="field.is_required"
                                    class="rounded-full bg-[#fdf3df] px-2 py-px text-[11px] font-bold text-[#8a6208]">
                                    {{ $t('inquiryFields.required') }}
                                </span>
                                <span v-if="!field.is_active"
                                    class="rounded-full bg-surface-100 px-2 py-px text-[11px] font-semibold text-slate-400">
                                    {{ $t('inquiryFieldSettings.inactive') }}
                                </span>
                            </div>
                            <p v-if="field.help_text" class="mt-0.5 truncate text-xs text-gray-400">
                                {{ field.help_text }}
                            </p>
                            <p v-if="field.options?.choices?.length" class="mt-0.5 truncate text-xs text-gray-400">
                                {{ field.options.choices.join(' · ') }}
                            </p>
                            <p v-else-if="field.type === 'scale'" class="mt-0.5 text-xs text-gray-400">
                                {{ field.options?.min ?? 1 }}–{{ field.options?.max ?? 5 }}
                            </p>
                        </div>

                        <div class="flex items-center gap-2">
                            <Tooltip :text="$t('inquiryPipelineStages.actions.moveUp')">
                                <FormButton type="button" buttonStyle="action" :disabled="index === 0"
                                    :aria-label="$t('inquiryPipelineStages.actions.moveUp')"
                                    @click="move(group, index, -1)">
                                    <Icon name="ph:arrow-up" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('inquiryPipelineStages.actions.moveDown')">
                                <FormButton type="button" buttonStyle="action"
                                    :disabled="index === group.fields.length - 1"
                                    :aria-label="$t('inquiryPipelineStages.actions.moveDown')"
                                    @click="move(group, index, 1)">
                                    <Icon name="ph:arrow-down" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <FormButton type="button" buttonStyle="action" @click="openEdit(field)">
                                <Icon name="ph:pencil-simple" class="size-4" />
                                {{ $t('inquiryFieldSettings.actions.edit') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="danger" @click="confirmDelete(field)">
                                <Icon name="ph:trash" class="size-4" />
                            </FormButton>
                        </div>
                    </div>
                </div>
            </div>

            <Modal size="md" :title="state.form.uuid
                ? $t('inquiryFieldSettings.editField')
                : $t('inquiryFieldSettings.addField')" :show="state.isFormOpen" @close="closeForm">
                <template #modal-body>
                    <div class="space-y-4">
                        <Alert type="danger" :text="state.formError?.message"
                            v-if="state.formError?.message && state.formError.message.length > 0" />

                        <div>
                            <FormLabel for="field-label" :label="$t('inquiryFieldSettings.form.label')" />
                            <FormTextField id="field-label" name="field-label" v-model="state.form.label"
                                :placeholder="$t('inquiryFieldSettings.form.labelPlaceholder')" :maxLength="120" />
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <FormLabel for="field-type" :label="$t('inquiryFieldSettings.form.type')" />
                                <!-- Fixed once the field exists, so it is shown rather
                                     than offered as a dropdown that cannot be used. -->
                                <template v-if="state.form.uuid">
                                    <p class="h-11 flex items-center rounded-lg border border-gray-200 bg-[#f6f9fa] px-4 text-sm font-semibold text-gray-700">
                                        {{ $t('inquiryFieldSettings.types.' + state.form.type) }}
                                    </p>
                                    <p class="mt-1 text-[11px] text-gray-400">
                                        {{ $t('inquiryFieldSettings.form.typeLocked') }}
                                    </p>
                                </template>
                                <FormSelect v-else id="field-type" v-model="state.form.type" :options="typeOptions"
                                    :canClear="false" :searchable="false" />
                            </div>
                            <div>
                                <FormLabel for="field-stage" :label="$t('inquiryFieldSettings.form.stage')" />
                                <FormSelect id="field-stage" v-model="state.form.stage_uuid" :options="stageOptions"
                                    :searchable="false" />
                                <p class="mt-1 text-[11px] text-gray-400">
                                    {{ $t('inquiryFieldSettings.form.stageHint') }}
                                </p>
                            </div>
                        </div>

                        <div v-if="state.form.type === 'lookup'">
                            <FormLabel for="field-source" :label="$t('inquiryFieldSettings.form.source')" />
                            <FormSelect id="field-source" v-model="state.form.source" :options="sourceOptions"
                                :canClear="false" :searchable="false" />
                            <p class="mt-1 text-[11px] text-gray-400">
                                {{ $t('inquiryFieldSettings.form.sourceHint') }}
                            </p>
                            <div class="mt-2 flex w-fit cursor-pointer items-center gap-2"
                                @click="state.form.multiple = !state.form.multiple">
                                <FormCheckbox :value="state.form.multiple" />
                                <span class="text-sm">{{ $t('inquiryFieldSettings.allowMultiple') }}</span>
                            </div>
                        </div>

                        <div>
                            <FormLabel for="field-service-type"
                                :label="$t('inquiryFieldSettings.form.serviceType')" />
                            <FormSelect id="field-service-type" v-model="state.form.service_type_uuid"
                                :options="serviceTypeOptions" :searchable="false" />
                            <p class="mt-1 text-[11px] text-gray-400">
                                {{ $t('inquiryFieldSettings.form.serviceTypeHint') }}
                            </p>
                        </div>

                        <div>
                            <FormLabel for="field-form" :label="$t('inquiryFieldSettings.form.form')" />
                            <FormSelect id="field-form" v-model="state.form.form_uuid"
                                :options="formOptions" :searchable="false" />
                            <p class="mt-1 text-[11px] text-gray-400">
                                {{ $t('inquiryFieldSettings.form.formHint') }}
                            </p>
                        </div>

                        <div v-if="isChoiceType">
                            <FormLabel for="field-choices" :label="$t('inquiryFieldSettings.form.choices')" />
                            <FormTextArea id="field-choices" name="field-choices" v-model="state.form.choicesText"
                                :placeholder="$t('inquiryFieldSettings.form.choicesPlaceholder')" :rows="5" />
                            <p class="mt-1 text-[11px] text-gray-400">
                                {{ $t('inquiryFieldSettings.form.choicesHint') }}
                            </p>
                        </div>

                        <div v-if="state.form.type === 'scale'">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <FormLabel for="field-min" :label="$t('inquiryFieldSettings.form.min')" />
                                    <FormTextField id="field-min" name="field-min" v-model="state.form.min"
                                        placeholder="1" />
                                </div>
                                <div>
                                    <FormLabel for="field-max" :label="$t('inquiryFieldSettings.form.max')" />
                                    <FormTextField id="field-max" name="field-max" v-model="state.form.max"
                                        placeholder="5" />
                                </div>
                            </div>
                            <div class="mt-2 flex w-fit cursor-pointer items-center gap-2"
                                @click="state.form.allow_half = !state.form.allow_half">
                                <FormCheckbox :value="state.form.allow_half" />
                                <span class="text-sm">{{ $t('inquiryFieldSettings.allowHalfSteps') }}</span>
                            </div>
                        </div>

                        <div>
                            <FormLabel for="field-help" :label="$t('inquiryFieldSettings.form.helpText')" />
                            <FormTextField id="field-help" name="field-help" v-model="state.form.help_text"
                                :placeholder="$t('inquiryFieldSettings.form.helpTextPlaceholder')" :maxLength="500" />
                        </div>

                        <div class="space-y-2">
                            <div class="flex w-fit cursor-pointer items-center gap-2"
                                @click="state.form.is_required = !state.form.is_required">
                                <FormCheckbox :value="state.form.is_required" />
                                <span class="text-sm">{{ $t('inquiryFieldSettings.form.isRequired') }}</span>
                            </div>
                            <p class="text-[11px] text-gray-400">
                                {{ $t('inquiryFieldSettings.form.isRequiredHint') }}
                            </p>
                            <div class="flex w-fit cursor-pointer items-center gap-2"
                                @click="state.form.is_active = !state.form.is_active">
                                <FormCheckbox :value="state.form.is_active" />
                                <span class="text-sm">{{ $t('inquiryFieldSettings.form.isActive') }}</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">
                            <FormButton type="button" buttonStyle="cancel" @click="closeForm">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="!canSubmit"
                                @click="submitForm">
                                {{ state.form.uuid ? $t('update') : $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.isDeleteOpen"
                :message="$t('inquiryFieldSettings.confirmation.delete') + '?'"
                @close="state.isDeleteOpen = false" @confirm="deleteField" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

import { inquiryFieldService } from '@/components/api/user/InquiryFieldService'
import { inquiryPipelineStageService } from '@/components/api/user/InquiryPipelineStageService'
import { inquiryServiceTypeService } from '@/components/api/user/InquiryServiceTypeService'
import { inquiryFormService } from '@/components/api/user/InquiryFormService'
import { formLabel } from '@/composables/inquiryForms'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'
import { useCustomPagesStore } from '@/store/custom-pages'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any

const breadcrumbLinks = [
    {
        name: 'inquiryFieldSettings.title',
        translate: true,
        href: '/settings/inquiry-fields',
    },
]

const TYPES = ['text', 'textarea', 'number', 'amount', 'date', 'select', 'multiselect', 'scale', 'boolean', 'lookup', 'risk']
const LOOKUP_SOURCES = [
    'municipalities', 'regions', 'departments', 'company_contacts',
    'spoken_languages', 'consultant_skills', 'consultant_skills_competence', 'consultant_skills_course',
    'consultant_skills_topic', 'inquiry_service_types', 'employees',
    'jobcenters', 'customer_departments', 'focus_areas', 'focus_areas_ics', 'rooms',
]
// A company that renamed its Rooms page (Memox: "Lokaler") sees its own name.
function sourceLabel(source: string) {
    const roomsName = source === 'rooms' ? customPagesStore.getCustomPagesName?.rooms : ''
    return roomsName || t('inquiryFieldSettings.sources.' + source)
}

const CHOICE_TYPES = ['select', 'multiselect']

function emptyForm() {
    return {
        uuid: '',
        label: '',
        type: 'text',
        stage_uuid: null as string | null,
        help_text: '',
        choicesText: '',
        min: '1',
        max: '5',
        allow_half: false,
        source: 'municipalities',
        multiple: false,
        service_type_uuid: null as string | null,
        form_uuid: null as string | null,
        is_required: false,
        is_active: true,
    }
}

const state = reactive({
    error: {} as Error,
    formError: {} as Error,
    fields: [] as any[],
    stages: [] as any[],
    serviceTypes: [] as any[],
    forms: [] as any[],
    isDeleteOpen: false,
    isFormOpen: false,
    selectedField: null as any,
    form: emptyForm(),
})

const typeOptions = computed(() =>
    TYPES.map((type) => ({ value: type, label: t('inquiryFieldSettings.types.' + type) }))
)

const stageOptions = computed(() => [
    { value: null, label: t('inquiryFields.appliesThroughout') },
    ...state.stages.map((stage: any) => ({ value: stage.uuid, label: stage.name })),
])

const isChoiceType = computed(() => CHOICE_TYPES.includes(state.form.type))

const sourceOptions = computed(() =>
    LOOKUP_SOURCES.map((source) => ({ value: source, label: sourceLabel(source) }))
)

const serviceTypeOptions = computed(() => [
    { value: null, label: t('inquiryFieldSettings.allServiceTypes') },
    ...state.serviceTypes.map((type: any) => ({ value: type.uuid, label: type.label })),
])

const builtinNames = computed(() => ({
    shelter: customPagesStore.getCustomPagesName?.shelter || t('inquiries.form.options.inquiryType.shelter'),
    crisisCenter: customPagesStore.getCustomPagesName?.crisisCenter || t('inquiries.form.options.inquiryType.crisisCenter'),
}))

const formOptions = computed(() => [
    { value: null, label: t('inquiryFieldSettings.allForms') },
    ...state.forms.map((form: any) => ({ value: form.uuid, label: formLabel(form, builtinNames.value) })),
])

// Opened from a form on Henvendelsesformularer: show that form's fields, and
// put a new field on it.
const route = useRoute()
const formFilter = computed(() => ((route.query as Record<string, any>).form as string) || null)

const canSubmit = computed(() => {
    if (!state.form.label.trim()) return false
    // A choice field with no choices cannot be answered, so the server refuses
    // it too - no reason to let the request leave.
    if (isChoiceType.value && parsedChoices().length === 0) return false
    // A lookup with no source would resolve to an empty list, so the server
    // refuses it as well.
    if (state.form.type === 'lookup' && !state.form.source) return false

    return true
})

// One group per stage in board order, plus the fields that apply throughout.
const groups = computed(() => {
    const shown = formFilter.value
        ? state.fields.filter((field: any) => !field.form || field.form.uuid === formFilter.value)
        : state.fields
    const byStage = (uuid: string | null) =>
        shown.filter((field: any) => (field.stage?.uuid ?? null) === uuid)

    return [
        {
            key: 'always',
            title: t('inquiryFields.appliesThroughout'),
            color: null,
            fields: byStage(null),
        },
        ...state.stages.map((stage: any) => ({
            key: stage.uuid,
            title: stage.name,
            color: stage.color,
            fields: byStage(stage.uuid),
        })),
    ]
})

onMounted(() => {
    fetchStages()
    fetchServiceTypes()
    fetchForms()
    fetchFields()
})

async function fetchForms() {
    try {
        const response = await inquiryFormService.getForms()
        state.forms = response?.data ?? []
    } catch (_) {
        state.forms = []
    }
}

async function fetchServiceTypes() {
    try {
        const response = await inquiryServiceTypeService.getServiceTypes()
        state.serviceTypes = (response?.data ?? []).filter((type: any) => type.is_active)
    } catch (_) {
        state.serviceTypes = []
    }
}

function parsedChoices() {
    return state.form.choicesText
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean)
}

async function fetchStages() {
    try {
        const response = await inquiryPipelineStageService.getStages()
        state.stages = response?.data ?? []
    } catch (_) {
        state.stages = []
    }
}

async function fetchFields() {
    state.error = {}
    try {
        const response = await inquiryFieldService.getDefinitions()
        state.fields = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

function openNew() {
    state.form = { ...emptyForm(), form_uuid: formFilter.value }
    state.formError = {}
    state.isFormOpen = true
}

function openEdit(field: any) {
    state.form = {
        uuid: field.uuid,
        label: field.label,
        type: field.type,
        stage_uuid: field.stage?.uuid ?? null,
        help_text: field.help_text ?? '',
        choicesText: (field.options?.choices ?? []).join('\n'),
        min: String(field.options?.min ?? 1),
        max: String(field.options?.max ?? 5),
        allow_half: !!field.options?.allow_half,
        source: field.options?.source ?? 'municipalities',
        multiple: !!field.options?.multiple,
        service_type_uuid: field.service_type?.uuid ?? null,
        form_uuid: field.form?.uuid ?? null,
        is_required: !!field.is_required,
        is_active: !!field.is_active,
    }
    state.formError = {}
    state.isFormOpen = true
}

function closeForm() {
    state.isFormOpen = false
    state.formError = {}
}

function payload() {
    const body: Record<string, any> = {
        label: state.form.label.trim(),
        stage_uuid: state.form.stage_uuid,
        help_text: state.form.help_text.trim() || null,
        is_required: state.form.is_required,
        is_active: state.form.is_active,
    }

    // The type is fixed after creation, so it is only sent when creating.
    if (!state.form.uuid) {
        body.type = state.form.type
    }

    body.service_type_uuid = state.form.service_type_uuid
    body.form_uuid = state.form.form_uuid

    if (isChoiceType.value) {
        body.options = { choices: parsedChoices() }
    } else if (state.form.type === 'lookup') {
        body.options = { source: state.form.source, multiple: state.form.multiple }
    } else if (state.form.type === 'scale') {
        body.options = {
            min: Number(state.form.min) || 1,
            max: Number(state.form.max) || 5,
            allow_half: state.form.allow_half,
        }
    }

    return body
}

async function submitForm() {
    state.formError = {}
    try {
        if (state.form.uuid) {
            await inquiryFieldService.updateDefinition(state.form.uuid, payload())
        } else {
            await inquiryFieldService.saveDefinition(payload())
        }
        closeForm()
        await fetchFields()
        successAlert(`${t('alert.success')}!`, `${t('inquiryFieldSettings.alert.saved')}.`)
    } catch (error: any) {
        state.formError = error
    }
}

function confirmDelete(field: any) {
    state.selectedField = field
    state.isDeleteOpen = true
}

async function deleteField() {
    state.isDeleteOpen = false
    try {
        await inquiryFieldService.deleteDefinition(state.selectedField.uuid)
        await fetchFields()
        successAlert(`${t('alert.success')}!`, `${t('inquiryFieldSettings.alert.deleted')}.`)
    } catch (error: any) {
        // The usual refusal is "this field has answers" - worth reading, so it
        // goes in an alert rather than a banner further up the page.
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryFieldSettings.alert.deleteFailed'))
    }
}

async function move(group: any, index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= group.fields.length) return

    const reordered = [...group.fields]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)

    // Order is stored across all fields, so the moved group's new order is sent
    // in place of its old one and every other group keeps its sequence.
    const uuids = groups.value.flatMap((candidate: any) =>
        (candidate.key === group.key ? reordered : candidate.fields).map((field: any) => field.uuid)
    )

    try {
        await inquiryFieldService.reorderDefinitions(uuids)
        await fetchFields()
    } catch (error: any) {
        state.error = error
    }
}
</script>
