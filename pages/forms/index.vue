<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('forms.forms') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('forms.forms') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserFormAdminView class="mt-8" v-if="!state.isPageLoading && state.isAdmin" />
                <ModulesUserFormUserView class="mt-8" v-else />
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
        name: 'forms.forms',
        translate: true,
        href: '/forms',
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