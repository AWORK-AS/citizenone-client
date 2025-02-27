<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('customPages.editCustomPage') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('customPages.editCustomPage') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/custom-pages">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserCustomPagesForm formType="update" :selectedCustomPage="state.formCustomPage"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="updateCustomPage" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { customPagesService } from '@/components/api/CustomPagesService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const customPageUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'customPages.customPages',
        translate: true,
        href: '/settings/custom-pages',
    },
    {
        name: 'customPages.editCustomPage',
        translate: true,
        href: `/settings/custom-pages/${customPageUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formCustomPage: {
        en_name: '',
        dk_name: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchCustomPage()
})

async function fetchCustomPage() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await customPagesService.getCustomPage(customPageUuid)
        if (response) {
            state.formCustomPage = {
                en_name: response?.data?.en_name ?? '',
                dk_name: response?.data?.dk_name ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateCustomPage(customPageDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            en_name: customPageDetails.en_name,
            dk_name: customPageDetails.dk_name,
        }
        const response = await customPagesService.updateCustomPage(customPageUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('customPages.form.alert.customPageSuccessfullyUpdated')}.`)
            navigateTo('/settings/custom-pages')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>