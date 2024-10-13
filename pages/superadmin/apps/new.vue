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
                    <ModulesSuperadminAppForm formType="create" :selectedPoll="state.formApp" :error="state.error"
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
        name: '',
        description: '',
        price: '',
        type: '',
        logo: '',
        image: '',
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
        params.append('is_one_time_fee', appDetails.is_one_time_fee)
        params.append('price', appDetails.price)
        params.append('monthly_price', appDetails.monthly_price)
        params.append('yearly_price', appDetails.yearly_price)
        params.append('type', appDetails.type)
        params.append('logo', appDetails.logo)
        params.append('image', appDetails.image)
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