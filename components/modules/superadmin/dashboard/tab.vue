<template>
    <Tabs :tabs="tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'

const { can } = usePermissions()

// Overview and Report are two views of the same thing, so they sit as tabs on
// the dashboard rather than as separate places in the sidebar. Each keeps its
// own route, so a report is still something you can link a colleague to.
// Ledelse vises kun for dem der har rettigheden. Skjulningen her er en pænhed,
// ikke en adgangskontrol - ruten bag den er gated i API'et.
const tabs = computed(() => [
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
    ...(can('view_management') ? [{
        name: 'superadmin.dashboard.tabs.management',
        isTranslateName: true,
        href: '/superadmin/management',
        routeNames: ['superadmin-management'],
    }] : []),
])

function changeTab(value: any) {
    navigateTo(value)
}
</script>
