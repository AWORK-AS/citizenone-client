<template>
    <Tabs :tabs="tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'

const { can } = usePermissions()

// Overblik er drift og ses af alle med adgang til panelet. Rapport og Ledelse
// er forretningens tilstand og ligger begge bag `view_management`. Hver fane
// beholder sin egen rute, så en rapport stadig er noget man kan sende videre -
// til en kollega der har adgangen.
// Ledelse vises kun for dem der har rettigheden. Skjulningen her er en pænhed,
// ikke en adgangskontrol - ruten bag den er gated i API'et.
const tabs = computed(() => [
    {
        name: 'superadmin.dashboard.tabs.overview',
        isTranslateName: true,
        href: '/superadmin/dashboard',
        routeNames: ['superadmin-dashboard'],
    },
    // Rapporten ligger nu bag samme rettighed som Ledelse. Den viser kundetilgang
    // og -afgang måned for måned og hvor meget af forretningen der er aftalt -
    // forretningens tilstand, ikke drift.
    ...(can('view_management') ? [{
        name: 'superadmin.dashboard.tabs.report',
        isTranslateName: true,
        href: '/superadmin/analytics',
        routeNames: ['superadmin-analytics'],
    }] : []),
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
