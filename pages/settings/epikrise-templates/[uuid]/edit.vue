<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('epikrise.templates.edit') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('epikrise.templates.edit') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/epikrise-templates">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsReportTemplateForm formType="edit" type="epikrise"
                        :selectedTemplate="state.template" :error="state.error" @submitForm="updateTemplate" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { reportTemplateService } from '@/components/api/user/ReportTemplateService'
import { useAlert } from '@/composables/alert'
import { useEpikrise } from '@/composables/useEpikrise'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const { canManageTemplates } = useEpikrise()

// Same rule as the template list: the company switch on and allowed to manage templates. Only leave once the
// user is known (the store starts as an empty object, so "known" means it has an id).
watch([() => userStore.getUser, canManageTemplates], ([user, allowed]: any[]) => {
    if (user?.id && !allowed) navigateTo('/')
}, { immediate: true })
const templateUuid = route.params.uuid

const breadcrumbLinks = [
    { name: 'epikrise.templates.title', translate: true, href: '/settings/epikrise-templates' },
    { name: 'epikrise.templates.edit', translate: true, href: `/settings/epikrise-templates/${templateUuid}/edit` },
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
        const response = await reportTemplateService.updateReportTemplate(templateUuid, { ...formData, type: 'epikrise' })
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('reportTemplates.alert.templateSuccessfullyUpdated')}.`)
            navigateTo('/settings/epikrise-templates')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
