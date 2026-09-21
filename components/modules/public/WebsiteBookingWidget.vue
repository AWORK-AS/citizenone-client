<template>
    <div class="co-widget" :style="themeVars">
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

            <!-- Step 2: date + slot -->
            <div v-else-if="state.step === 'slot'">
                <h2 class="co-widget__step-title">{{ state.selectedService?.name }}</h2>

                <div class="co-widget__field">
                    <label class="co-widget__label" for="co-widget-date">{{ t('chooseDate') }}</label>
                    <input id="co-widget-date" type="date" class="co-widget__input" :min="today"
                        v-model="state.selectedDate" @change="loadTimeSlots" />
                </div>

                <div class="co-widget__slots" v-if="state.timeSlots.length">
                    <button type="button" class="co-widget__slot" v-for="slot in state.timeSlots" :key="slot.uuid"
                        @click="selectSlot(slot)">
                        {{ slot.start_time }}
                    </button>
                </div>
                <p class="co-widget__empty" v-else-if="state.selectedDate">{{ t('noSlots') }}</p>

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
import { ref, reactive, computed, onMounted } from 'vue'
import { PublicWebsiteBookingClient } from '@/components/api/public/PublicWebsiteBookingClient'

const props = defineProps<{
    apiBaseUrl: string
    embedToken: string
    locale?: string
}>()

const client = new PublicWebsiteBookingClient(props.apiBaseUrl, props.embedToken)

const LABELS: Record<string, Record<string, string>> = {
    en: {
        loading: 'Loading…',
        chooseService: 'Choose a service',
        allDepartments: 'All departments',
        noServices: 'No services are available for online booking right now.',
        chooseDate: 'Choose a date',
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

// 'da' is an alias for 'dk' so embeds published before the dk/no/sv locales
// were added (which passed data-locale="da") keep showing Danish instead of
// silently falling back to English.
function t(key: string): string {
    const requested = props.locale === 'da' ? 'dk' : props.locale
    const locale = requested && LABELS[requested] ? requested : 'en'
    return LABELS[locale][key] ?? key
}

const today = new Date().toISOString().slice(0, 10)

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
})

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
    state.step = 'slot'
}

function backToServices() {
    state.step = 'services'
    state.selectedService = null
}

async function loadTimeSlots() {
    if (!state.selectedService?.booking_setting_uuid || !state.selectedDate) return
    try {
        const response = await client.getTimeSlots(state.selectedService.booking_setting_uuid, state.selectedDate)
        state.timeSlots = response?.data ?? []
    } catch (error: any) {
        state.error = error?.message
        state.timeSlots = []
    }
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
