<template>
    <Modal size="2xl" :title="props.period?.uuid ? $t('socialWelfare.contract.editPeriod') : $t('socialWelfare.contract.newPeriod')"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <form @submit.prevent="save">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- The API stops a new period that has not been reviewed and says
                     what it copied from the last one. Those are the numbers that
                     most often should have changed, so they are listed here and
                     the period is only saved once they are confirmed. -->
                <div v-if="state.review" ref="reviewBanner"
                    class="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-2">
                    <p class="flex items-center gap-2 font-medium">
                        <Icon name="ph:warning" class="w-4 h-4" aria-hidden="true" />
                        {{ $t('socialWelfare.contract.reviewTitle') }}
                    </p>
                    <p>{{ $t('socialWelfare.contract.reviewIntro') }}</p>
                    <ul class="list-disc pl-5">
                        <li v-for="item in state.review.items" :key="item">
                            {{ $t(`socialWelfare.contract.reviewItems.${item}`) }}
                            <span v-if="reviewValue(item)" class="text-amber-800">({{ reviewValue(item) }})</span>
                        </li>
                    </ul>
                    <Tooltip :text="$t('socialWelfare.contract.reviewConfirmHelp')" wrap position="top">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                v-model="state.reviewConfirmed" />
                            {{ $t('socialWelfare.contract.reviewConfirm') }}
                        </label>
                    </Tooltip>
                </div>

                <LoadingSpinner :isActive="state.isSaving">
                    <div class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.contract.startDate')" />
                                <input type="date" class="co-cell-input w-full" v-model="state.form.start_date" required />
                                <FormError :error="state.error?.errors?.start_date?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.contract.endDate')" />
                                <input type="date" class="co-cell-input w-full" v-model="state.form.end_date" />
                                <FormError :error="state.error?.errors?.end_date?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.contract.stay')" />
                                <select class="co-cell-input w-full" v-model="state.form.stay_uuid">
                                    <option :value="null">{{ $t('socialWelfare.contract.allStays') }}</option>
                                    <option v-for="stay in props.stays" :key="stay.uuid" :value="stay.uuid">
                                        {{ stay.journal_number || $t('socialWelfare.billing.stayWithoutNumber') }}
                                        ({{ stay.start_date }} - {{ stay.end_date || '...' }})
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <FormLabel :label="$t('socialWelfare.contract.department')" />
                            <select class="co-cell-input w-full" v-model="state.form.customer_department_uuid">
                                <option :value="null">{{ $t('socialWelfare.contract.noDepartment') }}</option>
                                <option v-for="department in props.departments" :key="department.uuid" :value="department.uuid">
                                    {{ [department.customer_label, department.name].filter(Boolean).join(', ') }}
                                </option>
                            </select>
                            <p v-if="selectedDepartment" class="text-[12px] text-slate-500">
                                {{ [selectedDepartment.address, selectedDepartment.ean_number ? `EAN ${selectedDepartment.ean_number}` : null,
                                    selectedDepartment.payment_terms_days !== null ? $t('socialWelfare.customerDepartments.days', { days: selectedDepartment.payment_terms_days }) : null]
                                    .filter(Boolean).join(' · ') }}
                            </p>
                            <NuxtLink v-else-if="!props.departments.length" to="/settings/customer-departments"
                                class="text-[12px] text-primary hover:underline">
                                {{ $t('socialWelfare.contract.createDepartment') }}
                            </NuxtLink>
                        </div>

                        <!-- Price -->
                        <div class="space-y-3 border-t border-surface-200 pt-5">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-1">
                                        <FormLabel :label="$t('socialWelfare.contract.priceType')" />
                                        <Tooltip :text="$t('socialWelfare.contract.priceTypeHelp')" wrap position="top">
                                            <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition"
                                                aria-hidden="true" />
                                        </Tooltip>
                                    </div>
                                    <select class="co-cell-input w-full" v-model="state.form.price_type"
                                        :aria-label="$t('socialWelfare.contract.priceType')">
                                        <option value="hourly">{{ $t('socialWelfare.contract.priceTypes.hourly') }}</option>
                                        <option value="fixed">{{ $t('socialWelfare.contract.priceTypes.fixed') }}</option>
                                        <option value="one_off">{{ $t('socialWelfare.contract.priceTypes.one_off') }}</option>
                                    </select>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel :label="priceLabel" />
                                    <input type="number" min="0" step="0.01" class="co-cell-input w-full" v-model="state.form.price" />
                                    <FormError :error="state.error?.errors?.price?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel :label="$t('socialWelfare.contract.billingFrequency')" />
                                    <select class="co-cell-input w-full" v-model="state.form.billing_frequency"
                                        :aria-label="$t('socialWelfare.contract.billingFrequency')">
                                        <option v-for="frequency in frequencies" :key="frequency" :value="frequency">
                                            {{ $t(`socialWelfare.contract.frequencies.${frequency}`) }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <p class="text-[12px] text-slate-500">
                                {{ $t(`socialWelfare.contract.priceTypeHelps.${state.form.price_type}`) }}
                            </p>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-1">
                                        <FormLabel :label="$t('socialWelfare.contract.billingTiming')" />
                                        <Tooltip :text="$t('socialWelfare.contract.billingTimingHelp')" wrap position="top">
                                            <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition"
                                                aria-hidden="true" />
                                        </Tooltip>
                                    </div>
                                    <select class="co-cell-input w-full" v-model="state.form.billing_timing"
                                        :aria-label="$t('socialWelfare.contract.billingTiming')">
                                        <option value="in_arrears">{{ $t('socialWelfare.contract.billingTimings.in_arrears') }}</option>
                                        <option value="in_advance">{{ $t('socialWelfare.contract.billingTimings.in_advance') }}</option>
                                    </select>
                                    <FormError :error="state.error?.errors?.billing_timing?.[0]" />
                                </div>
                                <p class="md:col-span-2 text-[12px] text-slate-500 self-end pb-2">
                                    {{ $t(`socialWelfare.contract.billingTimingHelps.${state.form.billing_timing}`) }}
                                </p>
                            </div>
                        </div>

                        <!-- Granted hours per hour type -->
                        <div class="space-y-3 border-t border-surface-200 pt-5">
                            <div class="flex flex-wrap items-end gap-4">
                                <div class="space-y-1">
                                    <FormLabel :label="$t('socialWelfare.contract.hoursInterval')" />
                                    <select class="co-cell-input w-48" v-model="state.form.hours_interval"
                                        :aria-label="$t('socialWelfare.contract.hoursInterval')">
                                        <option value="weekly">{{ $t('socialWelfare.contract.intervals.weekly') }}</option>
                                        <option value="monthly">{{ $t('socialWelfare.contract.intervals.monthly') }}</option>
                                        <option value="total">{{ $t('socialWelfare.contract.intervals.total') }}</option>
                                    </select>
                                </div>
                                <p class="text-sm text-slate-600 pb-2">
                                    {{ $t('socialWelfare.contract.grantedTotal') }}: <strong>{{ formatHours(grantedTotal) }}</strong>
                                </p>
                            </div>

                            <div class="flex items-center gap-1">
                                <p class="text-sm font-medium text-slate-900">{{ $t('socialWelfare.contract.hourTypes') }}</p>
                                <Tooltip :text="$t('socialWelfare.contract.hourTypesHelp')" wrap position="top">
                                    <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                </Tooltip>
                            </div>
                            <p v-if="!hourTypeOptions.length" class="text-[13px] text-slate-400">
                                {{ $t('socialWelfare.contract.noHourTypes') }}
                                <NuxtLink to="/settings/contract-hour-types" class="text-primary hover:underline">
                                    {{ $t('socialWelfare.contract.createHourTypes') }}
                                </NuxtLink>
                            </p>
                            <div v-for="option in hourTypeOptions" :key="option.uuid" class="flex flex-wrap items-center gap-3">
                                <Tooltip :text="$t(`socialWelfare.hourTypes.basisHelp.${option.billing_basis}`)" wrap position="top">
                                    <label class="flex w-64 items-center gap-2 text-sm text-slate-700">
                                        <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                            :checked="entryOf(option.uuid)?.selected === true"
                                            @change="toggleHourType(option.uuid, ($event.target as HTMLInputElement).checked)" />
                                        {{ option.name }}
                                        <span class="co-badge text-[11px]">{{ $t(`socialWelfare.hourTypes.basis.${option.billing_basis}`) }}</span>
                                    </label>
                                </Tooltip>
                                <input v-if="entryOf(option.uuid)?.selected" type="number" min="0" max="99999" step="0.01"
                                    class="co-cell-input w-32" v-model="entryOf(option.uuid)!.hours"
                                    :aria-label="$t('socialWelfare.contract.hoursOfType', { name: option.name })" />
                            </div>
                            <FormError :error="state.error?.errors?.hours?.[0]" />
                        </div>

                        <!-- Invoice -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-surface-200 pt-5">
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.contract.paymentTermsDays')" />
                                <select class="co-cell-input w-full" v-model="state.form.payment_terms_days"
                                    :aria-label="$t('socialWelfare.contract.paymentTermsDays')">
                                    <option :value="''">
                                        {{ selectedDepartment?.payment_terms_days !== null && selectedDepartment?.payment_terms_days !== undefined
                                            ? $t('socialWelfare.contract.fromDepartment', { days: selectedDepartment.payment_terms_days })
                                            : $t('socialWelfare.contract.noPaymentTerms') }}
                                    </option>
                                    <option v-for="term in paymentTermOptions" :key="term.days" :value="term.days">
                                        {{ term.label }}
                                    </option>
                                </select>
                                <FormError :error="state.error?.errors?.payment_terms_days?.[0]" />
                                <NuxtLink v-if="!paymentTerms.length" to="/settings/payment-terms"
                                    class="text-[12px] text-primary hover:underline">
                                    {{ $t('socialWelfare.contract.createPaymentTerms') }}
                                </NuxtLink>
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.contract.economicCustomerNumber')" />
                                <input type="text" class="co-cell-input w-full" v-model="state.form.economic_customer_number"
                                    :placeholder="selectedDepartment?.customer_number || ''" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.contract.economicProductNumber')" />
                                <input type="text" class="co-cell-input w-full" v-model="state.form.economic_product_number" />
                            </div>
                            <Tooltip :text="$t('socialWelfare.contract.showCprHelp')" wrap position="top">
                                <label class="flex items-center gap-2 text-sm text-slate-700">
                                    <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary" v-model="state.form.show_cpr_on_invoice" />
                                    {{ $t('socialWelfare.contract.showCpr') }}
                                </label>
                            </Tooltip>
                            <Tooltip :text="$t('socialWelfare.contract.showCaseNumberHelp')" wrap position="top">
                                <label class="flex items-center gap-2 text-sm text-slate-700">
                                    <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary" v-model="state.form.show_case_number_on_invoice" />
                                    {{ $t('socialWelfare.contract.showCaseNumber') }}
                                </label>
                            </Tooltip>
                            <p v-if="state.form.show_case_number_on_invoice && !props.citizen?.case_number"
                                class="text-[12px] text-amber-700">
                                {{ $t('socialWelfare.contract.noCaseNumber') }}
                            </p>
                        </div>

                        <!-- The company's own contract fields -->
                        <div v-if="fieldDefinitions.length" class="space-y-3 border-t border-surface-200 pt-5">
                            <p class="text-sm font-medium text-slate-900">{{ $t('socialWelfare.contract.customFields') }}</p>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div v-for="definition in fieldDefinitions" :key="definition.uuid" class="space-y-1">
                                    <div class="flex items-center gap-1">
                                        <FormLabel :label="definition.label" />
                                        <Tooltip :text="fieldVisibility(definition)" wrap position="top">
                                            <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition"
                                                aria-hidden="true" />
                                        </Tooltip>
                                    </div>
                                    <input :type="definition.field_type === 'number' ? 'number' : 'text'"
                                        :step="definition.field_type === 'number' ? 'any' : undefined"
                                        :maxlength="definition.field_type === 'number' ? undefined : 1000"
                                        class="co-cell-input w-full" v-model="state.customFields[definition.uuid]" />
                                </div>
                            </div>
                        </div>

                        <!-- Start-up fee, room rent and status report: the three lines
                             every contract may carry, each with its own amount. -->
                        <div class="space-y-3 border-t border-surface-200 pt-5">
                            <p class="text-sm font-medium text-slate-900">{{ $t('socialWelfare.contract.presetLines') }}</p>
                            <div v-for="kind in presetKinds" :key="kind" class="space-y-2">
                                <Tooltip :text="$t(`socialWelfare.contract.presetHelps.${kind}`)" wrap position="top">
                                    <label class="flex items-center gap-2 text-sm text-slate-700">
                                        <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                            v-model="state.presets[kind].enabled" />
                                        {{ $t(`socialWelfare.contract.presetKinds.${kind}`) }}
                                    </label>
                                </Tooltip>
                                <div v-if="state.presets[kind].enabled" class="flex flex-wrap items-end gap-3 pl-6">
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('socialWelfare.contract.lineAmount')" />
                                        <input type="number" step="0.01" class="co-cell-input w-32"
                                            v-model="state.presets[kind].amount" required />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('socialWelfare.contract.lineRecurrence')" />
                                        <select class="co-cell-input w-44" v-model="state.presets[kind].recurrence"
                                            :aria-label="$t('socialWelfare.contract.lineRecurrence')">
                                            <option value="one_off">{{ $t('socialWelfare.contract.recurrences.one_off') }}</option>
                                            <option value="recurring">{{ $t('socialWelfare.contract.recurrences.recurring') }}</option>
                                        </select>
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('socialWelfare.contract.economicProductNumber')" />
                                        <input type="text" class="co-cell-input w-32"
                                            v-model="state.presets[kind].economic_product_number" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Any other line -->
                        <div class="space-y-3 border-t border-surface-200 pt-5">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium text-slate-900">{{ $t('socialWelfare.contract.lines') }}</p>
                                <Tooltip :text="$t('socialWelfare.contract.addLineHelp')" wrap position="left">
                                    <FormButton type="button" buttonStyle="action" @click="addLine">
                                        <Icon name="ph:plus" class="w-4 h-4" />
                                        {{ $t('socialWelfare.contract.addLine') }}
                                    </FormButton>
                                </Tooltip>
                            </div>
                            <p v-if="!state.form.lines.length" class="text-[13px] text-slate-400">
                                {{ $t('socialWelfare.contract.noLines') }}
                            </p>
                            <div v-for="(line, index) in state.form.lines" :key="line.key" class="flex flex-wrap items-end gap-3">
                                <div class="space-y-1 flex-1 min-w-[12rem]">
                                    <FormLabel v-if="index === 0" :label="$t('socialWelfare.contract.lineDescription')" />
                                    <input type="text" class="co-cell-input w-full" v-model="line.description"
                                        :placeholder="$t('socialWelfare.contract.linePlaceholder')" required />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel v-if="index === 0" :label="$t('socialWelfare.contract.lineAmount')" />
                                    <input type="number" step="0.01" class="co-cell-input w-32" v-model="line.amount" required />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel v-if="index === 0" :label="$t('socialWelfare.contract.lineRecurrence')" />
                                    <select class="co-cell-input w-44" v-model="line.recurrence"
                                        :aria-label="$t('socialWelfare.contract.lineRecurrence')">
                                        <option value="one_off">{{ $t('socialWelfare.contract.recurrences.one_off') }}</option>
                                        <option value="recurring">{{ $t('socialWelfare.contract.recurrences.recurring') }}</option>
                                    </select>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel v-if="index === 0" :label="$t('socialWelfare.contract.economicProductNumber')" />
                                    <input type="text" class="co-cell-input w-32" v-model="line.economic_product_number" />
                                </div>
                                <Tooltip :text="$t('socialWelfare.billing.extraRemove')" position="left">
                                    <button type="button" class="pb-2 text-slate-400 hover:text-red-600 transition"
                                        :aria-label="$t('socialWelfare.billing.extraRemove')"
                                        @click="state.form.lines.splice(index, 1)">
                                        <Icon name="ph:trash" class="w-4 h-4" />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>

                        <div class="space-y-1 border-t border-surface-200 pt-5">
                            <FormLabel :label="$t('socialWelfare.contract.note')" />
                            <textarea rows="2" class="co-cell-input w-full" v-model="state.form.note"></textarea>
                        </div>
                    </div>

                    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton type="button" buttonStyle="cancel" @click="emit('close')">{{ $t('cancel') }}</FormButton>
                        <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="!!state.review && !state.reviewConfirmed">
                            {{ props.period?.uuid ? $t('update') : $t('save') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
            </form>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { useAlert } from '@/composables/alert'
import { useAmountFormatter } from '@/composables/amountFormatter'
import {
    PRESET_KINDS, blankPresets, customFieldValues, customFieldsPayload, grantedTotal as sumGranted,
    hourEntriesFromPeriod, hoursPayload, linesPayload, splitLines,
} from '@/composables/contractPeriod'
import type { HourEntry } from '@/composables/contractPeriod'
import type { ContractFieldDefinition, ContractHourType, PaymentTerm, ReviewItem } from '@/types/contract'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    citizenUuid: { type: String, required: true },
    citizen: { type: Object, required: false, default: null },
    // The period being edited, or null for a new one.
    period: { type: Object, required: false, default: null },
    // The newest period (or the stay's fallback) a new one is prefilled from.
    previous: { type: Object, required: false, default: null },
    // The API's copy of the latest period's terms; preferred over `previous`.
    template: { type: Object, required: false, default: null },
    stays: { type: Array as () => any[], required: false, default: () => [] },
    departments: { type: Array as () => any[], required: false, default: () => [] },
})
const emit = defineEmits(['close', 'saved'])

const { t } = useI18n()
const { successAlert } = useAlert()
const { formatAmount } = useAmountFormatter()

const frequencies = ['monthly', 'quarterly', 'half_yearly', 'yearly']
const presetKinds = PRESET_KINDS
let lineKey = 0

const hourTypes = ref<ContractHourType[]>([])
const paymentTerms = ref<PaymentTerm[]>([])
const fieldDefinitions = ref<ContractFieldDefinition[]>([])
const reviewBanner = ref<HTMLElement | null>(null)

const blank = () => ({
    start_date: '',
    end_date: '',
    stay_uuid: null as string | null,
    customer_department_uuid: null as string | null,
    price_type: 'hourly',
    price: '' as any,
    hours_interval: 'weekly',
    billing_frequency: 'monthly',
    billing_timing: 'in_arrears',
    payment_terms_days: '' as any,
    economic_customer_number: '',
    economic_product_number: '',
    show_cpr_on_invoice: false,
    show_case_number_on_invoice: false,
    note: '',
    lines: [] as any[],
})

const state = reactive({
    error: {} as Error,
    isSaving: false,
    reviewConfirmed: false,
    // Set when the API answers that a new period has to be reviewed.
    review: null as null | { items: ReviewItem[], previous: any },
    form: blank(),
    hours: [] as HourEntry[],
    presets: blankPresets(),
    customFields: {} as Record<string, any>,
})

const selectedDepartment = computed(() =>
    props.departments.find((d: any) => d.uuid === state.form.customer_department_uuid) ?? null
)

const priceLabel = computed(() => {
    if (state.form.price_type === 'fixed') return t('socialWelfare.contract.fixedPrice')
    if (state.form.price_type === 'one_off') return t('socialWelfare.contract.oneOffPrice')

    return t('socialWelfare.contract.hourlyPrice')
})

// The active types, plus any inactive type the edited period still carries, so
// saving does not silently drop its hours.
const hourTypeOptions = computed(() => {
    const options = [...hourTypes.value]

    for (const row of props.period?.hours ?? []) {
        if (!options.some(option => option.uuid === row.hour_type_uuid)) {
            options.push({
                uuid: row.hour_type_uuid,
                name: row.name,
                system_key: row.system_key ?? null,
                economic_product_number: row.economic_product_number ?? null,
                billing_basis: row.billing_basis,
                sort_order: null,
                is_active: false,
            })
        }
    }

    return options
})

// A term the period already uses stays selectable even if the catalogue has
// since lost it, which the API allows on an unchanged value.
const paymentTermOptions = computed(() => {
    const options = paymentTerms.value.map(term => ({ days: term.days, label: term.display_label }))
    const current = state.form.payment_terms_days

    if (current !== '' && current !== null && !options.some(option => option.days === Number(current))) {
        options.push({ days: Number(current), label: t('socialWelfare.contract.legacyTerms', { days: current }) })
    }

    return options
})

const grantedTotal = computed(() => sumGranted(state.hours))

function entryOf(uuid: string): HourEntry | undefined {
    return state.hours.find(entry => entry.hour_type_uuid === uuid)
}

function toggleHourType(uuid: string, selected: boolean) {
    const entry = entryOf(uuid)

    if (entry) {
        entry.selected = selected
    } else {
        state.hours.push({ hour_type_uuid: uuid, selected, hours: '' })
    }
}

function fieldVisibility(definition: ContractFieldDefinition): string {
    return [
        definition.show_on_contract ? t('socialWelfare.contract.fieldOnContract') : null,
        definition.show_on_invoice ? t('socialWelfare.contract.fieldOnInvoice') : null,
    ].filter(Boolean).join(' · ') || t('socialWelfare.contract.fieldHidden')
}

function fromPeriod(source: any, asNew: boolean) {
    const form = blank()

    if (!source) return form

    form.stay_uuid = source.stay_uuid ?? null
    // A period names its department in full, the API's template only by uuid.
    form.customer_department_uuid = source.customer_department?.uuid ?? source.customer_department_uuid ?? null
    form.price_type = source.price_type || 'hourly'
    form.price = source.price ?? ''
    form.hours_interval = source.hours_interval || 'weekly'
    form.billing_frequency = source.billing_frequency || 'monthly'
    form.billing_timing = source.billing_timing || 'in_arrears'

    // The stay's agreed price is an amount per period (a won offer carries its
    // monthly price there), never an hourly rate. Copying it into the hourly
    // price would bill that amount for every hour, so a monthly one becomes a
    // fixed monthly price and any other is left for the user to fill in.
    if (source.is_fallback && source.price == null && source.agreed_price != null && source.hours_interval === 'monthly') {
        form.price_type = 'fixed'
        form.price = source.agreed_price
        form.billing_frequency = 'monthly'
    }
    form.payment_terms_days = source.payment_terms_days ?? ''
    form.economic_customer_number = source.economic_customer_number ?? ''
    form.economic_product_number = source.economic_product_number ?? ''
    form.show_cpr_on_invoice = !!source.show_cpr_on_invoice
    form.show_case_number_on_invoice = !!source.show_case_number_on_invoice
    form.note = asNew ? '' : (source.note ?? '')

    const { presets, custom } = splitLines(source.lines ?? [], asNew)
    state.presets = presets
    form.lines = custom.map((line: any) => ({
        key: ++lineKey,
        uuid: asNew ? null : line.uuid,
        description: line.description,
        amount: line.amount,
        recurrence: line.recurrence,
        economic_product_number: line.economic_product_number ?? '',
    }))
    state.hours = hourEntriesFromPeriod(source, hourTypes.value)
    state.customFields = customFieldValues(source)

    if (asNew) {
        // The API's template already knows when the next period starts.
        form.start_date = source.previous_period_uuid
            ? (source.start_date || today())
            : (source.end_date ? nextDay(source.end_date) : today())
    } else {
        form.start_date = source.start_date ?? ''
        form.end_date = source.end_date ?? ''
    }

    return form
}

async function loadCatalogues() {
    try {
        const [types, terms, fields] = await Promise.all([
            socialWelfareService.getContractHourTypes({ active_only: 1 }),
            socialWelfareService.getPaymentTerms({ active_only: 1 }),
            socialWelfareService.getContractFieldDefinitions({ active_only: 1 }),
        ])
        hourTypes.value = (types?.data ?? []).filter(item => item.is_active !== false)
        paymentTerms.value = (terms?.data ?? []).filter(item => item.is_active !== false)
        fieldDefinitions.value = (fields?.data ?? []).filter(item => item.is_active !== false)
    } catch (error: any) {
        state.error = error
    }
}

watch(() => props.isModalOpen, async (open) => {
    if (!open) return

    state.error = {} as Error
    state.review = null
    state.reviewConfirmed = false

    // The catalogues first: a legacy period maps its three hour fields onto the
    // system types, which needs the types to be known.
    await loadCatalogues()

    state.form = props.period?.uuid
        ? fromPeriod(props.period, false)
        : fromPeriod(templateSource(), true)

    if (!state.form.start_date) state.form.start_date = today()
})

// The API's template when there is a real period to copy. A stay's fallback has
// no template of its own (its agreed price is turned into a fixed price below),
// so it is used as it is.
function templateSource() {
    if (props.previous?.is_fallback) return props.previous

    return props.template ?? props.previous
}

function today(): string {
    return new Date().toISOString().slice(0, 10)
}

function nextDay(date: string): string {
    const d = new Date(`${date}T12:00:00`)
    d.setDate(d.getDate() + 1)

    return d.toISOString().slice(0, 10)
}

function addLine() {
    state.form.lines.push({ key: ++lineKey, uuid: null, description: '', amount: '', recurrence: 'one_off', economic_product_number: '' })
}

function formatHours(hours: any): string {
    if (hours === null || hours === undefined || hours === '') return '-'

    return Number(hours).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatPrice(price: any): string {
    return price === null || price === undefined || price === '' ? '-' : formatAmount(price)
}

// What the last period had for an item the API asks to be reviewed.
function reviewValue(item: ReviewItem): string {
    const previous = state.review?.previous

    if (!previous) return ''
    if (item === 'price') return formatPrice(previous.price ?? previous.agreed_price)
    if (item === 'granted_hours') return formatHours(previous.granted_hours)

    return (previous.hours ?? [])
        .map((row: any) => `${row.name}: ${formatHours(row.hours)}`)
        .join(', ')
}

function payload() {
    const numberOrNull = (value: any) => (value === '' || value === null || value === undefined ? null : Number(value))
    const textOrNull = (value: any) => (value === '' || value === undefined ? null : value)

    return {
        start_date: state.form.start_date,
        end_date: textOrNull(state.form.end_date),
        stay_uuid: state.form.stay_uuid,
        customer_department_uuid: state.form.customer_department_uuid,
        price_type: state.form.price_type,
        price: numberOrNull(state.form.price),
        hours_interval: state.form.hours_interval,
        hours: hoursPayload(state.hours),
        billing_frequency: state.form.billing_frequency,
        billing_timing: state.form.billing_timing,
        payment_terms_days: numberOrNull(state.form.payment_terms_days),
        economic_customer_number: textOrNull(state.form.economic_customer_number),
        economic_product_number: textOrNull(state.form.economic_product_number),
        show_cpr_on_invoice: state.form.show_cpr_on_invoice,
        show_case_number_on_invoice: state.form.show_case_number_on_invoice,
        note: textOrNull(state.form.note),
        // Only sent once the user has confirmed; the API asks for it with a 422
        // when it is missing on a new period.
        ...(state.reviewConfirmed ? { review_confirmed: true } : {}),
        custom_fields: customFieldsPayload(fieldDefinitions.value, state.customFields),
        lines: linesPayload(state.presets, state.form.lines),
    }
}

async function save() {
    state.error = {} as Error
    state.isSaving = true
    try {
        let saved: any = null

        if (props.period?.uuid) {
            await socialWelfareService.updateContractPeriod(props.period.uuid, payload())
        } else {
            saved = await socialWelfareService.saveContractPeriod(props.citizenUuid, payload())
        }

        // Keeping the old terms is allowed; it is only said out loud.
        const kept: ReviewItem[] = saved?.data?.review?.unchanged ?? []
        const message = kept.length
            ? `${t('socialWelfare.contract.saved')}. ${t('socialWelfare.contract.reviewKept', {
                items: kept.map(item => t(`socialWelfare.contract.reviewItems.${item}`).toLowerCase()).join(', '),
            })}`
            : t('socialWelfare.contract.saved')

        successAlert(`${t('alert.success')}!`, message)
        emit('saved')
        emit('close')
    } catch (error: any) {
        if (error?.review_required) {
            // Not a failure: the period is held back until it has been looked at.
            state.review = { items: error.review_items ?? [], previous: error.previous_period ?? null }
            state.reviewConfirmed = false
            await nextTick()
            reviewBanner.value?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
        } else {
            state.error = error
        }
    }
    state.isSaving = false
}
</script>
