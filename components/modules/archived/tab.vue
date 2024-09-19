<template>
    <Tabs :tabs="state.tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const state = reactive({
    tabs: [
        { name: 'archived.tabs.archivedCitizens', href: `/archived/citizens`, routeName: 'archived-citizens' },
        { name: 'archived.tabs.archivedEmployees', href: `/archived/employees`, routeName: 'archived-employees' },
    ]
})

function changeTab(value: any) {
    if (value === t('archived.tabs.archivedCitizens')) {
        navigateTo(`/archived/citizens`)
    }
    else if (value === t('archived.tabs.archivedEmployees')) {
        navigateTo(`/archived/employees`)
    }
}
</script>