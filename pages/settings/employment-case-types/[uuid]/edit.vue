<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.caseTypes.editCaseType') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employment.caseTypes.editCaseType') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/employment-case-types">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentCaseTypeForm formType="update" :selectedCaseType="state.formCaseType"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateCaseType" />
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
const caseTypeUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'employment.caseTypes.caseTypes',
        translate: true,
        href: '/settings/employment-case-types',
    },
    {
        name: 'employment.caseTypes.editCaseType',
        translate: true,
        href: `/settings/employment-case-types/${caseTypeUuid}/edit`,
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

onMounted(() => {
    fetchCaseType()
})

async function fetchCaseType() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employmentService.getCaseType(caseTypeUuid)
        if (response) {
            state.formCaseType = {
                name: response?.data?.name ?? '',
                description: response?.data?.description ?? '',
                is_active: response?.data?.is_active ?? true,
                sort_order: response?.data?.sort_order ?? 0,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateCaseType(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: details.name,
            description: details.description,
            is_active: details.is_active,
            sort_order: details.sort_order,
        }
        const response = await employmentService.updateCaseType(caseTypeUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.caseTypes.form.alert.caseTypeSuccessfullyUpdated')}.`)
            navigateTo('/settings/employment-case-types')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
