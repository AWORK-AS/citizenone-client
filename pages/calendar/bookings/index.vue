<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('events.calendar') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('events.calendar') }}</template>

            <ModulesUserCalendarTabs />
            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="mt-8 flex justify-end items-center mb-5 gap-x-2"
                    v-if="Object.keys(state.bookingSettings).length > 0">
                    <FormButton buttonStyle="action" @click="state.modal.isNewEventOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('bookings.newEvent') }}
                    </FormButton>
                    <FormButton buttonStyle="action" @click="navigateTo('/calendar/bookings/settings')">
                        <Icon name="ph:gear" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('bookingSettings.bookingSettings') }}
                    </FormButton>
                </div>
                <div v-if="Object.keys(state.bookingSettings).length > 0">
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.courseEvents"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.courseEvents?.data?.length === 0))">
                                    <tr v-for="(courseEvent, index) in state.courseEvents?.data" :key="index">
                                        <td width="20%">
                                            <div class="flex items-center gap-2">
                                                <Badge type="primary" class="text-xxs truncate w-fit"
                                                    v-if="courseEvent?.type === 'event'">
                                                    {{
                                                        $t('bookings.table.type.event')
                                                    }}
                                                </Badge>
                                                <Badge type="primary" class="text-xxs truncate w-fit" v-else>
                                                    {{
                                                        $t('bookings.table.type.course')
                                                    }}
                                                </Badge>
                                                {{ courseEvent?.name }}
                                            </div>
                                        </td>
                                        <td width="30%">
                                            <p class="text-primary underline cursor-pointer"
                                                @click="navigateToExternalLink(`${runtimeConfig.public.appBaseURL}/booking/${state.bookingSettings?.link}/event/${courseEvent?.uuid}`)">
                                                {{ runtimeConfig.public.appBaseURL }}/booking/{{
                                                    state.bookingSettings?.link }}/event/{{ courseEvent?.uuid }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <p>{{ courseEvent?.slots_available }}</p>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-center justify-end gap-2">
                                                <Tooltip :text="$t('bookings.table.actions.view')">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="viewCourseEvent(courseEvent)">
                                                        <Icon name="ph:eye" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('bookings.table.actions.edit')">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="editCourseEvent(courseEvent)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('bookings.table.actions.delete')">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="deleteCourseEventConfirmation(courseEvent)">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.courseEvents" @previous="previous" @next="next" />
                    </div>
                </div>
                <div v-else class="flex flex-col items-center justify-center text-center gap-5 mt-40">
                    <div class="text-pretty text-base text-gray-600" v-if="language.locale.value === 'en'">
                        <p>
                            It looks like you haven't set up your booking settings yet.
                        </p>
                        <p>
                            Click the button below to configure your settings so
                            you can start creating events or courses.
                        </p>
                    </div>
                    <div class="text-pretty text-base text-gray-600" v-if="language.locale.value === 'dk'">
                        <p>
                            Det ser ud til, at du endnu ikke har opsat dine bookingindstillinger.
                        </p>
                        <p>
                            Klik på knappen nedenfor for at konfigurere dine indstillinger,
                            så du kan begynde at oprette begivenheder eller kurser.
                        </p>
                    </div>
                    <div class="text-pretty text-base text-gray-600" v-if="language.locale.value === 'no'">
                        <p>
                            Det ser ut til at du ennå ikke har satt opp bookinginnstillingene dine.
                        </p>
                        <p>
                            Klikk på knappen nedenfor for å konfigurere innstillingene dine,
                            slik at du kan begynne å opprette arrangementer eller kurs.
                        </p>
                    </div>
                    <div class="text-pretty text-base text-gray-600" v-if="language.locale.value === 'sv'">
                        <p>
                            Det verkar som att du ännu inte har konfigurerat dina bokningsinställningar.
                        </p>
                        <p>
                            Klicka på knappen nedan för att konfigurera dina inställningar
                            så att du kan börja skapa evenemang eller kurser.
                        </p>
                    </div>
                    <FormButton buttonStyle="action" @click="navigateTo('/calendar/bookings/settings')">
                        <Icon name="ph:gear" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('bookingSettings.bookingSettings') }}
                    </FormButton>
                </div>
            </LoadingSpinner>
            <ModulesUserCalendarBookingModalNewEventSelection :isModalOpen="state.modal.isNewEventOpen"
                @close="state.modal.isNewEventOpen = false" @refreshCoursesEvents="fetchCoursesEvents" />

            <ModulesUserCalendarBookingModalView :isModalOpen="state.modal.isViewEventCourse"
                :selectedCourseEvent="state.selectedCourseEvent" :bookingSettings="state.bookingSettings"
                @close="state.modal.isViewEventCourse = false" />

            <ModulesUserCalendarBookingSingleEventModalEdit :isModalOpen="state.modal.isEditSingleEventOpen"
                :selectedEvent="state.selectedCourseEvent" @close="state.modal.isEditSingleEventOpen = false"
                @refreshCoursesEvents="fetchCoursesEvents" />
            <ModulesUserCalendarBookingCourseModalEdit :isModalOpen="state.modal.isEditCourseOpen"
                :selectedCourse="state.selectedCourseEvent" @close="state.modal.isEditCourseOpen = false"
                @refreshCoursesEvents="fetchCoursesEvents" />

            <DialogConfirmation :isModalOpen="state.modal.isDeleteCourseOpen"
                :message="$t('bookings.table.confirmation.deleteCourseConfirmation') + '?'"
                @close="state.modal.isDeleteCourseOpen = false" @confirm="deleteCourseEvent" />

            <DialogConfirmation :isModalOpen="state.modal.isDeleteEventOpen"
                :message="$t('bookings.table.confirmation.deleteEventConfirmation') + '?'"
                @close="state.modal.isDeleteEventOpen = false" @confirm="deleteCourseEvent" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { coursesEventsService } from '@/components/api/user/CoursesEventsService'
