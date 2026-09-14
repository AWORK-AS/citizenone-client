<template>
    <section v-if="state.fields.length" class="space-y-3.5">
        <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {{ $t('inquiryFields.additionalDetails') }}
        </h3>

        <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <div v-for="field in state.fields" :key="field.uuid" :class="isWide(field) ? 'sm:col-span-2' : ''">
                <div class="mb-1.5 flex items-center gap-1.5">
                    <p class="text-xs font-bold text-slate-500">{{ field.label }}</p>
                    <span v-if="field.is_required"
                        class="rounded-full bg-[#fdf3df] px-2 py-px text-[10px] font-bold text-[#8a6208]">
                        {{ $t('inquiryFields.required') }}
                    </span>
                </div>

                <div v-if="field.type === 'scale'" class="flex flex-wrap gap-1.5">
                    <button v-for="step in scaleSteps(field)" :key="step" type="button"
                        class="size-9 rounded-lg border text-[13px] font-bold transition-colors"
                        :class="String(draft[field.uuid]) === String(step)
                            ? 'border-secondary bg-secondary text-white'
                            : 'border-surface-200 bg-white text-slate-500 hover:bg-surface-50'"
                        @click="setValue(field, String(draft[field.uuid]) === String(step) ? null : step)">
                        {{ step }}
                    </button>
                </div>

                <div v-else-if="field.type === 'boolean'" class="flex h-11 items-center">
                    <FormSwitch :value="!!draft[field.uuid]" @toggleSwitch="setValue(field, !draft[field.uuid])" />
                </div>

                <!-- Same colored-choice pattern as the quick risk assessment, so a
                     caseworker reads the same three levels the same way everywhere. -->
                <div v-else-if="field.type === 'risk'">
                    <RadioGroup :modelValue="draft[field.uuid] ?? null"
                        @update:modelValue="(value: any) => setValue(field, value)"
                        class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <RadioGroupOption as="template" v-for="level in RISK_LEVELS" :key="level.value"
                            :value="level.value" v-slot="{ active, checked }">
                            <div :class="[
                                active ? 'ring-1 ring-offset-2' : '',
                                level.ring,
                                checked ? [level.bg, 'text-white ring-0'] : ['border', level.border, 'ring-inset'],
                                'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
                                {{ level.label }}
                            </div>
                        </RadioGroupOption>
                    </RadioGroup>
                </div>

                <!-- A lookup with `multiple` set can take more than one answer -
                     a single select would silently drop everything past the first. -->
                <FormSelectMultiple v-else-if="field.type === 'lookup' && field.options?.multiple"
                    :modelValue="draft[field.uuid] ?? []" :options="lookupOptions(field)"
                    @update:modelValue="(value: any) => setValue(field, value)" />

                <div v-else-if="field.type === 'lookup'">
                    <FormSelect :modelValue="draft[field.uuid] ?? null" :options="lookupOptions(field)"
                        @update:modelValue="(value: any) => setValue(field, value)" />

                    <!-- Jobcenters are a per-company catalogue the caseworker may
                         still be building out, so a missing one is created here
                         rather than sending them off to settings mid-inquiry. -->
                    <template v-if="field.options?.source === 'jobcenters'">
                        <button v-if="!isCreatingJobcenter(field)" type="button"
                            class="mt-1 text-[11px] font-semibold text-primary hover:text-primary-700"
                            @click="startCreatingJobcenter(field)">
                            + {{ $t('inquiryFields.createNew') }}
                        </button>
                        <div v-else class="mt-1.5 flex items-center gap-2">
                            <FormTextField :id="`new-jobcenter-${field.uuid}`" :name="`new-jobcenter-${field.uuid}`"
                                :placeholder="$t('inquiryFields.jobcenterName')"
                                v-model="state.newJobcenterName[field.uuid]" />
                            <FormButton type="button" buttonStyle="primary" buttonSize="xs"
                                :disabled="!state.newJobcenterName[field.uuid]?.trim() || state.isCreatingJobcenter"
                                @click="createJobcenter(field)">
                                {{ $t('inquiryFields.add') }}
                            </FormButton>
                        </div>
                    </template>
                </div>

                <FormSelect v-else-if="field.type === 'select'" :modelValue="draft[field.uuid] ?? null"
                    :options="choiceOptions(field)" :searchable="false"
                    @update:modelValue="(value: any) => setValue(field, value)" />

                <FormSelectMultiple v-else-if="field.type === 'multiselect'" :modelValue="draft[field.uuid] ?? []"
                    :options="choiceOptions(field)" @update:modelValue="(value: any) => setValue(field, value)" />

                <FormDateField v-else-if="field.type === 'date'" :id="`field-${field.uuid}`"
                    :name="`field-${field.uuid}`" :placeholder="field.label" :modelValue="draft[field.uuid] ?? ''"
                    @update:modelValue="(value: any) => setValue(field, value)" />

                <FormTextArea v-else-if="field.type === 'textarea'" :id="`field-${field.uuid}`"
                    :name="`field-${field.uuid}`" :placeholder="field.label" :modelValue="draft[field.uuid] ?? ''"
                    @update:modelValue="(value: any) => setValue(field, value)" />

                <FormTextField v-else :id="`field-${field.uuid}`" :name="`field-${field.uuid}`"
                    :placeholder="numericPlaceholder(field)" :modelValue="asText(draft[field.uuid])"
                    @update:modelValue="(value: any) => setValue(field, value)" />

                <p v-if="field.help_text" class="mt-1 text-[11px] text-slate-400">
                    {{ field.help_text }}
                </p>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { inquiryFieldService } from '@/components/api/user/InquiryFieldService'
