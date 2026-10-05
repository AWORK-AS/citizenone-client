<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('inquiryForms.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('inquiryForms.title') }}</template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-2xl text-sm text-gray-500">
                    {{ $t('inquiryForms.description') }}
                </p>

                <div class="rounded-lg border border-gray-200 bg-white">
                    <div v-if="canManage" class="flex flex-wrap items-end gap-3 border-b border-gray-100 px-4 py-3">
                        <div class="w-64">
                            <FormLabel for="new-form-name" :label="$t('inquiryForms.form.name')" />
                            <FormTextField id="new-form-name" name="new-form-name" v-model="state.draft.name"
                                :placeholder="$t('inquiryForms.form.namePlaceholder')" :maxLength="120" />
                        </div>
                        <div class="w-56" v-if="state.serviceTypes.length">
                            <FormLabel for="new-form-type" :label="$t('inquiryForms.form.serviceType')" />
                            <FormSelect id="new-form-type" :options="serviceTypeOptions"
                                v-model="state.draft.serviceTypeUuid" />
                        </div>
                        <Tooltip :text="$t('inquiryForms.addHint')">
                            <FormButton type="button" buttonStyle="action" :disabled="!state.draft.name.trim()"
                                @click="add">
                                <Icon name="ph:plus" class="size-4" />
                                {{ $t('inquiryForms.add') }}
                            </FormButton>
                        </Tooltip>
                    </div>

                    <div v-for="(form, index) in state.forms" :key="form.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <template v-if="state.editing === form.uuid">
                                <div class="w-64">
                                    <FormTextField :id="`form-name-${form.uuid}`" :name="`form-name-${form.uuid}`"
                                        v-model="state.edit.name" :placeholder="form.name ?? ''" :maxLength="120" />
                                </div>
                            </template>
                            <div v-else class="flex flex-wrap items-center gap-2">
                                <p class="text-sm font-medium text-gray-900"
                                    :class="!form.is_active && 'text-gray-400 line-through'">
                                    {{ formLabel(form, builtinNames) }}
                                </p>
                                <Tooltip v-if="form.builtin" :text="$t('inquiryForms.builtinHint')">
                                    <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                                        {{ $t('inquiryForms.builtin') }}
                                    </span>
                                </Tooltip>
                                <Tooltip v-if="form.service_type" :text="$t('inquiryForms.serviceTypeHint')">
                                    <span class="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                        {{ form.service_type.label }}
                                    </span>
                                </Tooltip>
                                <span class="text-xs text-gray-400">
                                    {{ $t('inquiryForms.fieldCount', { count: form.core_fields.length }) }}
                                </span>
                            </div>
                        </div>

                        <div v-if="canManage" class="flex items-center gap-2">
                            <template v-if="state.editing === form.uuid">
                                <FormButton type="button" buttonStyle="cancel" @click="state.editing = ''">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" :disabled="!state.edit.name.trim()"
                                    @click="rename(form)">
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
                                        :disabled="index === state.forms.length - 1"
                                        :aria-label="$t('inquiryPipelineStages.actions.moveDown')"
                                        @click="move(index, 1)">
                                        <Icon name="ph:arrow-down" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="form.is_active ? $t('inquiryForms.actions.switchOff') : $t('inquiryForms.actions.switchOn')">
                                    <FormButton type="button" buttonStyle="action"
                                        :aria-label="form.is_active ? $t('inquiryForms.actions.switchOff') : $t('inquiryForms.actions.switchOn')"
                                        @click="toggleActive(form)">
                                        <Icon :name="form.is_active ? 'ph:eye' : 'ph:eye-slash'" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('inquiryForms.actions.fields')">
                                    <FormButton type="button" buttonStyle="action"
                                        :aria-label="$t('inquiryForms.actions.fields')" @click="toggleFields(form)">
                                        <Icon name="ph:list-checks" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip v-if="pipelineEnabled" :text="$t('inquiryForms.actions.ownFields')">
                                    <FormButton type="button" buttonStyle="action"
                                        :aria-label="$t('inquiryForms.actions.ownFields')"
                                        @click="navigateTo(`/settings/inquiry-fields?form=${form.uuid}`)">
                                        <Icon name="ph:textbox" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <template v-if="!form.builtin">
                                    <Tooltip :text="$t('inquiryForms.actions.rename')">
                                        <FormButton type="button" buttonStyle="action"
                                            :aria-label="$t('inquiryForms.actions.rename')" @click="startRename(form)">
                                            <Icon name="ph:pencil-simple" class="size-4" />
                                        </FormButton>
                                    </Tooltip>
                                    <Tooltip :text="$t('inquiryForms.actions.delete')">
                                        <FormButton type="button" buttonStyle="danger"
                                            :aria-label="$t('inquiryForms.actions.delete')" @click="confirmDelete(form)">
                                            <Icon name="ph:trash" class="size-4" />
                                        </FormButton>
                                    </Tooltip>
                                </template>
                            </template>
                        </div>

                        <!-- The built-in fields the form asks for. What every inquiry
                             needs, and on the built-in forms what the § 110/§ 109
                             registration reads, stay ticked and cannot be taken off. -->
                        <div v-if="state.fieldsFor === form.uuid" class="w-full rounded-md bg-gray-50 px-4 py-3">
                            <p class="mb-2 text-xs text-gray-500">{{ $t('inquiryForms.fields.hint') }}</p>
                            <div class="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                                <label v-for="field in form.available_core_fields" :key="field"
                                    class="flex items-center gap-2 text-sm text-slate-700"
                                    :class="lockReason(form, field) ? 'cursor-default' : 'cursor-pointer'">
                                    <input type="checkbox"
                                        class="size-4 rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-60"
                                        :checked="state.selection.includes(field)"
                                        :disabled="!!lockReason(form, field)"
                                        @change="toggleSelection(form, field)" />
                                    {{ fieldLabel(field) }}
                                    <Tooltip v-if="lockReason(form, field)"
                                        :text="lockReason(form, field) === 'registration'
                                            ? $t('inquiryForms.fields.lockedRegistration')
                                            : $t('inquiryForms.fields.lockedAlways')">
                                        <Icon name="ph:lock-simple" class="size-3.5 text-slate-400"
                                            :aria-label="$t('inquiryForms.fields.locked')" />
                                    </Tooltip>
                                </label>
                            </div>
                            <div class="mt-3 flex items-center gap-2">
                                <FormButton type="button" buttonStyle="cancel" @click="state.fieldsFor = ''">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" @click="saveFields(form)">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.isDeleteOpen"
                :message="$t('inquiryForms.confirmation.delete') + '?'" @close="state.isDeleteOpen = false"
                @confirm="remove" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries' })

import { inquiryFormService } from '@/components/api/user/InquiryFormService'
import { inquiryServiceTypeService } from '@/components/api/user/InquiryServiceTypeService'
import { useAlert } from '@/composables/alert'
import { formLabel, lockReason, toggleField, type InquiryForm } from '@/composables/inquiryForms'
import { CORE_FIELD_LABELS } from '@/composables/inquiryCoreFieldLabels'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const { isAtLeast, can } = usePermissions()

const breadcrumbLinks = [
    {
        name: 'inquiryForms.title',
        translate: true,
        href: '/settings/inquiry-forms',
    },
]

const canManage = computed(() => isAtLeast('Admin') || can('update'))
const pipelineEnabled = computed(() => !!userStore.getUser?.company?.inquiry_pipeline_enabled)

const builtinNames = computed(() => ({
    shelter: customPagesStore.getCustomPagesName?.shelter || t('inquiries.form.options.inquiryType.shelter'),
    crisisCenter: customPagesStore.getCustomPagesName?.crisisCenter || t('inquiries.form.options.inquiryType.crisisCenter'),
}))

const state = reactive({
    error: {} as Error,
    forms: [] as InquiryForm[],
    serviceTypes: [] as any[],
    draft: { name: '', serviceTypeUuid: null as string | null },
    edit: { name: '' },
    editing: '',
    fieldsFor: '',
    selection: [] as string[],
    isDeleteOpen: false,
    selected: null as InquiryForm | null,
})

const serviceTypeOptions = computed(() => [
    { value: null, label: t('inquiryForms.form.noServiceType') },
    ...state.serviceTypes.map((type: any) => ({ value: type.uuid, label: type.label })),
])

onMounted(() => {
    fetchForms()
    if (pipelineEnabled.value) {
        fetchServiceTypes()
    }
})

async function fetchForms() {
    state.error = {}
    try {
        const response = await inquiryFormService.getForms()
        state.forms = response?.data ?? []
    } catch (error: any) {
        state.error = error
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

function fieldLabel(field: string): string {
    const key = CORE_FIELD_LABELS[field]

    return key ? t(key) : field
}

async function add() {
    try {
        const response = await inquiryFormService.saveForm({
            name: state.draft.name.trim(),
            service_type_uuid: state.draft.serviceTypeUuid,
        })
        state.draft = { name: '', serviceTypeUuid: null }
        await fetchForms()
        // A new form asks for almost nothing, so open its fields straight away.
        const created = state.forms.find((form) => form.uuid === response?.data?.uuid)
        if (created) toggleFields(created)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.errors?.name?.[0] ?? error?.message ?? t('inquiryForms.alert.saveFailed'))
    }
}

function toggleFields(form: InquiryForm) {
    if (state.fieldsFor === form.uuid) {
        state.fieldsFor = ''

        return
    }

    state.fieldsFor = form.uuid
    state.selection = [...form.core_fields]
}

function toggleSelection(form: InquiryForm, field: string) {
    state.selection = toggleField({ ...form, core_fields: state.selection }, field)
}

async function saveFields(form: InquiryForm) {
    try {
        await inquiryFormService.updateForm(form.uuid, { core_fields: [...state.selection] })
        state.fieldsFor = ''
        await fetchForms()
        successAlert(`${t('alert.success')}!`, `${t('inquiryForms.fields.saved')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryForms.alert.saveFailed'))
    }
}

function startRename(form: InquiryForm) {
    state.editing = form.uuid
    state.edit = { name: form.name ?? '' }
}

async function rename(form: InquiryForm) {
    try {
        await inquiryFormService.updateForm(form.uuid, { name: state.edit.name.trim() })
        state.editing = ''
        await fetchForms()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryForms.alert.saveFailed'))
    }
}

async function toggleActive(form: InquiryForm) {
    try {
        await inquiryFormService.updateForm(form.uuid, { is_active: !form.is_active })
        await fetchForms()
    } catch (error: any) {
        state.error = error
    }
}

function confirmDelete(form: InquiryForm) {
    state.selected = form
    state.isDeleteOpen = true
}

async function remove() {
    state.isDeleteOpen = false
    if (!state.selected) return

    try {
        await inquiryFormService.deleteForm(state.selected.uuid)
        await fetchForms()
        successAlert(`${t('alert.success')}!`, `${t('inquiryForms.alert.deleted')}.`)
    } catch (error: any) {
        // The refusal carries the counts and says to switch it off instead.
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryForms.alert.deleteFailed'))
    }
}

async function move(index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= state.forms.length) return

    const reordered = [...state.forms]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    state.forms = reordered

    try {
        const response = await inquiryFormService.reorderForms(reordered.map((form) => form.uuid))
        state.forms = response?.data ?? reordered
    } catch (error: any) {
        state.error = error
        fetchForms()
    }
}
</script>
