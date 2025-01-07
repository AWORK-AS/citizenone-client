<template>
    <div>
        <ModalSideBySide sizeLeft="lg" sizeRight="md" :titleLeft="$t('citizens.citizenJournals.newJournal')"
            :titleRight="$t('plansandgoals.currentPlansAndGoals')" :show="props.isModalOpen"
            :showRightModal="state.modal.showCurrentPlansAndGoals" @close="closeModal">
            <template #modal-left>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenJournalForm formType="create" :selectedJournal="state.formJournal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveJournal" />
                </LoadingSpinner>
            </template>
            <template #modal-right>
                <div class="space-y-5">
                    <div class="overflow-auto space-y-5" style="max-height: 56vh;">
                        <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                            v-for="(plan, index) in state.plans?.data" :key="index">
                            <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-10">
                                <div class="grow space-y-1">
                                    <div class="flex items-center gap-x-2">
                                        <div>
                                            <Badge :type="plan?.is_completed ? 'active' : 'primary'">
                                                <p class="text-xxs truncate">
                                                    {{ plan?.is_completed ? $t('plansandgoals.completed') :
                                                        $t('plansandgoals.inProgress') }}
                                                </p>
                                            </Badge>
                                        </div>
                                        <h3 class="text-lg font-semibold">
                                            {{ plan?.name }}
                                        </h3>
                                    </div>
                                    <div class="text-sm">
                                        <div v-html="plan?.description" class="content" />
                                    </div>
                                    <p class="text-sm">
                                        {{ $t('plansandgoals.dateCreated') }}: {{
                                            formatDateToReadable(plan?.created_at) }}
                                    </p>
                                    <p class="text-sm">
                                        <span v-if="plan?.is_completed">
                                            {{ $t('plansandgoals.dateCompleted') }}: {{
                                                formatDateToReadable(plan?.date_completed) }}
                                        </span>
                                        <span v-else>
                                            {{ $t('plansandgoals.completionDate') }}: {{
                                                formatDateToReadable(plan?.completion_date) }}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
                                        <FormButton class="rounded-md" buttonSize="sm" @click="viewPlan(plan)">
                                            <Icon name="ph:eye" class="size-4" />
                                            {{ $t('plansandgoals.table.actions.seeGoals') }}
                                        </FormButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="state.plans?.data?.length === 0">
                        <p class="text-center">
                            {{ $t('theresNoDataAvailableToDisplay') }}.
                        </p>
                    </div>
                    <Pagination :data="state.plans" @previous="previous" @next="next" />
                </div>
                <ModulesCitizenPlanGoalSlideOver :isOpen="state.slideOver.isGoalOpen" :selectedPlan="state.selectedPlan"
                    @close="state.slideOver.isGoalOpen = false" />
            </template>
        </ModalSideBySide>
    </div>
</template>


<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { planService } from '@/components/api/PlanService'
import { journalService } from '@/components/api/JournalService'
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
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshJournal'])
let currentTablePage = 1

watch(() => props.isModalOpen, (newValue: any) => {
    if (newValue) {
        fetchPlans()
    }
})

const state = reactive({
    dataFilter: [],
    error: {} as Error,
    isPageLoading: false,
    formJournal: {
        id: '',
        uuid: '',
        content: '',
        date: '',
        copy_journal_note_to_plan_or_goal: false,
        copy_risk_assessment_to_plan_or_goal: false,
        title: '',
        is_draft: false,
        assessment: null,
        note: '',
        score: 1
    },
    modal: {
        showCurrentPlansAndGoals: false,
    },
    plans: [] as any,
    selectedPlan: [] as any,
    slideOver: {
        isGoalOpen: false
    },
    sortData: {
        sortField: 'completion_date',
        sortOrder: 'descend',
    },
})

function closeModal() {
    emit('close')
}

function refreshJournal() {
    emit('refreshJournal')
}

async function fetchPlans() {
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
        const response = await planService.getPlans(params)
        if (response) {
            state.plans = response
            if (state.plans?.data?.length > 0) {
                state.modal.showCurrentPlansAndGoals = true
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchPlans()
}

function next() {
    currentTablePage++
    fetchPlans()
}

function viewPlan(plan: any) {
    state.selectedPlan = plan
    state.slideOver.isGoalOpen = true
}

async function saveJournal(journalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            title: journalDetails.title,
            date: journalDetails.date,
            copy_journal_note_to_plan_or_goal: journalDetails.copy_journal_note_to_plan_or_goal,
            copy_risk_assessment_to_plan_or_goal: journalDetails.copy_risk_assessment_to_plan_or_goal,
            content: journalDetails.content,
            is_draft: journalDetails.is_draft,
            assessment: journalDetails.assessment,
            note: journalDetails.note,
            score: journalDetails.score,
        }
        const response = await journalService.saveJournal(params)
        if (response?.data) {
            refreshJournal()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>