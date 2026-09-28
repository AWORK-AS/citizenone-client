<template>
    <div>
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
                <p class="text-sm font-semibold text-gray-900">{{ $t('inquiryOffer.title') }}</p>
                <p class="text-xs text-gray-400">{{ $t('inquiryOffer.hint') }}</p>
            </div>
            <FormButton v-if="!state.editing" type="button" buttonStyle="action" @click="startNew">
                <Icon name="ph:calculator" class="size-4" />
                {{ latest ? $t('inquiryOffer.newVersion') : $t('inquiryOffer.newCalculation') }}
            </FormButton>
        </div>

        <!-- A special language changes the price, so it is said where the
             offer is made and not only in the fine print of the calculation. -->
        <p v-if="state.context?.has_special_language"
            class="mb-3 rounded-lg border border-dashed border-[#f0c4b8] bg-[#fdf1ee] px-3 py-2.5 text-[13px] text-[#c0442c]">
            <Icon name="ph:translate" class="mr-1 inline size-4 align-text-bottom" />
            {{ $t('inquiryOffer.specialLanguageBanner', { languages: specialLanguageNames }) }}
        </p>

        <!-- The versions, newest first -->
        <p v-if="!state.offers.length && !state.editing" class="text-[13px] text-slate-400">
            {{ $t('inquiryOffer.empty') }}
        </p>

        <div v-for="offer in state.offers" :key="offer.uuid"
            class="border-t border-surface-100 py-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-center gap-2">
                <span class="text-[13px] font-semibold text-slate-800">
                    {{ $t('inquiryOffer.version', { version: offer.version }) }}
                </span>
                <span class="rounded-full px-2.5 py-[3px] text-[11.5px] font-bold" :class="statusClass(offer)">
                    {{ $t('inquiryOffer.statuses.' + offer.status) }}
                </span>
                <span v-if="offer.has_special_language"
                    class="rounded-full bg-[#fdf1ee] px-2.5 py-[3px] text-[11.5px] font-bold text-[#c0442c]">
                    {{ $t('inquiryOffer.specialLanguage') }}
                </span>
                <span v-if="offer.is_overdue"
                    class="rounded-full bg-[#fdf1ee] px-2.5 py-[3px] text-[11.5px] font-bold text-[#c0442c]">
                    {{ $t('inquiryOffer.overdue') }}
                </span>
                <span class="ml-auto text-[13px] font-semibold text-slate-700">
                    {{ formatAmount(offer.monthly_price) }} {{ $t('inquiryOffer.perMonth') }}
                </span>
            </div>
            <p class="mt-0.5 text-[11px] text-slate-400">
                {{ formatAmount(offer.weekly_price) }} {{ $t('inquiryOffer.perWeek') }}
                · {{ formatHours(offer.weekly_hours) }} {{ $t('inquiryOffer.hoursPerWeek') }}
                <template v-if="offer.total_price !== null"> · {{ $t('inquiryOffer.total') }} {{ formatAmount(offer.total_price) }}</template>
                <template v-if="offer.sent_at"> · {{ $t('inquiryOffer.sentOn', { date: formatDateToReadable(offer.sent_at) }) }}</template>
                <template v-if="offer.deadline_at"> · {{ $t('inquiryOffer.deadlineOn', { date: formatDateToReadable(offer.deadline_at) }) }}</template>
                <template v-if="offer.responded_at"> · {{ $t('inquiryOffer.respondedOn', { date: formatDateToReadable(offer.responded_at) }) }}</template>
            </p>
            <p v-if="offer.rejection_reason" class="mt-1 text-[12px] text-slate-600">
                {{ $t('inquiryOffer.rejectionReason') }}: {{ offer.rejection_reason }}
            </p>
            <p v-if="offer.start_wishes" class="mt-1 text-[12px] text-slate-600">
                {{ $t('inquiryOffer.startWishes') }}: {{ offer.start_wishes }}
            </p>
            <p v-if="offer.response_remarks" class="mt-1 whitespace-pre-line text-[12px] text-slate-600">
                {{ offer.response_remarks }}
            </p>

            <div class="mt-2 flex flex-wrap items-center gap-2">
                <FormButton v-if="offer.status === 'draft'" type="button" buttonStyle="action" @click="startEdit(offer)">
                    <Icon name="ph:pencil-simple" class="size-4" />
                    {{ $t('inquiryOffer.edit') }}
                </FormButton>
                <FormButton v-else type="button" buttonStyle="action" @click="toggleDetails(offer)">
                    <Icon name="ph:list-magnifying-glass" class="size-4" />
                    {{ state.detailsFor === offer.uuid ? $t('inquiryOffer.hideDetails') : $t('inquiryOffer.showDetails') }}
                </FormButton>
                <FormButton v-if="offer.status === 'draft'" type="button" buttonStyle="primary" @click="openSend(offer)">
                    <Icon name="ph:paper-plane-tilt" class="size-4" />
                    {{ $t('inquiryOffer.send') }}
                </FormButton>
                <FormButton v-if="offer.status === 'sent'" type="button" buttonStyle="primary" @click="openRespond(offer)">
                    <Icon name="ph:check-square" class="size-4" />
                    {{ $t('inquiryOffer.registerAnswer') }}
                </FormButton>
                <FormButton type="button" buttonStyle="action" @click="download(offer, 'pdf')">
                    <Icon name="ph:file-pdf" class="size-4" />
                    PDF
                </FormButton>
                <FormButton type="button" buttonStyle="action" @click="download(offer, 'docx')">
                    <Icon name="ph:file-doc" class="size-4" />
                    Word
                </FormButton>
                <FormButton v-if="offer.status === 'draft'" type="button" buttonStyle="danger"
                    :aria-label="$t('inquiryOffer.delete')" @click="remove(offer)">
                    <Icon name="ph:trash" class="size-4" />
                </FormButton>
            </div>

            <ModulesUserInquiryOfferResult v-if="state.detailsFor === offer.uuid && offer.calculation"
                class="mt-3" :result="offer.calculation" />
        </div>

        <!-- The calculator: every input can be changed, and the result lists
             what it rests on as it is recalculated. -->
        <div v-if="state.editing" class="mt-4 rounded-lg border border-surface-200 bg-surface-50 p-4">
            <p class="mb-3 text-[13px] font-semibold text-slate-800">
                {{ state.editingUuid
                    ? $t('inquiryOffer.editingVersion', { version: state.editingVersion })
                    : $t('inquiryOffer.newDraft') }}
            </p>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div v-for="key in NUMERIC_INPUTS" :key="key">
                    <FormLabel :for="`offer-${key}`" :label="$t('inquiryOffer.inputs.' + key)" />
                    <FormNumberField :id="`offer-${key}`" :name="`offer-${key}`" :min="0"
                        :placeholder="$t('inquiryOffer.inputs.' + key)" v-model="state.form[key]" />
                </div>
                <div>
                    <FormLabel for="offer-price-date" :label="$t('inquiryOffer.inputs.price_date')" />
                    <FormDateField id="offer-price-date" name="offer-price-date"
                        :placeholder="$t('inquiryOffer.inputs.price_date')" v-model="state.form.price_date" />
                </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                        v-model="state.form.supervision" />
                    {{ $t('inquiryOffer.inputs.supervision') }}
                </label>
                <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                        v-model="state.form.room" />
                    {{ $t('inquiryOffer.inputs.room') }}
                </label>
                <div class="flex items-center gap-2 text-sm text-slate-700">
                    <span>{{ $t('inquiryOffer.inputs.special_language') }}</span>
                    <select v-model="state.form.special_language"
                        class="h-8 rounded-md border border-gray-200 px-2 text-sm focus:border-primary focus:ring-primary">
                        <option :value="null">{{ $t('inquiryOffer.specialLanguageAuto') }}</option>
                        <option :value="true">{{ $t('inquiryOffer.yes') }}</option>
                        <option :value="false">{{ $t('inquiryOffer.no') }}</option>
                    </select>
                </div>
            </div>

            <!-- Prices from the catalogue can be adjusted for this offer alone. -->
            <button type="button" class="mt-4 text-xs font-semibold text-secondary hover:underline"
                @click="state.showOverrides = !state.showOverrides">
                <Icon :name="state.showOverrides ? 'ph:caret-down' : 'ph:caret-right'" class="inline size-3" />
                {{ $t('inquiryOffer.adjustPrices') }}
            </button>
            <div v-if="state.showOverrides" class="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div v-for="key in OVERRIDES" :key="key">
                    <FormLabel :for="`override-${key}`" :label="$t('inquiryOffer.overrides.' + key)" />
                    <FormNumberField :id="`override-${key}`" :name="`override-${key}`" :min="0"
                        :placeholder="catalogueValue(key)" v-model="state.form.overrides[key]" />
                </div>
            </div>

            <!-- Anything the calculator does not know about -->
            <div class="mt-4">
                <p class="mb-1.5 text-xs font-bold text-slate-500">{{ $t('inquiryOffer.extraItems') }}</p>
                <div v-for="(item, index) in state.form.extra_items" :key="index" class="mb-2 flex flex-wrap items-center gap-2">
                    <div class="min-w-[180px] flex-1">
                        <FormTextField :id="`extra-label-${index}`" :name="`extra-label-${index}`"
                            :placeholder="$t('inquiryOffer.extraLabel')" v-model="item.label" :maxLength="255" />
                    </div>
                    <div class="w-32">
                        <FormTextField :id="`extra-amount-${index}`" :name="`extra-amount-${index}`"
                            :placeholder="$t('inquiryOffer.extraAmount')" v-model="item.amount" />
                    </div>
                    <select v-model="item.per"
                        class="h-11 rounded-lg border border-gray-200 px-2 text-sm focus:border-primary focus:ring-primary">
                        <option value="week">{{ $t('inquiryOffer.per.week') }}</option>
                        <option value="month">{{ $t('inquiryOffer.per.month') }}</option>
                        <option value="once">{{ $t('inquiryOffer.per.once') }}</option>
                    </select>
                    <FormButton type="button" buttonStyle="danger" :aria-label="$t('inquiryOffer.delete')"
                        @click="state.form.extra_items.splice(index, 1)">
                        <Icon name="ph:x" class="size-4" />
                    </FormButton>
                </div>
                <button type="button" class="text-xs font-semibold text-secondary hover:underline"
                    @click="state.form.extra_items.push({ label: '', amount: '', per: 'week' })">
                    <Icon name="ph:plus" class="inline size-3" />
                    {{ $t('inquiryOffer.addExtraItem') }}
                </button>
            </div>

            <!-- The consultants chosen for the case are presented in the offer. -->
            <div v-if="state.context?.consultants?.length" class="mt-4">
                <p class="mb-1.5 text-xs font-bold text-slate-500">{{ $t('inquiryOffer.consultants') }}</p>
                <p class="mb-2 text-[11px] text-slate-400">{{ $t('inquiryOffer.consultantsHint') }}</p>
                <div v-for="consultant in state.context.consultants" :key="consultant.uuid" class="mb-2">
                    <FormLabel :for="`consultant-${consultant.uuid}`" :label="consultant.name" />
                    <FormTextArea :id="`consultant-${consultant.uuid}`" :name="`consultant-${consultant.uuid}`"
                        :placeholder="$t('inquiryOffer.consultantNotePlaceholder')" :rows="2"
                        v-model="state.form.consultant_notes[consultant.uuid]" />
                </div>
            </div>

            <div class="mt-4">
                <FormLabel for="offer-note" :label="$t('inquiryOffer.note')" />
                <FormTextArea id="offer-note" name="offer-note" :rows="2"
                    :placeholder="$t('inquiryOffer.note')" v-model="state.form.note" />
            </div>

            <ModulesUserInquiryOfferResult v-if="state.result" class="mt-4" :result="state.result" />

            <div class="mt-4 flex items-center justify-end gap-2 border-t border-surface-200 pt-3">
                <FormButton type="button" buttonStyle="cancel" @click="cancelEdit">{{ $t('cancel') }}</FormButton>
                <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving" @click="saveDraft">
                    {{ $t('inquiryOffer.saveDraft') }}
                </FormButton>
            </div>
        </div>

        <!-- Sending: the date it went and when the answer is due -->
        <Modal size="sm" :title="$t('inquiryOffer.sendTitle')" :show="state.sendFor !== null" @close="state.sendFor = null">
            <template #modal-body>
                <div class="space-y-3">
                    <div>
                        <FormLabel for="send-date" :label="$t('inquiryOffer.sentAt')" />
                        <FormDateField id="send-date" name="send-date" :placeholder="$t('inquiryOffer.sentAt')"
                            v-model="state.send.sent_at" />
                    </div>
                    <div>
                        <FormLabel for="send-days" :label="$t('inquiryOffer.deadlineDays')" />
                        <FormNumberField id="send-days" name="send-days" :min="0"
                            :placeholder="$t('inquiryOffer.deadlineDays')" v-model="state.send.deadline_days" />
                    </div>
                    <p class="text-[13px] text-slate-500">
                        {{ $t('inquiryOffer.deadlinePreview', { date: sendDeadlinePreview }) }}
                    </p>
                    <p class="text-[11px] text-slate-400">{{ $t('inquiryOffer.reminderHint') }}</p>
                    <div class="flex justify-end gap-2 pt-2">
                        <FormButton type="button" buttonStyle="cancel" @click="state.sendFor = null">{{ $t('cancel') }}</FormButton>
                        <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving" @click="send">
                            {{ $t('inquiryOffer.send') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>

        <!-- The municipality's answer -->
        <Modal size="sm" :title="$t('inquiryOffer.answerTitle')" :show="state.respondFor !== null"
            @close="state.respondFor = null">
            <template #modal-body>
                <div class="space-y-3">
                    <div class="flex gap-2">
                        <button v-for="decision in ['accepted', 'rejected']" :key="decision" type="button"
                            class="flex-1 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors"
                            :class="state.respond.decision === decision
                                ? 'border-secondary bg-[#f0fafd] text-secondary'
                                : 'border-surface-200 text-slate-600 hover:bg-surface-50'"
                            @click="state.respond.decision = decision">
                            {{ $t('inquiryOffer.statuses.' + decision) }}
                        </button>
                    </div>
                    <div>
                        <FormLabel for="respond-date" :label="$t('inquiryOffer.respondedAt')" />
                        <FormDateField id="respond-date" name="respond-date" :placeholder="$t('inquiryOffer.respondedAt')"
                            v-model="state.respond.responded_at" />
                    </div>
                    <!-- A rejected offer loses the case, and a lost case asks why
                         once the company keeps a list of reasons. -->
                    <div v-if="state.respond.decision === 'rejected' && lostReasonOptions.length" class="space-y-1">
                        <FormLabel for="respond-lost-reason" :label="$t('inquiryLost.modal.reason')" />
                        <FormSelect id="respond-lost-reason" v-model="state.respond.lost_reason_uuid"
                            :options="lostReasonOptions" :canClear="false" />
                        <FormError :error="state.lostReasonMissing ? $t('validation.thisFieldIsRequired') + '.' : ''" />
                    </div>
                    <div v-if="state.respond.decision === 'rejected'">
                        <FormLabel for="respond-reason" :label="$t('inquiryOffer.rejectionReason')" />
                        <FormTextArea id="respond-reason" name="respond-reason" :rows="2"
                            :placeholder="$t('inquiryOffer.rejectionReason')" v-model="state.respond.rejection_reason" />
                    </div>
                    <div v-if="state.respond.decision === 'accepted'">
                        <FormLabel for="respond-wishes" :label="$t('inquiryOffer.startWishes')" />
                        <FormTextArea id="respond-wishes" name="respond-wishes" :rows="2"
                            :placeholder="$t('inquiryOffer.startWishesPlaceholder')" v-model="state.respond.start_wishes" />
                    </div>
                    <div>
                        <FormLabel for="respond-remarks" :label="$t('inquiryOffer.remarks')" />
                        <FormTextArea id="respond-remarks" name="respond-remarks" :rows="2"
                            :placeholder="$t('inquiryOffer.remarks')" v-model="state.respond.remarks" />
                    </div>
                    <p class="text-[11px] text-slate-400">
                        {{ state.respond.decision === 'accepted' ? $t('inquiryOffer.acceptHint') : $t('inquiryOffer.rejectHint') }}
                    </p>
                    <div class="flex justify-end gap-2 pt-2">
                        <FormButton type="button" buttonStyle="cancel" @click="state.respondFor = null">{{ $t('cancel') }}</FormButton>
                        <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving || !state.respond.decision"
                            @click="respond">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>

        <DialogConfirmation :isModalOpen="state.deleteFor !== null"
            :message="$t('inquiryOffer.confirmDelete') + '?'" @close="state.deleteFor = null" @confirm="confirmRemove" />
    </div>
</template>

<script setup lang="ts">
import { inquiryOfferService } from '@/components/api/user/InquiryOfferService'
import { inquiryLostReasonService } from '@/components/api/user/InquiryLostReasonService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    inquiryUuid: {
        type: String,
        required: true,
    },
})

