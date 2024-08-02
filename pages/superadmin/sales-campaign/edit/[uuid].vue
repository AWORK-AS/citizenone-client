<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.salesCampaign.editCampaign') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.salesCampaign.editCampaign') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/sales-campaign">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminSalesCampaignForm formType="update"
                        :selectedSalesCampaign="state.formSalesCampaign" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateSalesCampaign" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { salesCampaignService } from '@/components/api/superadmin/SalesCampaign'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formSalesCampaign: {
        image: '',
        title: '',
        link: '',
        content: '',
        is_active: false,
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchSalesCampaign()
})

async function fetchSalesCampaign() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await salesCampaignService.getSalesCampaign(uuid)
        if (response) {
            state.formSalesCampaign = {
                image: response?.data?.image ?? '',
                title: response?.data?.title ?? '',
                link: response?.data?.link ?? '',
                content: response?.data?.content ?? '',
                is_active: response?.data?.is_active ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateSalesCampaign(salesCampaignDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('image', salesCampaignDetails.image)
        params.append('title', salesCampaignDetails.title)
        params.append('link', salesCampaignDetails.link)
        params.append('content', salesCampaignDetails.content)
        params.append('is_active', salesCampaignDetails.is_active)
        const response = await salesCampaignService.updateSalesCampaign(uuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.salesCampaign.form.alert.campaignSuccessfullyUpdated')}.`)
            navigateTo('/superadmin/sales-campaign')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>