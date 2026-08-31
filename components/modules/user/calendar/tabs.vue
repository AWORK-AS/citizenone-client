<template>
    <Tabs :tabs="state.tabs" :isJustifyBetween="false" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const { t } = useI18n()

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
            // The times patients have actually taken. The bookings tab beside
            // it is what a clinic offers; this is what came back.
            name: 'calendar.tabs.appointments',
            isTranslateName: true,
            href: `/calendar/bookings/appointments`,
            routeNames: [
                'calendar-bookings-appointments',
            ]
        },
    ] as any
})

function changeTab(value: any) {
    if (value === t('calendar.tabs.events')) {
        navigateTo(`/calendar`)
    }
    else if (value === t('calendar.tabs.bookings')) {
        navigateTo(`/calendar/bookings`)
    }
    else if (value === t('calendar.tabs.appointments')) {
        navigateTo(`/calendar/bookings/appointments`)
    }
}
</script>