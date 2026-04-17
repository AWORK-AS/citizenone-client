<template>
    <div>
        <Tabs :tabs="state.tabs" @changeTab="changeTab" />
    </div>
</template>

<script setup lang="ts">
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
    ]
})

function changeTab(value: any) {
    navigateTo(value)
}
</script>
