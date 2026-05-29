<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.billingRules.editBillingRule') }} - {{ runtimeConfig?.public?.appName }}</Title>
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
                    <ModulesUserEmploymentBillingRuleForm formType="update"
                        :selectedBillingRule="state.formBillingRule" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateBillingRule" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentBillingRuleService } from '@/components/api/user/EmploymentService'
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
        rate: '',
        frequency: null as string | null,
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
        const response = await employmentBillingRuleService.getBillingRule(billingRuleUuid)
        if (response) {
            state.formBillingRule = {
                name: response?.data?.name ?? '',
                rate: response?.data?.rate ?? '',
                frequency: response?.data?.frequency ?? null,
                description: response?.data?.description ?? '',
                is_active: response?.data?.is_active ?? true,
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
            rate: details.rate,
            frequency: details.frequency,
            description: details.description,
            is_active: details.is_active,
        }
        const response = await employmentBillingRuleService.updateBillingRule(billingRuleUuid, params)
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
