<template>
    <div>
        <div class="pt-1 space-y-5">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="space-y-5">
                <div class="mt-24 bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                    v-for="(goal, index) in state.goals?.data" :key="index">
                    <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-10">
                        <div class="grow space-y-1">
                            <div class="flex items-center gap-x-2">
                                <div>
                                    <Badge :type="goal?.is_completed ? 'active' : 'primary'">
                                        <p class="text-xxs truncate">
                                            {{ goal?.is_completed ? $t('citizens.treatments.table.completed') :
                                                $t('citizens.treatments.table.inProgress') }}
                                        </p>
                                    </Badge>
                                </div>
                                <h3 class="text-lg font-semibold">
                                    {{ goal?.title }}
                                </h3>
                            </div>
                            <div class="text-sm">
                                <div v-html="goal?.description" class="content" />
                            </div>
                            <div class="mt-1">
                                <Badge type="primary" class="w-fit" v-if="goal.score">
                                    <p class="text-xxs" v-if="goal.score == 1">
                                        {{
                                            $t('citizens.treatments.table.expectedLevels.minorChallenges')
                                        }}
                                    </p>
                                    <p class="text-xxs" v-if="goal.score == 2">
                                        {{
                                            $t('citizens.treatments.table.expectedLevels.moderateChallenges')
                                        }}
                                    </p>
                                    <p class="text-xxs" v-if="goal.score == 3">
                                        {{
                                            $t('citizens.treatments.table.expectedLevels.significantChallenges')
                                        }}
                                    </p>
                                    <p class="text-xxs" v-if="goal.score == 4">
                                        {{
                                            $t('citizens.treatments.table.expectedLevels.severeChallenges')
                                        }}
                                    </p>
                                    <p class="text-xxs" v-if="goal.score == 5">
                                        {{
                                            $t('citizens.treatments.table.expectedLevels.verySubstantialChallenges')
                                        }}
                                    </p>
                                </Badge>
                            </div>
                            <p class="text-sm">
                                {{ $t('citizens.treatments.table.dateCreated') }}: {{
                                    formatDateToReadable(goal?.created_at) }}
                            </p>
                            <p class="text-sm">
                                <span v-if="goal?.is_completed">
                                    {{ $t('citizens.treatments.table.dateCompleted') }}: {{
                                        formatDateToReadable(goal?.date_completed) }}
                                </span>
                                <span v-else>
                                    {{ $t('citizens.treatments.table.completionDate') }}: {{
                                        formatDateToReadable(goal?.id) }}
                                </span>
                            </p>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
                                <FormButton class="rounded-md" buttonSize="sm" @click="editTreatment(goal)">
                                    <Icon name="ph:pencil-duotone" class="size-4" />
                                    {{ $t('citizens.treatments.table.actions.edit') }}
                                </FormButton>
                                <FormButton class="rounded-md" buttonSize="sm" @click="viewStatuses(goal)">
                                    <Icon name="ph:check-square-offset" class="size-4" />
                                    {{ $t('citizens.treatments.table.actions.statuses') }}
                                </FormButton>
                                <FormButton class="rounded-md" buttonSize="sm" @click="confirmTreatmentDeletion(goal)"
                                    v-if="goal?.is_deletable">
                                    <Icon name="heroicons:trash" class="size-4" />
                                    {{ $t('citizens.treatments.table.actions.delete') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="state.goals?.data?.length === 0">
                    <p class="text-center text-sm mt-48">
                        {{ $t('theresNoDataAvailableToDisplay') }}.
                    </p>
                </div>
                <Pagination :data="state.goals" @previous="previous" @next="next" />
            </div>
            <ModulesCitizenTreatmentModalNew :isModalOpen="state.modal.isAddTreatmentOpen"
                @close="state.modal.isAddTreatmentOpen = false" @refreshTreatments="fetchNursingAreaTreatments" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { nursingAreaGoalService } from '@/components/api/NursingAreaGoalService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
let currentTablePage = 1

const state = reactive({
    dataFilter: [],
    error: {} as Error,
    isPageLoading: false,
    goals: [] as any,
    modal: {
        isAddTreatmentOpen: false,
        isDeleteTreatmentOpen: false,
        isEditTreatmentOpen: false,
        isStatusesOpen: false,
    },
    selectedTreatment: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchNursingAreaTreatments()
})

async function fetchNursingAreaTreatments() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await nursingAreaGoalService.getNursingAreaGoals(params)
        if (response) {
            state.goals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function resetFilter() {
    currentTablePage = 1
    state.dataFilter = []
    state.sortData = {
        sortField: 'date',
        sortOrder: 'descend',
    }
    fetchNursingAreaTreatments()
}

function previous() {
    currentTablePage--
    fetchNursingAreaTreatments()
}

function next() {
    currentTablePage++
    fetchNursingAreaTreatments()
}

function editTreatment(goal: any) {
    state.selectedTreatment = goal
    state.modal.isEditTreatmentOpen = true
}

function viewStatuses(goal: any) {
    state.selectedTreatment = goal
    state.modal.isStatusesOpen = true
}

function closeEditTreatmentModal() {
    state.modal.isEditTreatmentOpen = false
    state.selectedTreatment = {}
}

function closeStatusesModal() {
    state.modal.isStatusesOpen = false
    state.selectedTreatment = []
}

function confirmTreatmentDeletion(goal: any) {
    state.selectedTreatment = goal
    state.modal.isDeleteTreatmentOpen = true
}

async function deleteTreatment() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await nursingAreaGoalService.deleteNursingAreaGoal(state.selectedTreatment.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            if (state.goals?.data?.length === 1) {
                resetFilter()
            } else {
                fetchNursingAreaTreatments()
            }
            successAlert(`${t('alert.success')}!`, `${t('citizens.treatments.alert.treatmentSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>