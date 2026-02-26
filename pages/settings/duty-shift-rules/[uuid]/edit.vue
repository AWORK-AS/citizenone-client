<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('dutyShiftRules.editDutyShiftRule') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb><Breadcrumb :links="breadcrumbLinks" /></template>
            <template #header>{{ $t('dutyShiftRules.editDutyShiftRule') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/duty-shift-rules">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyShiftRuleForm formType="update" :selectedRule="state.form"
                        :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateRule" />
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
const router = useRouter()
const ruleUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    { name: 'dutyShiftRules.dutyShiftRules', translate: true, href: '/settings/duty-shift-rules' },
    { name: 'dutyShiftRules.editDutyShiftRule', translate: true, href: `/settings/duty-shift-rules/${ruleUuid}/edit` },
]
const state = reactive({ error: {} as Error, form: {} as any, isPageLoading: false })

onMounted(() => fetchRule())

async function fetchRule() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dutyShiftRuleService.getRule(ruleUuid)
        if (response) state.form = response?.data
    } catch (error: any) { state.error = error }
    state.isPageLoading = false
}

async function updateRule(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dutyShiftRuleService.updateRule(ruleUuid, formData)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('dutyShiftRules.form.alert.dutyShiftRuleSuccessfullyUpdated')}.`)
            navigateTo('/settings/duty-shift-rules')
        }
    } catch (error: any) { state.error = error }
    state.isPageLoading = false
}
</script>
