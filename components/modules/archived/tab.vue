<template>
    <Tabs :tabs="state.tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const state = reactive({
    tabs: [
        { name: 'archived.tabs.archivedCitizens', href: `/settings/archived/citizens`, routeNames: ['settings-archived-citizens'] },
        { name: 'archived.tabs.archivedEmployees', href: `/settings/archived/employees`, routeNames: ['settings-archived-employees'] },
    ]
})

function changeTab(value: any) {
    if (value === t('archived.tabs.archivedCitizens')) {
        navigateTo(`/settings/archived/citizens`)
    }
    else if (value === t('archived.tabs.archivedEmployees')) {
        navigateTo(`/settings/archived/employees`)
    }
}
</script>