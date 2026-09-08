<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.calendar') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.calendar') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex flex-col-reverse md:flex-row md:justify-between gap-3">
                        <div class="inline-flex items-center gap-x-0.5 rounded-lg bg-gray-100 p-0.5">
                            <button type="button" v-for="opt in viewOptions" :key="opt.value"
                                @click="setCalendarView(opt.value)" :class="[
                                    state.calendarView === opt.value
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800',
                                    'rounded-md px-4 py-1.5 text-xs font-semibold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                                ]">
                                {{ $t(opt.label) }}
                            </button>
                        </div>
                        <div class="flex justify-end">
                            <FormButton buttonStyle="action" @click="openCreateEventModal('')"
                                v-if="isAtLeast('Admin') || can('create_citizen_calendar')">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('events.newEvent') }}
                            </FormButton>
                        </div>
                    </div>
                </div>

                <div class="mt-5 space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <LoadingSpinner :isActive="state.isPageLoading">
                        <ModulesUserCitizenCalendarDefaultView :myCalendarEvents="state.myCalendarEvents"
                            @changeMonthYear="changeMonthYear" @deleteMyCalendarEvent="deleteMyCalendarEvent"
                            @markEventAsStatus="handleMarkEventAsStatus"
                            @createJournalFromEvent="handleCreateJournalFromEvent"
                            @viewMyCalendarEvent="viewMyCalendarEvent"
                            @createEvent="openCreateEventModal"
                            v-if="state.calendarView === 'default'" />
                        <ModulesUserCitizenCalendarWeekView :myCalendarEvents="state.myCalendarEvents"
                            @changeDatePerWeek="changeDatePerWeek" v-if="state.calendarView === 'week'"
                            @viewMyCalendarEvent="viewMyCalendarEvent"
                            @markEventAsStatus="handleMarkEventAsStatus"
                            @createJournalFromEvent="handleCreateJournalFromEvent"
                            @createEvent="openCreateEventModal" />
                        <ModulesUserCitizenCalendarMonthView :myCalendarEvents="state.myCalendarEvents"
                            @changeMonthYear="changeMonthYear" v-if="state.calendarView === 'month'"
                            @viewMyCalendarEvent="viewMyCalendarEvent"
                            @markEventAsStatus="handleMarkEventAsStatus"
                            @createJournalFromEvent="handleCreateJournalFromEvent"
                            @createEvent="openCreateEventModal" />
                    </LoadingSpinner>
                </div>

                <ModulesUserCitizenCalendarModalNew :isModalOpen="state.modal.isAddEventForCitizenOpen"
                    :presetDate="state.newEventPresetDate"
                    @close="state.modal.isAddEventForCitizenOpen = false" @refreshSchedules="fetchMyCalendarEvents" />
                <ModulesUserCitizenCalendarModalView :isModalOpen="state.modal.isViewEventOpen"
                    :selectedSchedule="state.selectedSchedule" @close="state.modal.isViewEventOpen = false"
                    @deleteMyCalendarEvent="deleteMyCalendarEvent" @refreshSchedules="fetchMyCalendarEvents" />
                <ModulesUserMyCalendarModalEventJournalPrompt :isModalOpen="state.modal.isEventJournalPromptOpen"
                    @close="state.modal.isEventJournalPromptOpen = false"
                    @yes="handleJournalPromptYes"
                    @no="state.modal.isEventJournalPromptOpen = false" />
                <ModulesUserMyCalendarModalCreateJournal :isModalOpen="state.modal.isCreateEventJournalOpen"
                    :selectedEvent="state.selectedSchedule"
                    @close="state.modal.isCreateEventJournalOpen = false"
                    @journalCreated="fetchMyCalendarEvents" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenService } from '@/components/api/user/CitizenService'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { usePermissions } from '@/composables/usePermissions'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast, can } = usePermissions()
const breadcrumbLinks = [
    {
        name: 'citizens.tabs.calendar',
        translate: true,
        href: `/citizens/${citizenUuid}/calendar`,
    },
]

const state = reactive({
    calendarView: 'default',
    error: {} as Error,
    isPageLoading: false,
    myCalendarEvents: [] as any,
    modal: {
        isAddEventForCitizenOpen: false,
        isViewEventOpen: false,
        isEventJournalPromptOpen: false,
        isCreateEventJournalOpen: false,
    },
    selectedSchedule: null as any,
    selectedDate: {
        end_date: moment().endOf('month').format('YYYY-MM-DD'),
        start_date: moment().startOf('month').format('YYYY-MM-DD'),
    },
    selectedYear: '',
    selectedMonth: '',
    newEventPresetDate: '',
})

onMounted(() => {
    // Arriving with a date means somebody came here to give this patient a
    // time: the recall list and the patient's own screen both link here when a
    // check-up falls due. Open the month it falls in and put the new-event form
    // in front of them, rather than the calendar and the date typed again.
    //
    // A due date in the past means an overdue patient, and nobody books
    // backwards, so the form opens on today instead.
    const requested = router?.currentRoute?.value?.query?.date as string | undefined

    if (requested && moment(requested, 'YYYY-MM-DD', true).isValid()) {
        const day = moment.max(moment(requested, 'YYYY-MM-DD'), moment().startOf('day'))

        state.selectedDate = {
            start_date: day.clone().startOf('month').format('YYYY-MM-DD'),
            end_date: day.clone().endOf('month').format('YYYY-MM-DD'),
        }

        openCreateEventModal(day.format('YYYY-MM-DD'))
    }

    fetchMyCalendarEvents()
})

