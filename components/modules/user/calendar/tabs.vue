<template>
    <Tabs :tabs="state.tabs" :isJustifyBetween="false" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const { t } = useI18n()
const userStore = useUserStore()

const BOOKING_TABS = ['calendar.tabs.bookings', 'calendar.tabs.treatments', 'calendar.tabs.appointments']

const state = reactive({
    tabs: [
        {
            name: 'calendar.tabs.events',
            isTranslateName: true,
            href: `/calendar`,
            routeNames: [
                'calendar',
            ]
        },
        {
            name: 'calendar.tabs.bookings',
            isTranslateName: true,
            href: `/calendar/bookings`,
            routeNames: [
                'calendar-bookings',
                'calendar-bookings-settings',
            ]
        },
        {
            // What patients book in the portal and the app: a treatment with a
            // clinician and times. Events and courses stay on Bookings.
            name: 'calendar.tabs.treatments',
            isTranslateName: true,
            href: `/calendar/bookings/treatments`,
            routeNames: [
                'calendar-bookings-treatments',
            ]
        },
        {
            // The times patients have actually taken. The bookings tab beside
            // it is what a clinic offers; this is what came back.
            name: 'calendar.tabs.appointments',
            isTranslateName: true,
            href: `/calendar/bookings/appointments`,
            routeNames: [
                'calendar-bookings-appointments',
            ]
        },
        {
            // Roadmap #499: which car, room or equipment is booked when, and which is free.
            name: 'calendar.tabs.units',
            isTranslateName: true,
            href: `/calendar/units`,
            routeNames: [
                'calendar-units',
            ]
        },
    ] as any
})

// Without the booking app the booking tabs are not offered; the calendar and units tabs always are.
watch(() => userStore.getUser?.has_booking_app_access, (hasBookingApp: any) => {
    if (!hasBookingApp) {
        state.tabs = state.tabs.filter((tab: any) => !BOOKING_TABS.includes(tab.name))
    }
}, { immediate: true })

function changeTab(value: any) {
    if (value === t('calendar.tabs.events')) {
        navigateTo(`/calendar`)
    }
    else if (value === t('calendar.tabs.bookings')) {
        navigateTo(`/calendar/bookings`)
    }
    else if (value === t('calendar.tabs.treatments')) {
        navigateTo(`/calendar/bookings/treatments`)
    }
    else if (value === t('calendar.tabs.appointments')) {
        navigateTo(`/calendar/bookings/appointments`)
    }
    else if (value === t('calendar.tabs.units')) {
        navigateTo(`/calendar/units`)
    }
}
</script>