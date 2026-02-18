<template>
    <form @submit.prevent="state.isAutoSaving = false; state.hasChanges = true; submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="space-y-3">
            <div v-if="state.isAutoSaving" class="flex items-center gap-x-1">
                <Icon name="ph:spinner" class="w-5 h-5 spin" />
                <div>
                    <span class="text-base">
                        {{ $t('saving') }}
                    </span>
                    <span class="dot1">.</span>
                    <span class="dot2">.</span>
                    <span class="dot3">.</span>
                    <span class="dot4">.</span>
                    <span class="dot5">.</span>
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-x-3">
                <div class="md:col-span-2">
                    <button type="button" class="text-sm text-primary hover:text-primary-700"
                        @click="state.usePredefinedJournalTitle = !state.usePredefinedJournalTitle">
                        <span v-if="state.usePredefinedJournalTitle">
                            {{ $t('citizens.citizenJournals.form.enterJournalTitleManually') }}
                        </span>
                        <span v-else>
                            {{ $t('citizens.citizenJournals.form.usePredefinedJournalTitle') }}
                        </span>
                    </button>
                </div>
                <div class="space-y-1" v-if="state.usePredefinedJournalTitle">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="predefined_title" :label="$t('citizens.citizenJournals.form.title')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddJournalTitleOpen = true">
                            {{ $t('journalTitles.addNewJournalTitle') }}
                        </span>
                    </div>
                    <FormSelect id="predefined_title" v-model="state.formJournal.title"
                        :options="state.options.journal_titles" />
                    <FormError :error="v$?.formJournal?.title?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.title?.[0]" />
                </div>
                <div class="space-y-1" v-else>
                    <FormLabel for="title" :label="$t('citizens.citizenJournals.form.title')" />
                    <FormTextField id="title" name="title" :placeholder="$t('citizens.citizenJournals.form.title')"
                        v-model="state.formJournal.title" />
                    <FormError :error="v$?.formJournal?.title?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.title?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date" :label="$t('citizens.citizenJournals.form.date')" />
                    <FormDateField id="date" name="date" placeholder="Date" v-model="state.formJournal.date" />
                    <FormError :error="v$?.formJournal?.date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="score" :label="$t('citizens.citizenJournals.form.currentLevels.currentLevel')" />
                <FormSelect id="score" :options="state.options.scores" v-model="state.formJournal.score" />
                <FormError :error="v$?.formJournal?.score?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.score?.[0]" />
            </div>
            <div v-if="props.formType === 'create'">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal = !state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal">
                    <FormCheckbox id="copy_journal_note_to_plan_or_goal_or_subgoal"
                        :value="state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal" />
                    {{ $t('citizens.citizenJournals.form.copyJournalNoteToPlanOrGoalOrSubgoal') }}
                </div>
            </div>
            <div class="grid md:grid-cols-3 gap-x-3"
                v-if="state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal">
                <div class="space-y-1">
                    <FormLabel for="journal_note_plan" :label="$t('citizens.citizenJournals.form.plan')" />
                    <FormSelect id="journal_note_plan" :options="state.options.journal_note_plans"
                        v-model="state.formJournal.journal_note_plan"
                        @change="(journalNotePlanUuid: any) => fetchAllGoalsForJournalNote(journalNotePlanUuid)" />
                    <FormError :error="v$?.formJournal?.journal_note_plan?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.journal_note_plan?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="journal_note_goal" :label="$t('citizens.citizenJournals.form.goal')" />
                    <FormSelect id="journal_note_goal" :options="state.options.journal_note_goals"
                        v-model="state.formJournal.journal_note_goal"
                        @change="(journalNoteGoalUuid: any) => fetchAllSubgoalsForJournalNote(journalNoteGoalUuid)" />
                    <FormError :error="v$?.formJournal?.journal_note_goal?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.journal_note_goal?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="journal_note_subgoals" :label="$t('citizens.citizenJournals.form.subgoal')" />
                    <FormSelect id="journal_note_subgoals" :options="state.options.journal_note_subgoals"
                        v-model="state.formJournal.journal_note_subgoal" />
                    <FormError :error="v$?.formJournal?.journal_note_subgoals?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.journal_note_subgoals?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <!-- task 523-->
                <div class="flex items-center">
                    <p class="text-sm text-gray-600">
                        {{ $t('citizens.citizenJournals.form.content') }}
                    </p>
                    <div class="flex-1 flex items-center gap-x-4 justify-end">
                        <button type="button" class="text-sm text-primary hover:text-primary-700"
                            @click="state.modal.isSelectJournalContent = true">
                            <span>
                                {{ $t('citizens.citizenJournals.form.usePredefinedcontent') }}
                            </span>
                        </button>
                        <div>
                            <input ref="contentFileInput" type="file" @change="handleContentFileChange"
                                class="hidden" />
                            <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                                @click="triggerContentFileInput">
                                <div class="flex items-center">
                                    <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                </div>
                                {{ $t('citizens.citizenJournals.form.attachFile') }}
                            </div>
                        </div>
                        <FormButton buttonStyle="AI" buttonSize="xs" class="px-4"
                            v-if="userStore.getUser?.has_ai_access" @click="generateNoteForJournalContent">
                            <div class="flex items-center">
                                <Icon name="ph:arrows-clockwise" class="h-4 w-4" aria-hidden="true" />
                            </div>
                            {{ $t('citizens.citizenJournals.form.prepareWithAI') }}
                        </FormButton>
                    </div>
                </div>
                <ckeditor :editor="editor" v-model="state.formJournal.content" :config="editorContentConfig"></ckeditor>
                <FormError :error="v$?.formJournal?.content?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.content?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="journal_note_tags" :label="$t('citizens.citizenJournals.form.journalNoteTags')" />
                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                        @click="state.modal.isAddJournalNoteTagsOpen = true">
                        {{ $t('journalNoteTags.addNewTag') }}
                    </span>
                </div>
                <FormSelectMultiple id="journal_note_tags" :options="state.options.journal_note_tags"
                    v-model="state.formJournal.journal_note_tags" />
                <FormError :error="v$?.formJournal?.journal_note_tags?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.journal_note_tags_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ customPagesStore.getCustomPagesName?.riskAssessment }}
                </p>
                <div>
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
                                'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
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
            </div>
            <div class="space-y-1 text-xs">
                <div v-if="state.formJournal.assessment === 'no risk' && citizenStore.getSelectedCitizen?.green"
                    class="bg-green-700 text-white px-4 py-3 rounded-md">
                    {{ citizenStore.getSelectedCitizen?.firstname }}
                    {{ citizenStore.getSelectedCitizen?.lastname }}
                    <span class="lowercase">
                        {{ citizenStore.getSelectedCitizen?.green }}.
                    </span>
                </div>
                <div v-if="state.formJournal.assessment === 'increased risk' && citizenStore.getSelectedCitizen?.yellow"
                    class="bg-yellow-500 text-white px-4 py-3 rounded-md">
                    {{ citizenStore.getSelectedCitizen?.firstname }}
                    {{ citizenStore.getSelectedCitizen?.lastname }}
                    <span class="lowercase">
                        {{ citizenStore.getSelectedCitizen?.yellow }}.
                    </span>
                </div>
                <div v-if="state.formJournal.assessment === 'acute increased risk' && citizenStore.getSelectedCitizen?.red"
                    class="bg-red-600 text-white px-4 py-3 rounded-md">
                    {{ citizenStore.getSelectedCitizen?.firstname }}
                    {{ citizenStore.getSelectedCitizen?.lastname }}
                    <span class="lowercase">
                        {{ citizenStore.getSelectedCitizen?.red }}.
                    </span>
                </div>
            </div>
            <div class="space-y-1" v-if="state.formJournal.assessment !== null">
                <div class="flex items-center">
                    <p class="text-sm text-gray-600">
                        {{ $t('citizens.citizenJournals.form.note') }}
                    </p>
                    <div class="flex-1 flex items-center gap-x-4 justify-end">
                        <input ref="riskAssessmentFileInput" type="file" @change="handleRiskAssessmentFileChange"
                            class="hidden" />
                        <div class="w-fit flex gap-2 item-center text-end text-sm cursor-pointer text-primary hover:text-primary-700"
                            @click="triggerRiskAssessmentFileInput">
                            <div class="flex items-center">
                                <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                            </div>
                            {{ $t('citizens.citizenJournals.form.attachFile') }}
                        </div>
                        <FormButton buttonStyle="AI" buttonSize="xs" class="px-4"
                            v-if="userStore.getUser?.has_ai_access" @click="generateNoteForRiskAssessmentNote">
                            <div class="flex items-center">
                                <Icon name="ph:arrows-clockwise" class="h-4 w-4" aria-hidden="true" />
                            </div>
                            {{ $t('citizens.citizenJournals.form.prepareWithAI') }}
                        </FormButton>
                    </div>
                </div>
                <ckeditor :editor="editor" v-model="state.formJournal.note" :config="editorNoteConfig"></ckeditor>
                <FormError :error="v$?.formJournal?.note?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.note?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="risk_assessment_tags"
                        :label="customPagesStore.getCustomPagesName?.riskAssessment + ' ' + $t('citizens.citizenJournals.form.tags')" />
                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                        @click="state.modal.isAddJournalNoteTagsOpen = true">
                        {{ $t('journalNoteTags.addNewTag') }}
                    </span>
                </div>
                <FormSelectMultiple id="risk_assessment_tags" :options="state.options.risk_assessment_tags"
                    v-model="state.formJournal.risk_assessment_tags" />
                <FormError :error="v$?.formJournal?.risk_assessment_tags?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.risk_assessment_tags_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formJournal.copy_risk_assessment_to_plan_or_goal_or_subgoal = !state.formJournal.copy_risk_assessment_to_plan_or_goal_or_subgoal"
                    v-if="props.formType === 'create' && state.formJournal.assessment !== null">
                    <FormCheckbox id="copy_risk_assessment_to_plan_or_goal_or_subgoal"
                        :value="state.formJournal.copy_risk_assessment_to_plan_or_goal_or_subgoal" />
                    {{ $t('citizens.citizenJournals.form.copyRiskAssessmentToPlanOrGoalOrSubgoal') }}
                </div>
            </div>
            <div class="grid md:grid-cols-3 gap-x-3"
                v-if="state.formJournal.copy_risk_assessment_to_plan_or_goal_or_subgoal">
                <div class="space-y-1">
                    <FormLabel for="risk_assessment_plan" :label="$t('citizens.citizenJournals.form.plan')" />
                    <FormSelect id="risk_assessment_plan" :options="state.options.risk_assessment_plans"
                        v-model="state.formJournal.risk_assessment_plan"
                        @change="(RiskAssessmentPlanUuid: any) => fetchAllGoalsForRiskAssessment(RiskAssessmentPlanUuid)" />
                    <FormError :error="v$?.formJournal?.risk_assessment_plan?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.risk_assessment_plan?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="risk_assessment_goal" :label="$t('citizens.citizenJournals.form.goal')" />
                    <FormSelect id="risk_assessment_goal" :options="state.options.risk_assessment_goals"
                        v-model="state.formJournal.risk_assessment_goal"
                        @change="(RiskAssessmentGoalUuid: any) => fetchAllSubgoalsForRiskAssessment(RiskAssessmentGoalUuid)" />
                    <FormError :error="v$?.formJournal?.risk_assessment_goal?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.risk_assessment_goal?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="risk_assessment_subgoals" :label="$t('citizens.citizenJournals.form.subgoal')" />
                    <FormSelect id="risk_assessment_subgoals" :options="state.options.risk_assessment_subgoals"
                        v-model="state.formJournal.risk_assessment_subgoal" />
                    <FormError :error="v$?.formJournal?.risk_assessment_subgoals?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.risk_assessment_subgoals?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formJournal.is_draft = !state.formJournal.is_draft">
                    <FormCheckbox id="is_draft" :value="state.formJournal.is_draft" />
                    {{ $t('citizens.citizenJournals.form.draft') }}
                </div>
            </div>
            <div class="space-y-3" v-if="userStore?.getUser?.industry === 'Dentists and dental hygienists'">
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formJournal.is_for_teeth = !state.formJournal.is_for_teeth">
                        <FormCheckbox id="is_for_teeth" :value="state.formJournal.is_for_teeth" />
                        {{ $t('citizens.citizenJournals.form.forTeeth') }}
                    </div>
                </div>
                <div class="space-y-1" v-if="state.formJournal.is_for_teeth">
                    <FormLabel for="teeth" :label="$t('citizens.citizenJournals.form.teeth')" />
                    <FormSelectMultiple id="teeth" :options="state.options.teeth" v-model="state.formJournal.teeth" />
                    <FormError :error="v$?.formJournal?.teeth?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.teeth_uuid?.[0]" />
                </div>
                <div class="flex items-center justify-center" v-if="state.formJournal.is_for_teeth">
                    <img src="/img/journal/tooth-chart.png" alt="Tooth chart">
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                    {{ props.formType === 'create' ? $t('save') : $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesUserJournalTitleModalNew :isModalOpen="state.modal.isAddJournalTitleOpen"
            @close="state.modal.isAddJournalTitleOpen = false" @refreshJournalTitles="fetchAllJournalTitles" />
        <ModulesUserJournalNoteTagModalNew :isModalOpen="state.modal.isAddJournalNoteTagsOpen"
            @close="state.modal.isAddJournalNoteTagsOpen = false" @refreshJournalNoteTags="fetchAllJournalNoteTags" />

        <ModulesUserJournalContentModalSelect :isModalOpen="state.modal.isSelectJournalContent"
            @close="state.modal.isSelectJournalContent = false" @select="onSelectJournalContent" />

        <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen"
            :title="$t('citizens.documents.upgradeStorage')"
            :message="state.error?.message + ' ' + $t('citizens.documents.confirmation.upgradeStorageConfirmation') + '?'"
            @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
    </form>
</template>

<script setup lang="ts">
import { aIAssistantService } from '@/components/api/user/AIAssistantService'
import { journalService } from '@/components/api/user/JournalService'
import { journalNoteTagService } from '@/components/api/user/JournalNoteTagService'
import { journalTitleService } from '@/components/api/user/JournalTitleService'
import { teethService } from '@/components/api/user/TeethService'
import { planService } from '@/components/api/user/PlanService'
import { goalService } from '@/components/api/user/GoalService'
import { subgoalService } from '@/components/api/user/SubgoalService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useCitizenStore } from '@/store/citizen'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedJournal: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])
const citizenStore = useCitizenStore() as any
const departmentStore = useDepartmentStore() as any
const userStore = useUserStore() as any
const language = useI18n()

const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const contentFileInput = ref(null) as any
const riskAssessmentFileInput = ref(null) as any
let autoSaveInterval = null as any
let isInitialized = true
let suppressChangeTracking = true

const editor = ref(ClassicEditor)
const editorContentConfig = ref({
    // Add your custom configuration here
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'imageUpload'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
        ]
    },
    extraPlugins: [ContentUploadAdapterPlugin],
    height: 500  // Set the editor height here
}) as any
const editorNoteConfig = ref({
    // Add your custom configuration here
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'imageUpload'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
        ]
    },
    extraPlugins: [NoteUploadAdapterPlugin],
    height: 500  // Set the editor height here
}) as any