async function fetchMyCalendarEvents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            citizen_uuid: citizenUuid
        }
        if (state.selectedDate.start_date && state.selectedDate.end_date) {
            params.date = JSON.stringify(state.selectedDate)
        }
        if (state.selectedYear) {
            params.year = state.selectedYear
        }
        if (state.selectedMonth !== '') {
            params.month = (state.selectedMonth + 1)
        }

        const response = await citizenService.getCitizenCalendar(params)
        if (response.data) {
            state.myCalendarEvents = response
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}

const viewOptions = [
    { value: 'default', label: 'calendar.view.day' },
    { value: 'week', label: 'calendar.view.week' },
    { value: 'month', label: 'calendar.view.month' },
]

function onViewKey(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const t = e.target as HTMLElement
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return
    if (e.key === 'd' || e.key === 'D') setCalendarView('default')
    else if (e.key === 'u' || e.key === 'U' || e.key === 'w' || e.key === 'W') setCalendarView('week')
    else if (e.key === 'm' || e.key === 'M') setCalendarView('month')
}
onMounted(() => window.addEventListener('keydown', onViewKey))
onUnmounted(() => window.removeEventListener('keydown', onViewKey))

function setCalendarView(viewStyle: any) {
    if (state.calendarView !== viewStyle) {
        state.calendarView = viewStyle
        if (viewStyle === 'default') {
            state.selectedDate = {
                end_date: moment().endOf('month').endOf('isoWeek').format('YYYY-MM-DD'),
                start_date: moment().startOf('month').startOf('isoWeek').format('YYYY-MM-DD'),
            }
        } else if (viewStyle === 'week') {
            state.selectedDate = {
                end_date: moment().endOf('isoWeek').format('YYYY-MM-DD'),
                start_date: moment().startOf('isoWeek').format('YYYY-MM-DD'),
            }
        } else if (viewStyle === 'month') {
            state.selectedDate = {
                end_date: moment().endOf('month').endOf('isoWeek').format('YYYY-MM-DD'),
                start_date: moment().startOf('month').startOf('isoWeek').format('YYYY-MM-DD'),
            }
        }
        state.selectedYear = ''
        state.selectedMonth = ''
        fetchMyCalendarEvents()
    }
}

function changeDate(date: any) {
    state.selectedYear = ''
    state.selectedMonth = ''
    state.selectedDate = {
        end_date: date,
        start_date: date,
    }
    fetchMyCalendarEvents()
}

function changeDatePerWeek(date: any) {
    state.selectedYear = ''
    state.selectedMonth = ''
    state.selectedDate = {
        end_date: date[1],
        start_date: date[0],
    }
    fetchMyCalendarEvents()
}

function changeMonthYear(year: any, month: any) {
    state.selectedDate = {
        end_date: '',
        start_date: '',
    }
    state.selectedYear = year
    state.selectedMonth = month
    fetchMyCalendarEvents()
}

function openCreateEventModal(date: string) {
    state.newEventPresetDate = date
    state.modal.isAddEventForCitizenOpen = true
}

function viewMyCalendarEvent(selectedCalendarEvent: any) {
    state.selectedSchedule = {
        uuid: selectedCalendarEvent.uuid,
        user: selectedCalendarEvent.user,
        title: selectedCalendarEvent.title,
        description: selectedCalendarEvent.description,
        start: selectedCalendarEvent.date_time_start,
        end: selectedCalendarEvent.date_time_end,
        is_private: selectedCalendarEvent.is_private ? true : false,
        is_recurring: selectedCalendarEvent.is_recurring ? true : false,
    }
    state.modal.isViewEventOpen = true
}

async function deleteMyCalendarEvent(selectedCalendarEvent: any, isDeleteFuture?: boolean) {
    state.error = {}
    state.isPageLoading = true
    state.modal.isViewEventOpen = false
    try {
        const scheduleUuid = selectedCalendarEvent?.uuid
        const params = {
            citizen_uuid: citizenUuid,
            is_delete_future: isDeleteFuture,
        }
        const response = await citizenService.deleteCitizenCalendarEvent(scheduleUuid, params)
        if (response) {
            fetchMyCalendarEvents()
            successAlert(`${t('alert.success')}!`, `${t('citizens.calendar.alert.successfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function handleMarkEventAsStatus(selectedCalendarEvent: any, status: 'completed' | 'not_completed') {
    state.error = {}
    state.isPageLoading = true
    state.selectedSchedule = selectedCalendarEvent
    try {
        const response = await myCalendarService.updateEventStatus(selectedCalendarEvent?.uuid, { status })
        if (response?.data) {
            fetchMyCalendarEvents()
            successAlert(`${t('alert.success')}!`, `${t('events.alert.statusSuccessfullyUpdated')}.`)
            state.modal.isEventJournalPromptOpen = true
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function handleCreateJournalFromEvent(selectedCalendarEvent: any) {
    state.selectedSchedule = selectedCalendarEvent
    state.modal.isCreateEventJournalOpen = true
}

function handleJournalPromptYes() {
    state.modal.isEventJournalPromptOpen = false
    state.modal.isCreateEventJournalOpen = true
}
</script>