import { employmentService } from '@/components/api/user/EmploymentService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    modelValue: {
        type: Object,
        required: false,
        default: () => ({}),
    },
})

const emit = defineEmits(['update:modelValue'])

const WIDE_TYPES = ['textarea', 'multiselect']

const RISK_LEVELS = computed(() => [
    { value: 'no risk', label: t('overview.quickRiskAssessment.form.risk.noRisk'), bg: 'bg-green-700', border: 'border-green-700', ring: 'ring-green-700' },
    { value: 'increased risk', label: t('overview.quickRiskAssessment.form.risk.increasedRisk'), bg: 'bg-yellow-500', border: 'border-yellow-500', ring: 'ring-yellow-500' },
    { value: 'acute increased risk', label: t('overview.quickRiskAssessment.form.risk.acuteIncreasedRisk'), bg: 'bg-red-600', border: 'border-red-600', ring: 'ring-red-600' },
])

const state = reactive({
    fields: [] as any[],
    isCreatingJobcenter: false,
    creatingJobcenterFor: null as string | null,
    newJobcenterName: {} as Record<string, string>,
})

const draft = ref<Record<string, any>>({ ...props.modelValue })

onMounted(() => {
    fetchFields()
})

function isWide(field: any) {
    return WIDE_TYPES.includes(field.type) || (field.type === 'lookup' && field.options?.multiple)
}

function lookupOptions(field: any) {
    return (field.lookup_options ?? []).map((option: any) => ({ value: option.uuid, label: option.label }))
}

function choiceOptions(field: any) {
    return (field.options?.choices ?? []).map((choice: string) => ({ value: choice, label: choice }))
}

function scaleSteps(field: any) {
    const min = Number(field.options?.min ?? 1)
    const max = Number(field.options?.max ?? 5)
    const step = field.options?.allow_half ? 0.5 : 1
    const steps = []
    for (let value = min; value <= max; value += step) {
        steps.push(value)
    }

    return steps
}

function numericPlaceholder(field: any) {
    return ['number', 'amount'].includes(field.type) ? '0' : field.label
}

function asText(value: any) {
    return value === null || value === undefined ? '' : String(value)
}

function setValue(field: any, value: any) {
    draft.value = { ...draft.value, [field.uuid]: value === '' ? null : value }
    emit('update:modelValue', { ...draft.value })
}

function isCreatingJobcenter(field: any) {
    return state.creatingJobcenterFor === field.uuid
}

function startCreatingJobcenter(field: any) {
    state.creatingJobcenterFor = field.uuid
    state.newJobcenterName[field.uuid] = ''
}

async function createJobcenter(field: any) {
    const name = state.newJobcenterName[field.uuid]?.trim()
    if (!name) return

    state.isCreatingJobcenter = true
    try {
        const response = await employmentService.saveJobcenter({ name })
        if (response?.data) {
            field.lookup_options = [...(field.lookup_options ?? []), { uuid: response.data.uuid, label: response.data.name }]
            state.creatingJobcenterFor = null

            if (field.options?.multiple) {
                setValue(field, [...(draft.value[field.uuid] ?? []), response.data.uuid])
            } else {
                setValue(field, response.data.uuid)
            }
        }
    } catch (_) {
        // The field stays in its create form so nothing typed is lost - the
        // usual required-name case is caught before the request is even sent.
    }
    state.isCreatingJobcenter = false
}

async function fetchFields() {
    try {
        const response = await inquiryFieldService.getFieldsForCreation()
        state.fields = response?.data ?? []
    } catch (_) {
        state.fields = []
    }
}
</script>
