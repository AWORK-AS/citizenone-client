<template>
    <div>
        <Modal size="lg" :title="$t('citizens.medicineJournals.history.giveMedicine')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                    <!-- Medicine context banner -->
                    <div class="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3">
                        <Icon name="ph:pill" class="size-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p class="text-sm font-semibold text-blue-900">
                                {{ medicineName }}
                            </p>
                            <p class="text-xs text-blue-600 mt-0.5">
                                {{ props.selectedMedicine?.medicine?.ingredients }}
                                <span v-if="props.selectedMedicine?.strength">
                                    · {{ $t('citizens.medicineJournals.giveMedicineModal.strengthLabel') }}
                                    {{ props.selectedMedicine?.strength }}
                                </span>
                                <span v-if="props.selectedMedicine?.dosage?.dk_name">
                                    · {{ props.selectedMedicine?.dosage?.dk_name }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <!-- Calendar -->
                    <div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            {{ $t('citizens.medicineJournals.giveMedicineModal.selectDate') }}
                        </p>
                        <div class="border border-gray-200 rounded-xl p-4">
                            <div class="flex items-center justify-between mb-3">
                                <button type="button" @click="prevMonth"
                                    class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                                    <Icon name="ph:caret-left" class="size-4" />
                                </button>
                                <span class="text-sm font-semibold text-gray-800 capitalize">
                                    {{ currentMonthLabel }}
                                </span>
                                <button type="button" @click="nextMonth"
                                    class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                                    <Icon name="ph:caret-right" class="size-4" />
                                </button>
                            </div>
                            <div class="grid grid-cols-7 mb-1">
                                <div v-for="(day, dayIndex) in calendarDayHeaders" :key="dayIndex"
                                    class="text-center text-xs text-gray-400 font-medium py-1">
                                    {{ day }}
                                </div>
                            </div>
                            <div class="grid grid-cols-7 gap-y-0.5">
                                <button v-for="day in calendarDays" :key="day.dateStr" type="button"
                                    @click="selectDate(day)" :disabled="!day.isCurrentMonth" :class="[
                                        'relative flex flex-col items-center justify-center h-9 rounded-lg text-xs transition-all',
                                        !day.isCurrentMonth ? 'text-gray-300 cursor-default' : 'cursor-pointer',
                                        // Multi-date mode: highlight selected dates
                                        state.multiDateMode && state.selectedDates.includes(day.dateStr) ? 'bg-primary text-white font-semibold' : '',
                                        // Single mode: highlight selected date
                                        !state.multiDateMode && day.dateStr === state.selectedDate ? 'bg-primary text-white font-semibold' : '',
                                        day.isToday && !state.selectedDates.includes(day.dateStr) && day.dateStr !== state.selectedDate ? 'ring-2 ring-primary/40 font-semibold text-primary' : '',
                                        day.isCurrentMonth && !state.selectedDates.includes(day.dateStr) && day.dateStr !== state.selectedDate && !day.isToday ? 'hover:bg-gray-100 text-gray-700' : '',
                                        day.hasOverdue && !state.selectedDates.includes(day.dateStr) && day.dateStr !== state.selectedDate ? 'text-red-700' : '',
                                    ]">
                                    <span>
                                        {{ day.dayNum }}
                                    </span>
                                    <div v-if="day.isCurrentMonth && day.dots.length > 0" class="flex gap-0.5 mt-0.5">
                                        <span v-for="(dot, di) in day.dots.slice(0, 3)" :key="di"
                                            :class="['w-1 h-1 rounded-full', day.dateStr === state.selectedDate ? 'bg-white/70' : dot]">
                                        </span>
                                    </div>
                                </button>
                            </div>
                            <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <div class="flex gap-4">
                                    <span class="flex items-center gap-1.5 text-xs text-gray-500">
                                        <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                                        {{ $t('citizens.medicineJournals.giveMedicineModal.legendGiven') }}
                                    </span>
                                    <span class="flex items-center gap-1.5 text-xs text-gray-500">
                                        <span class="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                                        {{ $t('citizens.medicineJournals.giveMedicineModal.legendOverdue') }}
                                    </span>
                                    <span class="flex items-center gap-1.5 text-xs text-gray-500">
                                        <span class="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                                        {{ $t('citizens.medicineJournals.giveMedicineModal.legendScheduled') }}
                                    </span>
                                </div>
                                <button type="button" @click="toggleMultiDateMode"
                                    :class="['text-xs px-2.5 py-1 rounded-lg border font-medium transition-all', state.multiDateMode ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/40 hover:bg-primary/5']">
                                    {{
                                        state.multiDateMode ? '✓ ' +
                                            $t('citizens.medicineJournals.giveMedicineModal.multipleDays') : '+ ' +
                                        $t('citizens.medicineJournals.giveMedicineModal.multipleDays')
                                    }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Time slots -->
                    <div v-if="!props.selectedMedicine?.is_pn_medicine && !state.multiDateMode">
                        <div class="flex items-center justify-between mb-2">
                            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                {{
                                    $t('citizens.medicineJournals.giveMedicineModal.timeSlots') }} —
                                {{ selectedDateLabel }}
                            </p>
                            <span v-if="overdueCount > 0"
                                class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                {{
                                    $t('citizens.medicineJournals.giveMedicineModal.overdueCount', { n: overdueCount })
                                }}
                            </span>
                        </div>

                        <div v-if="state.isLoadingSlots" class="flex justify-center py-8">
                            <Icon name="ph:spinner" class="size-6 text-primary animate-spin" />
                        </div>

                        <div v-else-if="state.slots.length === 0"
                            class="border border-dashed border-gray-200 rounded-xl py-8 text-center text-sm text-gray-400">
                            {{ $t('citizens.medicineJournals.giveMedicineModal.noScheduledDoses') }}
                        </div>

                        <div v-else class="space-y-3">
                            <div v-for="slot in state.slots" :key="slot.time" :class="[
                                'rounded-xl border overflow-hidden',
                                slot.status === 'given' || slot.status === 'delivered' ? 'border-green-200' :
                                    slot.status === 'deviated' ? 'border-red-200' :
                                        slot.isOverdue ? 'border-red-300' : 'border-gray-200'
                            ]">
                                <div :class="[
                                    'flex items-center justify-between px-4 py-2.5',
                                    slot.status === 'given' || slot.status === 'delivered' ? 'bg-green-50' :
                                        slot.status === 'deviated' ? 'bg-red-50' :
                                            slot.isOverdue ? 'bg-red-50' : 'bg-gray-50'
                                ]">
                                    <div class="flex items-center gap-2">
                                        <span v-if="slot.isOverdue && !slot.status"
                                            class="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium animate-pulse">
                                            {{ slot.overdueLabel }}
                                        </span>
                                        <span :class="[
                                            'text-sm font-semibold',
                                            slot.status === 'given' || slot.status === 'delivered' ? 'text-green-800' :
                                                slot.isOverdue && !slot.status ? 'text-red-800' : 'text-gray-800'
                                        ]">
                                            {{ $t('citizens.medicineJournals.giveMedicineModal.at') }}
                                            {{ slot.time }}
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs text-gray-500">
                                            {{ slot.dosage }}
                                            {{ props.selectedMedicine?.dosage?.dk_name ?? 'pcs' }}
                                        </span>
                                        <span v-if="slot.status === 'given'"
                                            class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                            <Icon name="ph:check-circle" class="size-3" />
                                            {{ $t('citizens.medicineJournals.giveMedicineModal.given') }}
                                        </span>
                                        <span v-else-if="slot.status === 'delivered'"
                                            class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                            {{ $t('citizens.medicineJournals.giveMedicineModal.delivered') }}
                                        </span>
                                        <span v-else-if="slot.status === 'deviated'"
                                            class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                            {{ $t('citizens.medicineJournals.giveMedicineModal.deviation') }}
                                        </span>
                                    </div>
                                </div>

                                <div class="px-4 py-3 space-y-2">
                                    <div class="grid grid-cols-3 gap-2">
                                        <button v-for="type in typeOptions" :key="type.value" type="button"
                                            @click="setSlotType(slot, type.value)" :class="[
                                                'py-2 rounded-lg text-xs font-medium border transition-all',
                                                slot.selectedType === type.value ? type.activeClass : type.inactiveClass
                                            ]">
                                            {{ type.label }}
                                        </button>
                                    </div>
                                    <div v-if="slot.selectedType === 'deviated' || slot.selectedType === 'delivered'"
                                        class="space-y-1">
                                        <label class="text-xs text-gray-500">
                                            {{
                                                slot.selectedType === 'delivered' ?
                                                    $t('citizens.medicineJournals.giveMedicineModal.amountDelivered') :
                                                    $t('citizens.medicineJournals.giveMedicineModal.amountGiven')
                                            }}
                                        </label>
                                        <input type="text" v-model="slot.customDosage"
                                            :placeholder="`Standard: ${slot.dosage}`"
                                            class="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:border-primary" />
                                    </div>
                                    <input v-if="slot.selectedType" type="text" v-model="slot.comment"
                                        :placeholder="$t('citizens.medicineJournals.giveMedicineModal.commentOptional')"
                                        class="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Multi-date confirmation step -->
                    <div v-if="state.multiDateMode && state.selectedDates.length > 0"
                        class="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                        <div class="flex items-center justify-between">
                            <p class="text-sm font-semibold text-primary">
                                {{ $t('citizens.medicineJournals.giveMedicineModal.daySelected', {
                                    n:
                                        state.selectedDates.length
                                }) }}
                            </p>
                            <button type="button" @click="state.selectedDates = []"
                                class="text-xs text-gray-400 hover:text-red-500">
                                {{ $t('citizens.medicineJournals.giveMedicineModal.clear') }}
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            <span v-for="d in state.selectedDates.slice().sort()" :key="d"
                                class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                                {{ formatDateShort(d) }}
                                <button type="button" @click="removeDate(d)" class="hover:text-red-500">
                                    ×
                                </button>
                            </span>
                        </div>
                        <div v-if="state.slots.length > 0" class="space-y-2">
                            <p class="text-xs text-gray-500 font-medium">
                                {{ $t('citizens.medicineJournals.giveMedicineModal.registerForAllDays') }}
                            </p>
                            <div class="grid grid-cols-3 gap-2">
                                <button v-for="type in typeOptions" :key="type.value" type="button"
                                    @click="state.multiType = type.value"
                                    :class="['py-2 rounded-lg text-xs font-medium border transition-all', state.multiType === type.value ? type.activeClass : type.inactiveClass]">
                                    {{ type.label }}
                                </button>
                            </div>
                            <div v-if="state.multiType" class="space-y-1.5">
                                <div class="text-xs text-gray-500 bg-white rounded-lg px-3 py-2 border border-gray-200">
                                    <span class="font-medium">
                                        {{ $t('citizens.medicineJournals.giveMedicineModal.total') }}
                                    </span>
                                    {{ state.selectedDates.length }}
                                    {{ $t('citizens.medicineJournals.giveMedicineModal.days') }} ×
                                    {{ state.slots.length }}
                                    {{ $t('citizens.medicineJournals.giveMedicineModal.timeSlotsEquals') }}
                                    <span class="font-semibold text-primary">
                                        {{ state.selectedDates.length * state.slots.length }}
                                        {{ $t('citizens.medicineJournals.giveMedicineModal.registrations') }}
                                    </span>
                                    <span class="ml-1 text-gray-400">
                                        ({{ totalDosage }}
                                        {{ props.selectedMedicine?.dosage?.dk_name ??
                                            $t('citizens.medicineJournals.giveMedicineModal.pcs') }}
                                        {{ $t('citizens.medicineJournals.giveMedicineModal.inTotal') }})
                                    </span>
                                </div>
                                <input type="text" v-model="state.multiComment"
                                    :placeholder="$t('citizens.medicineJournals.giveMedicineModal.commentForAll')"
                                    class="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:border-primary" />
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="grid grid-cols-2 gap-3 pt-2">
                        <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                            {{ $t('cancel') }}
                        </FormButton>
                        <!-- Multi-date save -->
                        <button v-if="state.multiDateMode" type="button"
                            :disabled="!state.multiType || state.selectedDates.length === 0 || state.isSaving"
                            @click="saveMultiDate" :class="[
                                'flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border',
                                state.multiType && state.selectedDates.length > 0 && !state.isSaving
                                    ? 'bg-primary text-white border-primary hover:bg-primary/90'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            ]">
                            <Icon v-if="state.isSaving" name="ph:spinner" class="size-4 animate-spin" />
                            {{
                                state.isSaving ? $t('citizens.medicineJournals.giveMedicineModal.saving') :
                                    $t('citizens.medicineJournals.giveMedicineModal.saveDay', { n: state.selectedDates.length })
                            }}
                        </button>
                        <!-- Single date save -->
                        <button v-else type="button" :disabled="!hasAnyTypeSelected || state.isSaving" @click="saveAll"
                            :class="[
                                'flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border',
                                hasAnyTypeSelected && !state.isSaving
                                    ? 'bg-primary text-white border-primary hover:bg-primary/90'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            ]">
                            <Icon v-if="state.isSaving" name="ph:spinner" class="size-4 animate-spin" />
                            {{
                                state.isSaving ? $t('citizens.medicineJournals.giveMedicineModal.saving') :
                                    (selectedCount > 1 ? $t('citizens.medicineJournals.giveMedicineModal.saveDoses', {
                                        n:
                                            selectedCount
                                    }) : $t('citizens.medicineJournals.giveMedicineModal.saveDose'))
                            }}
                        </button>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { useCustomPagesStore } from '@/store/custom-pages'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    selectedMedicine: { type: Object, required: true },
    preselectedDate: { type: String, default: null },
    preselectedTime: { type: String, default: null },
})
const emit = defineEmits(['close', 'refreshMedicines'])

