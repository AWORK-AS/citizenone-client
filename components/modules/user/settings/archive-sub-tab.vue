<template>
    <Tabs :tabs="state.tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const { t } = useI18n()

const state = reactive({
    tabs: [] as any
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        state.tabs = [
            { name: 'archived.tabs.archivedCitizens', isTranslateName: true, href: `/settings/archived/citizens`, routeNames: ['settings-archived-citizens'] },
            { name: 'archived.tabs.archivedEmployees', isTranslateName: true, href: `/settings/archived/employees`, routeNames: ['settings-archived-employees'] },
            { name: 'archived.tabs.archivedDocuments', isTranslateName: true, href: `/settings/archived/documents`, routeNames: ['settings-archived-documents'] },
            // { name: 'archived.tabs.archivedPlans', isTranslateName: true, href: `/settings/archived/plans`, routeNames: ['settings-archived-plans'] },
            // { name: 'archived.tabs.archivedGoals', isTranslateName: true, href: `/settings/archived/goals`, routeNames: ['settings-archived-goals'] },
            // { name: 'archived.tabs.archivedSubgoals', isTranslateName: true, href: `/settings/archived/subgoals`, routeNames: ['settings-archived-subgoals'] },
        ]
    }
})

function changeTab(value: any) {
    if (value === t('archived.tabs.archivedCitizens')) {
        navigateTo(`/settings/archived/citizens`)
    }
    else if (value === t('archived.tabs.archivedEmployees')) {
        navigateTo(`/settings/archived/employees`)
    }
    else if (value === t('archived.tabs.archivedDocuments')) {
        navigateTo(`/settings/archived/documents`)
    }
    // else if (value === t('archived.tabs.archivedPlans')) {
    //     navigateTo(`/settings/archived/plans`)
    // }
    // else if (value === t('archived.tabs.archivedGoals')) {
    //     navigateTo(`/settings/archived/goals`)
    // }
    // else if (value === t('archived.tabs.archivedSubgoals')) {
    //     navigateTo(`/settings/archived/subgoals`)
    // }
}
</script>