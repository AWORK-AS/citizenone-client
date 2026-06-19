<template>
    <div>
        <Tabs :tabs="state.tabs" @changeTab="changeTab" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const userStore = useUserStore() as any

const state = reactive({
    tabs: [
        {
            name: 'settings.licenseOverview.userLicenses',
            isTranslateName: true,
            href: '/settings/license-overview',
            routeNames: ['settings-license-overview']
        },
        {
            name: 'settings.licenseOverview.departmentLicenses',
            isTranslateName: true,
            href: '/settings/license-overview/departments',
            routeNames: ['settings-license-overview-departments']
        },
    ] as any[],
})

watchEffect(() => {
    const nextTabs = [
        {
            name: 'settings.licenseOverview.userLicenses',
            isTranslateName: true,
            href: '/settings/license-overview',
            routeNames: ['settings-license-overview']
        },
        {
            name: 'settings.licenseOverview.departmentLicenses',
            isTranslateName: true,
            href: '/settings/license-overview/departments',
            routeNames: ['settings-license-overview-departments']
        },
    ] as any[]

    if (
        userStore.getUser?.company?.industry?.system_name === 'employment_services'
        || userStore.getUser?.company?.industry?.en_name === 'Employment Services'
    ) {
        nextTabs.splice(1, 0, {
            name: 'settings.licenseOverview.caseworkerLicenses',
            isTranslateName: true,
            href: '/settings/license-overview/caseworker',
            routeNames: ['settings-license-overview-caseworker'],
        })
    }

    state.tabs = nextTabs
})

function changeTab(value: any) {
    navigateTo(value)
}
</script>