<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('normPeriod.editNormPeriod') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('normPeriod.editNormPeriod') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/norm-periods">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserNormPeriodForm formType="update" :selectedNormPeriod="state.formNormPeriod" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateNormPeriod" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { normPeriodService } from '@/components/api/user/NormPeriodService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const normPeriodUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'normPeriod.normPeriod',
        translate: true,
        href: '/settings/norm-periods',
    },
    {
        name: 'normPeriod.editNormPeriod',
        translate: true,
        href: `/settings/norm-periods/${normPeriodUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formNormPeriod: {
        name: '',
        start_month: '',
        start_day: '',
        end_month: '',
        end_day: '',
        description: '',
        department_uuids: [] as Array<string>,
        is_active: true
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchNormPeriod()
})

async function fetchNormPeriod() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await normPeriodService.getNormPeriod(normPeriodUuid)
        if (response) {
            state.formNormPeriod = {
                name: response?.data?.name ?? '',
                start_month: response?.data?.start_month ?? 1,
                start_day: response?.data?.start_day ?? 1,
                end_month: response?.data?.end_month ?? 12,
                end_day: response?.data?.end_day ?? 31,
                description: response?.data?.description ?? '',
                department_uuids: response?.data?.departments?.map((dept: any) => dept.uuid) ?? [],
                is_active: response?.data?.is_active ?? true
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateNormPeriod(normPeriodDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: normPeriodDetails.name,
            start_month: normPeriodDetails.start_month,
            start_day: normPeriodDetails.start_day,
            end_month: normPeriodDetails.end_month,
            end_day: normPeriodDetails.end_day,
            description: normPeriodDetails.description,
            department_uuids: normPeriodDetails.department_uuids,
            is_active: normPeriodDetails.is_active
        }
        const response = await normPeriodService.updateNormPeriod(normPeriodUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('normPeriod.form.alert.normPeriodSuccessfullyUpdated')}.`)
            navigateTo('/settings/norm-periods')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>