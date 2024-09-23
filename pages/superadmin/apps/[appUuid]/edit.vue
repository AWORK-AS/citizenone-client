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
        name: '',
        description: '',
        price: '',
        type: '',
        logo: '',
        image: '',
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
                name: response?.data?.name ?? '',
                description: response?.data?.description ?? '',
                price: response?.data?.price ?? '',
                type: response?.data?.type ?? '',
                logo: response?.data?.logo ?? '',
                image: response?.data?.image ?? '',
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
        params.append('price', appDetails.price)
        params.append('type', appDetails.type)
        params.append('logo', appDetails.logo)
        params.append('image', appDetails.image)
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