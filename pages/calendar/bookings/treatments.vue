<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('bookableTreatments.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('events.calendar') }}</template>

            <ModulesUserCalendarTabs />
            <!-- What a patient can book in the portal and the app: a treatment
                 with a clinician and times. Before this page the backend could
                 hold them, but nothing on screen could make one. -->
            <Alert type="info" class="mt-4" :text="$t('bookableTreatments.intro')" />

            <div class="mt-8 flex justify-end items-center mb-5">
                <FormButton buttonStyle="action" @click="openForm(null)">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('bookableTreatments.new') }}
                </FormButton>
            </div>

            <div class="space-y-5">
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.treatments" :isLoading="state.isLoading">
                        <template #body v-if="!(state.isLoading || state.treatments?.data?.length === 0)">
                            <tr v-for="treatment in state.treatments?.data" :key="treatment.uuid">
                                <td>
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium text-gray-900">{{ treatment.name }}</span>
                                        <Icon v-if="treatment.is_video_consultation" name="ph:video-camera"
                                            class="h-4 w-4 text-gray-500" :aria-label="$t('bookableTreatments.form.video')" />
                                    </div>
                                </td>
                                <td>{{ clinicianName(treatment) }}</td>
                                <td>{{ treatment.department?.name ?? $t('bookableTreatments.form.departmentAll') }}</td>
                                <td>{{ formatPrice(treatment.booking_setting?.price) }}</td>
                                <td>
                                    <Badge :type="treatment.booking_setting?.is_online_booking ? 'active' : 'pending'" class="text-xxs">
                                        {{ treatment.booking_setting?.is_online_booking
                                            ? $t('bookableTreatments.table.online')
                                            : $t('bookableTreatments.table.offline') }}
                                    </Badge>
                                </td>
                                <td>
                                    <span :class="upcomingCount(treatment) ? 'text-gray-900' : 'text-amber-600'">
                                        {{ upcomingCount(treatment)
                                            ? $t('bookableTreatments.table.upcomingCount', upcomingCount(treatment))
                                            : $t('bookableTreatments.table.noTimes') }}
                                    </span>
                                </td>
                                <td>
                                    <div class="flex items-center justify-end gap-2">
                                        <Tooltip :text="$t('bookableTreatments.table.times')">
                                            <FormButton :aria-label="$t('bookableTreatments.table.times')" type="button"
                                                buttonStyle="action" @click="openTimes(treatment)">
                                                <Icon name="ph:clock" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('bookings.table.actions.edit')">
                                            <FormButton :aria-label="$t('bookings.table.actions.edit')" type="button"
                                                buttonStyle="action" @click="openForm(treatment)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('bookings.table.actions.delete')">
                                            <FormButton :aria-label="$t('bookings.table.actions.delete')" type="button"
                                                buttonStyle="action" @click="confirmDelete(treatment)">
                                                <Icon name="ph:trash" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.treatments" @previous="changePage(-1)" @next="changePage(1)" />
            </div>

            <ModulesUserCalendarBookingTreatmentModalForm :isModalOpen="state.modal.isFormOpen"
                :treatment="state.selected" @close="state.modal.isFormOpen = false" @saved="onSaved" />

            <ModulesUserCalendarBookingTreatmentModalTimes :isModalOpen="state.modal.isTimesOpen"
                :treatment="state.selected" @close="state.modal.isTimesOpen = false" @changed="fetchTreatments" />

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('bookableTreatments.deleteConfirm', { name: state.selected?.name ?? '' })"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteTreatment" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { bookingServiceService } from '@/components/api/user/BookingServiceService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
let currentPage = 1

const breadcrumbLinks = [
    { name: 'bookings.bookings', translate: true, href: '/calendar/bookings' },
    { name: 'bookableTreatments.title', translate: true, href: '/calendar/bookings/treatments' },
]

const state = reactive({
    columnHeaders: [
        { name: 'bookableTreatments.table.name', isTranslateName: true },
        { name: 'bookableTreatments.table.clinician', isTranslateName: true },
        { name: 'bookableTreatments.table.department', isTranslateName: true },
        { name: 'bookableTreatments.table.price', isTranslateName: true },
        { name: 'bookableTreatments.table.onlineBooking', isTranslateName: true },
        { name: 'bookableTreatments.table.upcoming', isTranslateName: true },
        { name: '' },
    ],
    treatments: [] as any,
    selected: null as any,
    error: {} as any,
    isLoading: false,
    modal: {
        isFormOpen: false,
        isTimesOpen: false,
        isDeleteOpen: false,
    },
})

onMounted(fetchTreatments)

// The same gate as the Bookings tab beside it.
watch(() => userStore.user, (user) => {
    if (user && !user?.has_booking_app_access) {
        navigateTo('/calendar')
    }
}, { immediate: true })

async function fetchTreatments() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await bookingServiceService.getBookingServices({ page: currentPage })
        if (response) {
            state.treatments = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function changePage(step: number) {
    currentPage = Math.max(1, currentPage + step)
    fetchTreatments()
}

function clinicianName(treatment: any) {
    const user = treatment?.user
    return user ? `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() : '-'
}

function formatPrice(price: any) {
    const value = Number(price ?? 0)
    return value > 0 ? `${value.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.` : t('bookableTreatments.table.free')
}

/** Times from today on with a seat left: what a patient can still pick. */
function upcomingCount(treatment: any) {
    const today = moment().format('YYYY-MM-DD')
    return (treatment?.booking_setting?.time_slots ?? [])
        .filter((slot: any) => String(slot.date).slice(0, 10) >= today && Number(slot.capacity) > 0)
        .length
}

function openForm(treatment: any) {
    state.selected = treatment
    state.modal.isFormOpen = true
}

function openTimes(treatment: any) {
    state.selected = treatment
    state.modal.isTimesOpen = true
}

// A new treatment has no times yet, and without times nobody can book it, so
// adding them is the next step rather than something to go looking for.
async function onSaved(treatment: any, isNew: boolean) {
    await fetchTreatments()
    if (isNew && treatment?.booking_setting?.uuid) {
        state.selected = treatment
        state.modal.isTimesOpen = true
    }
}

function confirmDelete(treatment: any) {
    state.selected = treatment
    state.modal.isDeleteOpen = true
}

async function deleteTreatment() {
    state.modal.isDeleteOpen = false
    state.error = {}
    state.isLoading = true
    try {
        await bookingServiceService.deleteBookingService(state.selected.uuid)
        successAlert(`${t('alert.success')}!`, t('bookableTreatments.deleted'))
        await fetchTreatments()
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
