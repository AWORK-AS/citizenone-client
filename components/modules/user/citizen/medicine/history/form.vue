<template>
    <form @submit.prevent="validateForm()" id="formMedicineHistory">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="$t('citizens.medicineJournals.history.form.noMedicineToday')"
            v-if="!props.selectedMedicine.is_pn_medicine && state.formMedicineHistory.dosages?.length === 0" />
        <div class="space-y-3">
            <div class="space-y-1" v-if="!props.selectedMedicine.is_pn_medicine">
                <FormLabel for="date" :label="$t('citizens.medicineJournals.history.form.date')" />
                <FormDateField id="date" name="date" :placeholder="$t('citizens.medicineJournals.history.form.date')"
                    v-model="state.formMedicineHistory.date" />
                <FormError :error="v$?.formMedicineHistory?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
            </div>
            <!-- Calendar -->
            <div v-else>
                <p class="text-sm text-gray-600 mb-2">
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
                        <button v-for="day in calendarDays" :key="day.dateStr" type="button" @click="selectDate(day)"
                            :disabled="!day.isCurrentMonth" :class="[
                                'relative flex flex-col items-center justify-center h-9 rounded-lg text-xs transition-all',
                                !day.isCurrentMonth ? 'text-gray-300 cursor-default' : 'cursor-pointer',
                                // Multi-date mode: highlight selected dates
                                state.calendar.multiDateMode && state.calendar.selectedDates.includes(day.dateStr) ? 'bg-primary text-white font-semibold' : '',
                                // Single mode: highlight selected date
                                !state.calendar.multiDateMode && day.dateStr === state.calendar.selectedDate ? 'bg-primary text-white font-semibold' : '',
                                day.isToday && !state.calendar.selectedDates.includes(day.dateStr) && day.dateStr !== state.calendar.selectedDate ? 'ring-2 ring-primary/40 font-semibold text-primary' : '',
                                day.isCurrentMonth && !state.calendar.selectedDates.includes(day.dateStr) && day.dateStr !== state.calendar.selectedDate && !day.isToday ? 'hover:bg-gray-100 text-gray-700' : '',
                                day.hasOverdue && !state.calendar.selectedDates.includes(day.dateStr) && day.dateStr !== state.calendar.selectedDate ? 'text-red-700' : '',
                            ]">
                            <span>
                                {{ day.dayNum }}
                            </span>
                        </button>
                    </div>
                    <div class="flex items-center justify-end mt-3 pt-3 border-t border-gray-100">
                        <button type="button" @click="toggleMultiDateMode"
                            :class="['text-xs px-2.5 py-1 rounded-lg border font-medium transition-all', state.calendar.multiDateMode ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/40 hover:bg-primary/5']">
                            {{
                                state.calendar.multiDateMode ? '✓ ' +
                                    $t('citizens.medicineJournals.giveMedicineModal.multipleDays') : '+ ' +
                                $t('citizens.medicineJournals.giveMedicineModal.multipleDays')
                            }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="space-y-3" v-if="props.selectedMedicine.is_pn_medicine">
                <div class="space-y-2">
                    <div class="flex items-center gap-x-1">
                        <FormLabel for="dosage" :label="$t('citizens.medicineJournals.history.form.dose')" />
                        <div
                            class="bg-blue-50 border border-blue-200 rounded-md text-blue-600 p-1 text-xs flex items-center gap-x-1">
                            <div class="flex items-center">
                                <Icon name="ph:info" class="h-3.5 w-3.5" aria-hidden="true" />
                            </div>
                            {{
                                $t('citizens.medicineJournals.history.form.maximumDosePerAdministrationForThisCitizenIs',
                                    {
                                        n:
                                            props.selectedMedicine?.max_dose_per_administration
                                    })
                            }}.
                        </div>
                    </div>
                    <FormTextField id="dosage" name="dosage"
                        :placeholder="$t('citizens.medicineJournals.history.form.dose')"
                        v-model="state.formMedicineHistory.dosage" @input="handlePnDosageInput" />
                    <FormError :error="v$?.formMedicineHistory?.dosage?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.dosage?.[0]" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ $t('citizens.medicineJournals.history.form.type.type') }}
                    </p>
                    <div>
                        <RadioGroup v-model="state.formMedicineHistory.type"
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <RadioGroupOption as="template" v-for="(type, index) in state.options.types" :key="index"
                                :value="type.value" v-slot="{ active, checked }">
                                <div :class="[
                                    active ? 'ring-1 ring-offset-2' : '',
                                    type.title === 'Delivered' && 'ring-primary',
                                    type.title === 'Deviated' && 'ring-red-600',
                                    type.title === 'Given' && 'ring-green-700',
                                    checked && type.title === 'Delivered' && 'bg-primary text-white ring-0 hover:bg-primary',
                                    checked && type.title === 'Deviated' && 'bg-red-600 text-white ring-0 hover:bg-red-600',
                                    checked && type.title === 'Given' && 'bg-green-700 text-white ring-0 hover:bg-green-700',
                                    !active && !checked && type.title === 'Delivered' && 'border border-primary ring-inset text-primary hover:bg-primary/5',
                                    !active && !checked && type.title === 'Deviated' && 'border border-red-600 ring-inset text-red-600 hover:bg-red-50',
                                    !active && !checked && type.title === 'Given' && 'border border-green-700 ring-inset text-green-700 hover:bg-green-50',
                                    active && checked ? 'text-white ring-1' : '',
                                    'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
                                    <span v-if="type.title === 'Delivered'">
                                        {{
                                            $t('citizens.medicineJournals.history.form.type.delivered')
                                        }}
                                    </span>
                                    <span v-if="type.title === 'Deviated'">
                                        {{
                                            $t('citizens.medicineJournals.history.form.type.deviated')
                                        }}
                                    </span>
                                    <span v-if="type.title === 'Given'">
                                        {{ customPagesStore.getCustomPagesName?.giveMedicine }}
                                    </span>
                                </div>
                            </RadioGroupOption>
                        </RadioGroup>
                    </div>
                    <FormError :error="v$?.formMedicineHistory?.type?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.type?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="evaluator" :label="$t('citizens.medicineJournals.history.form.evaluator')" />
                    <FormSelect id="evaluator" name="evaluator" :options="state.options.evaluators"
                        v-model="state.formMedicineHistory.evaluator" />
                    <FormError :error="v$?.formMedicineHistory?.evaluator?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.evaluator?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="evaluation_frequency"
                        :label="`${$t('citizens.medicineJournals.history.form.evaluationFrequency')}?`" />
                    <FormSelectMultiple id="evaluation_frequency" name="evaluation_frequency"
                        :options="state.options.evaluation_frequencies"
                        v-model="state.formMedicineHistory.evaluation_frequency" />
                    <FormError
                        :error="v$?.formMedicineHistory?.evaluation_frequency?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.evaluation_frequency?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel :for="`comment`" :label="$t('citizens.medicineJournals.history.form.comment')" />
                    <FormTextArea :id="`comment`" :name="`comment`"
                        :placeholder="$t('citizens.medicineJournals.history.form.comment')"
                        v-model="state.formMedicineHistory.comment" />
                </div>
            </div>
            <div class="space-y-4" v-else>
                <Disclosure v-slot="{ open }" v-for="(dosage, index) in state.formMedicineHistory.dosages" :key="index">
                    <div>
                        <DisclosureButton :class="[
                            !open ? 'rounded-full' : 'rounded-tl-md rounded-tr-md',
                            dosage?.type === null ? 'ring-red-500' : 'ring-gray-100',
                            'w-full bg-gray-100 ring-1 flex justify-between p-3'
                        ]">
                            <p class="text-sm font-semibold text-gray-700">
                                {{ t('citizens.medicineJournals.history.form.time') }}:
                                {{ dosage?.time }}
                            </p>
                            <div class="flex items-center">
                                <Icon name="ic:round-keyboard-arrow-down" class="w-4 h-4" v-if="!open" />
                                <Icon name="ic:round-keyboard-arrow-up" class="w-4 h-4" v-else />
                            </div>
                        </DisclosureButton>
                        <DisclosurePanel>
                            <div :class="[
                                dosage?.type === null ? 'ring-red-500' : 'ring-gray-900/5',
                                'bg-white shadow-sm ring-1 rounded-bl-lg rounded-br-lg px-4 py-6 sm:p-8'
                            ]">
                                <div class="space-y-3">
                                    <div class="space-y-1">
                                        <FormLabel :for="`quantity_${index}`"
                                            :label="$t('citizens.medicineJournals.history.form.dose')" />
                                        <FormTextField :id="`quantity_${index}`" :name="`quantity_${index}`"
                                            :placeholder="$t('citizens.medicineJournals.history.form.dose')"
                                            :value="dosage.dosage"
                                            @keyup="(event: any) => handleQuantityInput(event, index as number)" />
                                    </div>
                                    <div class="space-y-1">
                                        <p class="text-sm text-gray-600">
                                            {{ $t('citizens.medicineJournals.history.form.type.type') }}
                                        </p>
                                        <div>
                                            <RadioGroup v-model="state.formMedicineHistory.dosages[index].type"
                                                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                <RadioGroupOption as="template"
                                                    v-for="(type, index) in state.options.types" :key="index"
                                                    :value="type.value" v-slot="{ active, checked }">
                                                    <div
                                                        :class="[
                                                            active ? 'ring-1 ring-offset-2' : '',
                                                            type.title === 'Delivered' && 'ring-primary',
                                                            type.title === 'Deviated' && 'ring-red-600',
                                                            type.title === 'Given' && 'ring-green-700',
                                                            checked && type.title === 'Delivered' && 'bg-primary text-white ring-0 hover:bg-primary',
                                                            checked && type.title === 'Deviated' && 'bg-red-600 text-white ring-0 hover:bg-red-600',
                                                            checked && type.title === 'Given' && 'bg-green-700 text-white ring-0 hover:bg-green-700',
                                                            !active && !checked && type.title === 'Delivered' && 'border border-primary ring-inset text-primary',
                                                            !active && !checked && type.title === 'Deviated' && 'border border-red-600 ring-inset text-red-600',
                                                            !active && !checked && type.title === 'Given' && 'border border-green-700 ring-inset text-green-700',
                                                            active && checked ? 'text-white ring-1' : '',
                                                            'cursor-pointer flex items-center justify-center rounded-full px-2 py-2 text-xs']">
                                                        <span v-if="type.title === 'Delivered'">
                                                            {{
                                                                $t('citizens.medicineJournals.history.form.type.delivered')
                                                            }}
                                                        </span>
                                                        <span v-if="type.title === 'Deviated'">
                                                            {{
                                                                $t('citizens.medicineJournals.history.form.type.deviated')
                                                            }}
                                                        </span>
                                                        <span v-if="type.title === 'Given'">
                                                            {{ customPagesStore.getCustomPagesName?.giveMedicine }}
                                                        </span>
                                                    </div>
                                                </RadioGroupOption>
                                            </RadioGroup>
                                        </div>
                                        <FormError
                                            :error="v$?.formMedicineHistory?.type?.$errors[0]?.$message.toString()" />
                                        <FormError :error="props?.error?.errors?.type?.[0]" />
                                    </div>
                                    <div class="space-y-1 col-span-2">
                                        <FormLabel :for="`comment_${index}`"
                                            :label="$t('citizens.medicineJournals.history.form.comment')" />
                                        <FormTextArea :id="`comment_${index}`" :name="`comment_${index}`"
                                            :placeholder="$t('citizens.medicineJournals.history.form.comment')"
                                            v-model="state.formMedicineHistory.dosages[index].comment" />
                                    </div>
                                </div>
                            </div>
                        </DisclosurePanel>
                    </div>
                </Disclosure>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="w-full">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <DialogConfirmation :isModalOpen="state.modal.isMoreThanMedicineDailyConfirmationOpen"
            :message="doseConfirmationMessage"
            @close="state.modal.isMoreThanMedicineDailyConfirmationOpen = false; state.pendingLimit = null"
            @confirm="submitForm" />
    </form>
