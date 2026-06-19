<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('protocols.newProtocol') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('protocols.newProtocol') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/protocols">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserProtocolForm formType="create" :selectedProtocol="state.formProtocol"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveProtocol" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { protocolService } from '@/components/api/user/ProtocolService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'protocols.protocols',
        translate: true,
        href: '/protocols',
    },
    {
        name: 'protocols.newProtocol',
        translate: true,
        href: '/protocols/new',
    },
]

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
        const params: any = {
            name: protocolDetails.name,
            start_date: protocolDetails.start_date,
            end_date: protocolDetails.end_date,
            citizen_ids: protocolDetails.citizens,
            exclude_weekends: protocolDetails.exclude_weekends,
        }

        if (protocolDetails.is_recurring) {
            params.is_recurring = true
            params.recurring = protocolDetails.recurring
            params.recurring_until = protocolDetails.recurring_until

            if (protocolDetails.recurring === 'custom') {
                params.frequency = protocolDetails.frequency
                params.every = Number(protocolDetails.every) || 1

                if (protocolDetails.frequency === 'weekly') {
                    params.weekly_on = protocolDetails.weekly_on
                } else if (protocolDetails.frequency === 'monthly') {
                    params.monthly_on_the_enabled = protocolDetails.monthly_on_the_enabled
                    if (protocolDetails.monthly_on_the_enabled) {
                        params.monthly_on_the_sequence = protocolDetails.monthly_on_the_sequence
                        params.monthly_on_the_day = protocolDetails.monthly_on_the_day
                    } else {
                        params.monthly_each = protocolDetails.monthly_each
                    }
                } else if (protocolDetails.frequency === 'yearly') {
                    params.yearly_in_months = protocolDetails.yearly_in_months
                    params.yearly_on_the_enabled = protocolDetails.yearly_on_the_enabled
                    if (protocolDetails.yearly_on_the_enabled) {
                        params.yearly_on_the_sequence = protocolDetails.yearly_on_the_sequence
                        params.yearly_on_the_day = protocolDetails.yearly_on_the_day
                    }
                }
            }
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
</script>