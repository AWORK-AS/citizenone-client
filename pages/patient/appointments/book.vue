<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ $t('patient.booking.bookTime') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('patient.booking.bookTime') }}</template>

            <div class="mt-2 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.services.length === 0 && !state.isLoading">
                        <Alert type="info" :text="$t('patient.booking.noServices')" />
                    </div>

                    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        <!-- Step 1: what -->
                        <div class="lg:col-span-2 space-y-3">
                            <p class="text-xs font-bold text-primary uppercase tracking-widest">
                                {{ $t('patient.booking.chooseWhat') }}
                            </p>
                            <button v-for="service in state.services" :key="service.uuid" type="button"
                                class="w-full text-left bg-white rounded-2xl border px-5 py-4 transition"
                                :class="state.selectedService?.uuid === service.uuid ? 'border-primary shadow-card-hover' : 'border-gray-200 hover:border-primary/40'"
                                @click="selectService(service)">
                                <div class="flex items-center gap-2">
                                    <p class="font-semibold text-gray-900">{{ service.name }}</p>
                                    <span v-if="service.kind === 'event'"
                                        class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                        {{ $t('patient.booking.event') }}
                                    </span>
                                </div>
                                <p class="mt-1 text-sm text-gray-500 line-clamp-2" v-if="service.description">{{ service.description }}</p>
                                <p class="mt-1.5 text-sm text-gray-600 flex items-center gap-2" v-if="service.location">
                                    <Icon name="heroicons:map-pin" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    {{ service.location }}
                                </p>
                                <p class="mt-1.5 text-sm text-gray-600" v-if="service.staff_name">
                                    {{ service.staff_name }}
                                </p>
                                <p class="mt-1 text-sm text-gray-500" v-if="service.duration_minutes">
                                    {{ $t('patient.appointments.duration', { minutes: service.duration_minutes }) }}
                                </p>
                            </button>
                        </div>

                        <!-- Step 2 and 3: when -->
                        <div class="lg:col-span-3 space-y-5" v-if="state.selectedService">
                            <!-- Day and time in one card: side by side on a wide screen, so the
                                 calendar does not sit alone in a card of empty space; stacked on a phone. -->
                            <div class="bg-white rounded-2xl border border-gray-200 px-6 py-5">
                                <p v-if="!state.selectedService.available_dates?.length" class="text-sm text-gray-500 italic">
                                    {{ $t('patient.booking.noDates') }}
                                </p>

                                <div v-else class="flex flex-col gap-6 md:flex-row">
                                    <div class="md:w-80 md:shrink-0">
                                        <p class="text-xs font-bold text-primary uppercase tracking-widest">
                                            {{ $t('patient.booking.chooseDate') }}
                                        </p>
                                        <div class="mt-3">
                                            <PatientBookingCalendar :key="state.selectedService.uuid"
                                                :dates="state.selectedService.available_dates" :modelValue="state.selectedDate"
                                                @update:modelValue="selectDate" />
                                        </div>
                                    </div>

                                    <div class="min-w-0 flex-1 border-t border-gray-100 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                                        <p class="text-xs font-bold text-primary uppercase tracking-widest">
                                            {{ $t('patient.booking.chooseTime') }}
                                        </p>

                                        <p v-if="!state.selectedDate" class="mt-3 text-sm text-gray-500">
                                            {{ $t('patient.booking.pickDayFirst') }}
                                        </p>

                                        <template v-else>
                                            <p class="mt-1 text-sm text-gray-600">{{ formatDate(state.selectedDate) }}</p>

                                            <LoadingSpinner :isActive="state.isSlotsLoading">
                                                <div v-if="state.slots.length" class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                                    <button v-for="slot in state.slots" :key="slot.uuid" type="button"
                                                        class="rounded-full border px-4 py-2 text-sm transition"
                                                        :class="state.selectedSlot?.uuid === slot.uuid ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-700 hover:border-primary/40'"
                                                        @click="state.selectedSlot = slot">
                                                        {{ slot.start_time?.substring(0, 5) }}
                                                    </button>
                                                </div>
                                                <p v-else class="mt-3 text-sm text-gray-500 italic">
                                                    {{ $t('patient.booking.noTimes') }}
                                                </p>
                                            </LoadingSpinner>
                                        </template>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white rounded-2xl border border-gray-200 px-6 py-5 space-y-4"
                                v-if="state.selectedSlot">
                                <label for="booking-note" class="block text-xs font-bold text-primary uppercase tracking-widest">
                                    {{ $t('patient.booking.note') }}
                                </label>
                                <FormTextArea id="booking-note" name="notes" :rows="3" maxlength="1000"
                                    :placeholder="$t('patient.booking.notePlaceholder')" v-model="state.notes" />

                                <div class="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p class="text-sm font-medium text-gray-900">
                                        {{ summary }}
                                    </p>
                                    <FormButton type="button" buttonStyle="primary" class="sm:w-auto w-full"
                                        :disabled="state.isBooking" @click="book">
                                        {{ $t('patient.booking.confirm') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import PatientBookingCalendar from '@/components/modules/patient/booking/calendar.vue'
import { patientBookingService } from '@/components/api/patient/BookingService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { formatLocalized } = useDatetimeFormatter()

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isSlotsLoading: false,
    isBooking: false,
    services: [] as any[],
    selectedService: null as any,
    selectedDate: null as string | null,
    slots: [] as any[],
    selectedSlot: null as any,
    notes: '',
})

const summary = computed(() => {
    if (!state.selectedSlot) return ''

    return t('patient.booking.summary', {
        treatment: state.selectedService?.name ?? '',
        date: formatDate(state.selectedDate),
        time: state.selectedSlot.start_time?.substring(0, 5),
    })
})

function formatDate(date: any) {
    return date ? formatLocalized(moment(date), 'dddd D. MMMM') : ''
}

onMounted(() => fetchServices())

async function fetchServices() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await patientBookingService.getServices()
        state.services = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function selectService(service: any) {
    state.selectedService = service
    state.selectedDate = null
    state.slots = []
    state.selectedSlot = null
}

async function selectDate(date: string) {
    state.selectedDate = date
    state.selectedSlot = null
    state.error = {}
    state.isSlotsLoading = true
    try {
        const response = await patientBookingService.getTimeSlots(state.selectedService.uuid, date)
        state.slots = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isSlotsLoading = false
}

async function book() {
    state.error = {}
    state.isBooking = true
    try {
        const response = await patientBookingService.book(state.selectedService.uuid, {
            time_slot: state.selectedSlot.uuid,
            notes: state.notes || null,
        })

        if (response?.data) {
            successAlert(`${t('alert.success')}!`, t('patient.booking.booked'))
            navigateTo('/patient/appointments')
        }
    } catch (error: any) {
        state.error = error
        // The slot may have been taken while the patient was choosing, so the
        // times are refetched rather than left showing a time that is gone.
        if (state.selectedDate) await selectDate(state.selectedDate)
    }
    state.isBooking = false
}
</script>