</template>

<script setup lang="ts">
import moment from 'moment'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { userService } from '@/components/api/user/UserService'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { formFieldConfigService } from '@/components/api/user/FormFieldConfigService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { euDecimalValidation } from "@/composables/euDecimalValidation"
import { medicineDosage } from "@/composables/medicineDosage"
import { useCustomPagesStore } from '@/store/custom-pages'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedMedicine: {
        type: Object,
        required: true,
    },
    selectedMedicineHistory: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm', 'isPageLoading', 'error', 'confirmationDialogToggle'])

const { t } = useI18n()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any
const { validateEuropeanDecimal } = euDecimalValidation()
const { parseDosage, isValidDosage, exceededDoseLimit } = medicineDosage()
const calendarDayHeaders = computed(() =>
    language.locale.value === 'dk'
        ? ['M', 'T', 'O', 'T', 'F', 'L', 'S']
        : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
)

const state = reactive({
    calendar: {
        calendarMonth: moment().startOf('month'),
        multiDateMode: false,
        selectedDate: moment().format('YYYY-MM-DD'),
        selectedDates: [] as string[],
    },
    formMedicineHistory: {
        uuid: '',
        date: moment().format('YYYY-MM-DD'),
        dosage: '',
        type: '',
        evaluator: '',
        evaluation_frequency: [],
        dosages: [],
        comment: '',
    } as any,
    modal: {
        isMoreThanMedicineDailyConfirmationOpen: false,
    },
    // Set by validateForm() for a PN save whose entered dose genuinely exceeds
    // a limit, so the confirmation dialog can show which limit and by how
    // much instead of the old numberless "did you enter the right dose?"
    // (AW-2026-3581). null on the unchanged scheduled path.
    pendingLimit: null as { limit: 'max_dose_per_administration' | 'max_daily_dose'; entered: number; max: number } | null,
    options: {
        evaluation_frequencies: [] as any,
        evaluators: [],
        types: [
            { value: 'given', title: 'Given' },
            { value: 'delivered', title: 'Delivered' },
            { value: 'deviated', title: 'Deviated' },
        ] as any
    },
})

