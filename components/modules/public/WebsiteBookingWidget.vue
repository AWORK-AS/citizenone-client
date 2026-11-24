<template>
    <div class="co-widget" :style="themeVars" :lang="htmlLang">
        <div class="co-widget__languages" role="group" aria-label="Language">
            <button type="button" v-for="option in WIDGET_LOCALE_OPTIONS" :key="option.value"
                class="co-widget__language" :class="{ 'co-widget__language--active': activeLocale === option.value }"
                :lang="option.value === 'dk' ? 'da' : option.value" :title="option.name" :aria-label="option.name"
                :aria-pressed="activeLocale === option.value" @click="chooseLocale(option.value)">
                {{ option.short }}
            </button>
        </div>

        <div v-if="state.step === 'loading'" class="co-widget__spinner">
            {{ t('loading') }}
        </div>

        <template v-else>
            <div class="co-widget__error" v-if="state.error">{{ state.error }}</div>

            <p class="co-widget__welcome" v-if="state.config?.welcome_text && state.step === 'services'">
                {{ state.config.welcome_text }}
            </p>

            <!-- Step 1: service (and optional department filter) -->
            <div v-if="state.step === 'services'">
                <h2 class="co-widget__step-title">{{ t('chooseService') }}</h2>

                <select v-if="state.departments.length" class="co-widget__select" v-model="state.selectedDepartment"
                    @change="loadServices">
                    <option value="">{{ t('allDepartments') }}</option>
                    <option v-for="department in state.departments" :key="department.uuid" :value="department.uuid">
                        {{ department.name }}
                    </option>
                </select>

                <div class="co-widget__list">
                    <button type="button" class="co-widget__card" v-for="service in state.services" :key="service.uuid"
                        @click="selectService(service)">
                        <span class="co-widget__card-title">{{ service.name }}</span>
                        <span class="co-widget__card-subtitle" v-if="service.practitioner_name">
                            {{ service.practitioner_name }}
                        </span>
                        <span class="co-widget__card-subtitle" v-if="service.department_name">
                            {{ service.department_name }}
                        </span>
                    </button>
                    <p class="co-widget__empty" v-if="!state.services.length">{{ t('noServices') }}</p>
                </div>
            </div>

            <!-- Step 2: date + time. A month with the open days marked, and the
                 free times of the chosen day beside it (AW-2026-10776). -->
            <div v-else-if="state.step === 'slot'">
                <h2 class="co-widget__step-title">{{ state.selectedService?.name }}</h2>
                <p class="co-widget__subtitle">{{ t('chooseDateTime') }}</p>

                <div class="co-widget__picker">
                    <div class="co-widget__calendar">
                        <div class="co-widget__calendar-head">
                            <button type="button" class="co-widget__nav" :disabled="!canGoBack"
                                :aria-label="t('previousMonth')" @click="changeMonth(-1)">&lsaquo;</button>
                            <span class="co-widget__month">{{ monthTitle }}</span>
                            <button type="button" class="co-widget__nav" :aria-label="t('nextMonth')"
                                @click="changeMonth(1)">&rsaquo;</button>
                        </div>
                        <div class="co-widget__weekdays">
                            <span v-for="weekday in weekdayNames" :key="weekday">{{ weekday }}</span>
                        </div>
                        <div class="co-widget__days" :class="{ 'co-widget__days--loading': state.isLoadingDates }">
                            <button type="button" v-for="day in calendarDays" :key="day.date" class="co-widget__day"
                                :class="{
                                    'co-widget__day--outside': !day.inMonth,
                                    'co-widget__day--open': day.isOpen,
                                    'co-widget__day--selected': day.date === state.selectedDate,
                                }" :disabled="!day.isOpen" :aria-pressed="day.date === state.selectedDate"
                                :aria-label="day.label" @click="selectDate(day.date)">
                                {{ day.day }}
                            </button>
                        </div>
                        <p class="co-widget__empty" v-if="!state.isLoadingDates && !state.availableDates.length">
                            {{ t('noDatesThisMonth') }}
                        </p>
                    </div>

                    <div class="co-widget__times">
                        <div class="co-widget__times-head">
                            {{ t('availableTimes') }}
                            <strong v-if="state.selectedDate">{{ selectedDateLabel }}</strong>
                        </div>
                        <div class="co-widget__slots" v-if="openSlots.length">
                            <button type="button" class="co-widget__slot" v-for="slot in openSlots" :key="slot.uuid"
                                @click="selectSlot(slot)">
                                {{ shortTime(slot.start_time) }}
                            </button>
                        </div>
                        <p class="co-widget__empty" v-else-if="state.selectedDate && !state.isLoadingSlots">
                            {{ t('noSlots') }}
                        </p>
                        <p class="co-widget__empty" v-else-if="!state.selectedDate">{{ t('pickADay') }}</p>
                    </div>
                </div>

                <div class="co-widget__button-row">
                    <button type="button" class="co-widget__button co-widget__button--secondary" @click="backToServices">
                        {{ t('back') }}
                    </button>
                </div>
            </div>

            <!-- Step 3: contact info -->
            <div v-else-if="state.step === 'contact'">
                <h2 class="co-widget__step-title">{{ t('yourDetails') }}</h2>

                <div class="co-widget__field">
                    <label class="co-widget__label" for="co-widget-firstname">{{ t('firstName') }}</label>
                    <input id="co-widget-firstname" class="co-widget__input" v-model="state.contact.firstname" />
                </div>
                <div class="co-widget__field">
                    <label class="co-widget__label" for="co-widget-lastname">{{ t('lastName') }}</label>
                    <input id="co-widget-lastname" class="co-widget__input" v-model="state.contact.lastname" />
                </div>
                <div class="co-widget__field" v-if="requiredFields.email">
                    <label class="co-widget__label" for="co-widget-email">{{ t('email') }}</label>
                    <input id="co-widget-email" type="email" class="co-widget__input" v-model="state.contact.email" />
                </div>
                <div class="co-widget__field" v-if="requiredFields.phone">
                    <label class="co-widget__label" for="co-widget-phone">{{ t('phone') }}</label>
                    <input id="co-widget-phone" class="co-widget__input" v-model="state.contact.phone" />
                </div>
                <div class="co-widget__field" v-if="requiredFields.address">
                    <label class="co-widget__label" for="co-widget-address">{{ t('address') }}</label>
                    <input id="co-widget-address" class="co-widget__input" v-model="state.contact.address" />
                </div>
                <div class="co-widget__field" v-if="requiredFields.notes">
                    <label class="co-widget__label" for="co-widget-notes">{{ t('notes') }}</label>
                    <input id="co-widget-notes" class="co-widget__input" v-model="state.contact.notes" />
                </div>
                <div class="co-widget__field" v-if="requiredFields.social_security_number">
                    <label class="co-widget__label" for="co-widget-ssn">{{ t('socialSecurityNumber') }}</label>
                    <input id="co-widget-ssn" class="co-widget__input" v-model="state.contact.social_security_number" />
                </div>
                <div class="co-widget__field" v-if="requiredFields.date_of_birth">
                    <label class="co-widget__label" for="co-widget-dob">{{ t('dateOfBirth') }}</label>
                    <input id="co-widget-dob" type="date" class="co-widget__input" v-model="state.contact.date_of_birth" />
                </div>
                <div class="co-widget__field co-widget__checkbox" v-if="requiredFields.conditions">
                    <input id="co-widget-conditions" type="checkbox" v-model="state.contact.acceptedConditions" />
                    <label for="co-widget-conditions">
                        {{ t('acceptConditions') }}
                        <a v-if="conditionsUrl" :href="conditionsUrl" target="_blank" rel="noopener">{{ t('conditions') }}</a>
                    </label>
                </div>

                <div class="co-widget__button-row">
                    <button type="button" class="co-widget__button co-widget__button--secondary" @click="state.step = 'slot'">
                        {{ t('back') }}
                    </button>
                    <button type="button" class="co-widget__button" :disabled="!canSubmit || state.isSubmitting"
                        @click="submitBooking">
                        {{ state.isSubmitting ? t('booking') : t('confirmBooking') }}
                    </button>
                </div>
            </div>

            <!-- Step 4: confirmation -->
            <div v-else-if="state.step === 'confirmed'" class="co-widget__confirmation">
                <h2 class="co-widget__step-title">{{ t('bookingConfirmed') }}</h2>
                <p>{{ state.config?.confirmation_text || t('bookingConfirmedDefault') }}</p>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { localDateString, parseLocalDate } from '@/composables/localDate'
