<template>
    <Tabs :tabs="state.tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const state = reactive({
    tabs: [
        {
            name: 'settings.tabs.customPages',
            href: `/settings/custom-pages`,
            routeNames: [
                'settings-custom-pages'
            ]
        },
        {
            name: 'settings.tabs.transactions',
            href: `/settings/transactions`,
            routeNames: [
                'settings-transactions'
            ]
        },
    ]
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