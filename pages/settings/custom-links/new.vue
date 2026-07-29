<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('customSidebarLinks.addNew') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('customSidebarLinks.addNew') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/custom-links">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserCustomSidebarLinkForm formType="create" :selectedLink="state.formLink" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveLink" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { customSidebarLinkService } from '@/components/api/user/CustomSidebarLinkService'
import { useCustomSidebarLinksStore } from '@/store/custom-sidebar-links'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customSidebarLinksStore = useCustomSidebarLinksStore()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    { name: 'customSidebarLinks.title', translate: true, href: '/settings/custom-links' },
    { name: 'customSidebarLinks.addNew', translate: true, href: '/settings/custom-links/new' },
]

const state = reactive({
    error: {} as Error,
    formLink: {
        label: '',
        url: '',
        visibility: 'both',
        icon: '',
        sort_order: 0,
    },
    isPageLoading: false,
})

async function saveLink(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            label: details.label,
            url: details.url,
            visibility: details.visibility,
            icon: details.icon || null,
            sort_order: Number(details.sort_order) || 0,
        }
        const response = await customSidebarLinkService.saveCustomSidebarLink(params)
        if (response?.data) {
            await customSidebarLinksStore.fetchLinks()
            successAlert(`${t('alert.success')}!`, `${t('customSidebarLinks.alert.saved')}.`)
            navigateTo('/settings/custom-links')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
