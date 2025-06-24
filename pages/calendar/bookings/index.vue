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
                    <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isNewEventOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('bookings.newEvent') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/calendar/bookings/settings')">
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
                                        <td width="40%">
                                            <p class="text-primary underline cursor-pointer"
                                                @click="navigateToExternalLink(`${runtimeConfig.public.appBaseURL}/booking/${state.bookingSettings?.link}/event/${courseEvent?.uuid}`)">
                                                {{ runtimeConfig.public.appBaseURL }}/booking/{{
                                                    state.bookingSettings?.link }}/event/{{ courseEvent?.uuid }}
                                            </p>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <Tooltip :text="$t('bookings.table.actions.edit')">
                                                    <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                        @click="editCourseEvent(courseEvent)">
                                                        <Icon name="ph:pencil" class="size-4" />
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
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/calendar/bookings/settings')">
                        <Icon name="ph:gear" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('bookingSettings.bookingSettings') }}
                    </FormButton>
                </div>
            </LoadingSpinner>
            <ModulesUserCalendarBookingNewEventSelection :isModalOpen="state.modal.isNewEventOpen"
                @close="state.modal.isNewEventOpen = false" @refreshCoursesEvents="fetchCoursesEvents" />


            <ModulesUserCalendarBookingSingleEventModalEdit :isModalOpen="state.modal.isEditSingleEventOpen"
                :selectedEvent="state.selectedCourseEvent" @close="state.modal.isEditSingleEventOpen = false"
                @refreshCoursesEvents="fetchCoursesEvents" />
            <ModulesUserCalendarBookingCourseModalEdit :isModalOpen="state.modal.isEditCourseOpen"
                :selectedCourse="state.selectedCourseEvent" @close="state.modal.isEditCourseOpen = false"
                @refreshCoursesEvents="fetchCoursesEvents" />
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
        { name: 'bookings.table.name', sorter: true, key: 'name' },
        { name: 'bookings.table.link' },
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
        isEditCourseOpen: false,
        isEditSingleEventOpen: false,
        isNewEventOpen: false,
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

function editCourseEvent(courseEvent: any) {
    state.selectedCourseEvent = courseEvent
    if (courseEvent?.type === 'event') {
        state.modal.isEditSingleEventOpen = true
    } else {
        state.modal.isEditCourseOpen = true

    }
}
</script>