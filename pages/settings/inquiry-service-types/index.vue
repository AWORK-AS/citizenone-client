<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('inquiryServiceTypes.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('inquiryServiceTypes.title') }}</template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-2xl text-sm text-gray-500">
                    {{ $t('inquiryServiceTypes.description') }}
                </p>

                <div class="rounded-lg border border-gray-200 bg-white">
                    <div class="flex flex-wrap items-end gap-3 border-b border-gray-100 px-4 py-3">
                        <div class="w-64">
                            <FormLabel for="new-name" :label="$t('inquiryServiceTypes.form.name')" />
                            <FormTextField id="new-name" name="new-name" v-model="state.draft.name"
                                :placeholder="$t('inquiryServiceTypes.form.namePlaceholder')" :maxLength="120" />
                        </div>
                        <div class="w-44">
                            <FormLabel for="new-paragraph" :label="$t('inquiryServiceTypes.form.paragraph')" />
                            <FormTextField id="new-paragraph" name="new-paragraph" v-model="state.draft.paragraph"
                                :placeholder="$t('inquiryServiceTypes.form.paragraphPlaceholder')" :maxLength="60" />
                        </div>
                        <FormButton type="button" buttonStyle="action" :disabled="!state.draft.name.trim()"
                            @click="add">
                            <Icon name="ph:plus" class="size-4" />
                            {{ $t('inquiryServiceTypes.add') }}
                        </FormButton>
                    </div>

                    <p v-if="!state.types.length" class="px-4 py-5 text-sm text-gray-400">
                        {{ $t('inquiryServiceTypes.empty') }}
                    </p>

                    <div v-for="(type, index) in state.types" :key="type.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <template v-if="state.editing === type.uuid">
                                <div class="flex flex-wrap gap-3">
                                    <div class="w-56">
                                        <FormTextField :id="`name-${type.uuid}`" :name="`name-${type.uuid}`"
                                            v-model="state.edit.name" :placeholder="type.name" :maxLength="120" />
                                    </div>
                                    <div class="w-40">
                                        <FormTextField :id="`par-${type.uuid}`" :name="`par-${type.uuid}`"
                                            v-model="state.edit.paragraph"
                                            :placeholder="$t('inquiryServiceTypes.form.paragraphPlaceholder')"
                                            :maxLength="60" />
                                    </div>
                                </div>
                            </template>
                            <p v-else class="text-sm font-medium text-gray-900"
                                :class="!type.is_active && 'text-gray-400 line-through'">
                                {{ type.label }}
                            </p>
                        </div>

                        <div class="flex items-center gap-2">
                            <template v-if="state.editing === type.uuid">
                                <FormButton type="button" buttonStyle="cancel" @click="state.editing = ''">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" :disabled="!state.edit.name.trim()"
                                    @click="save(type)">
                                    {{ $t('save') }}
                                </FormButton>
                            </template>
                            <template v-else>
                                <Tooltip :text="$t('inquiryPipelineStages.actions.moveUp')">
                                    <FormButton type="button" buttonStyle="action" :disabled="index === 0"
                                        :aria-label="$t('inquiryPipelineStages.actions.moveUp')"
                                        @click="move(index, -1)">
                                        <Icon name="ph:arrow-up" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('inquiryPipelineStages.actions.moveDown')">
                                    <FormButton type="button" buttonStyle="action"
                                        :disabled="index === state.types.length - 1"
                                        :aria-label="$t('inquiryPipelineStages.actions.moveDown')"
                                        @click="move(index, 1)">
                                        <Icon name="ph:arrow-down" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="type.is_active
                                    ? $t('consultantSkills.deactivate')
                                    : $t('consultantSkills.activate')">
                                    <FormButton type="button" buttonStyle="action"
                                        :aria-label="type.is_active
                                            ? $t('consultantSkills.deactivate')
                                            : $t('consultantSkills.activate')"
                                        @click="toggleActive(type)">
                                        <Icon :name="type.is_active ? 'ph:eye' : 'ph:eye-slash'" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('inquiryServiceTypes.fields.title')">
                                    <FormButton type="button" buttonStyle="action"
                                        :aria-label="$t('inquiryServiceTypes.fields.title')"
                                        @click="toggleFields(type)">
                                        <Icon name="ph:list-checks" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <FormButton type="button" buttonStyle="action" @click="startEdit(type)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </FormButton>
                                <FormButton type="button" buttonStyle="danger" @click="confirmDelete(type)">
                                    <Icon name="ph:trash" class="size-4" />
                                </FormButton>
                            </template>
                        </div>

                        <!-- Which built-in fields this kind of inquiry asks for. All of
                             them until somebody says otherwise, which is how every form
                             behaved before the setting existed. -->
                        <div v-if="state.fieldsFor === type.uuid" class="w-full rounded-md bg-gray-50 px-4 py-3">
                            <p class="mb-2 text-xs text-gray-500">{{ $t('inquiryServiceTypes.fields.hint') }}</p>
                            <div class="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                                <label v-for="field in availableFields(type)" :key="field"
                                    class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox"
                                        class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                        :value="field" v-model="state.fieldSelection" />
                                    {{ fieldLabel(field) }}
                                </label>
                            </div>
                            <div class="mt-3 flex items-center gap-2">
                                <FormButton type="button" buttonStyle="cancel" @click="state.fieldsFor = ''">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" @click="saveFields(type)">
                                    {{ $t('save') }}
                                </FormButton>
                                <button type="button" class="text-xs text-gray-500 hover:text-gray-800"
                                    @click="state.fieldSelection = [...availableFields(type)]">
                                    {{ $t('inquiryServiceTypes.fields.selectAll') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.isDeleteOpen"
                :message="$t('inquiryServiceTypes.confirmation.delete') + '?'" @close="state.isDeleteOpen = false"
                @confirm="remove" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

import { inquiryServiceTypeService } from '@/components/api/user/InquiryServiceTypeService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'inquiryServiceTypes.title',
        translate: true,
        href: '/settings/inquiry-service-types',
    },
]

const state = reactive({
    error: {} as Error,
    types: [] as any[],
    draft: { name: '', paragraph: '' },
    edit: { name: '', paragraph: '' },
    editing: '',
    fieldsFor: '',
    fieldSelection: [] as string[],
    isDeleteOpen: false,
    selected: null as any,
})

onMounted(() => {
    fetchTypes()
})

async function fetchTypes() {
    state.error = {}
    try {
        const response = await inquiryServiceTypeService.getServiceTypes()
        state.types = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

async function add() {
    try {
        await inquiryServiceTypeService.saveServiceType({
            name: state.draft.name.trim(),
            paragraph: state.draft.paragraph.trim() || null,
        })
        state.draft = { name: '', paragraph: '' }
        await fetchTypes()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.errors?.name?.[0] ?? error?.message ?? t('inquiryServiceTypes.alert.saveFailed'))
    }
}

/**
 * The built-in fields, labelled with the same strings the forms themselves use
 * rather than a second set that can drift away from them.
 */
const CORE_FIELD_LABELS: Record<string, string> = {
    inquiry_date: 'inquiries.form.dateOfInquiry',
    department_uuid: 'department.department',
    company_contact: 'inquiryContact.label',
    inquirer_name: 'inquiries.form.inquirerName',
    contacted_by: 'inquiries.form.crisisCenter.fields.contactedBy',

    first_name: 'inquiries.form.firstname',
    last_name: 'inquiries.form.lastname',
    cpr: 'inquiries.form.cpr',
    cpr_missing_reason: 'inquiries.form.shelter.fields.cprMissingReason',

    purpose: 'inquiries.form.purpose',
    outcome: 'inquiries.form.outcome',
    conversation_summary: 'inquiries.form.conversationSummary',
    notes: 'inquiries.form.notes',
    topic: 'inquiries.form.crisisCenter.fields.topic',
    guidance: 'inquiries.form.crisisCenter.fields.guidance',
    assessment: 'inquiries.form.crisisCenter.fields.assessment',
    assessment_reason: 'inquiries.form.crisisCenter.fields.notOfferedInterview',

    received_visit: 'inquiries.form.crisisCenter.fields.receivedVisit',

    in_shelter_target_group: 'inquiries.form.shelter.fields.inShelterTargetGroup',
    fits_in_target_group: 'inquiries.form.shelter.fields.fitsInTargetGroup',
    vacant_place_available: 'inquiries.form.shelter.fields.vacantPlaceAvailable',
    non_admission_reason: 'inquiries.form.shelter.fields.nonAdmissionReason',
    not_in_service_target_group_reason: 'inquiries.form.shelter.fields.notInServiceTargetGroupReason',
    referral_destination: 'inquiries.form.shelter.fields.referralDestination',
}

function availableFields(type: any): string[] {
    return type.available_core_fields ?? Object.keys(CORE_FIELD_LABELS)
}

function fieldLabel(field: string): string {
    const key = CORE_FIELD_LABELS[field]

    return key ? t(key) : field
}

function toggleFields(type: any) {
    if (state.fieldsFor === type.uuid) {
        state.fieldsFor = ''

        return
    }

    state.fieldsFor = type.uuid
    // Null means the form asks for everything, so that is what the boxes show.
    state.fieldSelection = type.core_fields ?? [...availableFields(type)]
}

async function saveFields(type: any) {
    try {
        await inquiryServiceTypeService.updateServiceType(type.uuid, {
            core_fields: [...state.fieldSelection],
        })
        state.fieldsFor = ''
        await fetchTypes()
        successAlert(`${t('alert.success')}!`, `${t('inquiryServiceTypes.fields.saved')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryServiceTypes.alert.saveFailed'))
    }
}

function startEdit(type: any) {
    state.editing = type.uuid
    state.edit = { name: type.name, paragraph: type.paragraph ?? '' }
}

async function save(type: any) {
    try {
        await inquiryServiceTypeService.updateServiceType(type.uuid, {
            name: state.edit.name.trim(),
            paragraph: state.edit.paragraph.trim() || null,
        })
        state.editing = ''
        await fetchTypes()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryServiceTypes.alert.saveFailed'))
    }
}

async function toggleActive(type: any) {
    try {
        await inquiryServiceTypeService.updateServiceType(type.uuid, { is_active: !type.is_active })
        await fetchTypes()
    } catch (error: any) {
        state.error = error
    }
}

function confirmDelete(type: any) {
    state.selected = type
    state.isDeleteOpen = true
}

async function remove() {
    state.isDeleteOpen = false
    try {
        await inquiryServiceTypeService.deleteServiceType(state.selected.uuid)
        await fetchTypes()
        successAlert(`${t('alert.success')}!`, `${t('inquiryServiceTypes.alert.deleted')}.`)
    } catch (error: any) {
        // The refusal carries the counts and says to deactivate instead.
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryServiceTypes.alert.deleteFailed'))
    }
}

async function move(index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= state.types.length) return

    const reordered = [...state.types]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    state.types = reordered

    try {
        const response = await inquiryServiceTypeService.reorderServiceTypes(reordered.map((item: any) => item.uuid))
        state.types = response?.data ?? reordered
    } catch (error: any) {
        state.error = error
        fetchTypes()
    }
}
</script>
