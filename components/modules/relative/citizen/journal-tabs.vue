<template>
    <ModulesUserCitizenSectionNav :tabs="state.tabs" />
</template>

<script setup lang="ts">
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

// Relatives only see Journals + Documents — both stay as primary tabs (no overflow).
const state = reactive({
    tabs: [
        {
            name: 'citizens.tabs.journals', icon: 'ph:notebook', isTranslateName: true,
            category: 'documentation', primary: true,
            href: `/relative/citizens/${citizenUuid}/journals`,
            routeNames: ['relative-citizens-uuid-journals'],
        },
        {
            name: 'citizens.tabs.documents', icon: 'ph:files', isTranslateName: true,
            category: 'documentation', primary: true,
            href: `/relative/citizens/${citizenUuid}/documents`,
            routeNames: ['relative-citizens-uuid-documents'],
        },
    ] as any[],
})
</script>
