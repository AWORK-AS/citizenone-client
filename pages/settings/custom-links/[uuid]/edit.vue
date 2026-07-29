<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('customSidebarLinks.edit') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('customSidebarLinks.edit') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/custom-links">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserCustomSidebarLinkForm formType="update" :selectedLink="state.formLink" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateLink" />
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
const router = useRouter()
const linkUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    { name: 'customSidebarLinks.title', translate: true, href: '/settings/custom-links' },
    { name: 'customSidebarLinks.edit', translate: true, href: `/settings/custom-links/${linkUuid}/edit` },
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

onMounted(() => {
    fetchLink()
})

async function fetchLink() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await customSidebarLinkService.getCustomSidebarLink(linkUuid)
        if (response?.data) {
            state.formLink = {
                label: response.data.label ?? '',
                url: response.data.url ?? '',
                visibility: response.data.visibility ?? 'both',
                icon: response.data.icon ?? '',
                sort_order: response.data.sort_order ?? 0,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateLink(details: any) {
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
        const response = await customSidebarLinkService.updateCustomSidebarLink(linkUuid, params)
        if (response?.data) {
            await customSidebarLinksStore.fetchLinks()
            successAlert(`${t('alert.success')}!`, `${t('customSidebarLinks.alert.updated')}.`)
            navigateTo('/settings/custom-links')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
