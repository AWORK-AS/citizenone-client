<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('nursingProfessionalRecordTemplates.newTemplate') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('nursingProfessionalRecordTemplates.newTemplate') }}
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/nursing-professional-record-templates">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsNursingProfessionalRecordTemplateForm formType="create"
                        :selectedTemplate="state.formTemplate" :error="state.error" @submitForm="saveTemplate" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { nursingProfessionalRecordTemplateService } from '@/components/api/user/NursingProfessionalRecordTemplateService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'nursingProfessionalRecordTemplates.nursingProfessionalRecordTemplates',
        translate: true,
        href: '/settings/nursing-professional-record-templates',
    },
    {
        name: 'nursingProfessionalRecordTemplates.newTemplate',
        translate: true,
        href: '/settings/nursing-professional-record-templates/new',
    },
]

const state = reactive({
    error: {} as Error,
    formTemplate: {
        name: '',
        functional_level: 'optional',
        musculoskeletal_system: 'optional',
        nutrition: 'optional',
        skin_and_mucous_membranes: 'optional',
        communication: 'optional',
        psychosocial_conditions: 'optional',
        respiration_and_circulation: 'optional',
        sexuality: 'optional',
        pain_and_sensory_impressions: 'optional',
        sleep_and_rest: 'optional',
        knowledge_and_development: 'optional',
        excretion_of_waste: 'optional',
    },
    isPageLoading: false,
})

async function saveTemplate(templateDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: templateDetails.name,
            functional_level: templateDetails.functional_level,
            musculoskeletal_system: templateDetails.musculoskeletal_system,
            nutrition: templateDetails.nutrition,
            skin_and_mucous_membranes: templateDetails.skin_and_mucous_membranes,
            communication: templateDetails.communication,
            psychosocial_conditions: templateDetails.psychosocial_conditions,
            respiration_and_circulation: templateDetails.respiration_and_circulation,
            sexuality: templateDetails.sexuality,
            pain_and_sensory_impressions: templateDetails.pain_and_sensory_impressions,
            sleep_and_rest: templateDetails.sleep_and_rest,
            knowledge_and_development: templateDetails.knowledge_and_development,
            excretion_of_waste: templateDetails.excretion_of_waste,
        }
        const response = await nursingProfessionalRecordTemplateService.saveTemplate(params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('nursingProfessionalRecordTemplates.form.alert.newTemplateSuccessfullySaved')}.`)
            navigateTo('/settings/nursing-professional-record-templates')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
