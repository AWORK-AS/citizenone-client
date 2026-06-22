<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('reportTemplates.newReportTemplate') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('reportTemplates.newReportTemplate') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/report-templates">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsReportTemplateForm formType="create" :error="state.error"
                        @submitForm="saveTemplate" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { reportTemplateService } from '@/components/api/user/ReportTemplateService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    { name: 'reportTemplates.reportTemplates', translate: true, href: '/settings/report-templates' },
    { name: 'reportTemplates.newReportTemplate', translate: true, href: '/settings/report-templates/new' },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

async function saveTemplate(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await reportTemplateService.saveReportTemplate(formData)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('reportTemplates.alert.templateSuccessfullySaved')}.`)
            navigateTo('/settings/report-templates')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
