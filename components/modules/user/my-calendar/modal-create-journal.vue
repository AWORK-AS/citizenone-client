<template>
    <div>
        <Modal size="md" :title="$t('events.createJournalNote')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <form @submit.prevent="saveJournal" class="space-y-4">
                        <div class="grid md:grid-cols-2 gap-x-3">
                            <div class="md:col-span-2">
                                <button type="button" class="text-sm text-primary hover:text-primary-700"
                                    @click="state.usePredefinedTitle = !state.usePredefinedTitle">
                                    <span v-if="state.usePredefinedTitle">
                                        {{ $t('citizens.citizenJournals.form.enterJournalTitleManually') }}
                                    </span>
                                    <span v-else>
                                        {{ $t('citizens.citizenJournals.form.usePredefinedJournalTitle') }}
                                    </span>
                                </button>
                            </div>
                            <div class="space-y-1" v-if="state.usePredefinedTitle">
                                <div class="flex justify-between items-center py-0.5">
                                    <FormLabel for="journal_title" :label="$t('citizens.citizenJournals.form.title')" />
                                </div>
                                <FormSelect id="journal_title" v-model="state.formJournal.title"
                                    :options="state.options.journal_titles" />
                                <FormError :error="state.error?.errors?.title?.[0]" />
                            </div>
                            <div class="space-y-1" v-else>
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
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="journal_score"
                                :label="$t('citizens.citizenJournals.form.currentLevels.currentLevel')" />
                            <FormSelect id="journal_score" :options="state.options.scores"
                                v-model="state.formJournal.score" />
                            <FormError :error="state.error?.errors?.score?.[0]" />
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
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('citizens.citizenJournals.form.content') }}
                            </p>
                            <ckeditor :editor="editor" v-model="state.formJournal.content"
                                :config="editorConfig"></ckeditor>
                            <FormError :error="state.error?.errors?.content?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="journal_note_tags"
                                :label="$t('citizens.citizenJournals.form.journalNoteTags')" />
                            <FormSelectMultiple id="journal_note_tags" :options="state.options.journal_note_tags"
                                v-model="state.formJournal.journal_note_tags" />
                            <FormError :error="state.error?.errors?.journal_note_tags_uuid?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ customPagesStore.getCustomPagesName?.riskAssessment }}
                            </p>
                            <RadioGroup v-model="state.formJournal.assessment"
                                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <RadioGroupOption as="template" v-for="(assessment, index) in state.options.assessments"
                                    :key="index" :value="assessment.value" v-slot="{ active, checked }">
                                    <div :class="[
                                        active ? 'ring-1 ring-offset-2' : '',
                                        assessment.title === 'None' && 'ring-primary',
                                        assessment.title === 'No risk' && 'ring-green-700',
                                        assessment.title === 'Increased risk' && 'ring-yellow-500',
                                        assessment.title === 'Acute increased risk' && 'ring-red-600',
                                        checked && assessment.title === 'None' && 'bg-primary text-white ring-0 hover:bg-primary',
                                        checked && assessment.title === 'No risk' && 'bg-green-700 text-white ring-0 hover:bg-green-700',
                                        checked && assessment.title === 'Increased risk' && 'bg-yellow-500 text-white ring-0 hover:bg-yellow-500',
                                        checked && assessment.title === 'Acute increased risk' && 'bg-red-600 text-white ring-0 hover:bg-red-600',
                                        !active && !checked && assessment.title === 'None' && 'border border-primary ring-inset',
                                        !active && !checked && assessment.title === 'No risk' && 'border border-green-700 ring-inset',
                                        !active && !checked && assessment.title === 'Increased risk' && 'border border-yellow-500 ring-inset',
                                        !active && !checked && assessment.title === 'Acute increased risk' && 'border border-red-600 ring-inset',
                                        active && checked ? 'text-white ring-1' : '',
                                        'cursor-pointer flex items-center justify-center rounded-full px-2 py-2 text-xs']">
                                        <span v-if="assessment.title === 'None'">
                                            {{ $t('citizens.citizenJournals.form.risk.none') }}
                                        </span>
                                        <span v-if="assessment.title === 'No risk'">
                                            {{ $t('citizens.citizenJournals.form.risk.noRisk') }}
                                        </span>
                                        <span v-if="assessment.title === 'Increased risk'">
                                            {{ $t('citizens.citizenJournals.form.risk.increasedRisk') }}
                                        </span>
                                        <span v-if="assessment.title === 'Acute increased risk'">
                                            {{ $t('citizens.citizenJournals.form.risk.acuteIncreasedRisk') }}
                                        </span>
                                    </div>
                                </RadioGroupOption>
                            </RadioGroup>
                        </div>
                        <div class="space-y-1" v-if="state.formJournal.assessment !== null">
                            <p class="text-sm text-gray-600">
                                {{ $t('citizens.citizenJournals.form.note') }}
                            </p>
                            <ckeditor :editor="editor" v-model="state.formJournal.note"
                                :config="editorConfig"></ckeditor>
                            <FormError :error="state.error?.errors?.note?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="risk_assessment_tags"
                                :label="customPagesStore.getCustomPagesName?.riskAssessment + ' ' + $t('citizens.citizenJournals.form.tags')" />
                            <FormSelectMultiple id="risk_assessment_tags" :options="state.options.risk_assessment_tags"
                                v-model="state.formJournal.risk_assessment_tags" />
                            <FormError :error="state.error?.errors?.risk_assessment_tags_uuid?.[0]" />
                        </div>
                        <div>
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.formJournal.is_draft = !state.formJournal.is_draft">
                                <FormCheckbox id="is_draft" :value="state.formJournal.is_draft" />
                                {{ $t('citizens.citizenJournals.form.draft') }}
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
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { planService } from '@/components/api/user/PlanService'
import { goalService } from '@/components/api/user/GoalService'
import { subgoalService } from '@/components/api/user/SubgoalService'
import { journalNoteTagService } from '@/components/api/user/JournalNoteTagService'
import { journalTitleService } from '@/components/api/user/JournalTitleService'
import { useDepartmentStore } from '@/store/department'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const departmentStore = useDepartmentStore() as any
const customPagesStore = useCustomPagesStore() as any

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

