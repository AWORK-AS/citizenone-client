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
                        <div class="flex items-center gap-x-3">
                            <FormButton :buttonStyle="state.calendarView === 'default' ? 'primary' : ''"
                                @click="setCalendarView('default')" class="rounded-md">
                                {{ $t('calendar.view.defaultView') }}
                            </FormButton>
                            <FormButton :buttonStyle="state.calendarView === 'week' ? 'primary' : ''"
                                @click="setCalendarView('week')" class="rounded-md">
                                {{ $t('calendar.view.weekView') }}
                            </FormButton>
                            <FormButton :buttonStyle="state.calendarView === 'month' ? 'primary' : ''"
                                @click="setCalendarView('month')" class="rounded-md">
                                {{ $t('calendar.view.monthView') }}
                            </FormButton>
                        </div>
                        <div class="flex justify-end">
                            <FormButton buttonStyle="action" class="rounded-lg"
                                @click="state.modal.isAddEventForCitizenOpen = true">
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
                            v-if="state.calendarView === 'default'" />
                        <ModulesUserCitizenCalendarWeekView :myCalendarEvents="state.myCalendarEvents"
                            @changeDatePerWeek="changeDatePerWeek" v-if="state.calendarView === 'week'"
                            @viewMyCalendarEvent="viewMyCalendarEvent" />
                        <ModulesUserCitizenCalendarMonthView :myCalendarEvents="state.myCalendarEvents"
                            @changeMonthYear="changeMonthYear" v-if="state.calendarView === 'month'"
                            @viewMyCalendarEvent="viewMyCalendarEvent" />
                    </LoadingSpinner>
                </div>

                <ModulesUserCitizenCalendarModalNew :isModalOpen="state.modal.isAddEventForCitizenOpen"
                    @close="state.modal.isAddEventForCitizenOpen = false" @refreshSchedules="fetchMyCalendarEvents" />
                <ModulesUserCitizenCalendarModalView :isModalOpen="state.modal.isViewEventOpen"
                    :selectedSchedule="state.selectedSchedule" @close="state.modal.isViewEventOpen = false"
                    @deleteMyCalendarEvent="deleteMyCalendarEvent" @refreshSchedules="fetchMyCalendarEvents" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenService } from '@/components/api/user/CitizenService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
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
    },
    selectedDate: {
        end_date: moment().endOf('month').format('YYYY-MM-DD'),
        start_date: moment().startOf('month').format('YYYY-MM-DD'),
    },
    selectedSchedule: {
        id: '',
        uuid: '',
        user: '',
        title: '',
        description: '',
        start: '',
        end: '',
        is_private: false,
    },
    selectedYear: '',
    selectedMonth: '',
})

onMounted(() => {
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
            params.date = state.selectedDate
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

function viewMyCalendarEvent(selectedCalendarEvent: any) {
    state.selectedSchedule.uuid = selectedCalendarEvent.uuid
    state.selectedSchedule.user = selectedCalendarEvent.user
    state.selectedSchedule.title = selectedCalendarEvent.title
    state.selectedSchedule.description = selectedCalendarEvent.description
    state.selectedSchedule.start = selectedCalendarEvent.date_time_start
    state.selectedSchedule.end = selectedCalendarEvent.date_time_end
    state.selectedSchedule.is_private = selectedCalendarEvent.is_private ? true : false
    state.modal.isViewEventOpen = true
}

async function deleteMyCalendarEvent(selectedCalendarEvent: any) {
    state.error = {}
    state.isPageLoading = true
    state.modal.isViewEventOpen = false
    try {
        const scheduleUuid = selectedCalendarEvent?.uuid
        const params = {
            citizen_uuid: citizenUuid
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
</script>