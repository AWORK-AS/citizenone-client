<template>
    <Tabs id="wallet-tabs" :tabs="state.tabs" :isJustifyBetween="false" variant="sub" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const route = useRoute()
const citizenUuid = route?.params?.uuid
const { t } = useI18n()
const userStore = useUserStore() as any

// The contract sits beside wallets and expenses for the social welfare sector,
// where an intervention is billed to a customer on agreed terms.
const isSocialWelfare = userStore.getUser?.company?.industry?.system_name === 'social_welfare'

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
        },
        ...(isSocialWelfare ? [{
            name: 'citizens.wallets.tabs.contract',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/contract`,
            routeNames: ['citizens-uuid-contract']
        }] : []),
    ] as any,
})

function changeTab(tab: any) {
    navigateTo(tab.href)
}
</script>
