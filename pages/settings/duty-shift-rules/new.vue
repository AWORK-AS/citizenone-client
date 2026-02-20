<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('dutyShiftRules.newDutyShiftRule') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb><Breadcrumb :links="breadcrumbLinks" /></template>
            <template #header>{{ $t('dutyShiftRules.newDutyShiftRule') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/duty-shift-rules">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyShiftRuleForm formType="create" :selectedRule="state.form"
                        :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveRule" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { dutyShiftRuleService } from '@/components/api/user/DutyShiftRuleService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    { name: 'dutyShiftRules.dutyShiftRules', translate: true, href: '/settings/duty-shift-rules' },
    { name: 'dutyShiftRules.newDutyShiftRule', translate: true, href: '/settings/duty-shift-rules/new' },
]
const state = reactive({ error: {} as Error, form: {}, isPageLoading: false })

async function saveRule(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dutyShiftRuleService.saveRule(formData)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('dutyShiftRules.form.alert.newDutyShiftRuleSuccessfullySaved')}.`)
            navigateTo('/settings/duty-shift-rules')
        }
    } catch (error: any) { state.error = error }
    state.isPageLoading = false
}
</script>
