<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.treatments.treatments') }}
        </h3>

        <div class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.treatments?.data?.length === 0">
            {{ $t('dailyOverview.treatments.noTreatmentsToShow') }}
        </div>

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm divide-y overflow-scroll min-h-96 max-h-96"
            v-else>
            <div v-for="(treatment, treatmentIndex) in state.treatments?.data" :key="treatmentIndex"
                class="pl-4 pr-3 py-5 cursor-pointer hover:bg-gray-100"
                @click="navigateTo(`/citizens/${treatment?.citizen?.uuid}/nursing-areas?open=treatments`)">
                <div class="flex gap-x-2">
                    <img :src="treatment?.citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${treatment?.citizen?.firstname + ' ' + treatment?.citizen?.lastname}`"
                        class="rounded-full w-12 h-12 object-cover border-2 border-secondary" />
                    <div>
                        <p class="text-sm font-medium text-primary">
                            {{ treatment?.citizen?.firstname + ' ' + treatment?.citizen?.lastname }}
                        </p>
                        <p class="text-xxs" v-if="treatment?.user?.firstname || treatment?.user?.lastname">
                            {{ $t('dailyOverview.createdBy') }}
                            {{ treatment?.user?.firstname + ' ' +
                                treatment?.user?.lastname }}
                        </p>
                        <Badge type="primary" class="w-fit" v-if="treatment?.area_type">
                            <p class="text-xxs truncate">
                                <span v-if="treatment?.area_type === 'functional_level'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.functionalLevel')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'musculoskeletal_system'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.musculoskeletalSystem')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'nutrition'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.nutrition')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'skin_and_mucous_membranes'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.skinAndMucousMembranes')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'communication'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.communication')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'psychosocial_conditions'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.psychosocialConditions')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'respiration_and_circulation'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.respirationAndCirculation')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'sexuality'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.sexuality')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'pain_and_sensory_impressions'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.painAndSensoryImpressions')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'sleep_and_rest'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.sleepAndRest')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'knowledge_and_development'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.knowledgeAndDevelopment')
                                    }}
                                </span>
                                <span v-if="treatment?.area_type === 'excretion_of_waste'">
                                    {{
                                        $t('dailyOverview.treatments.areaTypes.excretionOfWaste')
                                    }}
                                </span>
                            </p>
                        </Badge>
                        <div class="px-1">
                            <h3 class="text-base font-semibold">
                                {{ treatment?.name }}
                            </h3>
                            <p v-html="treatment?.description" class="text-xs" />
                            <p class="content text-xs text-muted-400 mt-1">
                                {{ $t('dailyOverview.treatments.completionDate') }}:
                                <span>{{ formatDateToReadable(treatment?.completion_date) }}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm divide-y overflow-scroll min-h-96 max-h-96"
            v-else>
            <div v-for="(citizen, citizenIndex) in state.citizens?.data" :key="citizenIndex">
                <div v-for="(journal, journalIndex) in citizen?.citizen_journals" :key="journalIndex"
                    class="pl-4 pr-3 py-5 cursor-pointer hover:bg-gray-100"
                    @click="navigateTo(`/citizens/${citizen?.uuid}/journals`)" v-if="props?.viewAll">
                    <div class="flex gap-x-2">
                        <img :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname + ' ' + citizen?.lastname}`"
                            :class="[
                                citizen.latest_risk_assessment === null && 'border-secondary',
                                citizen.latest_risk_assessment?.assessment === 'no risk' && 'border-green-700',
                                citizen.latest_risk_assessment?.assessment === 'increased risk' && 'border-yellow-500',
                                citizen.latest_risk_assessment?.assessment === 'acute increased risk' && 'border-red-600',
                                'rounded-full w-12 h-12 object-cover border-2 border-secondary'
                            ]" />
                        <div>
                            <p class="text-sm font-medium text-primary">
                                {{ citizen?.firstname + ' ' + citizen?.lastname }}
                            </p>
                            <p class="text-xxs" v-if="journal?.user?.firstname && journal?.user?.lastname">
                                {{ $t('dailyOverview.createdBy') }}
                                {{ journal?.user?.firstname + ' ' +
                                    journal?.user?.lastname }}
                            </p>
                            <div class="px-1">
                                <h3 class="text-base font-semibold">
                                    {{ journal?.title }}
                                </h3>
                                <div v-html="journal?.content" class="table-responsive text-sm" />
                                <p class="content text-xs text-muted-400 mt-1">
                                    <span>{{ formatDateToReadable(journal?.date) }}</span>
                                </p>
                            </div>
                            <p class="text-xs ml-1">
                                {{ $t('dailyOverview.latestJournal.score') }}:
                                {{ journal?.score }}
                            </p>
                        </div>
                    </div>
                </div>
                <div v-else class="pl-4 pr-3 py-5 cursor-pointer hover:bg-gray-100"
                    @click="navigateTo(`/citizens/${citizen?.uuid}/journals`)">
                    <div class="flex gap-x-2">
                        <img :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname + ' ' + citizen?.lastname}`"
                            :class="[
                                citizen.latest_risk_assessment === null && 'border-secondary',
                                citizen.latest_risk_assessment?.assessment === 'no risk' && 'border-green-700',
                                citizen.latest_risk_assessment?.assessment === 'increased risk' && 'border-yellow-500',
                                citizen.latest_risk_assessment?.assessment === 'acute increased risk' && 'border-red-600',
                                'rounded-full w-12 h-12 object-cover border-2'
                            ]" />
                        <div>
                            <p class="text-sm font-medium text-primary">
                                {{ citizen?.firstname + ' ' + citizen?.lastname }}
                            </p>
                            <p class="text-xxs"
                                v-if="citizen?.citizen_journal?.user?.firstname && citizen?.citizen_journal?.user?.lastname">
                                {{ $t('dailyOverview.createdBy') }}
                                {{ citizen?.citizen_journal?.user?.firstname + ' ' +
                                    citizen?.citizen_journal?.user?.lastname }}
                            </p>
                            <div class="px-1">
                                <h3 class="text-base font-semibold">
                                    {{ citizen?.citizen_journal?.title }}
                                </h3>
                                <div v-html="citizen?.citizen_journal?.content" class="table-responsive text-sm" />
                                <p class="content text-xs text-muted-400 mt-1">
                                    <span>{{ formatDateToReadable(citizen?.citizen_journal?.date) }}</span>
                                </p>
                            </div>
                            <p class="text-xs ml-1">
                                {{ $t('dailyOverview.latestJournal.score') }}:
                                {{ citizen?.citizen_journal?.score }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div> -->
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const props = defineProps({
    dateRange: {
        type: Object,
        required: false,
    },
})

const departmentStore = useDepartmentStore()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    isPageLoading: false,
    treatments: [] as any,
    error: {} as Error,
})

watch(() => props.dateRange, () => {
    fetchTreatments()
}, { deep: true })

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchTreatments()
    }
})

onMounted(() => {
    fetchTreatments()
})

async function fetchTreatments() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName,
        }

        if (props.dateRange) {
            params.end_date = props.dateRange.end_date
            params.start_date = props.dateRange.start_date
        }
        const response = await dailyOverviewService.getTreatments(params)
        if (response) {
            state.treatments = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>