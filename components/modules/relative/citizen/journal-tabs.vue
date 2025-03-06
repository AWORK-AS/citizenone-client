<template>
    <Tabs :tabs="state.tabs" :isJustifyBetween="true" @changeTab="changeTab" />
</template>

<script setup lang="ts">
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    tabs: [
        {
            name: 'citizens.tabs.journals',
            href: `/relative/citizens/${citizenUuid}/journals`,
            routeNames: [
                'citizens-uuid-journals',
            ]
        }
    ] as any,
})

function changeTab(value: any) {
    if (value === 'Journals' || value === 'Journaler') {
        navigateTo(`/relative/citizens/${citizenUuid}/journals`)
    }
}
</script>