<template>
    <Tabs :tabs="tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
/**
 * The four billing views - the plan, the licences and storage it is measured in,
 * and the invoices for them - as one tab row inside the page.
 *
 * They were four entries in the settings rail, which made the rail longer
 * without telling anyone anything: they are four views of the same subject, and
 * you switch between them while you are in it. One entry in the rail leads here,
 * and the row carries the rest.
 */
function changeTab(href: string) {
    navigateTo(href)
}

const tabs = [
    { name: 'settings.tabs.subscription', isTranslateName: true, href: '/settings/subscription', routeNames: ['settings-subscription'] },
    { name: 'settings.licenseOverview.licenseOverview', isTranslateName: true, href: '/settings/license-overview', routeNames: ['settings-license-overview', 'settings-license-overview-caseworker', 'settings-license-overview-departments'] },
    { name: 'storage.storage', isTranslateName: true, href: '/settings/storage', routeNames: ['settings-storage'] },
    { name: 'invoices.invoices', isTranslateName: true, href: '/settings/invoices', routeNames: ['settings-invoices', 'settings-invoices-invoice_uuid-invoice-details'] },
]
</script>
