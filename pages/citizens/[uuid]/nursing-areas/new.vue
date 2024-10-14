<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('citizens.nursingAreas.newNursingProfessionalRecords') }} -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('citizens.nursingAreas.newNursingProfessionalRecords') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/citizens/${citizenUuid}/nursing-areas`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenNursingProfessionalRecordForm formType="create"
                        :selectedRecord="state.formNursingProfessionalRecord" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveRecord" />
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
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const { successAlert } = useAlert()
const { t } = useI18n()

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
    isPageLoading: false,
})

async function saveRecord(recordDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
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
        const response = await nursingAreasService.saveNursingProfessionalRecord(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.form.alert.successfullyAdded')}.`)
            navigateTo(`/citizens/${citizenUuid}/nursing-areas`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>