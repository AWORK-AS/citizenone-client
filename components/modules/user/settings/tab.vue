<template>
    <Tabs :tabs="state.tabs"
        :isJustifyBetween="userStore.getUser?.roles?.some((role: any) => role.name === 'Admin') ? true : false"
        @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const router = useRouter()

const state = reactive({
    tabs: [] as any
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        const hasAdmin = newValue?.roles?.some((role: any) => role.name === 'Admin')
        if (hasAdmin) {
            state.tabs = [
                {
                    name: 'settings.tabs.profile',
                    isTranslateName: true,
                    href: `/settings/profile`,
                    routeNames: [
                        'settings-profile'
                    ]
                },
                {
                    name: 'settings.tabs.company',
                    isTranslateName: true,
                    href: `/settings/company`,
                    routeNames: [
                        'settings-company'
                    ]
                },
                {
                    name: 'settings.tabs.import',
                    isTranslateName: true,
                    href: `/settings/import`,
                    routeNames: [
                        'settings-import'
                    ]
                },
                {
                    name: 'settings.tabs.invoices',
                    isTranslateName: true,
                    href: `/settings/invoices`,
                    routeNames: [
                        'settings-invoices',
                        'settings-invoices-invoice_uuid-invoice-details'
                    ]
                },
                {
                    name: 'settings.tabs.storage',
                    isTranslateName: true,
                    href: `/settings/storage`,
                    routeNames: [
                        'settings-storage'
                    ]
                },
                {
                    name: 'settings.tabs.licenses',
                    isTranslateName: true,
                    href: `/settings/license-overview`,
                    routeNames: [
                        'settings-license-overview'
                    ]
                },
                {
                    name: 'settings.tabs.subscription',
                    isTranslateName: true,
                    href: `/settings/subscription`,
                    routeNames: [
                        'settings-subscription'
                    ]
                },
                {
                    name: 'settings.tabs.archived',
                    isTranslateName: true,
                    href: `/settings/archived/citizens`,
                    routeNames: [
                        'settings-archived-citizens',
                        'settings-archived-employees',
                        'settings-archived-documents',
                    ]
                },
                {
                    name: 'settings.tabs.catalog',
                    isTranslateName: true,
                    href: `/settings/absences`,
                    routeNames: [
                        'settings-absences',
                        'settings-addictions',
                        'settings-booking-tags',
                        'settings-calendar-tags',
                        'settings-departments',
                        'settings-diagnoses',
                        'settings-foreign-cities',
                        'settings-job-titles',
                        'settings-journal-note-tags',
                        'settings-medicines',
                        'settings-relationships',
                        'settings-schedule-tags',
                        'settings-sections',
                        'settings-shifts',
                        'settings-units',
                    ]
                },
                {
                    name: 'settings.tabs.activityLogs',
                    isTranslateName: true,
                    href: `/settings/activity-logs`,
                    routeNames: [
                        'settings-activity-logs'
                    ]
                },
                {
                    name: 'settings.tabs.timeLogs',
                    isTranslateName: true,
                    href: `/settings/time-logs`,
                    routeNames: [
                        'settings-time-logs'
                    ]
                },
                ...(newValue?.company?.industry?.system_name === 'employment_services' ? [{
                    name: 'settings.tabs.smsNotifications',
                    isTranslateName: true,
                    href: `/settings/sms-notifications`,
                    routeNames: [
                        'settings-sms-notifications',
                    ]
                }, {
                    name: 'settings.tabs.gdprRetention',
                    isTranslateName: true,
                    href: `/settings/gdpr-retention`,
                    routeNames: [
                        'settings-gdpr-retention',
                        'settings-gdpr-retention-deletion-log',
                    ]
                }] : []),
                {
                    name: 'settings.tabs.other',
                    isTranslateName: true,
                    href: `/settings/custom-pages`,
                    routeNames: [
                        'settings-custom-pages',
                        'settings-transactions'
                    ]
                }
            ]
        } else {
            const route = router?.currentRoute?.value?.name as string
            if (!['settings-profile', 'settings-time-logs'].includes(route)) {
                navigateTo('/settings/profile')
            }

            state.tabs = [
                {
                    name: 'settings.tabs.profile',
                    isTranslateName: true,
                    href: `/settings/profile`,
                    routeNames: [
                        'settings-profile'
                    ]
                },
                {
                    name: 'settings.tabs.timeLogs',
                    isTranslateName: true,
                    href: `/settings/time-logs`,
                    routeNames: [
                        'settings-time-logs'
                    ]
                },
            ]
        }
    }
})

function changeTab(value: any) {
    if (value === '/settings/profile') {
        navigateTo(`/settings/profile`)
    }
    else if (value === '/settings/company') {
        navigateTo(`/settings/company`)
    }
    else if (value === '/settings/invoices') {
        navigateTo(`/settings/invoices`)
    }
    else if (value === '/settings/storage') {
        navigateTo(`/settings/storage`)
    }
    else if (value === '/settings/license-overview') {
        navigateTo(`/settings/license-overview`)
    }
    else if (value === '/settings/subscription') {
        navigateTo(`/settings/subscription`)
    }
    else if (value === '/settings/archived/citizens') {
        navigateTo(`/settings/archived/citizens`)
    }
    else if (value === '/settings/absences') {
        navigateTo(`/settings/absences`)
    }
    else if (value === '/settings/activity-logs') {
        navigateTo(`/settings/activity-logs`)
    }
    else if (value === '/settings/time-logs') {
        navigateTo(`/settings/time-logs`)
    }
    else if (value === '/settings/custom-pages') {
        navigateTo(`/settings/custom-pages`)
    }
}
</script>