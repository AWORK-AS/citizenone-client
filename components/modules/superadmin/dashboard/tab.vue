<template>
    <Tabs :tabs="tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
// Overview and Report are two views of the same thing, so they sit as tabs on
// the dashboard rather than as separate places in the sidebar. Each keeps its
// own route, so a report is still something you can link a colleague to.
const tabs = [
    {
        name: 'superadmin.dashboard.tabs.overview',
        isTranslateName: true,
        href: '/superadmin/dashboard',
        routeNames: ['superadmin-dashboard'],
    },
    {
        name: 'superadmin.dashboard.tabs.report',
        isTranslateName: true,
        href: '/superadmin/analytics',
        routeNames: ['superadmin-analytics'],
    },
]

function changeTab(value: any) {
    navigateTo(value)
}
</script>
