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
        { name: 'settings.tabs.profile', href: `/settings/profile`, routeName: 'settings-profile' },
        { name: 'settings.tabs.storage', href: `/settings/storage`, routeName: 'settings-storage' },
        { name: 'settings.tabs.licenseOverview', href: `/settings/license-overview`, routeName: 'setttings-license-overview' },
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
                    routeName: 'settings-profile'
                },
                {
                    name: 'settings.tabs.company',
                    href: `/settings/company`,
                    routeName: 'settings-company'
                },
                {
                    name: 'settings.tabs.storage',
                    href: `/settings/storage`,
                    routeName: 'settings-storage'
                },
                {
                    name: 'settings.tabs.licenseOverview',
                    href: `/settings/license-overview`,
                    routeName: 'settings-license-overview'
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
    else if (value === t('settings.tabs.licenseOverview')) {
        navigateTo(`/settings/license-overview`)
    }
}
</script>