onMounted(() => {
    fetchAllUsers()
    fetchStatusTypesConfig()
    fetchMedicineHistoryPerMedicine(moment(props.selectedMedicineHistory?.date).format('YYYY-MM-DD'))
    state.formMedicineHistory = {
        uuid: props.selectedMedicineHistory.uuid,
        date: props.selectedMedicineHistory.date,
        dosage: props.selectedMedicineHistory?.quantity,
        type: props.selectedMedicineHistory?.type,
        dosages: [],
        evaluator: props.selectedMedicineHistory.evaluator?.uuid,
        evaluation_frequency: [],
        comment: props.selectedMedicineHistory.comment,
    }
    if (props.selectedMedicineHistory.evaluation_frequency?.length > 0) {
        props.selectedMedicineHistory.evaluation_frequency?.forEach((time: any) => {
            state.formMedicineHistory.evaluation_frequency.push(time)
        })
    }
    generateDosage()
})

watch(() => state.formMedicineHistory.date, (date: any) => {
    fetchMedicineHistoryPerMedicine(date)
})

// The parent's own Modal must not stay "open" while this confirmation dialog is
// showing, or the two stacked HeadlessUI Dialogs fight over focus/outside-click
// and a failed submit silently closes the whole form instead of showing the error.
watch(() => state.modal.isMoreThanMedicineDailyConfirmationOpen, (isOpen: boolean) => {
    emit('confirmationDialogToggle', isOpen)
})