import { ref, reactive, computed, onMounted } from 'vue'
import { PublicWebsiteBookingClient } from '@/components/api/public/PublicWebsiteBookingClient'
import {
    WIDGET_LOCALE_OPTIONS,
    browserLanguages,
    readStoredWidgetLocale,
    resolveWidgetLocale,
    storeWidgetLocale,
    type WidgetLocale,
} from '@/composables/widgetLocale'

const props = defineProps<{
    apiBaseUrl: string
    embedToken: string
    locale?: string
}>()

// htmlLang is the BCP 47 tag ('da', not our internal 'dk'), which is what Accept-Language expects.
const client = new PublicWebsiteBookingClient(props.apiBaseUrl, props.embedToken, () => htmlLang.value)

const LABELS: Record<string, Record<string, string>> = {
    en: {
        loading: 'Loading…',
        chooseService: 'Choose a service',
        allDepartments: 'All departments',
        noServices: 'No services are available for online booking right now.',
        chooseDate: 'Choose a date',
        chooseDateTime: 'Choose date & time',
        availableTimes: 'Available times',
        pickADay: 'Pick a day marked in the calendar.',
        noDatesThisMonth: 'No available times this month. Try the next month.',
        previousMonth: 'Previous month',
        nextMonth: 'Next month',
        noSlots: 'No available times on this date.',
        back: 'Back',
        yourDetails: 'Your details',
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        notes: 'Notes',
        socialSecurityNumber: 'Social security number',
        dateOfBirth: 'Date of birth',
        acceptConditions: 'I accept the',
        conditions: 'terms',
        confirmBooking: 'Confirm booking',
        booking: 'Booking…',
        bookingConfirmed: 'Booking confirmed',
        bookingConfirmedDefault: 'Your appointment has been booked. You will receive a confirmation email shortly.',
    },
    dk: {
        loading: 'Indlæser…',
        chooseService: 'Vælg en ydelse',
        allDepartments: 'Alle afdelinger',
        noServices: 'Der er ingen ydelser tilgængelige til online booking lige nu.',
        chooseDate: 'Vælg en dato',
        chooseDateTime: 'Vælg dato & tid',
        availableTimes: 'Ledige tider',
        pickADay: 'Vælg en af de markerede dage i kalenderen.',
        noDatesThisMonth: 'Ingen ledige tider i denne måned. Prøv næste måned.',
        previousMonth: 'Forrige måned',
        nextMonth: 'Næste måned',
        noSlots: 'Ingen ledige tider på denne dato.',
        back: 'Tilbage',
        yourDetails: 'Dine oplysninger',
        firstName: 'Fornavn',
        lastName: 'Efternavn',
        email: 'Email',
        phone: 'Telefon',
        address: 'Adresse',
        notes: 'Noter',
        socialSecurityNumber: 'CPR-nummer',
        dateOfBirth: 'Fødselsdato',
        acceptConditions: 'Jeg accepterer',
        conditions: 'betingelserne',
        confirmBooking: 'Bekræft booking',
        booking: 'Booker…',
        bookingConfirmed: 'Booking bekræftet',
        bookingConfirmedDefault: 'Din tid er booket. Du modtager en bekræftelse på email.',
    },
    no: {
        loading: 'Laster…',
        chooseService: 'Velg en tjeneste',
        allDepartments: 'Alle avdelinger',
        noServices: 'Ingen tjenester er tilgjengelige for nettbooking akkurat nå.',
        chooseDate: 'Velg en dato',
        chooseDateTime: 'Velg dato og tid',
        availableTimes: 'Ledige tider',
        pickADay: 'Velg en av de markerte dagene i kalenderen.',
        noDatesThisMonth: 'Ingen ledige tider denne måneden. Prøv neste måned.',
        previousMonth: 'Forrige måned',
        nextMonth: 'Neste måned',
        noSlots: 'Ingen ledige tider på denne datoen.',
        back: 'Tilbake',
        yourDetails: 'Dine opplysninger',
        firstName: 'Fornavn',
        lastName: 'Etternavn',
        email: 'E-post',
        phone: 'Telefon',
        address: 'Adresse',
        notes: 'Notater',
        socialSecurityNumber: 'Fødselsnummer',
        dateOfBirth: 'Fødselsdato',
        acceptConditions: 'Jeg godtar',
        conditions: 'vilkårene',
        confirmBooking: 'Bekreft booking',
        booking: 'Booker…',
        bookingConfirmed: 'Booking bekreftet',
        bookingConfirmedDefault: 'Timen din er booket. Du vil motta en bekreftelse på e-post.',
    },
    sv: {
        loading: 'Läser in…',
        chooseService: 'Välj en tjänst',
        allDepartments: 'Alla avdelningar',
        noServices: 'Inga tjänster är tillgängliga för onlinebokning just nu.',
        chooseDate: 'Välj ett datum',
        chooseDateTime: 'Välj datum och tid',
        availableTimes: 'Lediga tider',
        pickADay: 'Välj en av de markerade dagarna i kalendern.',
        noDatesThisMonth: 'Inga lediga tider den här månaden. Prova nästa månad.',
        previousMonth: 'Föregående månad',
        nextMonth: 'Nästa månad',
        noSlots: 'Inga lediga tider detta datum.',
        back: 'Tillbaka',
        yourDetails: 'Dina uppgifter',
        firstName: 'Förnamn',
        lastName: 'Efternamn',
        email: 'E-post',
        phone: 'Telefon',
        address: 'Adress',
        notes: 'Anteckningar',
        socialSecurityNumber: 'Personnummer',
        dateOfBirth: 'Födelsedatum',
        acceptConditions: 'Jag godkänner',
        conditions: 'villkoren',
        confirmBooking: 'Bekräfta bokning',
        booking: 'Bokar…',
        bookingConfirmed: 'Bokning bekräftad',
        bookingConfirmedDefault: 'Din tid är bokad. Du får en bekräftelse via e-post inom kort.',
    },
}

