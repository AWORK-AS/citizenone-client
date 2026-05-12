<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('treatmentTemplates.newTemplate') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('treatmentTemplates.newTemplate') }}
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/treatment-templates">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsTreatmentTemplateForm formType="create"
                        :selectedTemplate="state.formTemplate" :error="state.error" @submitForm="saveTemplate" />
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

const breadcrumbLinks = [
    {
        name: 'treatmentTemplates.treatmentTemplates',
        translate: true,
        href: '/settings/treatment-templates',
    },
    {
        name: 'treatmentTemplates.newTemplate',
        translate: true,
        href: '/settings/treatment-templates/new',
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

async function saveTemplate(templateDetails: any) {
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
        const response = await treatmentTemplateService.saveTemplate(params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('treatmentTemplates.form.alert.newTemplateSuccessfullySaved')}.`)
            navigateTo('/settings/treatment-templates')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
