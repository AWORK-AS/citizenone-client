<template>
    <Tabs :tabs="state.tabs" @changeTab="changeTab" />
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
                href: `/settings/absences`,
                routeNames: [
                    'settings-absences'
                ]
            },
            {
                name: 'settings.tabs.departments',
                href: `/settings/departments`,
                routeNames: [
                    'settings-departments'
                ]
            },
            {
                name: 'settings.tabs.addictions',
                href: `/settings/addictions`,
                routeNames: [
                    'settings-addictions'
                ]
            },
            {
                name: 'settings.tabs.diagnoses',
                href: `/settings/diagnoses`,
                routeNames: [
                    'settings-diagnoses'
                ]
            },
            {
                name: 'settings.tabs.foreignCities',
                href: `/settings/foreign-cities`,
                routeNames: [
                    'settings-foreign-cities'
                ]
            },
            {
                name: 'settings.tabs.jobTitles',
                href: `/settings/job-titles`,
                routeNames: [
                    'settings-job-titles',
                    'settings-job-titles-job_title_uuid'
                ]
            },
            {
                name: 'settings.tabs.journalNoteTags',
                href: `/settings/journal-note-tags`,
                routeNames: [
                    'settings-journal-note-tags'
                ]
            },
            {
                name: 'settings.tabs.relationships',
                href: `/settings/relationships`,
                routeNames: [
                    'settings-relationships'
                ]
            },
            {
                name: 'settings.tabs.medicines',
                href: `/settings/medicines`,
                routeNames: [
                    'settings-medicines'
                ]
            },
            {
                name: 'settings.tabs.shifts',
                href: `/settings/shifts`,
                routeNames: [
                    'settings-shifts'
                ]
            }
        ]
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
    else if (value === t('settings.tabs.jobTitles')) {
        navigateTo(`/settings/job-titles`)
    }
    else if (value === t('settings.tabs.journalNoteTags')) {
        navigateTo(`/settings/journal-note-tags`)
    }
    else if (value === t('settings.tabs.relationships')) {
        navigateTo(`/settings/relationships`)
    }
}
</script>