// See composables/widgetLocale.ts for the priority order. 'da' stays accepted
// as an alias for 'dk' so embeds that passed data-locale="da" keep Danish.
// The first value only uses the clinic's setting so server-rendered markup
// matches the first client render; browser language and the visitor's own
// pick are applied on mount.
const activeLocale = ref<WidgetLocale>(resolveWidgetLocale({ explicit: props.locale }))

const htmlLang = computed(() => (activeLocale.value === 'dk' ? 'da' : activeLocale.value))

function t(key: string): string {
    return LABELS[activeLocale.value]?.[key] ?? LABELS.en[key] ?? key
}

function chooseLocale(locale: WidgetLocale) {
    if (activeLocale.value === locale) return
    activeLocale.value = locale
    storeWidgetLocale(locale)

    // A message from the server was written in the old language. On the
    // first step, load again so it comes back in the new one; later steps
    // keep the visitor's progress and just drop the stale message.
    if (state.step === 'services') {
        loadInitial()
    } else {
        state.error = ''
    }
}

const today = localDateString()

const state = reactive({
    step: 'loading' as 'loading' | 'services' | 'slot' | 'contact' | 'confirmed',
    error: '',
    config: null as any,
    departments: [] as any[],
    services: [] as any[],
    selectedDepartment: '',
    selectedService: null as any,
    selectedDate: '',
    timeSlots: [] as any[],
    selectedSlot: null as any,
    // First day of the month shown in the calendar, YYYY-MM-01.
    month: '',
    availableDates: [] as string[],
    isLoadingDates: false,
    isLoadingSlots: false,
    contact: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        social_security_number: '',
        date_of_birth: '',
        acceptedConditions: false,
    },
    isSubmitting: false,
})

