<template>
    <div>
        <Tabs :id="props?.id" :tabs="state.tabs" :isJustifyBetween="false" :isSwipeable="true" @changeTab="changeTab" />
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const props = defineProps({
    id: {
        type: String,
        required: false,
    },
})

const customPagesStore = useCustomPagesStore() as any
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
                name: customPagesStore.getCustomPagesName?.addictions,
                isTranslateName: false,
                href: `/settings/addictions`,
                routeNames: [
                    'settings-addictions'
                ]
            },
            {
                name: 'settings.tabs.bookingTags',
                isTranslateName: true,
                href: `/settings/booking-tags`,
                routeNames: [
                    'settings-booking-tags'
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
                name: 'settings.tabs.contactJobTitles',
                isTranslateName: true,
                href: `/settings/contact-job-titles`,
                routeNames: [
                    'settings-contact-job-titles'
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
                name: 'settings.tabs.dosageForms',
                isTranslateName: true,
                href: `/settings/dosage-forms`,
                routeNames: [
                    'settings-dosage-forms'
                ]
            },
            {
                name: 'settings.tabs.employeeGroups',
                isTranslateName: true,
                href: `/settings/employee-groups`,
                routeNames: [
                    'settings-employee-groups'
                ]
            },
            {
                name: 'settings.tabs.expenseCategories',
                isTranslateName: true,
                href: `/settings/expense-categories`,
                routeNames: [
                    'settings-expense-categories'
                ]
            },
            {
                name: 'settings.tabs.extraHoursTags',
                isTranslateName: true,
                href: `/settings/extra-hours-tags`,
                routeNames: [
                    'settings-extra-hours-tags'
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
                name: 'settings.tabs.journalTitles',
                isTranslateName: true,
                href: `/settings/journal-titles`,
                routeNames: [
                    'settings-journal-titles'
                ]
            },
            {
                name: 'settings.tabs.massUnits',
                isTranslateName: true,
                href: `/settings/mass-units`,
                routeNames: [
                    'settings-mass-units'
                ]
            },
            {
                name: 'settings.tabs.medicationAllergies',
                isTranslateName: true,
                href: `/settings/medication-allergies`,
                routeNames: [
                    'settings-medication-allergies'
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
                name: 'settings.tabs.normPeriods',
                isTranslateName: true,
                href: `/settings/norm-periods`,
                routeNames: [
                    'settings-norm-periods'
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
                name: 'settings.tabs.roles',
                isTranslateName: true,
                href: `/settings/roles`,
                routeNames: [
                    'settings-roles'
                ]
            },
            {
                name: 'settings.tabs.rooms',
                isTranslateName: true,
                href: `/settings/rooms`,
                routeNames: [
                    'settings-rooms'
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
    if (value === '/settings/absences') {
        navigateTo(`/settings/absences`)
    }
    else if (value === '/settings/addictions') {
        navigateTo(`/settings/addictions`)
    }
    else if (value === '/settings/booking-tags') {
        navigateTo(`/settings/booking-tags`)
    }
    else if (value === '/settings/calendar-tags') {
        navigateTo(`/settings/calendar-tags`)
    }
    else if (value === '/settings/contact-job-titles') {
        navigateTo(`/settings/contact-job-titles`)
    }
    else if (value === '/settings/departments') {
        navigateTo(`/settings/departments`)
    }
    else if (value === '/settings/diagnoses') {
        navigateTo(`/settings/diagnoses`)
    }
    else if (value === '/settings/employee-groups') {
        navigateTo(`/settings/employee-groups`)
    }
    else if (value === '/settings/expense-categories') {
        navigateTo(`/settings/expense-categories`)
    }
    else if (value === '/settings/extra-hours-tags') {
        navigateTo(`/settings/extra-hours-tags`)
    }
    else if (value === '/settings/foreign-cities') {
        navigateTo(`/settings/foreign-cities`)
    }
    else if (value === '/settings/job-titles') {
        navigateTo(`/settings/job-titles`)
    }
    else if (value === '/settings/journal-note-tags') {
        navigateTo(`/settings/journal-note-tags`)
    }
    else if (value === '/settings/journal-titles') {
        navigateTo(`/settings/journal-titles`)
    }
    else if (value === '/settings/mass-units') {
        navigateTo(`/settings/mass-units`)
    }
    else if (value === '/settings/medication-allergies') {
        navigateTo(`/settings/medication-allergies`)
    }
    else if (value === '/settings/medicines') {
        navigateTo(`/settings/medicines`)
    }
    else if (value === '/settings/norm-periods') {
        navigateTo(`/settings/norm-periods`)
    }
    else if (value === '/settings/relationships') {
        navigateTo(`/settings/relationships`)
    }
    else if (value === '/settings/roles') {
        navigateTo(`/settings/roles`)
    }
    else if (value === '/settings/rooms') {
        navigateTo(`/settings/rooms`)
    }
    else if (value === '/settings/schedule-tags') {
        navigateTo(`/settings/schedule-tags`)
    }
    else if (value === '/settings/sections') {
        navigateTo(`/settings/sections`)
    }
    else if (value === '/settings/shifts') {
        navigateTo(`/settings/shifts`)
    }
    else if (value === '/settings/units') {
        navigateTo(`/settings/units`)
    }
}
</script>