const state = reactive({
    isAutoSaving: false,
    error: {} as Error,
    formJournal: {
        id: '',
        uuid: '',
        content: '',
        journal_note_tags: [],
        date: '',
        copy_journal_note_to_plan_or_goal_or_subgoal: false,
        journal_note_plan: '',
        journal_note_goal: '',
        journal_note_subgoal: '',
        copy_risk_assessment_to_plan_or_goal_or_subgoal: false,
        risk_assessment_plan: '',
        risk_assessment_goal: '',
        risk_assessment_subgoal: '',
        title: '',
        is_draft: false,
        assessment: null,
        note: '',
        risk_assessment_tags: [],
        score: '',
        teeth: [],
        is_for_teeth: false,
    } as any,
    hasChanges: false,
    modal: {
        isAddJournalNoteTagsOpen: false,
        isAddJournalTitleOpen: false,
        isUpgradeStorageOpen: false,
        isSelectJournalContent: false,
    },
    options: {
        assessments: [
            { value: null, title: 'None' },
            { value: 'no risk', title: 'No risk' },
            { value: 'increased risk', title: 'Increased risk' },
            { value: 'acute increased risk', title: 'Acute increased risk' },
        ] as any,
        scores: [
            { value: 1, label: `1. ${t('citizens.citizenJournals.form.currentLevels.minorChallenges')}` },
            { value: 2, label: `2. ${t('citizens.citizenJournals.form.currentLevels.moderateChallenges')}` },
            { value: 3, label: `3. ${t('citizens.citizenJournals.form.currentLevels.significantChallenges')}` },
            { value: 4, label: `4. ${t('citizens.citizenJournals.form.currentLevels.severeChallenges')}` },
            { value: 5, label: `5. ${t('citizens.citizenJournals.form.currentLevels.verySubstantialChallenges')}` },
        ],
        journal_note_plans: [],
        journal_note_goals: [],
        journal_note_subgoals: [],
        journal_titles: [],
        risk_assessment_plans: [],
        risk_assessment_goals: [],
        risk_assessment_subgoals: [],
        journal_note_tags: [],
        risk_assessment_tags: [],
        score: [
            { value: 1, label: 1 },
            { value: 2, label: 2 },
            { value: 3, label: 3 },
            { value: 4, label: 4 },
            { value: 5, label: 5 },
        ],
        teeth: [],
    },
    usePredefinedJournalTitle: false,
    userPredefinedContents: false,
})