const requiredFields = computed(() => {
    const raw = state.config?.required_fields
    if (!raw) return {}
    try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw
    } catch {
        return {}
    }
})

const conditionsUrl = computed(() => requiredFields.value?.conditions?.value || '')

const canSubmit = computed(() => {
    if (!state.contact.firstname || !state.contact.lastname) return false
    if (requiredFields.value?.email?.required && !state.contact.email) return false
    if (requiredFields.value?.phone?.required && !state.contact.phone) return false
    if (requiredFields.value?.address?.required && !state.contact.address) return false
    if (requiredFields.value?.notes?.required && !state.contact.notes) return false
    if (requiredFields.value?.social_security_number?.required && !state.contact.social_security_number) return false
    if (requiredFields.value?.date_of_birth?.required && !state.contact.date_of_birth) return false
    if (requiredFields.value?.conditions?.enabled && !state.contact.acceptedConditions) return false
    return true
})

const themeVars = computed(() => ({
    '--co-primary': state.config?.primary_color || '#4f46e5',
    '--co-secondary': state.config?.secondary_color || '#111827',
}))

onMounted(async () => {
    activeLocale.value = resolveWidgetLocale({
        stored: readStoredWidgetLocale(),
        explicit: props.locale,
        browserLanguages: browserLanguages(),
    })

    await loadInitial()
})

