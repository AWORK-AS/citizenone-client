<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('citizens.nursingAreas.editNursingProfessionalRecords') }} -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('citizens.nursingAreas.editNursingProfessionalRecords') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/citizens/${citizenUuid}/nursing-areas`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenNursingProfessionalRecordForm formType="update"
                        :selectedRecord="state.formNursingProfessionalRecord" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateRecord" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { nursingAreasService } from '@/components/api/NursingAreasService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const recordUuid = router?.currentRoute?.value?.params?.record_uuid

const state = reactive({
    error: {} as Error,
    formNursingProfessionalRecord: {
        date: '',
        functional_level: '',
        musculoskeletal_system: '',
        nutrition: '',
        skin_and_mucous_membranes: '',
        communication: '',
        psychosocial_conditions: '',
        respiration_and_circulation: '',
        sexuality: '',
        pain_and_sensory_impressions: '',
        sleep_and_rest: '',
        knowledge_and_development: '',
        excretion_of_waste: '',
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
                date: response?.data?.date ?? '',
                functional_level: response?.data?.functional_level ?? '',
                musculoskeletal_system: response?.data?.musculoskeletal_system ?? '',
                nutrition: response?.data?.nutrition ?? '',
                skin_and_mucous_membranes: response?.data?.skin_and_mucous_membranes ?? '',
                communication: response?.data?.communication ?? '',
                psychosocial_conditions: response?.data?.psychosocial_conditions ?? '',
                respiration_and_circulation: response?.data?.respiration_and_circulation ?? '',
                sexuality: response?.data?.sexuality ?? '',
                pain_and_sensory_impressions: response?.data?.pain_and_sensory_impressions ?? '',
                sleep_and_rest: response?.data?.sleep_and_rest ?? '',
                knowledge_and_development: response?.data?.knowledge_and_development ?? '',
                excretion_of_waste: response?.data?.excretion_of_waste ?? '',
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
            date: recordDetails.date,
            functional_level: recordDetails.functional_level,
            musculoskeletal_system: recordDetails.musculoskeletal_system,
            nutrition: recordDetails.nutrition,
            skin_and_mucous_membranes: recordDetails.skin_and_mucous_membranes,
            communication: recordDetails.communication,
            psychosocial_conditions: recordDetails.psychosocial_conditions,
            respiration_and_circulation: recordDetails.respiration_and_circulation,
            sexuality: recordDetails.sexuality,
            pain_and_sensory_impressions: recordDetails.pain_and_sensory_impressions,
            sleep_and_rest: recordDetails.sleep_and_rest,
            knowledge_and_development: recordDetails.knowledge_and_development,
            excretion_of_waste: recordDetails.excretion_of_waste,
        }
        const response = await nursingAreasService.updateNursingProfessionalRecord(recordUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.form.alert.successfullyUpdate')}.`)
            navigateTo(`/citizens/${citizenUuid}/nursing-areas`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>