import { onlineBookingSettingsService } from '@/components/api/user/OnlineBookingSettingsService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const language = useI18n()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'bookings.bookings',
        translate: true,
        href: '/calendar/bookings',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'bookings.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'bookings.table.link', isTranslateName: true, },
        { name: 'bookings.table.availableSlots', isTranslateName: true, },
        { name: '' },
    ],
    courseEvents: [] as any,
    bookingSettings: {},
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    modal: {
        isDeleteCourseOpen: false,
        isDeleteEventOpen: false,
        isEditCourseOpen: false,
        isEditSingleEventOpen: false,
        isNewEventOpen: false,
        isViewEventCourse: false,
    },
    selectedCourseEvent: {},
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchBookingSettings()
    fetchCoursesEvents()
})

watch(() => userStore.user, (newValue) => {
    if (!newValue?.has_booking_app_access) {
        navigateTo('/calendar')
    }
})

async function fetchBookingSettings() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await onlineBookingSettingsService.getOnlineBookingSettings()
        if (response?.data) {
            state.bookingSettings = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchCoursesEvents() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await coursesEventsService.getCoursesEvents(params)
        if (response) {
            state.courseEvents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCoursesEvents()
}

function next() {
    currentTablePage++
    fetchCoursesEvents()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCoursesEvents()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchCoursesEvents()
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

function viewCourseEvent(courseEvent) {
    state.selectedCourseEvent = courseEvent
    state.modal.isViewEventCourse = true
}

function editCourseEvent(courseEvent: any) {
    state.selectedCourseEvent = courseEvent
    if (courseEvent?.type === 'event') {
        state.modal.isEditSingleEventOpen = true
    } else {
        state.modal.isEditCourseOpen = true

    }
}

function deleteCourseEventConfirmation(courseEvent: any) {
    state.selectedCourseEvent = courseEvent
    if (courseEvent?.type === 'event') {
        state.modal.isDeleteEventOpen = true
    } else {
        state.modal.isDeleteCourseOpen = true
    }
}

async function deleteCourseEvent() {
    state.error = {}
    state.isTableLoading = true
    try {
        const courseEventUuid = state.selectedCourseEvent.uuid
        const response = await coursesEventsService.deleteEventCourse(courseEventUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchCoursesEvents()
            if (state.selectedCourseEvent.type === 'event') {
                successAlert(`${t('alert.success')}!`, `${t('bookings.table.alert.eventSuccessfullyDeleted')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('bookings.table.alert.courseSuccessfullyDeleted')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>