async function loadInitial() {
    state.error = ''
    try {
        const [configResponse, departmentsResponse] = await Promise.all([
            client.getConfig(),
            client.getDepartments(),
        ])
        state.config = configResponse?.data
        state.departments = departmentsResponse?.data ?? []
        await loadServices()
        state.step = 'services'
    } catch (error: any) {
        state.error = error?.message || t('noServices')
        state.step = 'services'
    }
}

async function loadServices() {
    try {
        const response = await client.getServices(state.selectedDepartment || undefined)
        state.services = response?.data ?? []
    } catch (error: any) {
        state.error = error?.message
    }
}

function selectService(service: any) {
    state.selectedService = service
    state.selectedDate = ''
    state.timeSlots = []
    state.error = ''
    state.month = today.slice(0, 8) + '01'
    state.step = 'slot'
    loadAvailableDates(true)
}

function backToServices() {
    state.step = 'services'
    state.selectedService = null
}

async function loadTimeSlots() {
    if (!state.selectedService?.booking_setting_uuid || !state.selectedDate) return
    state.isLoadingSlots = true
    try {
        const response = await client.getTimeSlots(state.selectedService.booking_setting_uuid, state.selectedDate)
        state.timeSlots = response?.data ?? []
    } catch (error: any) {
        state.error = error?.message
        state.timeSlots = []
    }
    state.isLoadingSlots = false
}

// --- Month calendar -------------------------------------------------------

function addMonths(month: string, count: number): string {
    const date = parseLocalDate(month) as Date
    return localDateString(new Date(date.getFullYear(), date.getMonth() + count, 1, 12))
}

function lastDayOf(month: string): string {
    const date = parseLocalDate(month) as Date
    return localDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0, 12))
}

// Which days of the shown month still have a time. On opening a service the
// first open day is chosen, and when this month is fully booked the calendar
// moves on to the next month that has room (up to a year ahead).
async function loadAvailableDates(pickFirst = false, monthsTried = 0) {
    const bookingSettingUuid = state.selectedService?.booking_setting_uuid
    if (!bookingSettingUuid || !state.month) return
    const month = state.month
    state.isLoadingDates = true
    try {
        const response = await client.getAvailableDates(bookingSettingUuid, month, lastDayOf(month))
        if (state.month !== month) return
        state.availableDates = response?.data ?? []
    } catch (error: any) {
        state.error = error?.message
        state.availableDates = []
    }
    state.isLoadingDates = false

    if (!pickFirst) return
    if (state.availableDates.length) {
        selectDate(state.availableDates[0])
    } else if (monthsTried < 11) {
        state.month = addMonths(state.month, 1)
        await loadAvailableDates(true, monthsTried + 1)
    } else {
        state.month = today.slice(0, 8) + '01'
        await loadAvailableDates(false)
    }
}

