<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.billingRules.editBillingRule') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employment.billingRules.editBillingRule') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/employment-billing-rules">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentBillingRuleForm formType="update" :selectedBillingRule="state.formBillingRule"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateBillingRule" />
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
const router = useRouter()
const billingRuleUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'employment.billingRules.billingRules',
        translate: true,
        href: '/settings/employment-billing-rules',
    },
    {
        name: 'employment.billingRules.editBillingRule',
        translate: true,
        href: `/settings/employment-billing-rules/${billingRuleUuid}/edit`,
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

onMounted(() => {
    fetchBillingRule()
})

async function fetchBillingRule() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employmentService.getBillingRule(billingRuleUuid)
        if (response) {
            const d = response?.data
            state.formBillingRule = {
                name: d?.name ?? '',
                pricing_type: d?.pricing_type ?? 'weekly',
                weekly_rate: d?.rate != null ? String(d.rate) : '',
                hourly_rate: d?.hourly_rate != null ? String(d.hourly_rate) : '',
                bonus_amount: d?.bonus_amount != null ? String(d.bonus_amount) : '',
                bonus_condition_months: d?.bonus_condition_months ?? null,
                customer_number: d?.customer_number ?? '',
                product_number: d?.product_number ?? '',
                description: d?.description ?? '',
                is_active: d?.is_active ?? true,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateBillingRule(details: any) {
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
        const response = await employmentService.updateBillingRule(billingRuleUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.billingRules.form.alert.billingRuleSuccessfullyUpdated')}.`)
            navigateTo('/settings/employment-billing-rules')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