onMounted(() => {
    suppressChangeTracking = true

    fetchAllPlans()
    fetchAllGoalsForJournalNote()
    fetchAllGoalsForRiskAssessment()
    fetchAllJournalNoteTags()
    fetchAllJournalTitles()
    fetchAllTeeth()
    // setFormJournalFromSelected(props.selectedJournal)
    // state.formJournal = {
    //     id: props.selectedJournal.id,
    //     uuid: props.selectedJournal.uuid,
    //     content: props.selectedJournal.content ?? '',
    //     journal_note_tags: [],
    //     date: props.selectedJournal.date,
    //     copy_journal_note_to_plan_or_goal_or_subgoal: props.selectedJournal.copy_journal_note_to_plan_or_goal_or_subgoal,
    //     journal_note_plan: '',
    //     journal_note_goal: '',
    //     journal_note_subgoal: '',
    //     copy_risk_assessment_to_plan_or_goal_or_subgoal: props.selectedJournal.copy_risk_assessment_to_plan_or_goal_or_subgoal,
    //     risk_assessment_plan: '',
    //     risk_assessment_goal: '',
    //     risk_assessment_subgoal: '',
    //     title: props.selectedJournal.title,
    //     is_draft: props.selectedJournal.is_draft,
    //     assessment: props.selectedJournal.assessment,
    //     note: props.selectedJournal.note === null ? '' : props.selectedJournal.note,
    //     risk_assessment_tags: [],
    //     score: props.selectedJournal.score,
    //     is_for_teeth: props.selectedJournal.teeth ? true : false,
    //     teeth: [],
    // }
    // props.selectedJournal.journal_tags?.forEach((journalTag: any) => {
    //     state.formJournal.journal_note_tags.push(journalTag?.uuid)
    // })
    // props.selectedJournal.risk_tags?.forEach((riskAssessmentTag: any) => {
    //     state.formJournal.risk_assessment_tags.push(riskAssessmentTag?.uuid)
    // })
    // props.selectedJournal.teeth?.forEach((tooth: any) => {
    //     state.formJournal.teeth.push(tooth?.uuid)
    // })

    runSilently(() => {
        setFormJournalFromSelected(props.selectedJournal)
        state.hasChanges = false
        state.isAutoSaving = false
    })
})