function changeMonth(step: number) {
    if (step < 0 && !canGoBack.value) return
    state.month = addMonths(state.month, step)
    loadAvailableDates()
}

function selectDate(date: string) {
    if (!state.availableDates.includes(date)) return
    state.selectedDate = date
    state.error = ''
    state.timeSlots = []
    loadTimeSlots()
}

const canGoBack = computed(() => state.month > today.slice(0, 8) + '01')

const monthTitle = computed(() => {
    const date = parseLocalDate(state.month)
    if (!date) return ''
    const title = new Intl.DateTimeFormat(htmlLang.value, { month: 'long', year: 'numeric' }).format(date)
    return title.charAt(0).toUpperCase() + title.slice(1)
})

// Monday first, as the clinics' own calendars are.
const weekdayNames = computed(() => {
    const format = new Intl.DateTimeFormat(htmlLang.value, { weekday: 'short' })
    return Array.from({ length: 7 }, (_, index) => {
        const name = format.format(new Date(2024, 0, 1 + index, 12)).replace('.', '')
        return name.charAt(0).toUpperCase() + name.slice(1, 2)
    })
})

const calendarDays = computed(() => {
    const first = parseLocalDate(state.month)
    if (!first) return []
    const open = new Set(state.availableDates)
    const labelFormat = new Intl.DateTimeFormat(htmlLang.value, { weekday: 'long', day: 'numeric', month: 'long' })
    const leading = (first.getDay() + 6) % 7
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - leading, 12)
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    const cells = Math.ceil((leading + daysInMonth) / 7) * 7

    return Array.from({ length: cells }, (_, index) => {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index, 12)
        const value = localDateString(date)
        const inMonth = date.getMonth() === first.getMonth()
        return {
            date: value,
            day: date.getDate(),
            inMonth,
            isOpen: inMonth && open.has(value),
            label: labelFormat.format(date),
        }
    })
})

const selectedDateLabel = computed(() => {
    const date = parseLocalDate(state.selectedDate)
    return date ? new Intl.DateTimeFormat(htmlLang.value, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date) : ''
})

// Only times with a seat left and, today, not already begun.
const openSlots = computed(() => {
    const now = new Date()
    return state.timeSlots.filter((slot: any) => {
        if (Number(slot.capacity ?? 1) < 1) return false
        if (state.selectedDate !== today) return true
        const [hours, minutes] = String(slot.start_time ?? '').split(':').map(Number)
        return hours * 60 + minutes > now.getHours() * 60 + now.getMinutes()
    })
})

function shortTime(value: string): string {
    return String(value ?? '').slice(0, 5)
}

function selectSlot(slot: any) {
    state.selectedSlot = slot
    state.error = ''
    state.step = 'contact'
}

async function submitBooking() {
    if (!canSubmit.value || !state.selectedService || !state.selectedSlot) return
    state.isSubmitting = true
    state.error = ''
    try {
        await client.book(state.selectedService.uuid, {
            firstname: state.contact.firstname,
            lastname: state.contact.lastname,
            email: state.contact.email || undefined,
            phone: state.contact.phone || undefined,
            address: state.contact.address || undefined,
            notes: state.contact.notes || undefined,
            social_security_number: state.contact.social_security_number || undefined,
            date_of_birth: state.contact.date_of_birth || undefined,
            time_slot: state.selectedSlot.uuid,
        })
        state.step = 'confirmed'
    } catch (error: any) {
        state.error = error?.message || t('noServices')
    }
    state.isSubmitting = false
}
</script>
