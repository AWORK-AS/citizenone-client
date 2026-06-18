<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.statusTypes.newStatusType') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employment.statusTypes.newStatusType') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/employment-status-types">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentStatusTypeForm formType="create"
                        :selectedStatusType="state.formStatusType" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveStatusType" />
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
        name: 'employment.statusTypes.statusTypes',
        translate: true,
        href: '/settings/employment-status-types',
    },
    {
        name: 'employment.statusTypes.newStatusType',
        translate: true,
        href: '/settings/employment-status-types/new',
    },
]

const state = reactive({
    error: {} as Error,
    formStatusType: {
        name: '',
        color: '#000000',
        is_active: true,
        sort_order: 0,
    },
    isPageLoading: false,
})

async function saveStatusType(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: details.name,
            color: details.color,
            is_active: details.is_active,
            sort_order: details.sort_order,
            billing_rule_uuid: details.billing_rule_uuid ?? null,
        }
        const response = await employmentService.saveStatusType(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.statusTypes.form.alert.newStatusTypeSuccessfullySaved')}.`)
            navigateTo('/settings/employment-status-types')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
