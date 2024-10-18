<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('procedures.procedures') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('procedures.procedures') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesProcedureAdminView class="mt-8" v-if="!state.isPageLoading && state.isAdmin" />
                <ModulesProcedureUserView class="mt-8" v-else-if="!state.isPageLoading && !state.isAdmin" />
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