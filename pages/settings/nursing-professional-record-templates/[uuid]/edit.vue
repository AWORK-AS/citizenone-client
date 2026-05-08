<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('nursingProfessionalRecordTemplates.editTemplate') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('nursingProfessionalRecordTemplates.editTemplate') }}
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/nursing-professional-record-templates">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsNursingProfessionalRecordTemplateForm formType="update"
                        :selectedTemplate="state.formTemplate" :error="state.error" @submitForm="updateTemplate" />
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
const router = useRouter()
const templateUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'nursingProfessionalRecordTemplates.nursingProfessionalRecordTemplates',
        translate: true,
        href: '/settings/nursing-professional-record-templates',
    },
    {
        name: 'nursingProfessionalRecordTemplates.editTemplate',
        translate: true,
        href: `/settings/nursing-professional-record-templates/${templateUuid}/edit`,
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

onMounted(() => {
    fetchTemplate()
})

async function fetchTemplate() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await nursingProfessionalRecordTemplateService.getTemplate(templateUuid)
        if (response?.data) {
            const d = response.data
            state.formTemplate = {
                name: d.name ?? '',
                functional_level: d.functional_level ?? 'optional',
                musculoskeletal_system: d.musculoskeletal_system ?? 'optional',
                nutrition: d.nutrition ?? 'optional',
                skin_and_mucous_membranes: d.skin_and_mucous_membranes ?? 'optional',
                communication: d.communication ?? 'optional',
                psychosocial_conditions: d.psychosocial_conditions ?? 'optional',
                respiration_and_circulation: d.respiration_and_circulation ?? 'optional',
                sexuality: d.sexuality ?? 'optional',
                pain_and_sensory_impressions: d.pain_and_sensory_impressions ?? 'optional',
                sleep_and_rest: d.sleep_and_rest ?? 'optional',
                knowledge_and_development: d.knowledge_and_development ?? 'optional',
                excretion_of_waste: d.excretion_of_waste ?? 'optional',
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
        const response = await nursingProfessionalRecordTemplateService.updateTemplate(templateUuid, params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('nursingProfessionalRecordTemplates.form.alert.templateSuccessfullyUpdated')}.`)
            navigateTo('/settings/nursing-professional-record-templates')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
