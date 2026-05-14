<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('treatmentTemplates.editTemplate') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('treatmentTemplates.editTemplate') }}
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/treatment-templates">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsTreatmentTemplateForm formType="update"
                        :selectedTemplate="state.formTemplate" :error="state.error" @submitForm="updateTemplate" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { treatmentTemplateService } from '@/components/api/user/TreatmentTemplateService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const templateUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'treatmentTemplates.treatmentTemplates',
        translate: true,
        href: '/settings/treatment-templates',
    },
    {
        name: 'treatmentTemplates.editTemplate',
        translate: true,
        href: `/settings/treatment-templates/${templateUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formTemplate: {
        name: '',
        title: 'optional',
        completion_date: 'optional',
        area_type: 'optional',
        score: 'optional',
        description: 'optional',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchTemplate()
})

async function fetchTemplate() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await treatmentTemplateService.getTemplate(templateUuid)
        if (response?.data) {
            const d = response.data
            state.formTemplate = {
                name: d.name ?? '',
                title: d.title ?? 'optional',
                completion_date: d.completion_date ?? 'optional',
                area_type: d.area_type ?? 'optional',
                score: d.score ?? 'optional',
                description: d.description ?? 'optional',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateTemplate(templateDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: templateDetails.name,
            title: templateDetails.title,
            completion_date: templateDetails.completion_date,
            area_type: templateDetails.area_type,
            score: templateDetails.score,
            description: templateDetails.description,
        }
        const response = await treatmentTemplateService.updateTemplate(templateUuid, params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('treatmentTemplates.form.alert.templateSuccessfullyUpdated')}.`)
            navigateTo('/settings/treatment-templates')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