// The page refetches the stage and the decision log when an offer moves them.
const emit = defineEmits(['changed'])

const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()

const NUMERIC_INPUTS = [
    'contact_hours_per_session',
    'sessions_per_week',
    'admin_hours_per_session',
    'transport_hours_per_session',
    'reports_per_month',
    'duration_weeks',
]

const OVERRIDES = [
    'hourly_rate',
    'admin_hourly_rate',
    'transport_hourly_rate',
    'special_language_surcharge',
    'supervision_price_per_week',
    'room_price_per_session',
    'reporting_price_per_report',
    'weeks_per_month',
]

function emptyForm(): any {
    return {
        contact_hours_per_session: '',
        sessions_per_week: '',
        admin_hours_per_session: '',
        transport_hours_per_session: '',
        reports_per_month: '',
        duration_weeks: '',
        price_date: '',
        supervision: false,
        room: false,
        special_language: null,
        overrides: {},
        extra_items: [],
        consultant_notes: {},
        note: '',
    }
}

const state = reactive({
    offers: [] as any[],
    context: null as any,
    editing: false,
    editingUuid: '' as string,
    editingVersion: 0,
    fromOfferUuid: '' as string,
    form: emptyForm(),
    result: null as any,
    showOverrides: false,
    isSaving: false,
    detailsFor: '' as string,
    sendFor: null as any,
    send: { sent_at: '', deadline_days: '' as any },
    respondFor: null as any,
    respond: { decision: 'accepted', responded_at: '', remarks: '', rejection_reason: '', start_wishes: '', lost_reason_uuid: '' },
    lostReasons: [] as any[],
    lostReasonMissing: false,
    deleteFor: null as any,
})