function runSilently(fn: () => void) {
    suppressChangeTracking = true
    try {
        fn()
    } finally {
        // release on next tick so all nested reactive updates settle
        nextTick(() => {
            suppressChangeTracking = false
        })
    }
}

watch(() => language.locale.value, (newValue: any) => {
    if (newValue != null) {
        fetchAllTeeth()
    }
})

watch(() => props.selectedJournal, (newValue: any) => {
    if (newValue != null) {
        if (!newValue) return
        // switching journals is also programmatic; do it silently
        runSilently(() => {
            setFormJournalFromSelected(newValue)
            state.hasChanges = false
            state.isAutoSaving = false
        })
    }
})

watch(() => state.formJournal, () => {
    if (!isInitialized) return

    // Guard 2: ignore programmatic + initial editor sync changes
    if (suppressChangeTracking) return

    // Only mark changes for update form
    if (props.formType === 'update') {
        state.hasChanges = true
        state.isAutoSaving = true
    }
}, { deep: true })

watch(() => state.hasChanges, (hasChanges) => {
    if (!isInitialized) return
    if (suppressChangeTracking) return

    if (hasChanges && props.formType === 'update') {
        state.isAutoSaving = true
        clearInterval(autoSaveInterval)

        autoSaveInterval = setInterval(() => {
            submitForm()
        }, 3000)
    } else {
        clearInterval(autoSaveInterval)
        state.isAutoSaving = false
    }
}, { immediate: true })

