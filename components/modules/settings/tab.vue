<template>
    <Tabs :tabs="tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
const tabs = [
    { name: 'settings.tabs.profile', href: `/settings/profile`, routeName: 'settings-profile' },
    { name: 'settings.tabs.company', href: `/settings/company`, routeName: 'settings-company' },
]

function changeTab(value: any) {
    if (value === 'Profile') {
        navigateTo(`/settings/profile`)
    }
    else if (value === 'Company') {
        navigateTo(`/settings/company`)
    }
}
</script>