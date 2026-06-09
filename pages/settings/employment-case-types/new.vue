<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.caseTypes.newCaseType') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employment.caseTypes.newCaseType') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/employment-case-types">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentCaseTypeForm formType="create"
                        :selectedCaseType="state.formCaseType" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveCaseType" />
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
        name: 'employment.caseTypes.caseTypes',
        translate: true,
        href: '/settings/employment-case-types',
    },
    {
        name: 'employment.caseTypes.newCaseType',
        translate: true,
        href: '/settings/employment-case-types/new',
    },
]

const state = reactive({
    error: {} as Error,
    formCaseType: {
        name: '',
        description: '',
        is_active: true,
        sort_order: 0,
    },
    isPageLoading: false,
})

async function saveCaseType(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: details.name,
            description: details.description,
            is_active: details.is_active,
            sort_order: details.sort_order,
        }
        const response = await employmentService.saveCaseType(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.caseTypes.form.alert.newCaseTypeSuccessfullySaved')}.`)
            navigateTo('/settings/employment-case-types')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
