<template>
    <div>
        <Modal size="sm" :title="$t('events.createJournalNote')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <form @submit.prevent="saveJournal" class="space-y-4">
                        <div class="space-y-1">
                            <FormLabel for="journal_title" :label="$t('citizens.citizenJournals.form.title')" />
                            <FormTextField id="journal_title" name="journal_title"
                                :placeholder="$t('citizens.citizenJournals.form.title')"
                                v-model="state.formJournal.title" />
                            <FormError :error="state.error?.errors?.title?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="journal_date" :label="$t('citizens.citizenJournals.form.date')" />
                            <FormDateField id="journal_date" name="journal_date" placeholder="Date"
                                v-model="state.formJournal.date" />
                            <FormError :error="state.error?.errors?.date?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="journal_content" :label="$t('events.journalNote.form.content')" />
                            <FormTextArea id="journal_content" name="journal_content"
                                :placeholder="$t('events.journalNote.form.content')"
                                v-model="state.formJournal.content" rows="5" />
                            <FormError :error="state.error?.errors?.content?.[0]" />
                        </div>
                        <div v-if="state.citizenUuid">
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal = !state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal">
                                <FormCheckbox id="copy_to_plan"
                                    :value="state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal" />
                                {{ $t('citizens.citizenJournals.form.copyJournalNoteToPlanOrGoalOrSubgoal') }}
                            </div>
                        </div>
                        <div class="grid md:grid-cols-3 gap-x-3"
                            v-if="state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal && state.citizenUuid">
                            <div class="space-y-1">
                                <FormLabel for="journal_note_plan"
                                    :label="$t('citizens.citizenJournals.form.plan')" />
                                <FormSelect id="journal_note_plan" :options="state.options.plans"
                                    v-model="state.formJournal.journal_note_plan"
                                    @change="(uuid: any) => fetchGoalsForPlan(uuid)" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="journal_note_goal"
                                    :label="$t('citizens.citizenJournals.form.goal')" />
                                <FormSelect id="journal_note_goal" :options="state.options.goals"
                                    v-model="state.formJournal.journal_note_goal"
                                    @change="(uuid: any) => fetchSubgoalsForGoal(uuid)" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="journal_note_subgoal"
                                    :label="$t('citizens.citizenJournals.form.subgoal')" />
                                <FormSelect id="journal_note_subgoal" :options="state.options.subgoals"
                                    v-model="state.formJournal.journal_note_subgoal" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3 mt-6">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { planService } from '@/components/api/user/PlanService'
import { goalService } from '@/components/api/user/GoalService'
import { subgoalService } from '@/components/api/user/SubgoalService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEvent: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'journalCreated'])

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    citizenUuid: '' as string,
    formJournal: {
        title: '',
        date: moment().format('YYYY-MM-DD'),
        content: '',
        copy_journal_note_to_plan_or_goal_or_subgoal: false,
        journal_note_plan: '',
        journal_note_goal: '',
        journal_note_subgoal: '',
    },
    options: {
        plans: [] as any[],
        goals: [] as any[],
        subgoals: [] as any[],
    },
})

watch(() => props.isModalOpen, (newValue: boolean) => {
    if (newValue && props.selectedEvent) {
        resetForm()
        state.formJournal.title = props.selectedEvent.title || ''
        resolveCitizenUuid()
        if (state.citizenUuid) {
            fetchPlans()
        }
    }
})

function resolveCitizenUuid() {
    const event = props.selectedEvent
    const citizenOwner = event?.calendar_owners?.find(
        (o: any) => o.owner_type === 'App\\Models\\Citizen'
    )
    state.citizenUuid = citizenOwner?.owner?.uuid || ''
}

function resetForm() {
    state.error = {}
    state.formJournal = {
        title: '',
        date: moment().format('YYYY-MM-DD'),
        content: '',
        copy_journal_note_to_plan_or_goal_or_subgoal: false,
        journal_note_plan: '',
        journal_note_goal: '',
        journal_note_subgoal: '',
    }
    state.options.plans = []
    state.options.goals = []
    state.options.subgoals = []
}

async function fetchPlans() {
    try {
        const response = await planService.getAllPlans(state.citizenUuid)
        if (response?.data) {
            state.options.plans = response.data.map((plan: any) => ({
                value: plan.uuid,
                label: plan.name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchGoalsForPlan(planUuid: string) {
    state.formJournal.journal_note_goal = ''
    state.formJournal.journal_note_subgoal = ''
    state.options.goals = []
    state.options.subgoals = []
    if (!planUuid) return
    try {
        const response = await goalService.getAllGoalsPerPlan(planUuid)
        if (response?.data) {
            state.options.goals = response.data.map((goal: any) => ({
                value: goal.uuid,
                label: goal.name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchSubgoalsForGoal(goalUuid: string) {
    state.formJournal.journal_note_subgoal = ''
    state.options.subgoals = []
    if (!goalUuid) return
    try {
        const response = await subgoalService.getAllSubgoals(goalUuid)
        if (response?.data) {
            state.options.subgoals = response.data.map((subgoal: any) => ({
                value: subgoal.uuid,
                label: subgoal.name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function saveJournal() {
    state.error = {}
    state.isPageLoading = true
    try {
        const uuid = props.selectedEvent?.uuid
        const journal_note_plan_goal_subgoal_uuid =
            state.formJournal.journal_note_subgoal ||
            state.formJournal.journal_note_goal ||
            state.formJournal.journal_note_plan ||
            ''

        const params: any = {
            title: state.formJournal.title,
            date: state.formJournal.date,
            content: state.formJournal.content,
            copy_journal_note_to_plan_or_goal_or_subgoal: state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal,
        }
        if (state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal && journal_note_plan_goal_subgoal_uuid) {
            params.journal_note_plan_goal_subgoal_uuid = journal_note_plan_goal_subgoal_uuid
        }

        const response = await myCalendarService.createJournalFromEvent(uuid, params)
        if (response?.data) {
            emit('journalCreated')
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('events.alert.journalSuccessfullyCreated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function closeModal() {
    emit('close')
}
</script>
