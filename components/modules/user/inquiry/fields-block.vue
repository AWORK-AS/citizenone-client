<template>
    <div v-if="state.groups.length" class="space-y-6">
        <section v-for="group in state.groups" :key="group.key">
            <div class="mb-3 flex items-center gap-2">
                <span v-if="group.color" class="size-[9px] rounded-[3px]" :style="{ background: group.color }" />
                <h3 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {{ group.title }}
                </h3>
            </div>

            <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
                <div v-for="field in group.fields" :key="field.uuid"
                    :class="isWide(field) ? 'sm:col-span-2' : ''">
                    <div class="mb-1.5 flex items-center gap-1.5">
                        <p class="text-xs font-bold text-slate-500">{{ field.label }}</p>
                        <span v-if="field.is_required && !hasAnswer(field)"
                            class="rounded-full bg-[#fdf3df] px-2 py-px text-[10px] font-bold text-[#8a6208]">
                            {{ $t('inquiryFields.required') }}
                        </span>
                        <!-- A scale or risk answer that has changed keeps its earlier
                             answers, so how the case developed is read where it is
                             answered. One answer has nothing earlier to show. -->
                        <button v-if="answerHistory(field).length > 1" type="button"
                            class="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:underline"
                            :aria-expanded="!!openHistory[field.uuid]" @click="toggleHistory(field)">
                            <Icon name="ph:clock-counter-clockwise" class="size-3.5" />
                            {{ $t('inquiryFields.history.previousAnswers') }}
                        </button>
                    </div>

                    <!-- Scale: the whole range visible, so picking 4 of 5 needs no
                         guessing about what the ends mean. -->
                    <!-- A trivselslineal looks like the ruler in a journal note: one
                         bar, the whole range, halves between the marks. -->
                    <div v-if="field.type === 'scale' && field.options?.wellbeing"
                        class="flex rounded-sm border border-gray-300 overflow-hidden" role="group" :aria-label="field.label">
                        <button v-for="step in scaleSteps(field)" :key="step" type="button"
                            class="grow py-1.5 border-r border-gray-200 last:border-r-0 transition-colors"
                            :class="[
                                Number.isInteger(step) ? 'text-xs' : 'text-[10px]',
                                Number(draft[field.uuid]) === step && draft[field.uuid] !== null
                                    ? 'text-white font-semibold bg-secondary'
                                    : Number.isInteger(step) ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-100',
                            ]"
                            :aria-pressed="Number(draft[field.uuid]) === step"
                            @click="setValue(field, String(draft[field.uuid]) === String(step) ? null : step)">
                            {{ formatStep(step) }}
                        </button>
                    </div>

                    <div v-else-if="field.type === 'scale'" class="flex flex-wrap gap-1.5">
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
                        <FormSwitch :value="!!draft[field.uuid]"
                            @toggleSwitch="setValue(field, !draft[field.uuid])" />
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

                    <!-- A lookup points at a register the company already keeps, so
                         the options come with the field rather than being typed here. -->
                    <div v-else-if="field.type === 'lookup'">
                        <!-- A lookup with `multiple` set can take more than one answer -
                             a single select would silently drop everything past the first. -->
                        <FormSelectMultiple v-if="field.options?.multiple" :modelValue="draft[field.uuid] ?? []"
                            :options="lookupOptions(field)"
                            @update:modelValue="(value: any) => setValue(field, value)" />

                        <FormSelect v-else :modelValue="draft[field.uuid] ?? null" :options="lookupOptions(field)"
                            @update:modelValue="(value: any) => setValue(field, value)" />

                        <!-- A customer department not in the register yet is created
                             here and picked, instead of leaving the inquiry for settings. -->
                        <Tooltip v-if="field.options?.source === 'customer_departments'"
                            :text="$t('inquiryFields.newCustomerDepartmentTooltip')">
                            <button type="button" class="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-secondary hover:underline"
                                @click="openNewDepartment(field)">
                                <Icon name="ph:plus" class="size-3.5" />
                                {{ $t('socialWelfare.customerDepartments.new') }}
                            </button>
                        </Tooltip>

                        <!-- A special language carries a surcharge on the offer, so it is
                             said where it is chosen. -->
                        <p v-if="specialChosen(field).length"
                            class="mt-1 inline-flex items-center gap-1 rounded-full bg-[#fdf1ee] px-2 py-px text-[11px] font-bold text-[#c0442c]">
                            <Icon name="ph:translate" class="size-3" />
                            {{ $t('inquiryOffer.specialLanguageChosen', { languages: specialChosen(field).join(', ') }) }}
                        </p>
                    </div>

                    <FormSelect v-else-if="field.type === 'select'" :modelValue="draft[field.uuid] ?? null"
                        :options="choiceOptions(field)" :searchable="false"
                        @update:modelValue="(value: any) => setValue(field, value)" />

                    <FormSelectMultiple v-else-if="field.type === 'multiselect'"
                        :modelValue="draft[field.uuid] ?? []" :options="choiceOptions(field)"
                        @update:modelValue="(value: any) => setValue(field, value)" />

                    <FormDateField v-else-if="field.type === 'date'" :id="`field-${field.uuid}`"
                        :name="`field-${field.uuid}`" :placeholder="field.label"
                        :modelValue="draft[field.uuid] ?? ''"
                        @update:modelValue="(value: any) => setValue(field, value)" />

                    <FormTextArea v-else-if="field.type === 'textarea'" :id="`field-${field.uuid}`"
                        :name="`field-${field.uuid}`" :placeholder="field.label"
                        :modelValue="draft[field.uuid] ?? ''"
                        @update:modelValue="(value: any) => setValue(field, value)" />

                    <FormTextField v-else :id="`field-${field.uuid}`" :name="`field-${field.uuid}`"
                        :placeholder="numericPlaceholder(field)" :modelValue="asText(draft[field.uuid])"
                        @update:modelValue="(value: any) => setValue(field, value)" />

                    <!-- Newest first; the first answer ever given is the baseline. -->
                    <ul v-if="openHistory[field.uuid] && answerHistory(field).length > 1"
                        class="mt-2 space-y-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2">
                        <li v-for="entry in answerHistory(field)" :key="entry.uuid"
                            class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px]">
                            <span class="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                                <template v-if="entry.value === null || entry.value === undefined">
                                    {{ $t('inquiryFields.history.cleared') }}
                                </template>
                                <template v-else-if="field.type === 'risk'">
                                    <span class="size-2 rounded-full" :class="riskLevel(entry.value)?.bg" />
                                    {{ riskLevel(entry.value)?.label ?? entry.value }}
                                </template>
                                <template v-else>{{ formatStep(Number(entry.value)) }}</template>
                            </span>
                            <span v-if="entry.is_baseline"
                                class="rounded-full bg-surface-200 px-2 py-px text-[10px] font-bold text-slate-600">
                                {{ $t('inquiryFields.history.baseline') }}
                            </span>
                            <span class="text-[11px] text-slate-400">
                                {{ formatDateTimeToReadable(entry.recorded_at) }}
                                · {{ entry.user_name ?? $t('inquiryFields.history.unknownUser') }}
                            </span>
                        </li>
                    </ul>

                    <p v-if="field.help_text" class="mt-1 text-[11px] text-slate-400">
                        {{ field.help_text }}
                    </p>
                </div>
            </div>
        </section>

        <!-- Nothing to save until something actually changed. -->
        <div v-if="isDirty" class="flex items-center justify-end gap-3 border-t border-surface-200 pt-4">
            <FormButton type="button" buttonStyle="cancel" @click="reset">
                {{ $t('cancel') }}
            </FormButton>
            <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving" @click="save">
                {{ state.isSaving ? $t('inquiryFields.saving') : $t('save') }}
            </FormButton>
        </div>
    </div>
    <!-- Always mounted: the modal fills its form and loads municipalities when
         isModalOpen turns true, which it never sees if created already open. -->
    <ModulesUserEconomyCustomerDepartmentModal :isModalOpen="!!newDepartmentFor"
        @close="newDepartmentFor = null" @saved="departmentCreated" />
