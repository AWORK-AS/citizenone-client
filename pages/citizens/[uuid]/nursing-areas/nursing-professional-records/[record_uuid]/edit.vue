<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('citizens.nursingAreas.editNursingProfessionalRecord') }} -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.nursingAreas.editNursingProfessionalRecord') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/citizens/${citizenUuid}/nursing-areas?open=nursing-professional-records`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenNursingAreasNursingProfessionalRecordForm formType="update"
                        :selectedRecord="state.formNursingProfessionalRecord" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateRecord" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { nursingAreasService } from '@/components/api/user/NursingAreasService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const recordUuid = router?.currentRoute?.value?.params?.record_uuid
const breadcrumbLinks = [
    {
        name: 'citizens.nursingAreas.nursingProfessionalRecords',
        translate: true,
        href: `/citizens/${citizenUuid}/nursing-areas?open=nursing-professional-records`,
    },
    {
        name: 'citizens.nursingAreas.editNursingProfessionalRecord',
        translate: true,
        href: `/citizens/${citizenUuid}/nursing-areas/nursing-professional-records/${recordUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formNursingProfessionalRecord: {
        template_uuid: '',
        date: '',
        functional_level: '',
        functional_level_note: '',
        musculoskeletal_system: '',
        musculoskeletal_system_note: '',
        nutrition: '',
        nutrition_note: '',
        skin_and_mucous_membranes: '',
        skin_and_mucous_membranes_note: '',
        communication: '',
        communication_note: '',
        psychosocial_conditions: '',
        psychosocial_conditions_note: '',
        respiration_and_circulation: '',
        respiration_and_circulation_note: '',
        sexuality: '',
        sexuality_note: '',
        pain_and_sensory_impressions: '',
        pain_and_sensory_impressions_note: '',
        sleep_and_rest: '',
        sleep_and_rest_note: '',
        knowledge_and_development: '',
        knowledge_and_development_note: '',
        excretion_of_waste: '',
        excretion_of_waste_note: '',
    },
    isPageLoading: false
})

onMounted(() => {
    fetchNursingProfessionalRecord()
})

async function fetchNursingProfessionalRecord() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await nursingAreasService.getNursingProfessionalRecord(recordUuid)
        if (response) {
            state.formNursingProfessionalRecord = {
                template_uuid: response?.data?.nursing_professional_record_template?.uuid ?? '',
                date: response?.data?.date ?? '',
                functional_level: response?.data?.functional_level ?? '',
                functional_level_note: response?.data?.functional_level_note ?? '',
                musculoskeletal_system: response?.data?.musculoskeletal_system ?? '',
                musculoskeletal_system_note: response?.data?.musculoskeletal_system_note ?? '',
                nutrition: response?.data?.nutrition ?? '',
                nutrition_note: response?.data?.nutrition_note ?? '',
                skin_and_mucous_membranes: response?.data?.skin_and_mucous_membranes ?? '',
                skin_and_mucous_membranes_note: response?.data?.skin_and_mucous_membranes_note ?? '',
                communication: response?.data?.communication ?? '',
                communication_note: response?.data?.communication_note ?? '',
                psychosocial_conditions: response?.data?.psychosocial_conditions ?? '',
                psychosocial_conditions_note: response?.data?.psychosocial_conditions_note ?? '',
                respiration_and_circulation: response?.data?.respiration_and_circulation ?? '',
                respiration_and_circulation_note: response?.data?.respiration_and_circulation_note ?? '',
                sexuality: response?.data?.sexuality ?? '',
                sexuality_note: response?.data?.sexuality_note ?? '',
                pain_and_sensory_impressions: response?.data?.pain_and_sensory_impressions ?? '',
                pain_and_sensory_impressions_note: response?.data?.pain_and_sensory_impressions_note ?? '',
                sleep_and_rest: response?.data?.sleep_and_rest ?? '',
                sleep_and_rest_note: response?.data?.sleep_and_rest_note ?? '',
                knowledge_and_development: response?.data?.knowledge_and_development ?? '',
                knowledge_and_development_note: response?.data?.knowledge_and_development_note ?? '',
                excretion_of_waste: response?.data?.excretion_of_waste ?? '',
                excretion_of_waste_note: response?.data?.excretion_of_waste_note ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateRecord(recordDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            template_uuid: recordDetails.template_uuid ?? null,
            date: recordDetails.date,
            functional_level: recordDetails.functional_level,
            functional_level_note: recordDetails.functional_level_note,
            musculoskeletal_system: recordDetails.musculoskeletal_system,
            musculoskeletal_system_note: recordDetails.musculoskeletal_system_note,
            nutrition: recordDetails.nutrition,
            nutrition_note: recordDetails.nutrition_note,
            skin_and_mucous_membranes: recordDetails.skin_and_mucous_membranes,
            skin_and_mucous_membranes_note: recordDetails.skin_and_mucous_membranes_note,
            communication: recordDetails.communication,
            communication_note: recordDetails.communication_note,
            psychosocial_conditions: recordDetails.psychosocial_conditions,
            psychosocial_conditions_note: recordDetails.psychosocial_conditions_note,
            respiration_and_circulation: recordDetails.respiration_and_circulation,
            respiration_and_circulation_note: recordDetails.respiration_and_circulation_note,
            sexuality: recordDetails.sexuality,
            sexuality_note: recordDetails.sexuality_note,
            pain_and_sensory_impressions: recordDetails.pain_and_sensory_impressions,
            pain_and_sensory_impressions_note: recordDetails.pain_and_sensory_impressions_note,
            sleep_and_rest: recordDetails.sleep_and_rest,
            sleep_and_rest_note: recordDetails.sleep_and_rest_note,
            knowledge_and_development: recordDetails.knowledge_and_development,
            knowledge_and_development_note: recordDetails.knowledge_and_development_note,
            excretion_of_waste: recordDetails.excretion_of_waste,
            excretion_of_waste_note: recordDetails.excretion_of_waste_note,
        }
        const response = await nursingAreasService.updateNursingProfessionalRecord(recordUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.form.alert.successfullyUpdated')}.`)
            navigateTo(`/citizens/${citizenUuid}/nursing-areas?open=nursing-professional-records`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>