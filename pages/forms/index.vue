<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('forms.forms') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('forms.forms') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesFormAdminView class="mt-8" v-if="!state.isPageLoading && state.isAdmin" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any

const state = reactive({
    isPageLoading: true,
    isAdmin: false,
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        const isAdmin = userStore?.getUser.roles.some((role: any) => role.name === 'Admin')
        state.isAdmin = isAdmin
    }
    state.isPageLoading = false
})
</script>