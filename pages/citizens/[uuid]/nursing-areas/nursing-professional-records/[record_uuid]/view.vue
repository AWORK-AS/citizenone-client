<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('citizens.nursingAreas.viewNursingProfessionalRecord') }} -
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

            <template #header>{{ $t('citizens.nursingAreas.viewNursingProfessionalRecord') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/citizens/${citizenUuid}/nursing-areas`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <p>
                                <span class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.date') }}:
                                </span>
                                {{ formatDateToReadable(state.nursingProfessionalRecord.date) }}
                            </p>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.functionalLevel') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.functional_level"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.functional_level_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.musculoskeletalSystem') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.musculoskeletal_system"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.musculoskeletal_system_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.nutrition') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.nutrition"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.nutrition_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.skinAndMucousMembranes') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.skin_and_mucous_membranes"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.skin_and_mucous_membranes_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.communication') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.communication"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.communication_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.psychosocialConditions') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.psychosocial_conditions"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.psychosocial_conditions_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.respirationAndCirculation') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.respiration_and_circulation"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.respiration_and_circulation_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.sexuality') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.sexuality"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.sexuality_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.painAndSensoryImpressions') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.pain_and_sensory_impressions"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.pain_and_sensory_impressions_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.sleepAndRest') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.sleep_and_rest"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.sleep_and_rest_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.knowledgeAndDevelopment') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.knowledge_and_development"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.knowledge_and_development_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                        <div class="bg-white rounded-md p-6 shadow-sm space-y-3">
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.excretionOfWaste') }}
                                </p>
                                <div v-html="state.nursingProfessionalRecord.excretion_of_waste"
                                    class="content table-responsive" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-primary font-semibold">
                                    {{ $t('citizens.nursingAreas.form.healthProfessionalDocumentation') }}
                                </p>

                                <div v-html="state.nursingProfessionalRecord.excretion_of_waste_note"
                                    class="content table-responsive" />
                            </div>
                        </div>
                    </div>
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
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const recordUuid = router?.currentRoute?.value?.params?.record_uuid
const breadcrumbLinks = [
    {
        name: 'citizens.nursingAreas.nursingProfessionalRecords',
        translate: true,
        href: `/citizens/${citizenUuid}/nursing-areas`,
    },
    {
        name: 'citizens.nursingAreas.viewNursingProfessionalRecord',
        translate: true,
        href: `/citizens/${citizenUuid}/nursing-areas/nursing-professional-records/${recordUuid}/view`,
    },
]

const state = reactive({
    error: {} as Error,
    nursingProfessionalRecord: {
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
            state.nursingProfessionalRecord = {
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
</script>