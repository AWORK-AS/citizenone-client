<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ $t('patient.nav.appointments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('patient.nav.appointments') }}</template>

            <div class="mt-2 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="flex flex-wrap items-center justify-between gap-3">
                    <TabsLocal v-model="state.filter" :tabs="tabs" />
                    <FormButton v-if="canBook" type="button" buttonStyle="action"
                        @click="navigateTo('/patient/appointments/book')">
                        {{ $t('patient.booking.bookTime') }}
                    </FormButton>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.appointments.length === 0 && !state.isLoading">
                        <Alert type="info" :text="$t('patient.appointments.empty')" />
                    </div>

                    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        <div class="lg:col-span-2 space-y-3">
                            <button v-for="appointment in state.appointments" :key="appointment.uuid" type="button"
                                class="w-full text-left bg-white rounded-2xl border px-5 py-4 transition"
                                :class="selected?.uuid === appointment.uuid ? 'border-primary shadow-card-hover' : 'border-gray-200 hover:border-primary/40'"
                                @click="state.selectedUuid = appointment.uuid">
                                <p class="font-semibold text-gray-900">{{ appointment.title ?? $t('patient.appointments.appointment') }}</p>
                                <p class="mt-1.5 text-sm text-gray-600 flex items-center gap-2">
                                    <Icon name="heroicons:clock" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    {{ formatDateTime(appointment.date_time_start) }}
                                </p>
                                <p class="mt-1 text-sm text-gray-600 flex items-center gap-2" v-if="appointment.location">
                                    <Icon name="heroicons:map-pin" class="h-4 w-4 text-gray-400" aria-hidden="true" />
                                    {{ appointment.location }}
                                </p>
                            </button>
                        </div>

                        <div class="lg:col-span-3" v-if="selected">
                            <div class="bg-white rounded-2xl border border-gray-200 px-6 py-6 space-y-4">
                                <h2 class="text-xl font-semibold text-primary">
                                    {{ $t('patient.appointments.detailTitle', { clinic: clinicName }) }}
                                </h2>

                                <dl class="space-y-3 text-sm">
                                    <div class="flex gap-4">
                                        <dt class="w-32 shrink-0 italic text-gray-400">{{ $t('patient.appointments.what') }}</dt>
                                        <dd class="font-semibold text-gray-900">
                                            {{ selected.title ?? $t('patient.appointments.appointment') }}
                                        </dd>
                                    </div>
                                    <div class="flex gap-4">
                                        <dt class="w-32 shrink-0 italic text-gray-400">{{ $t('patient.appointments.when') }}</dt>
                                        <dd class="text-gray-900">
                                            {{ formatDateTime(selected.date_time_start) }}
                                            <span v-if="selected.duration_minutes" class="block text-gray-500">
                                                {{ $t('patient.appointments.duration', { minutes: selected.duration_minutes }) }}
                                            </span>
                                        </dd>
                                    </div>
                                    <div class="flex gap-4" v-if="selected.location">
                                        <dt class="w-32 shrink-0 italic text-gray-400">{{ $t('patient.appointments.where') }}</dt>
                                        <dd class="text-gray-900">{{ selected.location }}</dd>
                                    </div>
                                    <div class="flex gap-4" v-if="selected.staff_name">
                                        <dt class="w-32 shrink-0 italic text-gray-400">{{ $t('patient.appointments.who') }}</dt>
                                        <dd class="text-gray-900">{{ selected.staff_name }}</dd>
                                    </div>
                                    <div class="flex gap-4" v-if="selected.is_online_meeting && selected.meeting_url">
                                        <dt class="w-32 shrink-0 italic text-gray-400">{{ $t('patient.appointments.online') }}</dt>
                                        <dd>
                                            <a :href="selected.meeting_url" target="_blank" rel="noopener"
                                                class="text-primary underline">
                                                {{ $t('patient.appointments.joinOnline') }}
                                            </a>
                                        </dd>
                                    </div>
                                    <div class="flex gap-4">
                                        <dt class="w-32 shrink-0 italic text-gray-400">{{ $t('patient.appointments.cancel') }}</dt>
                                        <dd class="text-gray-600">
                                            {{ $t('patient.appointments.cancelHelp') }}
                                            <button type="button" class="block mt-1 text-primary underline"
                                                @click="navigateTo('/patient/messages')">
                                                {{ $t('patient.appointments.writeToClinic') }}
                                            </button>
                                        </dd>
                                    </div>
                                </dl>

                                <p class="text-sm text-gray-500" v-if="selected.description">
                                    {{ selected.description }}
                                </p>
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
import { patientAppointmentService } from '@/components/api/patient/AppointmentService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    filter: 'upcoming',
    appointments: [] as any[],
    selectedUuid: null as string | null,
})

const tabs = computed(() => [
    { key: 'upcoming', label: t('patient.appointments.upcoming') },
    { key: 'past', label: t('patient.appointments.past') },
])

const selected = computed(() => state.appointments.find((a: any) => a.uuid === state.selectedUuid) ?? state.appointments[0])
const clinicName = computed(() => userStore.getUser?.clinic?.name ?? userStore.getUser?.company?.name ?? '')
const canBook = computed(() => (userStore.getUser?.portal_visibility ?? {}).booking !== false)

function formatDateTime(value: any) {
    return value ? moment(value).format('dddd D. MMMM YYYY, HH:mm') : '-'
}

onMounted(() => fetchAppointments())

watch(() => state.filter, () => fetchAppointments())

async function fetchAppointments() {
    state.error = {}
    state.isLoading = true
    state.selectedUuid = null
    try {
        const response = await patientAppointmentService.getAppointments({ filter: state.filter })
        state.appointments = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