const latest = computed(() => state.offers[0] ?? null)

const specialLanguageNames = computed(() =>
    (state.context?.languages ?? []).filter((language: any) => language.is_special).map((language: any) => language.name).join(', ')
)

const sendDeadlinePreview = computed(() => {
    const base = state.send.sent_at ? new Date(state.send.sent_at) : new Date()
    const days = Number(state.send.deadline_days || 0)
    base.setDate(base.getDate() + days)

    return formatDateToReadable(base.toISOString().slice(0, 10))
})

onMounted(() => {
    fetchAll()
})

watch(() => props.inquiryUuid, () => fetchAll())

async function fetchAll() {
    if (!props.inquiryUuid) return

    try {
        const [offers, context] = await Promise.all([
            inquiryOfferService.getOffers(props.inquiryUuid),
            inquiryOfferService.getContext(props.inquiryUuid),
        ])
        state.offers = offers?.data ?? []
        state.context = context?.data ?? null
    } catch (_) {
        state.offers = []
    }
}

function formatAmount(value: any) {
    if (value === null || value === undefined || value === '') return '-'

    return Number(value).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr.'
}

function formatHours(value: any) {
    return Number(value ?? 0).toLocaleString('da-DK', { maximumFractionDigits: 2 })
}

function statusClass(offer: any) {
    return {
        draft: 'bg-surface-100 text-slate-500',
        sent: 'bg-[#e8f5fb] text-[#1f7fa0]',
        accepted: 'bg-[#e6f6ee] text-[#177a53]',
        rejected: 'bg-[#fdf1ee] text-[#c0442c]',
        superseded: 'bg-surface-100 text-slate-400',
    }[offer.status as string] ?? 'bg-surface-100 text-slate-500'
}

