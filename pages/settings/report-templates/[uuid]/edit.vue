<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('reportTemplates.editReportTemplate') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('reportTemplates.editReportTemplate') }}</template>

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
                    <ModulesUserSettingsReportTemplateForm formType="edit" :selectedTemplate="state.template"
                        :error="state.error" @submitForm="updateTemplate" />
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

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const templateUuid = route.params.uuid

const breadcrumbLinks = [
    { name: 'reportTemplates.reportTemplates', translate: true, href: '/settings/report-templates' },
    { name: 'reportTemplates.editReportTemplate', translate: true, href: `/settings/report-templates/${templateUuid}/edit` },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    template: null as any,
})

onMounted(() => {
    fetchTemplate()
})

async function fetchTemplate() {
    state.isPageLoading = true
    try {
        const response = await reportTemplateService.getReportTemplate(templateUuid)
        if (response?.data) {
            state.template = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateTemplate(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await reportTemplateService.updateReportTemplate(templateUuid, formData)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('reportTemplates.alert.templateSuccessfullyUpdated')}.`)
            navigateTo('/settings/report-templates')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
