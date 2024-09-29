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
    tabs: [
        { name: 'settings.tabs.profile', href: `/settings/profile`, routeNames: ['settings-profile'] },
        { name: 'settings.tabs.storage', href: `/settings/storage`, routeNames: ['settings-storage'] },
        { name: 'settings.tabs.licenseOverviewPlusSubscription', href: `/settings/license-overview`, routeNames: ['setttings-license-overview'] },
        { name: 'settings.tabs.archived', href: `/settings/archived/citizens`, routeNames: ['settings-archived-citizens', 'settings-archived-employees'] },
        { name: 'settings.tabs.departments', href: `/settings/departments`, routeNames: ['settings-departments'] },
        { name: 'settings.tabs.jobTitles', href: `/settings/job-titles`, routeNames: ['settings-job-titles'] },
    ]
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
                    name: 'settings.tabs.licenseOverviewPlusSubscription',
                    href: `/settings/license-overview`,
                    routeNames: [
                        'settings-license-overview'
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
                        'settings-job-titles'
                    ]
                }
            ]
        } else {
            const route = router?.currentRoute?.value?.name
            if (route === 'settings-company') {
                navigateTo('/settings/profile')
            }
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
    else if (value === t('settings.tabs.licenseOverviewPlusSubscription')) {
        navigateTo(`/settings/license-overview`)
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
}
</script>