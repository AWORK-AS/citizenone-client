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
            {
                name: 'settings.tabs.customPages',
                isTranslateName: true,
                href: `/settings/custom-pages`,
                routeNames: [
                    'settings-custom-pages'
                ]
            },
            {
                name: 'settings.tabs.transactions',
                isTranslateName: true,
                href: `/settings/transactions`,
                routeNames: [
                    'settings-transactions'
                ]
            },
        ]
    }
})

function changeTab(value: any) {
    if (value === t('settings.tabs.customPages')) {
        navigateTo(`settings-custom-pages`)
    }
    else if (value === t('settings.tabs.transactions')) {
        navigateTo(`settings-transactions`)
    }
}
</script>