const editor = ref(ClassicEditor)
const editorConfig = ref({
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        ]
    },
})

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    citizenUuid: '' as string,
    usePredefinedTitle: false,
    formJournal: {
        title: '',
        date: moment().format('YYYY-MM-DD'),
        score: '',
        content: '',
        journal_note_tags: [] as string[],
        is_draft: false,
        copy_journal_note_to_plan_or_goal_or_subgoal: false,
        journal_note_plan: '',
        journal_note_goal: '',
        journal_note_subgoal: '',
        assessment: null as any,
        note: '',
        risk_assessment_tags: [] as string[],
    },
    options: {
        scores: [
            { value: 1, label: `1. ${t('citizens.citizenJournals.form.currentLevels.minorChallenges')}` },
            { value: 2, label: `2. ${t('citizens.citizenJournals.form.currentLevels.moderateChallenges')}` },
            { value: 3, label: `3. ${t('citizens.citizenJournals.form.currentLevels.significantChallenges')}` },
            { value: 4, label: `4. ${t('citizens.citizenJournals.form.currentLevels.severeChallenges')}` },
            { value: 5, label: `5. ${t('citizens.citizenJournals.form.currentLevels.verySubstantialChallenges')}` },
        ],
        assessments: [
            { value: null, title: 'None' },
            { value: 'no risk', title: 'No risk' },
            { value: 'increased risk', title: 'Increased risk' },
            { value: 'acute increased risk', title: 'Acute increased risk' },
        ] as any[],
        plans: [] as any[],
        goals: [] as any[],
        subgoals: [] as any[],
        journal_titles: [] as any[],
        journal_note_tags: [] as any[],
        risk_assessment_tags: [] as any[],
    },
})

watch(() => props.isModalOpen, (newValue: boolean) => {
    if (newValue && props.selectedEvent) {
        resetForm()
        state.formJournal.title = props.selectedEvent.title || ''
        resolveCitizenUuid()
        if (state.citizenUuid) {
            fetchPlans()
            fetchJournalNoteTags()
            fetchJournalTitles()
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
    state.usePredefinedTitle = false
    state.formJournal = {
        title: '',
        date: moment().format('YYYY-MM-DD'),
        score: '',
        content: '',
        journal_note_tags: [],
        is_draft: false,
        copy_journal_note_to_plan_or_goal_or_subgoal: false,
        journal_note_plan: '',
        journal_note_goal: '',
        journal_note_subgoal: '',
        assessment: null,
        note: '',
        risk_assessment_tags: [],
    }
    state.options.plans = []
    state.options.goals = []
    state.options.subgoals = []
    state.options.journal_titles = []
    state.options.journal_note_tags = []
    state.options.risk_assessment_tags = []
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

async function fetchJournalNoteTags() {
    try {
        const response = await journalNoteTagService.getAllJournalNoteTags({
            department: departmentStore.getSelectedDepartmentName,
        })
        if (response?.data) {
            const tags = response.data.map((tag: any) => ({
                value: tag.uuid,
                label: tag.name,
            }))
            state.options.journal_note_tags = tags
            state.options.risk_assessment_tags = tags
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchJournalTitles() {
    try {
        const response = await journalTitleService.getAllJournalTitles()
        if (response?.data) {
            state.options.journal_titles = response.data.map((item: any) => ({
                value: item.title,
                label: item.title,
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
            score: state.formJournal.score,
            content: state.formJournal.content,
            journal_note_tags_uuid: state.formJournal.journal_note_tags,
            is_draft: state.formJournal.is_draft,
            copy_journal_note_to_plan_or_goal_or_subgoal: state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal,
            assessment: state.formJournal.assessment,
            risk_assessment_tags_uuid: state.formJournal.risk_assessment_tags,
        }
        if (state.formJournal.assessment !== null) {
            params.note = state.formJournal.note
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
