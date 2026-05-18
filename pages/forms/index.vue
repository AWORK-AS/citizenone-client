<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('forms.forms') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('forms.forms') }}
                <p class="text-sm font-normal text-gray-900">
                    {{ $t('forms.formsSublabel') }}.
                </p>
            </template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserFormAdminView class="mt-8" v-if="!state.isPageLoading && state.isAdmin" />
                <ModulesUserFormUserView class="mt-8" v-else />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { isAtLeast } = usePermissions()
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
        state.isAdmin = isAtLeast('Admin')
    }
    state.isPageLoading = false
})
</script>