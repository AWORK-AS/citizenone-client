<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('citizens.nursingAreas.newNursingProfessionalRecords') }} -
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

            <template #header>{{ $t('citizens.nursingAreas.newNursingProfessionalRecords') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/citizens/${citizenUuid}/nursing-areas`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenNursingProfessionalRecordForm formType="create"
                        :selectedRecord="state.formNursingProfessionalRecord" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveRecord" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { nursingAreasService } from '@/components/api/NursingAreasService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'citizens.nursingAreas.nursingProfessionalRecords',
        translate: true,
        href: `/citizens/${citizenUuid}/nursing-areas`,
    },
    {
        name: 'citizens.nursingAreas.newNursingProfessionalRecords',
        translate: true,
        href: `/citizens/${citizenUuid}/nursing-areas/new`,
    },
]

const state = reactive({
    error: {} as Error,
    formNursingProfessionalRecord: {
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