<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.apps.editApp') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.apps.editApp') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/superadmin/apps">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminAppForm formType="update" :selectedApp="state.formApp" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateApp" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/superadmin/AppService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const appUuid = router?.currentRoute?.value?.params?.appUuid

const state = reactive({
    error: {} as Error,
    formApp: {
        background_image: '',
        name: '',
        description: '',
        is_one_time_fee: false,
        price: '',
        monthly_price: '',
        yearly_price: '',
        type: '',
        logo: '',
        image: '',
        is_quantifiable: false,
        is_thirdparty: false,
        is_popular: false,
        is_recommended: false,
        is_news: false,
        url_field: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchApp()
})

async function fetchApp() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await appService.getApp(appUuid)
        if (response) {
            state.formApp = {
                background_image: response?.data?.background_image ?? '',
                name: response?.data?.name ?? '',
                description: response?.data?.description ?? '',
                is_one_time_fee: response?.data?.is_one_time_fee ? true : false,
                price: response?.data?.price ?? '',
                monthly_price: response?.data?.monthly_price ?? '',
                yearly_price: response?.data?.yearly_price ?? '',
                type: response?.data?.type ?? '',
                logo: response?.data?.logo ?? '',
                image: response?.data?.image ?? '',
                is_quantifiable: response?.data?.is_quantifiable ? true : false,
                is_thirdparty: response?.data?.is_thirdparty ? true : false,
                is_popular: response?.data?.is_popular ? true : false,
                is_recommended: response?.data?.is_recommended ? true : false,
                is_news: response?.data?.is_news ? true : false,
                url_field: response?.data?.url_field ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateApp(appDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('name', appDetails.name)
        params.append('description', appDetails.description)
        params.append('is_one_time_fee', appDetails.is_one_time_fee)
        params.append('price', appDetails.price)
        params.append('monthly_price', appDetails.monthly_price)
        params.append('yearly_price', appDetails.yearly_price)
        params.append('type', appDetails.type)
        params.append('is_quantifiable', appDetails.is_quantifiable)
        params.append('is_thirdparty', appDetails.is_thirdparty)
        params.append('is_popular', appDetails.is_popular)
        params.append('is_recommended', appDetails.is_recommended)
        params.append('is_news', appDetails.is_news)
        params.append('url_field', appDetails.url_field)
        if (appDetails.background_image) {
            params.append('background_image', appDetails.background_image)
        }
        if (appDetails.logo) {
            params.append('logo', appDetails.logo)
        }
        if (appDetails.image) {
            params.append('image', appDetails.image)
        }
        const response = await appService.updateApp(appUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.apps.form.alert.appSuccessfullyUpdated')}.`)
            navigateTo('/superadmin/apps')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>