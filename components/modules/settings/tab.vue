<template>
    <Tabs :tabs="state.tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const router = useRouter()

const state = reactive({
    tabs: [
        { name: 'settings.tabs.profile', href: `/settings/profile`, routeName: 'settings-profile' }
    ]
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        const hasAdmin = userStore.getUser?.roles.some((role: any) => role.name === 'Admin')
        if (hasAdmin) {
            state.tabs.push({
                name: 'settings.tabs.company',
                href: `/settings/company`,
                routeName: 'settings-company'
            })
        } else {
            const route = router?.currentRoute?.value?.name
            if (route === 'settings-company') {
                navigateTo('/settings/profile')
            }
        }
    }
})

function changeTab(value: any) {
    if (value === 'Profile') {
        navigateTo(`/settings/profile`)
    }
    else if (value === 'Company') {
        navigateTo(`/settings/company`)
    }
}
</script>