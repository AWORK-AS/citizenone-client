<template>
    <Tabs :tabs="state.tabs" :isJustifyBetween="false" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const { t } = useI18n()

const state = reactive({
    tabs: [] as any
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        state.tabs = [
            {
                name: 'settings.tabs.absences',
                isTranslateName: true,
                href: `/settings/absences`,
                routeNames: [
                    'settings-absences'
                ]
            },
            {
                name: 'settings.tabs.addictions',
                isTranslateName: true,
                href: `/settings/addictions`,
                routeNames: [
                    'settings-addictions'
                ]
            },
            {
                name: 'settings.tabs.calendarTags',
                isTranslateName: true,
                href: `/settings/calendar-tags`,
                routeNames: [
                    'settings-calendar-tags'
                ]
            },
            {
                name: 'settings.tabs.departments',
                isTranslateName: true,
                href: `/settings/departments`,
                routeNames: [
                    'settings-departments'
                ]
            },
            {
                name: 'settings.tabs.diagnoses',
                isTranslateName: true,
                href: `/settings/diagnoses`,
                routeNames: [
                    'settings-diagnoses'
                ]
            },
            {
                name: 'settings.tabs.foreignCities',
                isTranslateName: true,
                href: `/settings/foreign-cities`,
                routeNames: [
                    'settings-foreign-cities'
                ]
            },
            {
                name: 'settings.tabs.jobTitles',
                isTranslateName: true,
                href: `/settings/job-titles`,
                routeNames: [
                    'settings-job-titles',
                    'settings-job-titles-job_title_uuid'
                ]
            },
            {
                name: 'settings.tabs.journalNoteTags',
                isTranslateName: true,
                href: `/settings/journal-note-tags`,
                routeNames: [
                    'settings-journal-note-tags'
                ]
            },
            {
                name: 'settings.tabs.medicines',
                isTranslateName: true,
                href: `/settings/medicines`,
                routeNames: [
                    'settings-medicines'
                ]
            },
            {
                name: 'settings.tabs.relationships',
                isTranslateName: true,
                href: `/settings/relationships`,
                routeNames: [
                    'settings-relationships'
                ]
            },
            {
                name: 'settings.tabs.scheduleTags',
                isTranslateName: true,
                href: `/settings/schedule-tags`,
                routeNames: [
                    'settings-schedule-tags'
                ]
            },
            {
                name: 'settings.tabs.sections',
                isTranslateName: true,
                href: `/settings/sections`,
                routeNames: [
                    'settings-sections'
                ]
            },
            {
                name: 'settings.tabs.shifts',
                isTranslateName: true,
                href: `/settings/shifts`,
                routeNames: [
                    'settings-shifts'
                ]
            },
            {
                name: 'settings.tabs.units',
                isTranslateName: true,
                href: `/settings/units`,
                routeNames: [
                    'settings-units'
                ]
            },
        ];

    }
})


function changeTab(value: any) {
    if (value === t('settings.tabs.absences')) {
        navigateTo(`/settings/absences`)
    }
    else if (value === t('settings.tabs.departments')) {
        navigateTo(`/settings/departments`)
    }
    else if (value === t('settings.tabs.addictions')) {
        navigateTo(`/settings/addictions`)
    }
    else if (value === t('settings.tabs.diagnoses')) {
        navigateTo(`/settings/diagnoses`)
    }
    else if (value === t('settings.tabs.foreignCities')) {
        navigateTo(`/settings/foreign-cities`)
    }
    else if (value === t('settings.tabs.jobTitles')) {
        navigateTo(`/settings/job-titles`)
    }
    else if (value === t('settings.tabs.journalNoteTags')) {
        navigateTo(`/settings/journal-note-tags`)
    }
    else if (value === t('settings.tabs.relationships')) {
        navigateTo(`/settings/relationships`)
    }
    else if (value === t('settings.tabs.medicines')) {
        navigateTo(`/settings/medicines`)
    }
    else if (value === t('settings.tabs.sections')) {
        navigateTo(`/settings/sections`)
    }
    else if (value === t('settings.tabs.shifts')) {
        navigateTo(`/settings/shifts`)
    }
    else if (value === t('settings.tabs.units')) {
        navigateTo(`/settings/units`)
    }
}
</script>