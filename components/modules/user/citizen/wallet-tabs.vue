<template>
    <Tabs id="wallet-tabs" :tabs="state.tabs" :isJustifyBetween="false" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const route = useRoute()
const citizenUuid = route?.params?.uuid
const { t } = useI18n()

const state = reactive({
    tabs: [
        {
            name: 'citizens.wallets.tabs.wallets',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/wallets`,
            routeNames: ['citizens-uuid-wallets']
        },
        {
            name: 'citizens.wallets.tabs.expenses',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/expenses`,
            routeNames: ['citizens-uuid-expenses']
        }
    ] as any,
})

function changeTab(tab: any) {
    navigateTo(tab.href)
}
</script>
