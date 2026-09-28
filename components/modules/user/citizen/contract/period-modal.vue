<template>
    <Modal size="2xl" :title="props.period?.uuid ? $t('socialWelfare.contract.editPeriod') : $t('socialWelfare.contract.newPeriod')"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <form @submit.prevent="save">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- A new period starts from the last one's terms. Those are the
                     numbers that most often should have changed, so they are
                     pointed out before anything is saved. -->
                <div v-if="needsReview"
                    class="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-2">
                    <p class="flex items-center gap-2 font-medium">
                        <Icon name="ph:warning" class="w-4 h-4" />
                        {{ $t('socialWelfare.contract.reviewTitle') }}
                    </p>
                    <p>{{ $t('socialWelfare.contract.reviewText', {
                        price: formatPrice(props.previous?.price ?? props.previous?.agreed_price),
                        hours: formatHours(props.previous?.granted_hours),
                    }) }}</p>
                    <label class="flex items-center gap-2">
                        <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary" v-model="state.reviewConfirmed" />
                        {{ $t('socialWelfare.contract.reviewConfirm') }}
                    </label>
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
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-surface-200 pt-5">
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.contract.priceType')" />
                                <select class="co-cell-input w-full" v-model="state.form.price_type">
                                    <option value="hourly">{{ $t('socialWelfare.contract.priceTypes.hourly') }}</option>
                                    <option value="fixed">{{ $t('socialWelfare.contract.priceTypes.fixed') }}</option>
                                </select>
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="state.form.price_type === 'fixed' ? $t('socialWelfare.contract.fixedPrice') : $t('socialWelfare.contract.hourlyPrice')" />
                                <input type="number" min="0" step="0.01" class="co-cell-input w-full" v-model="state.form.price" />
                                <FormError :error="state.error?.errors?.price?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.contract.billingFrequency')" />
                                <select class="co-cell-input w-full" v-model="state.form.billing_frequency">
                                    <option v-for="frequency in frequencies" :key="frequency" :value="frequency">
                                        {{ $t(`socialWelfare.contract.frequencies.${frequency}`) }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <!-- Granted hours, split the way the contract splits them -->
                        <div class="space-y-3 border-t border-surface-200 pt-5">
                            <div class="flex flex-wrap items-end gap-4">
                                <div class="space-y-1">
                                    <FormLabel :label="$t('socialWelfare.contract.hoursInterval')" />
                                    <select class="co-cell-input w-48" v-model="state.form.hours_interval">
                                        <option value="weekly">{{ $t('socialWelfare.contract.intervals.weekly') }}</option>
                                        <option value="monthly">{{ $t('socialWelfare.contract.intervals.monthly') }}</option>
                                        <option value="total">{{ $t('socialWelfare.contract.intervals.total') }}</option>
                                    </select>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel :label="$t('socialWelfare.contract.contactHours')" />
                                    <input type="number" min="0" step="0.25" class="co-cell-input w-32" v-model="state.form.contact_hours" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel :label="$t('socialWelfare.contract.adminHours')" />
                                    <input type="number" min="0" step="0.25" class="co-cell-input w-32" v-model="state.form.admin_hours" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel :label="$t('socialWelfare.contract.transportHours')" />
                                    <input type="number" min="0" step="0.25" class="co-cell-input w-32" v-model="state.form.transport_hours" />
                                </div>
                                <p class="text-sm text-slate-600 pb-2">
                                    {{ $t('socialWelfare.contract.grantedTotal') }}: <strong>{{ formatHours(grantedTotal) }}</strong>
                                </p>
                            </div>
                        </div>

                        <!-- Invoice -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-surface-200 pt-5">
                            <div class="space-y-1">
                                <FormLabel :label="$t('socialWelfare.contract.paymentTermsDays')" />
                                <input type="number" min="0" max="365" class="co-cell-input w-full" v-model="state.form.payment_terms_days"
                                    :placeholder="selectedDepartment?.payment_terms_days !== null && selectedDepartment?.payment_terms_days !== undefined
                                        ? $t('socialWelfare.contract.fromDepartment', { days: selectedDepartment.payment_terms_days }) : ''" />
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
                            <label class="flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary" v-model="state.form.show_cpr_on_invoice" />
                                {{ $t('socialWelfare.contract.showCpr') }}
                            </label>
                            <label class="flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary" v-model="state.form.show_case_number_on_invoice" />
                                {{ $t('socialWelfare.contract.showCaseNumber') }}
                            </label>
                            <p v-if="state.form.show_case_number_on_invoice && !props.citizen?.case_number"
                                class="text-[12px] text-amber-700">
                                {{ $t('socialWelfare.contract.noCaseNumber') }}
                            </p>
                        </div>

                        <!-- The contract's own lines: start-up fee, room rent, status report -->
                        <div class="space-y-3 border-t border-surface-200 pt-5">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium text-slate-900">{{ $t('socialWelfare.contract.lines') }}</p>
                                <FormButton type="button" buttonStyle="action" @click="addLine">
                                    <Icon name="ph:plus" class="w-4 h-4" />
                                    {{ $t('socialWelfare.contract.addLine') }}
                                </FormButton>
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
                                    <select class="co-cell-input w-44" v-model="line.recurrence">
                                        <option value="one_off">{{ $t('socialWelfare.contract.recurrences.one_off') }}</option>
                                        <option value="recurring">{{ $t('socialWelfare.contract.recurrences.recurring') }}</option>
                                    </select>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel v-if="index === 0" :label="$t('socialWelfare.contract.economicProductNumber')" />
                                    <input type="text" class="co-cell-input w-32" v-model="line.economic_product_number" />
                                </div>
                                <button type="button" class="pb-2 text-slate-400 hover:text-red-600 transition"
                                    :title="$t('socialWelfare.billing.extraRemove')" @click="state.form.lines.splice(index, 1)">
                                    <Icon name="ph:trash" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div class="space-y-1 border-t border-surface-200 pt-5">
                            <FormLabel :label="$t('socialWelfare.contract.note')" />
                            <textarea rows="2" class="co-cell-input w-full" v-model="state.form.note"></textarea>
                        </div>
                    </div>

                    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton type="button" buttonStyle="cancel" @click="emit('close')">{{ $t('cancel') }}</FormButton>
                        <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="needsReview && !state.reviewConfirmed">
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
    stays: { type: Array as () => any[], required: false, default: () => [] },
    departments: { type: Array as () => any[], required: false, default: () => [] },
})
const emit = defineEmits(['close', 'saved'])

