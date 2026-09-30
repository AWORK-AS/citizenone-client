<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('bookingServices.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('bookingServices.title') }}</template>

            <ModulesUserCalendarTabs />

            <div class="mt-4 flex flex-wrap items-start justify-between gap-4">
                <p class="max-w-3xl text-sm text-gray-600">{{ $t('bookingServices.intro') }}</p>
                <FormButton buttonStyle="primary" @click="openForm(null)">
                    <Icon name="ph:plus" class="size-4" aria-hidden="true" />
                    {{ $t('bookingServices.new') }}
                </FormButton>
            </div>

            <LoadingSpinner :isActive="state.isLoading">
                <Alert type="danger" :text="state.error" v-if="state.error" class="mt-5" />

                <div class="mt-5 rounded-xl border border-gray-200 bg-white overflow-hidden" v-if="services.length">
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                                <tr class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                                    <th class="px-4 py-3">{{ $t('bookingServices.table.name') }}</th>
                                    <th class="px-4 py-3">{{ $t('bookingServices.table.clinician') }}</th>
                                    <th class="px-4 py-3">{{ $t('bookingServices.table.onlineBooking') }}</th>
                                    <th class="px-4 py-3">{{ $t('bookingServices.table.times') }}</th>
                                    <th class="px-4 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="service in services" :key="service.uuid" class="border-t border-gray-100">
                                    <td class="px-4 py-3">
                                        <p class="font-medium text-gray-900">{{ service.name }}</p>
                                        <p class="max-w-md truncate text-xs text-gray-500" v-if="service.description">
                                            {{ service.description }}
                                        </p>
                                    </td>
                                    <td class="px-4 py-3">
                                        {{ clinicianName(service) }}
                                        <p class="text-xs text-gray-500" v-if="service.department?.name">
                                            {{ service.department.name }}
                                        </p>
                                    </td>
                                    <td class="px-4 py-3">
                                        <Badge :type="service.booking_setting?.is_online_booking ? 'active' : 'inactive'"
                                            class="w-fit">
                                            {{ service.booking_setting?.is_online_booking
                                                ? $t('bookingServices.online')
                                                : $t('bookingServices.offline') }}
                                        </Badge>
                                    </td>
                                    <td class="px-4 py-3 tabular-nums whitespace-nowrap">
                                        <!-- A service with no open times is one nobody can
                                             book, which is exactly what the clinic needs to see. -->
                                        <span :class="service.upcoming_slots ? 'text-gray-900' : 'text-red-700'">
                                            {{ $t('bookingServices.openTimes', { count: service.upcoming_slots ?? 0 }) }}
                                        </span>
                                        <span class="text-gray-500" v-if="service.upcoming_bookings">
                                            · {{ $t('bookingServices.bookedTimes', { count: service.upcoming_bookings }) }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center justify-end gap-2">
                                            <FormButton buttonStyle="action" buttonSize="xs" @click="openTimes(service)">
                                                <Icon name="ph:clock" class="size-4" aria-hidden="true" />
                                                {{ $t('bookingServices.actions.times') }}
                                            </FormButton>
                                            <Tooltip :text="$t('bookingServices.actions.edit')">
                                                <FormButton :aria-label="$t('bookingServices.actions.edit')" type="button"
                                                    buttonStyle="action" @click="openForm(service)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('bookingServices.actions.delete')">
                                                <FormButton :aria-label="$t('bookingServices.actions.delete')" type="button"
                                                    buttonStyle="action" @click="confirmDelete(service)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="mt-16 flex flex-col items-center gap-4 text-center" v-else-if="!state.error">
                    <Icon name="ph:calendar-plus" class="size-12 text-gray-400" aria-hidden="true" />
                    <p class="max-w-md text-sm text-gray-600">{{ $t('bookingServices.none') }}</p>
                    <FormButton buttonStyle="primary" @click="openForm(null)">
                        <Icon name="ph:plus" class="size-4" aria-hidden="true" />
                        {{ $t('bookingServices.new') }}
                    </FormButton>
                </div>

                <Pagination class="mt-4" :data="state.services" @previous="previous" @next="next"
                    v-if="services.length" />
            </LoadingSpinner>

            <ModulesUserCalendarBookingServiceModalForm :isModalOpen="state.isFormOpen" :service="state.selected"
                @close="state.isFormOpen = false" @saved="onSaved" />

            <ModulesUserCalendarBookingServiceModalTimes :isModalOpen="state.isTimesOpen" :service="state.selected"
                @close="state.isTimesOpen = false" @changed="load" />

            <DialogConfirmation :isModalOpen="state.isDeleteOpen" :message="$t('bookingServices.confirmDelete')"
                @close="state.isDeleteOpen = false" @confirm="deleteService" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { bookingServiceService } from '@/components/api/user/BookingServiceService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

// The patient portal and the website widget both book services, and until
// this screen there was nowhere to make one: a clinic that bought Booking
// still showed its patients "no treatments open for online booking".
const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
let currentPage = 1

const breadcrumbLinks = [
    { name: 'bookingServices.title', translate: true, href: '/calendar/bookings/services' },
]

const state = reactive({
    services: {} as any,
    selected: null as any,
    isLoading: true,
    isFormOpen: false,
    isTimesOpen: false,
    isDeleteOpen: false,
    error: '',
})

const services = computed(() => state.services?.data ?? [])

watch(() => userStore.user, (user) => {
    if (user && !user.has_booking_app_access) {
        navigateTo('/calendar')
    }
})

function clinicianName(service: any): string {
    const clinician = service.clinician

    return clinician ? `${clinician.firstname ?? ''} ${clinician.lastname ?? ''}`.trim() : ''
}

async function load() {
    state.error = ''
    state.isLoading = true

    try {
        state.services = await bookingServiceService.getBookingServices({ page: currentPage }) ?? {}
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isLoading = false
    }
}

function previous() {
    currentPage--
    load()
}

function next() {
    currentPage++
    load()
}

function openForm(service: any) {
    state.selected = service
    state.isFormOpen = true
}

function openTimes(service: any) {
    state.selected = service
    state.isTimesOpen = true
}

async function onSaved(saved: any) {
    const isNew = !state.selected?.uuid

    await load()

    // A new service is bookable only once it has times, so go straight on to
    // adding them.
    if (isNew && saved?.uuid) {
        state.selected = services.value.find((service: any) => service.uuid === saved.uuid) ?? saved
        state.isTimesOpen = true
    }
}

function confirmDelete(service: any) {
    state.selected = service
    state.isDeleteOpen = true
}

async function deleteService() {
    if (!state.selected?.uuid) return

    state.error = ''

    try {
        await bookingServiceService.deleteBookingService(state.selected.uuid)
        successAlert(`${t('alert.success')}!`, `${t('bookingServices.alert.deleted')}.`)

        if (services.value.length === 1 && currentPage > 1) {
            currentPage--
        }

        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

onMounted(load)
</script>