function setFormJournalFromSelected(journal: any) {
    state.formJournal = {
        id: journal.id,
        uuid: journal.uuid,
        content: journal.content ?? '',
        journal_note_tags: [],
        date: journal.date,
        copy_journal_note_to_plan_or_goal_or_subgoal: journal.copy_journal_note_to_plan_or_goal_or_subgoal,
        journal_note_plan: '',
        journal_note_goal: '',
        journal_note_subgoal: '',
        copy_risk_assessment_to_plan_or_goal_or_subgoal: journal.copy_risk_assessment_to_plan_or_goal_or_subgoal,
        risk_assessment_plan: '',
        risk_assessment_goal: '',
        risk_assessment_subgoal: '',
        title: journal.title,
        is_draft: journal.is_draft,
        assessment: journal.assessment,
        note: journal.note === null ? '' : journal.note,
        risk_assessment_tags: [],
        score: journal.score,
        is_for_teeth: journal.is_for_teeth,
        teeth: [],
    }
    journal.journal_tags?.forEach((journalTag: any) => {
        state.formJournal.journal_note_tags.push(journalTag?.uuid)
    })
    journal.risk_tags?.forEach((riskAssessmentTag: any) => {
        state.formJournal.risk_assessment_tags.push(riskAssessmentTag?.uuid)
    })
    journal.teeth?.forEach((tooth: any) => {
        state.formJournal.teeth.push(tooth?.uuid)
    })
}

