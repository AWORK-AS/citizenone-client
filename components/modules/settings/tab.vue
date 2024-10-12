<template>
    <Tabs :tabs="state.tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const { t } = useI18n()
const userStore = useUserStore()
const router = useRouter()

const state = reactive({
    tabs: [] as any
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        const hasAdmin = newValue.roles.some((role: any) => role.name === 'Admin')
        if (hasAdmin) {
            state.tabs = [
                {
                    name: 'settings.tabs.profile',
                    href: `/settings/profile`,
                    routeNames: [
                        'settings-profile'
                    ]
                },
                {
                    name: 'settings.tabs.company',
                    href: `/settings/company`,
                    routeNames: [
                        'settings-company'
                    ]
                },
                {
                    name: 'settings.tabs.storage',
                    href: `/settings/storage`,
                    routeNames: [
                        'settings-storage'
                    ]
                },
                {
                    name: 'settings.tabs.licenses',
                    href: `/settings/license-overview`,
                    routeNames: [
                        'settings-license-overview'
                    ]
                },
                {
                    name: 'settings.tabs.subscription',
                    href: `/settings/subscription`,
                    routeNames: [
                        'settings-subscription'
                    ]
                },
                {
                    name: 'settings.tabs.archived',
                    href: `/settings/archived/citizens`,
                    routeNames: [
                        'settings-archived-citizens',
                        'settings-archived-employees',
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
                    name: 'settings.tabs.jobTitles',
                    href: `/settings/job-titles`,
                    routeNames: [
                        'settings-job-titles',
                        'settings-job-titles-job_title_uuid'
                    ]
                },
                {
                    name: 'settings.tabs.activityLogs',
                    href: `/settings/activity-logs`,
                    routeNames: [
                        'settings-activity-logs'
                    ]
                },
                {
                    name: 'settings.tabs.timeLogs',
                    href: `/settings/time-logs`,
                    routeNames: [
                        'settings-time-logs'
                    ]
                }
            ]
        } else {
            const route = router?.currentRoute?.value?.name
            if (route === 'settings-company') {
                navigateTo('/settings/profile')
            }

            state.tabs = [
                {
                    name: 'settings.tabs.profile',
                    href: `/settings/profile`,
                    routeNames: [
                        'settings-profile'
                    ]
                },
                {
                    name: 'settings.tabs.storage',
                    href: `/settings/storage`,
                    routeNames: [
                        'settings-storage'
                    ]
                },
                {
                    name: 'settings.tabs.licenses',
                    href: `/settings/license-overview`,
                    routeNames: [
                        'setttings-license-overview'
                    ]
                },
                {
                    name: 'settings.tabs.subscription',
                    href: `/settings/subscription`,
                    routeNames: [
                        'setttings-subscription'
                    ]
                },
                {
                    name: 'settings.tabs.archived',
                    href: `/settings/archived/citizens`,
                    routeNames: [
                        'settings-archived-citizens',
                        'settings-archived-employees'
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
                    name: 'settings.tabs.jobTitles',
                    href: `/settings/job-titles`,
                    routeNames: [
                        'settings-job-titles',
                        'settings-job-titles-job_title_uuid'
                    ]
                },
                {
                    name: 'settings.tabs.activityLogs',
                    href: `/settings/activity-logs`,
                    routeNames: [
                        'settings-activity-logs'
                    ]
                },
                {
                    name: 'settings.tabs.timeLogs',
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
    if (value === t('settings.tabs.profile')) {
        navigateTo(`/settings/profile`)
    }
    else if (value === t('settings.tabs.company')) {
        navigateTo(`/settings/company`)
    }
    else if (value === t('settings.tabs.storage')) {
        navigateTo(`/settings/storage`)
    }
    else if (value === t('settings.tabs.licenses')) {
        navigateTo(`/settings/license-overview`)
    }
    else if (value === t('settings.tabs.subscription')) {
        navigateTo(`/settings/subscription`)
    }
    else if (value === t('settings.tabs.archived')) {
        navigateTo(`/settings/archived/citizens`)
    }
    else if (value === t('settings.tabs.departments')) {
        navigateTo(`/settings/archived/departments`)
    }
    else if (value === t('settings.tabs.jobTitles')) {
        navigateTo(`/settings/archived/job-titles`)
    }
    else if (value === t('settings.tabs.activityLogs')) {
        navigateTo(`/settings/activity-logs`)
    }
    else if (value === t('settings.tabs.timeLogs')) {
        navigateTo(`/settings/time-logs`)
    }
}
</script>