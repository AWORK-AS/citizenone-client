<template>
    <ModulesUserCitizenSectionNav :tabs="visibleTabs" />
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const userStore = useUserStore() as any

// Relatives only see Journals + Documents — both stay as primary tabs (no overflow).
const state = reactive({
    tabs: [
        {
            key: 'journals',
            name: 'citizens.tabs.journals', icon: 'ph:notebook', isTranslateName: true,
            category: 'documentation', primary: true,
            href: `/relative/citizens/${citizenUuid}/journals`,
            routeNames: ['relative-citizens-uuid-journals'],
        },
        {
            key: 'documents',
            name: 'citizens.tabs.documents', icon: 'ph:files', isTranslateName: true,
            category: 'documentation', primary: true,
            href: `/relative/citizens/${citizenUuid}/documents`,
            routeNames: ['relative-citizens-uuid-documents'],
        },
    ] as any[],
})

// A section an admin switched off must not appear as a tab. The resolved map
// comes from the relative "me" endpoint.
const visibleTabs = computed(() => {
    const visibility = userStore.getUser?.portal_visibility ?? {}

    return state.tabs.filter((tab: any) => visibility[tab.key] !== false)
})
</script>
