<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.billingRules.newBillingRule') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employment.billingRules.newBillingRule') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/employment-billing-rules">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentBillingRuleForm formType="create" :selectedBillingRule="state.formBillingRule"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveBillingRule" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'employment.billingRules.billingRules',
        translate: true,
        href: '/settings/employment-billing-rules',
    },
    {
        name: 'employment.billingRules.newBillingRule',
        translate: true,
        href: '/settings/employment-billing-rules/new',
    },
]

const state = reactive({
    error: {} as Error,
    formBillingRule: {
        name: '',
        pricing_type: 'weekly' as string,
        weekly_rate: '' as string,
        hourly_rate: '' as string,
        bonus_amount: '' as string,
        bonus_condition_months: null as number | null,
        customer_number: '',
        product_number: '',
        description: '',
        is_active: true,
    },
    isPageLoading: false,
})

async function saveBillingRule(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: details.name,
            pricing_type: details.pricing_type,
            rate: details.weekly_rate !== '' ? Number(details.weekly_rate) : null,
            hourly_rate: details.hourly_rate !== '' ? Number(details.hourly_rate) : null,
            bonus_amount: details.bonus_amount !== '' ? Number(details.bonus_amount) : null,
            bonus_condition_months: details.bonus_condition_months ?? null,
            customer_number: details.customer_number,
            product_number: details.product_number,
            description: details.description,
            is_active: details.is_active,
        }
        const response = await employmentService.saveBillingRule(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.billingRules.form.alert.newBillingRuleSuccessfullySaved')}.`)
            navigateTo('/settings/employment-billing-rules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
