<template>
    <div>
        <ModalSideBySide sizeLeft="lg" sizeRight="sm" :titleLeft="$t('citizens.nursingAreas.statuses.newStatus')"
            :titleRight="$t('citizens.nursingAreas.nursingProfessionalRecords')" :show="props.isModalOpen"
            :showRightModal="true" @close="closeModal" @closeRightModal="closeModal">
            <template #modal-left>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenNursingAreasNursingProfessionalRecordStatusForm formType="create"
                        :selectedStatus="state.formStatus" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveStatus" />
                </LoadingSpinner>
            </template>
            <template #modal-right>
                <div class="space-y-4 overflow-auto max-h-[70vh]">
                    <div v-if="props.selectedRecord?.date" class="text-sm text-gray-600">
                        {{ formatDateToReadable(props.selectedRecord.date) }}
                        <span v-if="props.selectedRecord?.user">
                            &mdash;
                            {{ props.selectedRecord.user.firstname }}
                            {{ props.selectedRecord.user.lastname ?? '' }}
                        </span>
                    </div>
                    <div v-for="area in nursingAreas" :key="area.field">
                        <div v-if="props.selectedRecord?.[area.field] || props.selectedRecord?.[area.field + '_note']"
                            class="bg-white ring-1 ring-gray-200 rounded-md p-3 border-l-4 border-primary">
                            <p class="text-xs font-semibold text-gray-700 mb-1">
                                {{ area.label }}
                            </p>
                            <p v-if="props.selectedRecord?.[area.field]" class="text-xs text-gray-600 mb-1">
                                {{ props.selectedRecord[area.field] }}
                            </p>
                            <div v-if="props.selectedRecord?.[area.field + '_note']"
                                v-html="props.selectedRecord[area.field + '_note']"
                                class="content text-xs text-gray-600" />
                        </div>
                    </div>
                    <div v-if="!hasAnyAreaContent" class="text-center text-sm text-gray-400 py-4">
                        {{ $t('theresNoDataAvailableToDisplay') }}.
                    </div>
                </div>
            </template>
        </ModalSideBySide>
    </div>
</template>

<script setup lang="ts">
import { statusService } from '@/components/api/user/StatusService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedRecord: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshStatuses'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formStatus: {
        date: '',
        area_type: '',
        score: '',
        status: '',
        problem_status: '',
    },
})

const nursingAreas = computed(() => [
    { field: 'functional_level', label: t('citizens.nursingAreas.statuses.areaTypes.functionalLevel') },
    { field: 'musculoskeletal_system', label: t('citizens.nursingAreas.statuses.areaTypes.musculoskeletalSystem') },
    { field: 'nutrition', label: t('citizens.nursingAreas.statuses.areaTypes.nutrition') },
    { field: 'skin_and_mucous_membranes', label: t('citizens.nursingAreas.statuses.areaTypes.skinAndMucousMembranes') },
    { field: 'communication', label: t('citizens.nursingAreas.statuses.areaTypes.communication') },
    { field: 'psychosocial_conditions', label: t('citizens.nursingAreas.statuses.areaTypes.psychosocialConditions') },
    { field: 'respiration_and_circulation', label: t('citizens.nursingAreas.statuses.areaTypes.respirationAndCirculation') },
    { field: 'sexuality', label: t('citizens.nursingAreas.statuses.areaTypes.sexuality') },
    { field: 'pain_and_sensory_impressions', label: t('citizens.nursingAreas.statuses.areaTypes.painAndSensoryImpressions') },
    { field: 'sleep_and_rest', label: t('citizens.nursingAreas.statuses.areaTypes.sleepAndRest') },
    { field: 'knowledge_and_development', label: t('citizens.nursingAreas.statuses.areaTypes.knowledgeAndDevelopment') },
    { field: 'excretion_of_waste', label: t('citizens.nursingAreas.statuses.areaTypes.excretionOfWaste') },
])

const hasAnyAreaContent = computed(() =>
    nursingAreas.value.some(area =>
        props.selectedRecord?.[area.field] || props.selectedRecord?.[area.field + '_note']
    )
)

function closeModal() {
    emit('close')
}

function refreshStatuses() {
    emit('refreshStatuses')
}

async function saveStatus(statusDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {
            model_uuid: props.selectedRecord?.uuid,
            date: statusDetails.date,
            area_type: statusDetails.area_type,
            score: statusDetails.score,
            status: statusDetails.status,
            problem_status: statusDetails.problem_status,
        }
        const response = await statusService.saveStatus(params)
        if (response?.data) {
            refreshStatuses()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.statuses.alert.statusSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
