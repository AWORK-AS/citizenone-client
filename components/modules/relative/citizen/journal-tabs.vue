<template>
    <Tabs :tabs="state.tabs" :isJustifyBetween="false" @changeTab="changeTab" />
</template>

<script setup lang="ts">
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    tabs: [
        {
            name: 'citizens.tabs.journals',
            isTranslateName: true,
            href: `/relative/citizens/${citizenUuid}/journals`,
            routeNames: [
                'relative-citizens-uuid-journals',
            ]
        },
        {
            name: 'citizens.tabs.documents',
            isTranslateName: true,
            href: `/relative/citizens/${citizenUuid}/documents`,
            routeNames: [
                'relative-citizens-uuid-documents',
            ]
        },
    ] as any,
})

function changeTab(value: any) {
    if (value === 'Journals' || value === 'Journaler') {
        navigateTo(`/relative/citizens/${citizenUuid}/journals`)
    }
    else if (value === 'Documents' || value === 'Dokumenter') {
        navigateTo(`/relative/citizens/${citizenUuid}/documents`)
    }
}
</script>