</template>

<script setup lang="ts">
import { inquiryFieldService } from '@/components/api/user/InquiryFieldService'
import { useAlert } from '@/composables/alert'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'

const { successAlert, errorAlert } = useAlert()
const { t, locale } = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()

const props = defineProps({
    inquiryUuid: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['saved'])

const WIDE_TYPES = ['textarea', 'multiselect']

const RISK_LEVELS = computed(() => [
    { value: 'no risk', label: t('overview.quickRiskAssessment.form.risk.noRisk'), bg: 'bg-green-700', border: 'border-green-700', ring: 'ring-green-700' },
    { value: 'increased risk', label: t('overview.quickRiskAssessment.form.risk.increasedRisk'), bg: 'bg-yellow-500', border: 'border-yellow-500', ring: 'ring-yellow-500' },
    { value: 'acute increased risk', label: t('overview.quickRiskAssessment.form.risk.acuteIncreasedRisk'), bg: 'bg-red-600', border: 'border-red-600', ring: 'ring-red-600' },
])

const state = reactive({
    fields: [] as any[],
    groups: [] as any[],
    isSaving: false,
})

// The answers as loaded, and the answers as edited. Comparing the two is what
// decides whether there is anything to save.
const loaded = ref<Record<string, any>>({})
const draft = ref<Record<string, any>>({})

const isDirty = computed(() =>
    JSON.stringify(normalisedDraft(draft.value)) !== JSON.stringify(normalisedDraft(loaded.value))
)

onMounted(() => {
    fetchFields()
})

watch(() => props.inquiryUuid, () => fetchFields())

function normalisedDraft(source: Record<string, any>) {
    // Sort the keys so two equal sets of answers always stringify the same way.
    return Object.keys(source).sort().reduce((carry: Record<string, any>, key) => {
        const value = source[key]
        carry[key] = Array.isArray(value) ? [...value].sort() : (value ?? null)

        return carry
    }, {})
}

// Which fields have their earlier answers open.
const openHistory = ref<Record<string, boolean>>({})

// A scale or risk field's answers, newest first. A response without them reads
// as none, so the link just doesn't show.
function answerHistory(field: any): any[] {
    return Array.isArray(field.answer_history) ? field.answer_history : []
}

function toggleHistory(field: any) {
    openHistory.value = { ...openHistory.value, [field.uuid]: !openHistory.value[field.uuid] }
}

function riskLevel(value: string) {
    return RISK_LEVELS.value.find((level) => level.value === value)
}

function isWide(field: any) {
    return WIDE_TYPES.includes(field.type) || (field.type === 'lookup' && field.options?.multiple)
}

function lookupOptions(field: any) {
    return (field.lookup_options ?? []).map((option: any) => ({
        value: option.uuid,
        label: option.is_special ? `${option.label} (${t('inquiryOffer.specialLanguage').toLowerCase()})` : option.label,
    }))
}

// The lookup field a new customer department is being created for.
const newDepartmentFor = ref<any>(null)

function openNewDepartment(field: any) {
    newDepartmentFor.value = field
}

// Reloads the options so the new department is listed, keeping what has been
// typed but not saved, then picks it (added to the list on a multiple field).
async function departmentCreated(department: any) {
    const field = newDepartmentFor.value
    if (!field || !department?.uuid) return

    const unsaved = { ...draft.value }
    await fetchFields()
    draft.value = { ...draft.value, ...unsaved }

    const current = draft.value[field.uuid]
    setValue(field, field.options?.multiple ? [...(current ?? []), department.uuid] : department.uuid)
}

function specialChosen(field: any): string[] {
    const chosen = ([] as any[]).concat(draft.value[field.uuid] ?? [])

    return (field.lookup_options ?? [])
        .filter((option: any) => option.is_special && chosen.includes(option.uuid))
        .map((option: any) => option.label)
}

function choiceOptions(field: any) {
    return (field.options?.choices ?? []).map((choice: string) => ({ value: choice, label: choice }))
}

// 4.5 reads as 4,5 everywhere but English, as on the journal note's ruler.
const stepFormatter = computed(() => new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK'))

function formatStep(step: number) {
    return stepFormatter.value.format(step)
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

// A field that takes several answers starts from an empty list, not null.
function initialAnswer(field: any) {
    const multiple = field.type === 'multiselect' || (field.type === 'lookup' && field.options?.multiple)

    return field.answer ?? (multiple ? [] : null)
}

function hasAnswer(field: any) {
    const value = draft.value[field.uuid]

    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value.trim() !== ''

    return value !== null && value !== undefined
}

function setValue(field: any, value: any) {
    draft.value = { ...draft.value, [field.uuid]: value === '' ? null : value }
    fillRegionFrom(field, value)
}

/**
 * A kommune and its region are never independently true. When a kommune is
 * picked, any empty region field on the same form is filled from it, so nobody
 * has to remember which region a Danish kommune sits in. An answer already
 * given is left alone: the form may be recording something deliberate.
 */
function fillRegionFrom(field: any, value: any) {
    if (field.type !== 'lookup' || field.options?.source !== 'municipalities' || !value) return

    const picked = (field.lookup_options ?? []).find((option: any) => option.uuid === value)
    if (!picked?.region_uuid) return

    for (const candidate of state.fields) {
        if (candidate.type !== 'lookup' || candidate.options?.source !== 'regions') continue
        if (draft.value[candidate.uuid]) continue

        draft.value = { ...draft.value, [candidate.uuid]: picked.region_uuid }
    }
}

function groupFields(fields: any[]) {
    const groups: any[] = []

    for (const field of fields) {
        // A field with no stage is asked for throughout, so it is grouped on its
        // own rather than attached to whichever stage happens to come first.
        const key = field.stage?.uuid ?? 'always'
        let group = groups.find((candidate) => candidate.key === key)

        if (!group) {
            group = {
                key,
                title: field.stage?.name ?? t('inquiryFields.appliesThroughout'),
                color: field.stage?.color ?? null,
                fields: [],
            }
            groups.push(group)
        }

        group.fields.push(field)
    }

    return groups
}

async function fetchFields() {
    try {
        const response = await inquiryFieldService.getFields(props.inquiryUuid)
        state.fields = response?.data ?? []
        state.groups = groupFields(state.fields)

        const answers: Record<string, any> = {}
        for (const field of state.fields) {
            answers[field.uuid] = initialAnswer(field)
        }

        loaded.value = answers
        draft.value = { ...answers }
    } catch (_) {
        state.fields = []
        state.groups = []
    }
}

function reset() {
    draft.value = { ...loaded.value }
}

async function save() {
    state.isSaving = true
    try {
        // Only what changed is sent, so a field another user filled in meanwhile
        // is not overwritten with what this page happened to load.
        const changed: Record<string, any> = {}
        for (const uuid of Object.keys(draft.value)) {
            if (JSON.stringify(draft.value[uuid] ?? null) !== JSON.stringify(loaded.value[uuid] ?? null)) {
                changed[uuid] = draft.value[uuid]
            }
        }

        const response = await inquiryFieldService.saveFields(props.inquiryUuid, changed)
        state.fields = response?.data ?? state.fields
        state.groups = groupFields(state.fields)

        const answers: Record<string, any> = {}
        for (const field of state.fields) {
            answers[field.uuid] = initialAnswer(field)
        }
        loaded.value = answers
        draft.value = { ...answers }

        successAlert(`${t('alert.success')}!`, `${t('inquiryFields.alert.saved')}.`)
        emit('saved')
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryFields.alert.saveFailed'))
    }
    state.isSaving = false
}
</script>