const rules = computed(() => {
    if (state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal) {
        return {
            formJournal: {
                title: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                content: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else if (state.formJournal.copy_risk_assessment_to_plan_or_goal_or_subgoal) {
        return {
            formJournal: {
                title: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                note: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formJournal: {
                title: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error && state.hasChanges) {
        state.hasChanges = false
        emit('submitForm', {
            isAutoSaving: state.isAutoSaving,
            formJournal: state.formJournal
        })
    }
}

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

function onSelectJournalContent(selected: any) {
    state.formJournal.content = selected.content
    state.modal.isSelectJournalContent = false
    state.userPredefinedContents = true
}

const triggerContentFileInput = () => {
    contentFileInput.value?.click()
}

const handleContentFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadContentAttachment(file)
    }
}

const uploadContentAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await journalService.uploadJournalFile(params)
        if (response) {
            state.formJournal.content += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const triggerRiskAssessmentFileInput = () => {
    riskAssessmentFileInput.value?.click()
}

const handleRiskAssessmentFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement; // Typecasting to HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]
        uploadRiskAssessmentAttachment(file)
    }
}

const uploadRiskAssessmentAttachment = async (file: any) => {
    emit('isPageLoading', true)
    try {
        const params = new FormData()
        params.append('file', file)
        params.append('citizen_uuid', String(citizenUuid))
        const response = await journalService.uploadJournalFile(params)
        if (response) {
            state.formJournal.note += `<p><a href="${response?.data?.file_url}" target="_blank">${response?.data?.file_name}</a></p>`
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    emit('isPageLoading', false)
}

const resetFileInput = () => {
    if (contentFileInput.value) {
        contentFileInput.value.value = null
    }
    if (riskAssessmentFileInput.value) {
        riskAssessmentFileInput.value.value = null
    }
}

function ContentUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new ContentUploadAdapter(loader)
    }
}

function NoteUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new NoteUploadAdapter(loader)
    }
}

class ContentUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await journalService.uploadJournalFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

class NoteUploadAdapter {
    private loader: { file: Promise<File> }

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader
    }

    async upload(): Promise<{ default: string }> {
        emit('isPageLoading', true)
        try {
            const file = await this.loader.file
            const params = new FormData()
            params.append('file', file)
            params.append('citizen_uuid', String(citizenUuid))
            const response = await journalService.uploadAssessmentFile(params)
            if (response?.data) {
                emit('isPageLoading', false)
                return { default: response.data?.file_url }
            } else {
                emit('isPageLoading', false)
                throw new Error('No data returned from the server')
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
            emit('isPageLoading', false)
            throw null
        }
    }
}

async function fetchAllPlans() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await planService.getAllPlans(citizenUuid)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (plan: any) => options.push({
                    value: plan?.uuid,
                    label: plan?.name,
                })
            )
            state.options.journal_note_plans = options
            state.options.risk_assessment_plans = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllJournalNoteTags() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await journalNoteTagService.getAllJournalNoteTags(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (journalNoteTag: any) => options.push({
                    value: journalNoteTag?.uuid,
                    label: journalNoteTag?.name,
                })
            )
            state.options.journal_note_tags = options
            state.options.risk_assessment_tags = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}



