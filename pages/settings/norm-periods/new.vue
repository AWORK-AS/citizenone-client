<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('normPeriod.newNormPeriod') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('normPeriod.newNormPeriod') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/norm-periods">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserNormPeriodForm formType="create" :selectedNormPeriod="state.formNormPeriod" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveNormPeriod" />
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
const breadcrumbLinks = [
    {
        name: 'normPeriod.normPeriod',
        translate: true,
        href: '/settings/norm-periods',
    },
    {
        name: 'normPeriod.newNormPeriod',
        translate: true,
        href: '/settings/norm-periods/new',
    },
]

const state = reactive({
    error: {} as Error,
    formNormPeriod: {
        name: '',
        date_start: '',
        date_end: '',
        end_month: '',
        end_day: '',
        description: '',
        department_uuids: [] as Array<string>,
        is_active: true
    },
    isPageLoading: false,
})

async function saveNormPeriod(normPeriodDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let dateStart = normPeriodDetails.date_start.split('-')
        let dateEnd = normPeriodDetails.date_end.split('-')

        const params = {
            name: normPeriodDetails.name,
            start_year: parseInt(dateStart[0]),
            start_month: parseInt(dateStart[1]),
            start_day: parseInt(dateStart[2]),
            end_year: parseInt(dateEnd[0]),
            end_month: parseInt(dateEnd[1]),
            end_day: parseInt(dateEnd[2]),
            description: normPeriodDetails.description,
            department_uuids: normPeriodDetails.department_uuids,
            is_active: normPeriodDetails.is_active
        }
        const response = await normPeriodService.saveNormPeriod(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('normPeriod.form.alert.newNormPeriodSuccessfullySaved')}.`)
            navigateTo('/settings/norm-periods')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>