/**
 * What the catalogue would use for an override, shown as the placeholder so
 * the field says what an empty box means.
 */
function catalogueValue(key: string) {
    const assumption = (state.result?.assumptions ?? []).find((item: any) => item.key === key)

    return assumption && assumption.source !== 'manual' ? String(assumption.value ?? '') : t('inquiryOffer.fromCatalogue')
}

function formFromInputs(inputs: any): any {
    const form = emptyForm()
    for (const key of NUMERIC_INPUTS) {
        form[key] = inputs?.[key] === undefined || inputs?.[key] === null ? '' : String(inputs[key])
    }
    form.price_date = inputs?.price_date ?? ''
    form.supervision = !!inputs?.supervision
    form.room = !!inputs?.room
    form.special_language = inputs?.special_language ?? null
    form.overrides = Object.fromEntries(Object.entries(inputs?.overrides ?? {}).map(([key, value]) => [key, String(value)]))
    form.extra_items = (inputs?.extra_items ?? []).map((item: any) => ({ ...item, amount: String(item.amount ?? '') }))
    form.consultant_notes = { ...(inputs?.consultant_notes ?? {}) }
    form.note = inputs?.note ?? ''

    return form
}

function payload(): any {
    const body: any = {}
    for (const key of NUMERIC_INPUTS) {
        if (state.form[key] !== '' && state.form[key] !== null) body[key] = Number(state.form[key])
    }
    if (state.form.price_date) body.price_date = state.form.price_date
    body.supervision = !!state.form.supervision
    body.room = !!state.form.room
    body.special_language = state.form.special_language
    body.overrides = Object.fromEntries(
        Object.entries(state.form.overrides).filter(([, value]) => value !== '' && value !== null).map(([key, value]) => [key, Number(value)])
    )
    body.extra_items = state.form.extra_items
        .filter((item: any) => (item.label ?? '').trim() || item.amount)
        .map((item: any) => ({ label: item.label, amount: Number(String(item.amount).replace(',', '.')) || 0, per: item.per }))
    body.consultant_notes = state.form.consultant_notes
    body.note = state.form.note || null

    return body
}