const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any

const calendarDayHeaders = computed(() =>
    language.locale.value === 'dk'
        ? ['M', 'T', 'O', 'T', 'F', 'L', 'S']
        : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
)

const state = reactive({
    selectedDate: moment().format('YYYY-MM-DD'),
    calendarMonth: moment().startOf('month'),
    slots: [] as any[],
    isLoadingSlots: false,
    isSaving: false,
    error: null as any,
    multiDateMode: false,
    selectedDates: [] as string[], // for multi-date selection
    multiType: '' as string, // given/delivered/deviated for all dates
    multiComment: '' as string,
    multiStep: 1 as number, // 1=select dates, 2=confirm
})

const typeOptions = computed(() => [
    {
        value: 'given',
        label: customPagesStore.getCustomPagesName?.giveMedicine ?? t('citizens.medicineJournals.giveMedicineModal.given'),
        activeClass: 'bg-green-700 text-white border-green-700',
        inactiveClass: 'bg-white text-green-700 border-green-300 hover:bg-green-50',
    },
    {
        value: 'delivered',
        label: t('citizens.medicineJournals.history.form.type.delivered'),
        activeClass: 'bg-primary text-white border-primary',
        inactiveClass: 'bg-white text-primary border-primary/40 hover:bg-primary/5',
    },
    {
        value: 'deviated',
        label: t('citizens.medicineJournals.history.form.type.deviated'),
        activeClass: 'bg-red-600 text-white border-red-600',
        inactiveClass: 'bg-white text-red-600 border-red-300 hover:bg-red-50',
    },
])

