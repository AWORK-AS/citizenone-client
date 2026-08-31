<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('calendar.tabs.appointments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('calendar.tabs.appointments') }}</template>

            <ModulesUserCalendarTabs />

            <p class="mt-4 max-w-3xl text-sm text-gray-600">
                {{ $t('bookingAppointments.intro') }}
            </p>

            <div class="mt-5 flex flex-wrap items-end gap-3">
                <div class="space-y-1">
                    <FormLabel for="from" :label="$t('bookingAppointments.from')" />
                    <FormDateField id="from" name="from" v-model="state.from" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="to" :label="$t('bookingAppointments.to')" />
                    <FormDateField id="to" name="to" v-model="state.to" />
                </div>
                <FormButton buttonStyle="action" @click="load">
                    <Icon name="ph:magnifying-glass" class="size-4" />
                    {{ $t('search') }}
                </FormButton>
            </div>

            <LoadingSpinner :isActive="state.isPageLoading">
                <Alert type="danger" :text="state.error" v-if="state.error" class="mt-5" />

                <div class="mt-5 rounded-xl border border-gray-200 bg-white overflow-hidden"
                    v-if="state.appointments.length">
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                                <tr class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                                    <th class="px-4 py-3">{{ $t('bookingAppointments.when') }}</th>
                                    <th class="px-4 py-3">{{ $t('bookingAppointments.who') }}</th>
                                    <th class="px-4 py-3">{{ $t('bookingAppointments.treatment') }}</th>
                                    <th class="px-4 py-3">{{ $t('bookingAppointments.with') }}</th>
                                    <th class="px-4 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="appointment in state.appointments" :key="appointment.uuid"
                                    class="border-t border-gray-100">
                                    <td class="px-4 py-3 tabular-nums whitespace-nowrap">
                                        {{ formatDate(appointment.date) }}
                                        <span class="text-gray-500">
                                            {{ (appointment.start_time || '').substring(0, 5) }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        {{ nameOf(appointment) }}
                                        <p class="text-xs text-gray-500" v-if="appointment.booking_client?.phone">
                                            {{ appointment.booking_client.phone }}
                                        </p>
                                    </td>
                                    <td class="px-4 py-3">{{ appointment.treatment }}</td>
                                    <td class="px-4 py-3">
                                        {{ appointment.clinician }}
                                        <!-- Somebody took this over, which is worth
                                             saying: the treatment still belongs to
                                             whoever published it. -->
                                        <p class="text-xs text-primary" v-if="appointment.is_reassigned">
                                            {{ $t('bookingAppointments.takenOver') }}
                                        </p>
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <FormButton buttonStyle="action" buttonSize="xs"
                                            @click="openHandover(appointment)">
                                            <Icon name="ph:arrows-left-right" class="size-4" />
                                            {{ $t('bookingAppointments.handOver') }}
                                        </FormButton>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <p class="mt-8 text-center text-sm text-gray-400" v-else>
                    {{ $t('bookingAppointments.none') }}
                </p>
            </LoadingSpinner>

            <Modal :title="$t('bookingAppointments.handOverTitle')" :show="state.isHandoverOpen"
                @close="state.isHandoverOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <Alert type="danger" :text="state.handoverError" v-if="state.handoverError" />

                        <p class="text-sm text-gray-600">{{ $t('bookingAppointments.handOverExplanation') }}</p>

                        <div class="space-y-1">
                            <FormLabel for="colleague" :label="$t('bookingAppointments.colleague')" />
                            <FormSelect id="colleague" :options="colleagueOptions" v-model="state.colleagueUuid" />
                        </div>

                        <div class="flex items-center justify-end gap-2 pt-2">
                            <FormButton buttonStyle="action" @click="state.isHandoverOpen = false"
                                :disabled="state.isSaving">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton buttonStyle="primary" @click="handOver"
                                :disabled="state.isSaving || !state.colleagueUuid">
                                {{ $t('bookingAppointments.handOver') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { bookingAppointmentService } from '@/components/api/user/BookingAppointmentService'
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

// The clinic could never see a single booking: nothing in the app listed one,
// and the endpoint that should have thrown for every caller. So a booking could
// only be cancelled and rebooked when somebody had to cover for a colleague.
const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t, locale } = useI18n()

const breadcrumbLinks = [
    { name: 'calendar.tabs.appointments', translate: true, href: '/calendar/bookings/appointments' },
]

const state = reactive({
    appointments: [] as any[],
    colleagues: [] as any[],
    from: moment().format('YYYY-MM-DD'),
    to: moment().add(30, 'days').format('YYYY-MM-DD'),
    selected: null as any,
    colleagueUuid: null as string | null,
    isHandoverOpen: false,
    isPageLoading: true,
    isSaving: false,
    error: '',
    handoverError: '',
})

const colleagueOptions = computed(() => state.colleagues.map((colleague: any) => ({
    value: colleague.uuid,
    label: `${colleague.firstname} ${colleague.lastname}`.trim(),
})))

function formatDate(date: string): string {
    return date ? moment(date).format('DD.MM.YYYY') : ''
}

function nameOf(appointment: any): string {
    const client = appointment.booking_client

    return client ? `${client.firstname ?? ''} ${client.lastname ?? ''}`.trim() : ''
}

async function load() {
    state.error = ''
    state.isPageLoading = true

    try {
        const response = await bookingAppointmentService.getBookingAppointments({
            from: state.from,
            to: state.to,
        })
        state.appointments = response?.data || []
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
}

async function loadColleagues() {
    try {
        const response = await userService.getAllUsers({})
        state.colleagues = response?.data || []
    } catch {
        state.colleagues = []
    }
}

function openHandover(appointment: any) {
    state.selected = appointment
    state.colleagueUuid = appointment.assigned_user_uuid || null
    state.handoverError = ''
    state.isHandoverOpen = true
}

async function handOver() {
    if (!state.selected || !state.colleagueUuid) return

    state.handoverError = ''
    state.isSaving = true

    try {
        await bookingAppointmentService.assignBookingAppointment(state.selected.uuid, {
            user_uuid: state.colleagueUuid,
        })

        successAlert(`${t('alert.success')}!`, `${t('bookingAppointments.handedOver')}.`)
        state.isHandoverOpen = false
        await load()
    } catch (error: any) {
        state.handoverError = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

onMounted(async () => {
    await Promise.all([load(), loadColleagues()])
})
</script>