const rules = computed(() => {
    if (props.selectedMedicine.is_pn_medicine) {
        return {
            formMedicineHistory: {
                date: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                dosage: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                    // AW-2026-3581: the PN dose input previously had no numeric
                    // validation at all -- "en halv" would pass this rule and
                    // get silently cast to 0 by the backend. !helpers.req(...)
                    // defers to the required rule above on an empty value so
                    // the two rules don't both fire at once.
                    validDosage: helpers.withMessage(
                        () => `${t('citizens.medicineJournals.history.form.dosageMustBeANumber')}.`,
                        (value: any) => !helpers.req(value) || isValidDosage(value)
                    ),
                },
                type: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                evaluator: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                evaluation_frequency: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formMedicineHistory: {
                date: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                dosages: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

// AW-2026-3581: PN and scheduled saves used to share this check, but it only
// ever made sense for scheduled doses (computeAllEnteredQuantities() sums the
// SCHEDULED-slot array) -- for PN that array is always empty, so the old
// single check fired the confirmation on effectively every PN save. PN now
// checks the dose the user actually typed (state.formMedicineHistory.dosage)
// against the medicine's own limits via exceededDoseLimit(); the scheduled
// branch below is unchanged.
function validateForm() {
    v$.value.$validate()
    if (v$.value.$error) return

    if (props.selectedMedicine.is_pn_medicine) {
        state.pendingLimit = exceededDoseLimit(state.formMedicineHistory.dosage, {
            maxPerAdministration: props.selectedMedicine?.max_dose_per_administration,
            maxDaily: props.selectedMedicine?.max_daily_dose,
        })
        if (state.pendingLimit) {
            state.modal.isMoreThanMedicineDailyConfirmationOpen = true
        } else {
            submitForm()
        }
        return
    }

    if (computeAllEnteredQuantities() !== parseInt(props.selectedMedicine?.max_daily_dose)) {
        state.modal.isMoreThanMedicineDailyConfirmationOpen = true
    } else {
        submitForm()
    }
}

function submitForm() {
    emit('submitForm', {
        ...state.formMedicineHistory,
        selectedDates: state.calendar.selectedDates,
    })
}

const currentMonthLabel = computed(() =>
    state.calendar.calendarMonth.clone().locale('en').format('MMMM YYYY')
)

function prevMonth() {
    state.calendar.calendarMonth = state.calendar.calendarMonth.clone().subtract(1, 'month')
}

function nextMonth() {
    state.calendar.calendarMonth = state.calendar.calendarMonth.clone().add(1, 'month')
}

const calendarDays = computed(() => {
    const start = state.calendar.calendarMonth.clone().startOf('isoWeek')
    const end = state.calendar.calendarMonth.clone().endOf('month').endOf('isoWeek')
    const days = []
    let cur = start.clone()

    while (cur.isSameOrBefore(end, 'day')) {
        const ds = cur.format('YYYY-MM-DD')
        const isCurrentMonth = cur.month() === state.calendar.calendarMonth.month()
        const isToday = cur.isSame(moment(), 'day')
        const isPast = cur.isBefore(moment(), 'day')
        let hasOverdue = false

        days.push({ dateStr: ds, dayNum: cur.date(), isCurrentMonth, isToday, hasOverdue })
        cur.add(1, 'day')
    }
    return days
})

function selectDate(day: any) {
    state.formMedicineHistory.date = day?.dateStr
    if (!day.isCurrentMonth) return
    if (state.calendar.multiDateMode) {
        toggleDateSelection(day)
    } else {
        state.calendar.selectedDate = day.dateStr
    }
}

function toggleDateSelection(day: any) {
    if (!day.isCurrentMonth) return
    const idx = state.calendar.selectedDates.indexOf(day.dateStr)
    if (idx === -1) {
        state.calendar.selectedDates.push(day.dateStr)
    } else {
        state.calendar.selectedDates.splice(idx, 1)
    }
}

function toggleMultiDateMode() {
    state.calendar.multiDateMode = !state.calendar.multiDateMode
    state.calendar.selectedDates = []
}

function computeAllEnteredQuantities() {
    let total = 0
    state.formMedicineHistory.dosages.forEach((dosage: any) => {
        total += parseFloat(dosage?.dosage)
    })
    return total
}

// Mirrors toLocaleDecimal() in components/modules/user/citizen/medicine/form.vue
// -- numbers coming back out of state are always dot-decimal, so on the dk
// locale they need the dot swapped for a comma to read naturally.
function formatDose(value: number): string {
    const str = String(value)
    return language.locale.value === 'dk' ? str.replace('.', ',') : str
}

// AW-2026-3581 backend follow-up: given_today_total/last_given_at are now
// available on props.selectedMedicine for PN medicine (previously
// unavailable -- dosage_status_by_date is scheduled-medicine only). Appended
// to the dialog when there's something real to say; a fresh PN medicine with
// no history yet, or a medicine with no max_daily_dose configured, just gets
// the plain exceeded-limit message with no context tacked on.
function pnDosingContextText(): string {
    const medicine = props.selectedMedicine
    const parts: string[] = []

    const maxDaily = parseDosage(medicine?.max_daily_dose)
    if (Number.isFinite(maxDaily) && maxDaily > 0 && medicine?.given_today_total != null) {
        parts.push(t('citizens.medicineJournals.history.confirmation.givenTodayContext', {
            total: formatDose(Number(medicine.given_today_total)),
            max: formatDose(maxDaily),
        }))
    }

    if (medicine?.last_given_at) {
        parts.push(t('citizens.medicineJournals.history.confirmation.lastGivenAtContext', {
            time: moment(medicine.last_given_at).format('HH:mm'),
        }))
    }

    return parts.join(' ')
}

// AW-2026-3581: with a real exceeded limit in hand (state.pendingLimit, set
// by validateForm() for PN), show which limit and by how much instead of the
// old numberless "did you enter the right dose?". The scheduled path never
// sets pendingLimit, so it keeps the original generic message unchanged.
const doseConfirmationMessage = computed(() => {
    const pending = state.pendingLimit
    if (!pending) {
        return `${t('citizens.medicineJournals.history.confirmation.rightDailyDoseConfirmation')}?`
    }
    const key = pending.limit === 'max_dose_per_administration'
        ? 'citizens.medicineJournals.history.confirmation.doseExceedsMaxPerAdministration'
        : 'citizens.medicineJournals.history.confirmation.doseExceedsMaxDaily'
    let message = t(key, { entered: formatDose(pending.entered), max: formatDose(pending.max) })

    if (props.selectedMedicine.is_pn_medicine) {
        const context = pnDosingContextText()
        if (context) message += ` ${context}`
    }

    return message
})

function generateDosage() {
    (props.selectedMedicine?.max_dosage_per_time ?? []).forEach((dosage: any) => {
        state.formMedicineHistory.dosages.push({
            medicine_uuid: props.selectedMedicine?.uuid,
            time: dosage?.time,
            dosage: '',
            type: '',
            comment: '',
        })
    })
}

async function fetchMedicineHistoryPerMedicine(date: any) {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const params = {
            date: date
        }
        const response = await medicineHistoryService.getMedicineHistoryByMedicineUuid(props.selectedMedicine?.uuid, params)
        if (response) {
            state.formMedicineHistory.dosages = response.data
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}

async function fetchAllUsers() {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + (user?.lastname ?? ''),
                })
            )
            state.options.evaluators = options
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}

async function fetchStatusTypesConfig() {
    try {
        const response = await formFieldConfigService.getFormConfigs({ entity_type: 'citizen_medicine_history' })
        const config = response?.data?.find((c: any) => c.form_type === 'status_types')
        const formFields = config?.form_fields
        if (!formFields) return

        // Keep the current history entry's own type selectable even if the
        // company has since disabled it - editing existing data shouldn't break.
        const currentType = props.selectedMedicineHistory?.type
        state.options.types = state.options.types.filter(
            (type: any) => formFields[type.value] !== false || type.value === currentType
        )
    } catch (error: any) {
        // Non-fatal: if this fails, keep showing all types rather than
        // blocking the give-dose flow entirely.
    }
}

generateEvaluationFrequenciesTimeIntervals()

function generateEvaluationFrequenciesTimeIntervals() {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 1) {
            const hourStr = String(hour).padStart(2, '0')
            const minuteStr = String(minute).padStart(2, '0')
            const time = `${hourStr}:${minuteStr}`
            times.push({ value: time, label: time })
        }
    }
    state.options.evaluation_frequencies = times
}

function handleQuantityInput(event: Event, index: number) {
    const target = event.target as HTMLInputElement
    if (language.locale.value === 'dk') {
        target.value = validateEuropeanDecimal(target.value)
    }
    state.formMedicineHistory.dosages[index].dosage = target.value
}

// Same sanitisation as handleQuantityInput() above, applied to the PN dose
// field (AW-2026-3581). v-model still drives the field's value -- this only
// strips non-decimal characters as the user types, same as the scheduled
// input does.
function handlePnDosageInput(event: Event) {
    const target = event.target as HTMLInputElement
    if (language.locale.value === 'dk') {
        target.value = validateEuropeanDecimal(target.value)
    }
    state.formMedicineHistory.dosage = target.value
}
</script>

<style>
#formMedicineHistory .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>