const medicineName = computed(() =>
    language.locale.value === 'en'
        ? props.selectedMedicine?.medicine?.en_name
        : props.selectedMedicine?.medicine?.dk_name
)

const currentMonthLabel = computed(() =>
    state.calendarMonth.clone().locale('en').format('MMMM YYYY')
)

const selectedDateLabel = computed(() =>
    moment(state.selectedDate).locale('en').format('dddd, D MMMM')
)

const overdueCount = computed(() =>
    state.slots.filter(s => s.isOverdue && !s.status).length
)

const hasAnyTypeSelected = computed(() =>
    state.slots.some(s => s.selectedType && !s.status)
)

const selectedCount = computed(() =>
    state.slots.filter(s => s.selectedType && !s.status).length
)

const totalDosage = computed(() => {
    if (!state.multiType || !state.selectedDates.length) return 0
    return state.slots.reduce((sum: number, s: any) => {
        const d = parseFloat(s.dosage) || 0
        return sum + d * state.selectedDates.length
    }, 0)
})

const calendarDays = computed(() => {
    const start = state.calendarMonth.clone().startOf('isoWeek')
    const end = state.calendarMonth.clone().endOf('month').endOf('isoWeek')
    const days = []
    let cur = start.clone()
    const dosages = props.selectedMedicine?.max_dosage_per_time ?? []

    while (cur.isSameOrBefore(end, 'day')) {
        const ds = cur.format('YYYY-MM-DD')
        const isCurrentMonth = cur.month() === state.calendarMonth.month()
        const isToday = cur.isSame(moment(), 'day')
        const isPast = cur.isBefore(moment(), 'day')
        const dots: string[] = []
        let hasOverdue = false

        if (isCurrentMonth && dosages.length > 0) {
            if (isPast) {
                dots.push('bg-green-500')
            } else if (isToday) {
                const now = new Date()
                const anyOverdue = dosages.some((d: any) => {
                    if (d.status) return false
                    const [h, m] = (d.time ?? '').split(':').map(Number)
                    const sched = new Date(); sched.setHours(h, m, 0, 0)
                    return now > sched
                })
                if (anyOverdue) { dots.push('bg-red-500'); hasOverdue = true }
                else dots.push('bg-amber-400')
            } else {
                dots.push('bg-amber-400')
            }
        }

        days.push({ dateStr: ds, dayNum: cur.date(), isCurrentMonth, isToday, hasOverdue, dots })
        cur.add(1, 'day')
    }
    return days
})

