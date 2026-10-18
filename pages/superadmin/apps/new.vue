<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.apps.newApp') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.apps.newApp') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/superadmin/apps">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminAppForm formType="create" :selectedApp="state.formApp" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveApp" />
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

const state = reactive({
    error: {} as Error,
    formApp: {
        background_image: '',
        name: '',
        description: '',
        price: '',
        type: '',
        logo: '',
        image: '',
        is_free: false,
        is_quantifiable: false,
        is_thirdparty: false,
        is_popular: false,
        is_recommended: false,
        is_news: false,
        url_field: '',
        trial_enabled: false,
        trial_days: 14,
    },
    isPageLoading: false,
})

async function saveApp(appDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('name', appDetails.name)
        params.append('description', appDetails.description)
        // FormData turns a boolean into the text "true"/"false", which Laravel's `boolean`
        // rule refuses, so every flag goes as 1/0. Sent raw, no app could be saved at all.
        params.append('is_one_time_fee', appDetails.is_one_time_fee ? '1' : '0')
        params.append('price', appDetails.price)
        params.append('monthly_price', appDetails.monthly_price)
        params.append('yearly_price', appDetails.yearly_price)
        params.append('type', appDetails.type)
        params.append('is_free', appDetails.is_free ? '1' : '0')
        params.append('is_quantifiable', appDetails.is_quantifiable ? '1' : '0')
        params.append('is_thirdparty', appDetails.is_thirdparty ? '1' : '0')
        params.append('is_popular', appDetails.is_popular ? '1' : '0')
        params.append('is_recommended', appDetails.is_recommended ? '1' : '0')
        params.append('is_news', appDetails.is_news ? '1' : '0')
        params.append('url_field', appDetails.url_field)
        params.append('trial_enabled', appDetails.trial_enabled ? '1' : '0')
        if (appDetails.trial_enabled) {
            params.append('trial_days', String(appDetails.trial_days || 14))
        }
        if (appDetails.background_image) {
            params.append('background_image', appDetails.background_image)
        }
        if (appDetails.logo) {
            params.append('logo', appDetails.logo)
        }
        if (appDetails.image) {
            params.append('image', appDetails.image)
        }
        const response = await appService.saveApp(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.apps.form.alert.newAppSuccessfullySaved')}.`)
            navigateTo('/superadmin/apps')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>