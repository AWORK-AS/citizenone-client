<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('protocols.editProtocol') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('protocols.editProtocol') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/protocols">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesProtocolForm formType="update" :selectedProtocol="state.formProtocol" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateProtocol" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { protocolService } from '@/components/api/ProtocolService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formProtocol: {
        name: '',
        start_date: '',
        end_date: ''
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchProtocol()
})

async function fetchProtocol() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await protocolService.getProtocol(uuid)
        if (response) {
            state.formProtocol = {
                name: response?.data?.name ?? '',
                start_date: response?.data?.start_date ?? '',
                end_date: response?.data?.end_date ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateProtocol(protocolDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: protocolDetails.name,
            start_date: protocolDetails.start_date,
            end_date: protocolDetails.end_date,
        }
        const response = await protocolService.updateProtocol(uuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('protocols.form.alert.protocolSuccessfullyUpdated')}.`)
            navigateTo('/protocols')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>