function prevMonth() { state.calendarMonth = state.calendarMonth.clone().subtract(1, 'month') }
function nextMonth() { state.calendarMonth = state.calendarMonth.clone().add(1, 'month') }

function selectDate(day: any) {
    if (!day.isCurrentMonth) return
    if (state.multiDateMode) {
        toggleDateSelection(day)
    } else {
        state.selectedDate = day.dateStr
        buildSlots(day.dateStr)
    }
}

async function buildSlots(dateStr: string) {
    const now = new Date()
    const isToday = dateStr === moment().format('YYYY-MM-DD')
    const isFuture = dateStr > moment().format('YYYY-MM-DD')
    const rawDosages = props.selectedMedicine?.max_dosage_per_time ?? []

    // Fetch real history from API for this date
    let historyByTime: Record<string, string | null> = {}
    if (!isFuture && props.selectedMedicine?.uuid) {
        try {
            const history = await medicineHistoryService.getMedicineHistoryByMedicineUuid(props.selectedMedicine.uuid, { date: dateStr })
            if (Array.isArray(history?.data)) {
                history.data.forEach((h: any) => {
                    historyByTime[h.time] = h.type
                })
            }
        } catch (e) { /* ignore */ }
    }

    state.slots = rawDosages.map((d: any) => {
        let isOverdue = false
        let overdueLabel = ''
        const effectiveStatus = isFuture ? null : (historyByTime[d.time] ?? null)

        if (isToday && !effectiveStatus) {
            const [h, mi] = (d.time ?? '00:00').split(':').map(Number)
            const sched = new Date(); sched.setHours(h, mi, 0, 0)
            if (now > sched) {
                isOverdue = true
                const diffMin = Math.round((now.getTime() - sched.getTime()) / 60000)
                if (diffMin < 60) overdueLabel = t('citizens.medicineJournals.giveMedicineModal.overdueMinutes', { minutes: diffMin })
                else {
                    const h2 = Math.floor(diffMin / 60), m2 = diffMin % 60
                    overdueLabel = m2 > 0
                        ? t('citizens.medicineJournals.giveMedicineModal.overdueHoursMinutes', { hours: h2, minutes: m2 })
                        : t('citizens.medicineJournals.giveMedicineModal.overdueHours', { hours: h2 })
                }
            }
        }

        return {
            time: d.time,
            dosage: d.dosage,
            status: effectiveStatus,
            isOverdue,
            overdueLabel,
            selectedType: effectiveStatus ?? '',
            customDosage: '',
            comment: '',
        }
    })
}

