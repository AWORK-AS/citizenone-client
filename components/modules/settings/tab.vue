<template>
    <Tabs :tabs="state.tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

interface Role {
    name: string
}

interface User {
    roles: Role[]
}

const userStore = useUserStore()
const router = useRouter()

const state = reactive({
    tabs: [
        { name: 'settings.tabs.profile', href: `/settings/profile`, routeName: 'settings-profile' },
        { name: 'settings.tabs.storage', href: `/settings/storage`, routeName: 'settings-storage' },
        { name: 'settings.tabs.licenseOverview', href: `/settings/license-overview`, routeName: 'setttings-license-overview' },
    ]
})

watch(() => userStore.getUser, (newValue: User | null) => {
    if (newValue != null) {
        const hasAdmin = newValue.roles.some((role: Role) => role.name === 'Admin')
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
    if (value === 'Profile') {
        navigateTo(`/settings/profile`)
    }
    else if (value === 'Company') {
        navigateTo(`/settings/company`)
    }
    else if (value === 'Storage') {
        navigateTo(`/settings/storage`)
    }
}
</script>