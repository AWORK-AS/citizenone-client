<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('procedures.procedures') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('procedures.procedures') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserProcedureAdminView class="mt-8" v-if="!state.isPageLoading && state.isAdmin" />
                <ModulesUserProcedureUserView class="mt-8" v-else-if="!state.isPageLoading && !state.isAdmin" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const breadcrumbLinks = [
    {
        name: 'procedures.procedures',
        translate: true,
        href: '/procedures',
    },
]

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