function setSlotType(slot: any, type: string) {
    slot.selectedType = slot.selectedType === type ? '' : type
    if (slot.selectedType !== 'deviated' && slot.selectedType !== 'delivered') slot.customDosage = ''
}

function toggleMultiDateMode() {
    state.multiDateMode = !state.multiDateMode
    state.selectedDates = []
    state.multiType = ''
    state.multiComment = ''
}

function toggleDateSelection(day: any) {
    if (!day.isCurrentMonth) return
    const idx = state.selectedDates.indexOf(day.dateStr)
    if (idx === -1) {
        state.selectedDates.push(day.dateStr)
    } else {
        state.selectedDates.splice(idx, 1)
    }
}

function removeDate(dateStr: string) {
    state.selectedDates = state.selectedDates.filter(d => d !== dateStr)
}

function formatDateShort(dateStr: string): string {
    return moment(dateStr).locale('en').format('D MMM')
}

async function saveMultiDate() {
    if (!state.multiType || state.selectedDates.length === 0 || !state.slots.length) return
    state.isSaving = true
    state.error = null
    try {
        // Save one entry per date per timeslot in parallel
        await Promise.all(
            state.selectedDates.map(async (dateStr: string) => {
                await medicineHistoryService.saveMedicineHistory({
                    medicine_uuid: props.selectedMedicine?.uuid,
                    date: dateStr,
                    dosages: state.slots.map((s: any) => ({
                        medicine_uuid: props.selectedMedicine?.uuid,
                        time: s.time,
                        type: state.multiType,
                        dosage: s.dosage,
                        comment: state.multiComment,
                    })),
                })
            })
        )
        successAlert(`${t('alert.success')}!`, t('citizens.medicineJournals.giveMedicineModal.registeredForDays', { n: state.selectedDates.length }))
        state.selectedDates = []
        state.multiType = ''
        state.multiComment = ''
        state.multiDateMode = false
        emit('refreshMedicines')
        setTimeout(() => closeModal(), 600)
    } catch (error: any) {
        state.error = { message: error?.data?.message ?? error?.message ?? t('citizens.medicineJournals.giveMedicineModal.anErrorOccurred') }
    }
    state.isSaving = false
}

