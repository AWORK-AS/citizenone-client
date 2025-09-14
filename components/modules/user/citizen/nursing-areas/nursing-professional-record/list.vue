<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="space-y-3">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="flex justify-end items-center mb-5 gap-x-2">
                <FormButton buttonStyle="action" class="rounded-lg"
                    @click="navigateTo(`/citizens/${citizenUuid}/nursing-areas/nursing-professional-records/new`)">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('citizens.nursingAreas.newNursingProfessionalRecords') }}
                </FormButton>
            </div>
            <div class="space-y-5">
                <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                    v-for="(record, index) in state.records?.data" :key="index">
                    <div class="flex flex-col md:flex-row gap-3 md:gap-10">
                        <div class="grow">
                            <p class="text-sm">
                                <span>{{ formatDateToReadable(record?.date) }}</span>
                            </p>
                            <p class="text-sm">
                                {{ $t('citizens.nursingAreas.table.reportedBy') }}:
                                {{ record?.user?.firstname + ' ' + record?.user?.lastname }}
                            </p>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
                                <Tooltip :text="$t('citizens.nursingAreas.table.actions.view')">
                                    <FormButton class="rounded-md" buttonSize="sm"
                                        @click="navigateTo(`/citizens/${citizenUuid}/nursing-areas/nursing-professional-records/${record.uuid}/view`)">
                                        <Icon name="ph:eye" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('citizens.nursingAreas.table.actions.statuses')">
                                    <FormButton class="rounded-md" buttonSize="sm" @click="viewStatuses(record)">
                                        <Icon name="ph:file" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('citizens.nursingAreas.table.actions.edit')">
                                    <FormButton class="rounded-md" buttonSize="sm"
                                        @click="navigateTo(`/citizens/${citizenUuid}/nursing-areas/nursing-professional-records/${record.uuid}/edit`)">
                                        <Icon name="ph:pencil-simple" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2 space-y-1">
                        <div class="space-y-3" :class="expandedRecords[index] ? '' : 'line-clamp-2'">
                            <div>
                                <p class="font-bold">
                                    {{ $t('citizens.nursingAreas.form.functionalLevel') }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.functional_level }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.functional_level_note" class="content" />
                                </p>
                            </div>
                            <div>
                                <p class="font-bold">
                                    {{ $t('citizens.nursingAreas.form.musculoskeletalSystem') }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.musculoskeletal_system }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.musculoskeletal_system_note" class="content" />
                                </p>
                            </div>
                            <div>
                                <p class="font-bold">
                                    {{ $t('citizens.nursingAreas.form.nutrition') }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.nutrition }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.nutrition_note" class="content" />
                                </p>
                            </div>
                            <div>
                                <p class="font-bold">
                                    {{ $t('citizens.nursingAreas.form.skinAndMucousMembranes')
                                    }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.skin_and_mucous_membranes }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.skin_and_mucous_membranes_note" class="content" />
                                </p>
                            </div>
                            <div>
                                <p class="font-bold">
                                    {{ $t('citizens.nursingAreas.form.communication') }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.communication }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.communication_note" class="content" />
                                </p>
                            </div>
                            <div>
                                <p class="font-bold">
                                    {{ $t('citizens.nursingAreas.form.psychosocialConditions')
                                    }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.psychosocial_conditions }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.psychosocial_conditions_note" class="content" />
                                </p>
                            </div>
                            <div>
                                <p class="font-bold">
                                    {{
                                        $t('citizens.nursingAreas.form.respirationAndCirculation')
                                    }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.respiration_and_circulation }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.respiration_and_circulation_note" class="content" />
                                </p>
                            </div>
                            <div>
                                <p class="font-bold">
                                    {{ $t('citizens.nursingAreas.form.sexuality') }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.sexuality }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.sexuality_note" class="content" />
                                </p>
                            </div>
                            <div>
                                <p class="font-bold">
                                    {{
                                        $t('citizens.nursingAreas.form.painAndSensoryImpressions')
                                    }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.pain_and_sensory_impressions }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.pain_and_sensory_impressions_note" class="content" />
                                </p>
                            </div>
                            <div>
                                <p class="font-bold">
                                    {{ $t('citizens.nursingAreas.form.sleepAndRest') }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.sleep_and_rest }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.sleep_and_rest_note" class="content" />
                                </p>
                            </div>
                            <div>
                                <p class="font-bold">
                                    {{ $t('citizens.nursingAreas.form.knowledgeAndDevelopment')
                                    }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.knowledge_and_development }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.knowledge_and_development_note" class="content" />
                                </p>
                            </div>
                            <div>
                                <p class="font-bold">
                                    {{ $t('citizens.nursingAreas.form.excretionOfWaste') }}
                                </p>
                                <p class="text-sm">
                                    {{ record?.excretion_of_waste }}
                                </p>
                                <p class="text-sm mt-4">
                                    <span class="font-bold">
                                        {{
                                            $t('citizens.nursingAreas.table.healthProfessionalDocumentation')
                                        }}:
                                    </span>
                                    <div v-html="record?.excretion_of_waste_note" class="content" />
                                </p>
                            </div>
                        </div>
                        <button @click="toggleExpanded(index)" class="mt-3 text-primary text-sm hover:text-primary-700">
                            {{ expandedRecords[index] ?
                                $t('showLess') :
                                $t('showMore') }}
                        </button>
                    </div>
                </div>
                <div v-if="state.records?.data?.length === 0">
                    <p class="text-center">
                        {{ $t('theresNoDataAvailableToDisplay') }}.
                    </p>
                </div>
                <Pagination :data="state.records" @previous="previous" @next="next" />
            </div>
        </div>
        <ModulesUserCitizenNursingAreasNursingProfessionalRecordStatusModalStatuses
            :isModalOpen="state.modal.isStatusOpen" :selectedRecord="state.selectedRecord"
            @close="state.modal.isStatusOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { nursingAreasService } from '@/components/api/user/NursingAreasService'
import type { Error } from '@/types'

const router = useRouter()
const { formatDateToReadable } = useDatetimeFormatter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const expandedRecords = reactive([] as boolean[])
let currentTablePage = 1

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    records: [] as any,
    selectedRecord: {},
    modal: {
        isStatusOpen: false
    },
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchNursingProfessionalRecords()
})

async function fetchNursingProfessionalRecords() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await nursingAreasService.getNursingProfessionalRecords(params)
        if (response) {
            state.records = response
            expandedRecords.splice(0, expandedRecords.length, ...response.data.map(() => false))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchNursingProfessionalRecords()
}

function next() {
    currentTablePage++
    fetchNursingProfessionalRecords()
}

function toggleExpanded(index: number) {
    expandedRecords[index] = !expandedRecords[index]
}

function viewStatuses(record: any) {
    state.selectedRecord = record
    state.modal.isStatusOpen = true
}
</script>