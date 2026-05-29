<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.statusTypes.editStatusType') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employment.statusTypes.editStatusType') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/employment-status-types">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentStatusTypeForm formType="update"
                        :selectedStatusType="state.formStatusType" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateStatusType" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentStatusTypeService } from '@/components/api/user/EmploymentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const statusTypeUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'employment.statusTypes.statusTypes',
        translate: true,
        href: '/settings/employment-status-types',
    },
    {
        name: 'employment.statusTypes.editStatusType',
        translate: true,
        href: `/settings/employment-status-types/${statusTypeUuid}/edit`,
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

onMounted(() => {
    fetchStatusType()
})

async function fetchStatusType() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employmentStatusTypeService.getStatusType(statusTypeUuid)
        if (response) {
            state.formStatusType = {
                name: response?.data?.name ?? '',
                color: response?.data?.color ?? '#000000',
                is_active: response?.data?.is_active ?? true,
                sort_order: response?.data?.sort_order ?? 0,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateStatusType(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: details.name,
            color: details.color,
            is_active: details.is_active,
            sort_order: details.sort_order,
        }
        const response = await employmentStatusTypeService.updateStatusType(statusTypeUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.statusTypes.form.alert.statusTypeSuccessfullyUpdated')}.`)
            navigateTo('/settings/employment-status-types')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