async function saveAll() {
    const toSave = state.slots.filter(s => s.selectedType && !s.status)
    if (!toSave.length) return
    state.isSaving = true
    state.error = null
    try {
        await medicineHistoryService.saveMedicineHistory({
            medicine_uuid: props.selectedMedicine?.uuid,
            date: state.selectedDate,
            dosages: toSave.map(s => ({
                medicine_uuid: props.selectedMedicine?.uuid,
                time: s.time,
                type: s.selectedType,
                dosage: s.customDosage || s.dosage,
                comment: s.comment,
            })),
        })
        successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.history.form.alert.successfullyAdded')}.`)
        // Update slots locally so UI reflects immediately
        toSave.forEach(s => {
            s.status = s.selectedType
            s.isOverdue = false
            s.overdueLabel = ''
            s.selectedType = ''
        })
        emit('refreshMedicines')
        // Short delay so parent can refresh before we close
        setTimeout(() => closeModal(), 800)
    } catch (error: any) {
        state.error = { message: error?.data?.message ?? error?.message ?? t('citizens.medicineJournals.giveMedicineModal.anErrorOccurredRetry') }
    }
    state.isSaving = false
}


watch(() => props.isModalOpen, (val) => {
    if (val) {
        const initDate = props.preselectedDate ?? moment().format('YYYY-MM-DD')
        state.selectedDate = initDate
        state.calendarMonth = moment(initDate).startOf('month')
        state.error = null
        buildSlots(initDate)
        // If a specific time was preselected, auto-select 'given' for that slot
        if (props.preselectedTime) {
            nextTick(() => {
                const slot = state.slots.find(s => s.time === props.preselectedTime && !s.status)
                if (slot) slot.selectedType = 'given'
            })
        }
    }
})

function closeModal() { emit('close') }
</script>