const { t } = useI18n()
const { successAlert } = useAlert()
const { formatAmount } = useAmountFormatter()

const frequencies = ['monthly', 'quarterly', 'half_yearly', 'yearly']
let lineKey = 0

const blank = () => ({
    start_date: '',
    end_date: '',
    stay_uuid: null as string | null,
    customer_department_uuid: null as string | null,
    price_type: 'hourly',
    price: '' as any,
    hours_interval: 'weekly',
    contact_hours: '' as any,
    admin_hours: '' as any,
    transport_hours: '' as any,
    billing_frequency: 'monthly',
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
    form: blank(),
})

const needsReview = computed(() => !props.period?.uuid && !!props.previous)

const selectedDepartment = computed(() =>
    props.departments.find((d: any) => d.uuid === state.form.customer_department_uuid) ?? null
)

const grantedTotal = computed(() =>
    ['contact_hours', 'admin_hours', 'transport_hours']
        .reduce((sum, key) => sum + Number((state.form as any)[key] || 0), 0)
)

function fromPeriod(source: any, asNew: boolean) {
    const form = blank()

    if (!source) return form

    form.stay_uuid = source.stay_uuid ?? null
    form.customer_department_uuid = source.customer_department?.uuid ?? null
    form.price_type = source.price_type || 'hourly'
    form.price = source.price ?? source.agreed_price ?? ''
    form.hours_interval = source.hours_interval || 'weekly'
    form.contact_hours = source.contact_hours ?? ''
    form.admin_hours = source.admin_hours ?? ''
    form.transport_hours = source.transport_hours ?? ''
    form.billing_frequency = source.billing_frequency || 'monthly'
    form.payment_terms_days = source.payment_terms_days ?? ''
    form.economic_customer_number = source.economic_customer_number ?? ''
    form.economic_product_number = source.economic_product_number ?? ''
    form.show_cpr_on_invoice = !!source.show_cpr_on_invoice
    form.show_case_number_on_invoice = !!source.show_case_number_on_invoice
    form.note = asNew ? '' : (source.note ?? '')
    // A copied one-off fee has usually been billed already, so only the
    // recurring lines travel into a new period.
    form.lines = (source.lines ?? [])
        .filter((line: any) => !asNew || line.recurrence === 'recurring')
        .map((line: any) => ({
            key: ++lineKey,
            uuid: asNew ? null : line.uuid,
            description: line.description,
            amount: line.amount,
            recurrence: line.recurrence,
            economic_product_number: line.economic_product_number ?? '',
        }))

    if (asNew) {
        form.start_date = source.end_date ? nextDay(source.end_date) : today()
    } else {
        form.start_date = source.start_date ?? ''
        form.end_date = source.end_date ?? ''
    }

    return form
}

watch(() => props.isModalOpen, (open) => {
    if (!open) return

    state.error = {} as Error
    state.reviewConfirmed = false
    state.form = props.period?.uuid ? fromPeriod(props.period, false) : fromPeriod(props.previous, true)

    if (!state.form.start_date) state.form.start_date = today()
})

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
        contact_hours: numberOrNull(state.form.contact_hours),
        admin_hours: numberOrNull(state.form.admin_hours),
        transport_hours: numberOrNull(state.form.transport_hours),
        billing_frequency: state.form.billing_frequency,
        payment_terms_days: numberOrNull(state.form.payment_terms_days),
        economic_customer_number: textOrNull(state.form.economic_customer_number),
        economic_product_number: textOrNull(state.form.economic_product_number),
        show_cpr_on_invoice: state.form.show_cpr_on_invoice,
        show_case_number_on_invoice: state.form.show_case_number_on_invoice,
        note: textOrNull(state.form.note),
        review_confirmed: state.reviewConfirmed,
        lines: state.form.lines.map((line: any) => ({
            uuid: line.uuid,
            description: line.description,
            amount: Number(line.amount),
            recurrence: line.recurrence,
            economic_product_number: textOrNull(line.economic_product_number),
        })),
    }
}

async function save() {
    state.error = {} as Error
    state.isSaving = true
    try {
        if (props.period?.uuid) {
            await socialWelfareService.updateContractPeriod(props.period.uuid, payload())
        } else {
            await socialWelfareService.saveContractPeriod(props.citizenUuid, payload())
        }

        successAlert(`${t('alert.success')}!`, t('socialWelfare.contract.saved'))
        emit('saved')
        emit('close')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
