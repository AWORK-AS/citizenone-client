<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>Calendar - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>Calendar</template>

            <div>
                <FullCalendar :options="calendarOptions" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'

const runtimeConfig = useRuntimeConfig()

const calendarOptions = {
    headerToolbar: {
        start: 'title', // will normally be on the left. if RTL, will be on the right
        center: 'dayGridMonth,timeGridWeek,listWeek',
        end: 'today prev,next' // will normally be on the right. if RTL, will be on the left
    },
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    events: [
        { title: 'Event 1', start: new Date() },
        { title: 'Event 2', start: new Date(), end: '2024-07-09' },
        { title: 'Event 3', start: new Date(), allDay: false },
    ]
}
</script>