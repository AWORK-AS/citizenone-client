<template>
    <div>
        <div class="space-y-3">
            <h3 class="font-semibold">
                {{ $t('citizens.treatments.treatments') }}
            </h3>
            <div class="flex justify-end items-center mb-5 gap-x-2">
                <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isAddTreatmentOpen = true">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('citizens.treatments.newTreatment') }}
                </FormButton>
            </div>
            <div class="space-y-5">
                <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                    v-for="(treatment, index) in state.treatments?.data" :key="index">
                    <div class="flex flex-col md:flex-row gap-3 md:gap-10">
                        <div class="grow">
                            <p class="text-sm">
                                <span>{{ formatDateToReadable(treatment?.date) }}</span>
                            </p>
                            <p class="text-sm">
                                {{ $t('citizens.treatments.table.createdBy') }}:
                                {{ treatment?.user?.firstname + ' ' + treatment?.user?.lastname }}
                            </p>
                            <p class="text-sm">
                                {{ $t('citizens.treatments.table.dateCreated') }}: {{
                                    formatDateToReadable(treatment?.created_at) }}
                            </p>
                            <p class="text-sm">
                                {{ $t('citizens.treatments.table.completionDate') }}:
                                {{ formatDateToReadable(treatment?.completion_date) }}
                            </p>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                    @click="viewStatuses(treatment)">
                                    <Icon name="ph:eye" class="size-4" />
                                    {{ $t('citizens.treatments.table.actions.statuses') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                    @click="editTreatment(treatment)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                    {{ $t('citizens.treatments.table.actions.edit') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2">
                        <Badge type="primary" class="w-fit" v-if="treatment?.area_type">
                            <p class="text-xxs truncate">
                                <span v-if="treatment?.area_type === 'functional_level'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.functionalLevel')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'musculoskeletal_system'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.musculoskeletalSystem')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'nutrition'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.nutrition')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'skin_and_mucous_membranes'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.skinAndMucousMembranes')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'communication'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.communication')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'psychosocial_conditions'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.psychosocialConditions')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'respiration_and_circulation'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.respirationAndCirculation')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'sexuality'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.sexuality')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'pain_and_sensory_impressions'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.painAndSensoryImpressions')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'sleep_and_rest'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.sleepAndRest')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'knowledge_and_development'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.knowledgeAndDevelopment')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'excretion_of_waste'">
                                    {{
                                        $t('citizens.treatments.table.areaTypes.excretionOfWaste')
                                    }}
                                </span>
                            </p>
                        </Badge>
                        <p class="font-semibold">{{ treatment?.name }}</p>
                        <div class="mt-1">
                            <Badge type="primary" class="w-fit" v-if="treatment.score">
                                <p class="text-xxs" v-if="treatment.score == 1">
                                    {{
                                        $t('citizens.treatments.table.expectedLevels.minorChallenges')
                                    }}
                                </p>
                                <p class="text-xxs" v-if="treatment.score == 2">
                                    {{
                                        $t('citizens.treatments.table.expectedLevels.moderateChallenges')
                                    }}
                                </p>
                                <p class="text-xxs" v-if="treatment.score == 3">
                                    {{
                                        $t('citizens.treatments.table.expectedLevels.significantChallenges')
                                    }}
                                </p>
                                <p class="text-xxs" v-if="treatment.score == 4">
                                    {{
                                        $t('citizens.treatments.table.expectedLevels.severeChallenges')
                                    }}
                                </p>
                                <p class="text-xxs" v-if="treatment.score == 5">
                                    {{
                                        $t('citizens.treatments.table.expectedLevels.verySubstantialChallenges')
                                    }}
                                </p>
                            </Badge>
                        </div>
                        <div v-html="treatment?.description" class="content text-sm" />
                    </div>
                </div>
                <div v-if="state.treatments?.data?.length === 0">
                    <p class="text-center">
                        {{ $t('theresNoDataAvailableToDisplay') }}.
                    </p>
                </div>
                <Pagination :data="state.treatments" @previous="previous" @next="next" />
            </div>
        </div>
        <ModulesCitizenTreatmentModalNew :isModalOpen="state.modal.isAddTreatmentOpen"
            :selectedTreatment="state.selectedTreatment" @close="state.modal.isAddTreatmentOpen = false"
            @refreshTreatments="fetchTreatments" />
        <ModulesCitizenTreatmentModalEdit :isModalOpen="state.modal.isEditTreatmentOpen"
            :selectedTreatment="state.selectedTreatment" @close="state.modal.isEditTreatmentOpen = false"
            @refreshTreatments="fetchTreatments" />
        <!-- <ModulesCitizenNursingProfessionalRecordStatusModalStatuses :isModalOpen="state.modal.isStatusOpen"
            :selectedTreatment="state.selectedTreatment" @close="state.modal.isStatusOpen = false" /> -->
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { treatmentService } from '@/components/api/TreatmentService'
import type { Error } from '@/types'

const router = useRouter()
const { formatDateToReadable } = useDatetimeFormatter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
let currentTablePage = 1

const state = reactive({
    error: {} as Error,
    isTableLoading: false,
    treatments: [] as any,
    modal: {
        isAddTreatmentOpen: false,
        isEditTreatmentOpen: false,
        isStatusOpen: false
    },
    selectedTreatment: {},
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchTreatments()
})

async function fetchTreatments() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await treatmentService.getTreatments(params)
        if (response) {
            state.treatments = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchTreatments()
}

function next() {
    currentTablePage++
    fetchTreatments()
}

function editTreatment(treatment: any) {
    state.selectedTreatment = treatment
    state.modal.isEditTreatmentOpen = true
}

function viewStatuses(treatment: any) {
    state.selectedTreatment = treatment
    state.modal.isStatusOpen = true
}
</script>