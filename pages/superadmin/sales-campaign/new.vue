<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.salesCampaign.newCampaign') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.salesCampaign.newCampaign') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/sales-campaign">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminSalesCampaignForm formType="create"
                        :selectedSalesCampaign="state.formSalesCampaign" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveSalesCampaign" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { salesCampaignService } from '@/components/api/superadmin/SalesCampaignService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

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

async function saveSalesCampaign(salesCampaignDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('image', salesCampaignDetails.image)
        params.append('title', salesCampaignDetails.title)
        params.append('link', salesCampaignDetails.link)
        params.append('content', salesCampaignDetails.content)
        params.append('is_active', salesCampaignDetails.is_active)
        const response = await salesCampaignService.saveSalesCampaign(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.salesCampaign.form.alert.newCampaignSuccessfullySaved')}.`)
            navigateTo('/superadmin/sales-campaign')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>