function startNew() {
    // A new version starts from the latest one, so revising is not retyping.
    state.form = latest.value ? formFromInputs(latest.value.inputs) : emptyForm()
    state.fromOfferUuid = latest.value?.uuid ?? ''
    state.editingUuid = ''
    state.editing = true
    recalculate()
}

function startEdit(offer: any) {
    state.form = formFromInputs(offer.inputs)
    state.fromOfferUuid = ''
    state.editingUuid = offer.uuid
    state.editingVersion = offer.version
    state.editing = true
    state.result = offer.calculation
    recalculate()
}

function cancelEdit() {
    state.editing = false
    state.editingUuid = ''
    state.result = null
}

function toggleDetails(offer: any) {
    state.detailsFor = state.detailsFor === offer.uuid ? '' : offer.uuid
}

let timer: ReturnType<typeof setTimeout> | null = null

watch(() => state.form, () => {
    if (!state.editing) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(recalculate, 400)
}, { deep: true })

async function recalculate() {
    try {
        const response = await inquiryOfferService.calculate(props.inquiryUuid, payload())
        state.result = response?.data ?? null
    } catch (_) {
        // Validation is shown on save; a half-typed number is not an error yet.
    }
}

async function saveDraft() {
    state.isSaving = true
    try {
        if (state.editingUuid) {
            await inquiryOfferService.updateOffer(state.editingUuid, payload())
        } else {
            await inquiryOfferService.createOffer(props.inquiryUuid, payload())
        }
        cancelEdit()
        await fetchAll()
        successAlert(`${t('alert.success')}!`, `${t('inquiryOffer.saved')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryOffer.saveFailed'))
    } finally {
        state.isSaving = false
    }
}

function openSend(offer: any) {
    state.sendFor = offer
    state.send = {
        sent_at: new Date().toISOString().slice(0, 10),
        deadline_days: String(state.context?.deadline_days ?? 10),
    }
}

async function send() {
    state.isSaving = true
    try {
        const response = await inquiryOfferService.sendOffer(state.sendFor.uuid, {
            sent_at: state.send.sent_at || null,
            deadline_days: state.send.deadline_days === '' ? null : Number(state.send.deadline_days),
        })
        state.sendFor = null
        await fetchAll()
        emit('changed')
        stageFeedback(response?.stage, t('inquiryOffer.sentAlert'))
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryOffer.saveFailed'))
    } finally {
        state.isSaving = false
    }
}

const lostReasonOptions = computed(() => state.lostReasons
    .filter((reason: any) => reason.is_active)
    .map((reason: any) => ({ value: reason.uuid, label: reason.name })))

async function fetchLostReasons() {
    try {
        const response = await inquiryLostReasonService.getReasons()
        state.lostReasons = response?.data ?? []
    } catch {
        state.lostReasons = []
    }
}

function openRespond(offer: any) {
    state.respondFor = offer
    state.lostReasonMissing = false
    state.respond = {
        decision: 'accepted',
        responded_at: new Date().toISOString().slice(0, 10),
        remarks: '',
        rejection_reason: '',
        start_wishes: '',
        lost_reason_uuid: '',
    }
    fetchLostReasons()
}

async function respond() {
    if (state.respond.decision === 'rejected' && lostReasonOptions.value.length && !state.respond.lost_reason_uuid) {
        state.lostReasonMissing = true
        return
    }
    state.isSaving = true
    try {
        const response = await inquiryOfferService.respondToOffer(state.respondFor.uuid, {
            decision: state.respond.decision,
            responded_at: state.respond.responded_at || null,
            remarks: state.respond.remarks || null,
            rejection_reason: state.respond.decision === 'rejected' ? (state.respond.rejection_reason || null) : null,
            start_wishes: state.respond.decision === 'accepted' ? (state.respond.start_wishes || null) : null,
            lost_reason_uuid: state.respond.decision === 'rejected' ? (state.respond.lost_reason_uuid || null) : null,
        })
        state.respondFor = null
        await fetchAll()
        emit('changed')
        stageFeedback(response?.stage, t('inquiryOffer.answerSaved'))
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryOffer.saveFailed'))
    } finally {
        state.isSaving = false
    }
}

/**
 * The answer is always recorded; when the stage it leads to still needs
 * fields, the caseworker is told which, instead of the move silently failing.
 */
function stageFeedback(stage: any, message: string) {
    if (stage && stage.moved === false && stage.missing_fields?.length) {
        errorAlert(t('alert.warning'), t('inquiryOffer.stageBlocked', { fields: stage.missing_fields.join(', ') }))

        return
    }

    successAlert(`${t('alert.success')}!`, `${message}.`)
}

function remove(offer: any) {
    state.deleteFor = offer
}

async function confirmRemove() {
    const offer = state.deleteFor
    state.deleteFor = null
    try {
        await inquiryOfferService.deleteOffer(offer.uuid)
        await fetchAll()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryOffer.saveFailed'))
    }
}

async function download(offer: any, kind: 'pdf' | 'docx') {
    try {
        const blob = kind === 'pdf'
            ? await inquiryOfferService.downloadPdf(offer.uuid)
            : await inquiryOfferService.downloadDocx(offer.uuid)
        if (!blob) return

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${t('inquiryOffer.fileName', { version: offer.version })}.${kind}`
        document.body.appendChild(link)
        link.click()
        link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryOffer.downloadFailed'))
    }
}

defineExpose({ fetchAll })
</script>