async function fetchAllJournalTitles() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await journalTitleService.getAllJournalTitles()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.title,
                    label: item?.title,
                })
            )
            state.options.journal_titles = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function generateNoteForJournalContent() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            citizen_uuid: citizenUuid,
            prompt: state.formJournal.content,
        }
        const response = await aIAssistantService.generateNote(params)
        if (response) {
            if (JSON.parse(response)?.choices?.[0]?.message?.content) {
                state.formJournal.note = JSON.parse(response)?.choices?.[0]?.message?.content
            }
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function generateNoteForRiskAssessmentNote() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            citizen_uuid: citizenUuid,
            prompt: state.formJournal.note,
        }
        const response = await aIAssistantService.generateNote(params)
        if (response) {
            if (JSON.parse(response)?.choices?.[0]?.message?.content) {
                state.formJournal.note = JSON.parse(response)?.choices?.[0]?.message?.content
            }
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllTeeth() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        state.options.teeth = []
        const response = await teethService.getAllTeeth()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (teeth: any) => options.push({
                    value: teeth?.uuid,
                    label: language.locale.value === 'en' ? teeth?.en_name : teeth?.dk_name,
                })
            )
            state.options.teeth = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllGoalsForJournalNote(planUuid: any = null) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        state.formJournal.journal_note_goal = ''
        state.formJournal.journal_note_subgoal = ''
        state.options.journal_note_goals = []
        state.options.journal_note_subgoals = []
        let response = {} as any
        if (planUuid) {
            response = await goalService.getAllGoalsPerPlan(planUuid)
        } else {
            response = await goalService.getAllGoalsPerCitizen(citizenUuid)
        }
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (goal: any) => options.push({
                    value: goal?.uuid,
                    label: goal?.name,
                })
            )
            state.options.journal_note_goals = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllSubgoalsForJournalNote(goalUuid: any) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        state.formJournal.journal_note_subgoal = ''
        state.options.journal_note_subgoals = []
        const response = await subgoalService.getAllSubgoals(goalUuid)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (subgoal: any) => options.push({
                    value: subgoal?.uuid,
                    label: subgoal?.name,
                })
            )
            state.options.journal_note_subgoals = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllGoalsForRiskAssessment(planUuid: any = null) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        state.formJournal.risk_assessment_goal = ''
        state.formJournal.risk_assessment_subgoal = ''
        state.options.risk_assessment_goals = []
        state.options.risk_assessment_subgoals = []
        let response = {} as any
        if (planUuid) {
            response = await goalService.getAllGoalsPerPlan(planUuid)
        } else {
            response = await goalService.getAllGoalsPerCitizen(citizenUuid)
        }
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (goal: any) => options.push({
                    value: goal?.uuid,
                    label: goal?.name,
                })
            )
            state.options.risk_assessment_goals = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllSubgoalsForRiskAssessment(goalUuid: any) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        state.formJournal.risk_assessment_subgoal = ''
        state.options.risk_assessment_subgoals = []
        const response = await subgoalService.getAllSubgoals(goalUuid)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (subgoal: any) => options.push({
                    value: subgoal?.uuid,
                    label: subgoal?.name,
                })
            )
            state.options.risk_assessment_subgoals = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}
</script>

<style scoped>
.spin {
    animation: spin 1.5s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>