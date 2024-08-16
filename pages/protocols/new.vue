<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('protocols.newProtocol') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('protocols.newProtocol') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/protocols">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesProtocolForm formType="create" :selectedProtocol="state.formProtocol" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveProtocol" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { protocolService } from '@/components/api/ProtocolService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formProtocol: {
        name: '',
        start_date: '',
        end_date: '',
        citizens: [],
        exclude_weekends: '',
    },
    isPageLoading: false,
})

async function saveProtocol(protocolDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: protocolDetails.name,
            start_date: protocolDetails.start_date,
            end_date: protocolDetails.end_date,
            citizen_ids: protocolDetails.citizens,
            exclude_weekends: protocolDetails.exclude_weekends,
        }
        const response = await protocolService.saveProtocol(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('protocols.form.alert.newProtocolSuccessfullySaved')}.`)
            navigateTo('/protocols')
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