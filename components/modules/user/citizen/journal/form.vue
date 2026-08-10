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
                    <button type="button"
                        class="inline-flex items-center gap-1.5 rounded-full bg-primary-25 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-50 transition-colors"
                        @click="state.usePredefinedJournalTitle = !state.usePredefinedJournalTitle">
                        <Icon :name="state.usePredefinedJournalTitle ? 'ph:pencil-simple' : 'ph:list-bullets'"
                            class="size-4" aria-hidden="true" />
                        <span v-if="state.usePredefinedJournalTitle">
                            {{ $t('citizens.citizenJournals.form.enterJournalTitleManually') }}
                        </span>
                        <span v-else>
                            {{ $t('citizens.citizenJournals.form.usePredefinedJournalTitle') }}
                        </span>
                    </button>
                </div>
                <div class="space-y-1" v-if="state.usePredefinedJournalTitle">
                    <div class="flex items-center py-0.5">
                        <FormLabel for="predefined_title" :label="$t('citizens.citizenJournals.form.title')" />
                        <button type="button" class="ml-auto text-sm text-primary hover:text-primary-700"
                            @click="navigateTo('/settings/journal-titles')">
                            <span>
                                {{ $t('citizens.citizenJournals.form.createJournalTitle') }}
                            </span>
                        </button>
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
            <div v-if="state.selectedJournalTitleFields.length > 0" class="space-y-3">
                <div v-for="(field, i) in state.selectedJournalTitleFields" :key="field.uuid" class="space-y-1">
                    <FormLabel :for="`dyn_field_${field.uuid}`" :label="field.label" />
                    <FormTextArea v-if="field.field_type === 'textarea'" :name="`dyn_field_${field.uuid}`"
                        placeholder="" :rows="3" v-model="state.formJournal.field_answers[i].response" />
                    <FormDateField v-else-if="field.field_type === 'date'" :id="`dyn_field_${field.uuid}`"
                        :name="`dyn_field_${field.uuid}`" placeholder=""
                        v-model="state.formJournal.field_answers[i].response" />
                    <div v-else-if="field.field_type === 'radio'" class="flex flex-col gap-y-2">
                        <div v-for="option in field.options" :key="option"
                            class="flex items-center gap-x-2 cursor-pointer w-fit"
                            @click="state.formJournal.field_answers[i].response = option">
                            <FormRadioButton :name="`dyn_field_${field.uuid}`" :modelValue="option"
                                :checked="state.formJournal.field_answers[i].response === option" />
                            <span class="text-sm text-gray-600">{{ option }}</span>
                        </div>
                    </div>
                    <div v-else-if="field.field_type === 'checkbox'" class="flex flex-col gap-y-2">
                        <div v-for="option in field.options" :key="option"
                            class="flex items-center gap-x-2 cursor-pointer w-fit"
                            @click="toggleCheckboxAnswer(i, option)">
                            <FormCheckbox
                                :value="(state.formJournal.field_answers[i].response || []).includes(option)" />
                            <span class="text-sm text-gray-600">{{ option }}</span>
                        </div>
                    </div>
                    <FormTextField v-else :id="`dyn_field_${field.uuid}`" :name="`dyn_field_${field.uuid}`"
                        placeholder="" v-model="state.formJournal.field_answers[i].response" />
                </div>
            </div>
            <div class="space-y-3" v-if="linkedCompletedSurveys.length > 0">
                <p class="text-sm font-medium text-gray-700">
                    {{ $t('citizens.citizenJournals.form.linkedSurveys') }}
                </p>
                <div v-for="assignment in linkedCompletedSurveys" :key="assignment.uuid"
                    class="bg-gray-50 rounded-md p-4 space-y-2">
                    <h3 class="text-sm font-semibold">{{ assignment?.survey?.title }}</h3>
                    <div v-for="entry in linkedSurveyAnswerEntries(assignment)" :key="entry.question"
                        class="text-sm">
                        <p class="text-gray-500">{{ entry.question }}</p>
                        <p class="font-medium">{{ entry.answer }}</p>
                    </div>
                </div>
            </div>
            <div class="space-y-3" v-if="state.pendingSurveys.length > 0">
                <p class="text-sm font-medium text-gray-700">
                    {{ $t('citizens.citizenJournals.form.attachedSurveys') }}
                </p>
                <div v-for="assignment in state.pendingSurveys" :key="assignment.uuid"
                    class="bg-gray-50 rounded-md p-4 space-y-3">
                    <h3 class="text-sm font-semibold">{{ assignment?.survey?.title }}</h3>
                    <ModulesSharedSurveyFill :ref="(el: any) => setSurveyFillRef(assignment.uuid, el)"
                        :questions="assignment?.survey?.questions ?? []"
                        :answers="state.surveyAnswers[assignment.uuid]" />
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
                <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-medium text-gray-700">
                        {{ $t('citizens.citizenJournals.form.content') }}
                    </p>
                    <div class="flex-1 flex flex-wrap items-center gap-2 justify-end">
                        <button type="button"
                            class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                            @click="state.modal.isSelectJournalContent = true">
                            <Icon name="ph:list-bullets" class="size-4" aria-hidden="true" />
                            {{ $t('citizens.citizenJournals.form.usePredefinedcontent') }}
                        </button>
                        <input ref="contentFileInput" type="file" @change="handleContentFileChange" class="hidden" />
                        <button type="button"
                            class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                            @click="triggerContentFileInput">
                            <Icon name="ph:paperclip" class="size-4" aria-hidden="true" />
                            {{ $t('citizens.citizenJournals.form.attachFile') }}
                        </button>
                        <FormButton buttonStyle="AI" buttonSize="xs" class="px-4"
                            v-if="userStore.getUser?.has_ai_access" :disabled="isTranscribing"
                            @click="toggleDictation">
                            <div class="flex items-center">
                                <Icon
                                    :name="isRecording ? 'ph:stop-circle-fill' : (isTranscribing ? 'ph:spinner' : 'ph:microphone')"
                                    :class="['h-4 w-4', isRecording && 'text-red-600 animate-pulse', isTranscribing && 'spin']"
                                    aria-hidden="true" />
                            </div>
                            {{ isRecording ? $t('citizens.citizenJournals.form.stopDictation')
                                : (isTranscribing ? $t('citizens.citizenJournals.form.transcribing')
                                    : $t('citizens.citizenJournals.form.dictate')) }}
                        </FormButton>
                        <FormButton buttonStyle="AI" buttonSize="xs" class="px-4"
                            v-if="userStore.getUser?.has_ai_access" @click="openAiGeneratePreview('content')">
                            <div class="flex items-center">
                                <Icon name="ph:sparkle" class="h-4 w-4" aria-hidden="true" />
                            </div>
                            {{ $t('citizens.citizenJournals.form.prepareWithAI') }}
                        </FormButton>
                    </div>
                </div>
                <div class="co-editor">
                    <ckeditor :editor="editor" v-model="state.formJournal.content" :config="editorContentConfig"></ckeditor>
                    <!-- The audit's "always review AI output" reminder belongs where the
                    text was generated, not only in the assistant. -->
                    <p v-if="state.formJournal.is_ai_used"
                        class="mt-1.5 flex items-start gap-1.5 text-xs text-gray-400">
                        <Icon name="ph:sparkle" class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        {{ $t('assistants.reviewNotice') }}
                    </p>
                </div>
                <p class="text-xs text-gray-400">{{ $t('citizens.citizenJournals.mentions.hint') }}</p>
                <FormError :error="v$?.formJournal?.content?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.content?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="journal_note_tags"
                        :label="term('journalNoteTag', $t('citizens.citizenJournals.form.journalNoteTags'))" />
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
                <FormLabel :label="$t('citizens.citizenJournals.form.notifyColleagues')" />
                <FormSelectMultiple id="mentioned_colleagues" :options="state.options.colleagues"
                    :placeholder="$t('citizens.citizenJournals.form.notifyColleaguesPlaceholder')"
                    v-model="state.formJournal.mentioned_user_uuids" />
                <p class="text-xs text-gray-400">{{ $t('citizens.citizenJournals.form.notifyColleaguesHint') }}</p>
            </div>
            <div v-if="isFieldVisible('risk_assessment')">
            <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">
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
                                'cursor-pointer select-none flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-medium transition-all']">
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
                <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-medium text-gray-700">
                        {{ $t('citizens.citizenJournals.form.note') }}
                    </p>
                    <div class="flex-1 flex flex-wrap items-center gap-2 justify-end">
                        <input ref="riskAssessmentFileInput" type="file" @change="handleRiskAssessmentFileChange"
                            class="hidden" />
                        <button type="button"
                            class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                            @click="triggerRiskAssessmentFileInput">
                            <Icon name="ph:paperclip" class="size-4" aria-hidden="true" />
                            {{ $t('citizens.citizenJournals.form.attachFile') }}
                        </button>
                        <FormButton buttonStyle="AI" buttonSize="xs" class="px-4"
                            v-if="userStore.getUser?.has_ai_access" @click="openAiGeneratePreview('note')">
                            <div class="flex items-center">
                                <Icon name="ph:sparkle" class="h-4 w-4" aria-hidden="true" />
                            </div>
                            {{ $t('citizens.citizenJournals.form.prepareWithAI') }}
                        </FormButton>
                    </div>
                </div>
                <div class="co-editor">
                    <ckeditor :editor="editor" v-model="state.formJournal.note" :config="editorNoteConfig"></ckeditor>
                    <!-- The audit's "always review AI output" reminder belongs where the
                    text was generated, not only in the assistant. -->
                    <p v-if="state.formJournal.is_ai_used"
                        class="mt-1.5 flex items-start gap-1.5 text-xs text-gray-400">
                        <Icon name="ph:sparkle" class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        {{ $t('assistants.reviewNotice') }}
                    </p>
                </div>
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
        <div class="mt-6 border-t border-gray-100 pt-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="w-full">
                    {{ props.formType === 'create' ? $t('save') : $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesUserJournalNoteTagModalNew :isModalOpen="state.modal.isAddJournalNoteTagsOpen"
            @close="state.modal.isAddJournalNoteTagsOpen = false" @refreshJournalNoteTags="fetchAllJournalNoteTags" />

        <ModulesUserJournalContentModalSelect :isModalOpen="state.modal.isSelectJournalContent"
            @close="state.modal.isSelectJournalContent = false" @select="onSelectJournalContent" />

        <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen"
            :title="$t('citizens.documents.upgradeStorage')"
            :message="state.error?.message + ' ' + $t('citizens.documents.confirmation.upgradeStorageConfirmation') + '?'"
            @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />

        <!-- Audit P2.1/P2.2/P2.3/P2.4: before generating with AI, show what will be
        included, let the user deselect specific journals/plans, and remind them to
        always review the result. -->
        <DialogConfirmation :isModalOpen="state.modal.isAiGeneratePreviewOpen"
            :title="$t('citizens.citizenJournals.form.aiGenerate.title')"
            :message="$t('citizens.citizenJournals.form.aiGenerate.description')"
            @close="state.modal.isAiGeneratePreviewOpen = false" @confirm="confirmAiGenerate">
            <template #extra>
                <div v-if="state.aiGenerate.isLoading" class="text-sm text-gray-400 py-3">
                    {{ $t('citizens.citizenJournals.form.aiGenerate.loading') }}
                </div>
                <div v-else class="mt-3 space-y-3 max-h-56 overflow-y-auto">
                    <div v-if="state.aiGenerate.journals.length > 0">
                        <p class="text-xs font-medium text-gray-500 mb-1">
                            {{ $t('citizens.citizenJournals.form.aiGenerate.journals') }}
                        </p>
                        <label v-for="journal in state.aiGenerate.journals" :key="journal.uuid"
                            class="flex items-center gap-2 py-1 text-sm text-gray-700">
                            <input type="checkbox" :value="journal.uuid" v-model="state.aiGenerate.includedJournalUuids" />
                            <span class="truncate">{{ journal.title }} — {{ journal.date }}</span>
                        </label>
                    </div>
                    <div v-if="state.aiGenerate.plans.length > 0">
                        <p class="text-xs font-medium text-gray-500 mb-1">
                            {{ $t('citizens.citizenJournals.form.aiGenerate.plans') }}
                        </p>
                        <label v-for="plan in state.aiGenerate.plans" :key="plan.uuid"
                            class="flex items-center gap-2 py-1 text-sm text-gray-700">
                            <input type="checkbox" :value="plan.uuid" v-model="state.aiGenerate.includedPlanUuids" />
                            <span class="truncate">{{ plan.name }}</span>
                        </label>
                    </div>
                    <p class="text-xs text-gray-400">
                        {{ $t('citizens.citizenJournals.form.aiGenerate.redactionNotice') }}
                    </p>
                    <p class="text-xs text-gray-400 flex items-start gap-1.5">
                        <Icon name="ph:warning-circle" class="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{{ $t('assistants.reviewNotice') }}</span>
                    </p>
                </div>
            </template>
        </DialogConfirmation>
    </form>
</template>

<script setup lang="ts">
import { aIAssistantService } from '@/components/api/user/AIAssistantService'
import { formFieldConfigService } from '@/components/api/user/FormFieldConfigService'
import { journalService } from '@/components/api/user/JournalService'
import { journalNoteTagService } from '@/components/api/user/JournalNoteTagService'
import { journalTitleService } from '@/components/api/user/JournalTitleService'
import { teethService } from '@/components/api/user/TeethService'
import { planService } from '@/components/api/user/PlanService'
import { goalService } from '@/components/api/user/GoalService'
import { subgoalService } from '@/components/api/user/SubgoalService'
import { userService } from '@/components/api/user/UserService'
import { surveyService } from '@/components/api/user/SurveyService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import ClassicEditor from '@/utils/editor'
import { Mention } from 'ckeditor5'
import { MentionCustomization, mentionConfig } from '@/utils/journal-mentions'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useCitizenStore } from '@/store/citizen'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'
import { useTerminology } from '@/composables/useTerminology'
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
const { term } = useTerminology()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const contentFileInput = ref(null) as any
const riskAssessmentFileInput = ref(null) as any
let autoSaveInterval = null as any
let isInitialized = true
let suppressChangeTracking = true
// Tracks the template text last auto-inserted from a selected title, so
// switching titles swaps templates but never clobbers text the user typed.
let lastAppliedTitleTemplate = ''

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
    extraPlugins: [ContentUploadAdapterPlugin, Mention, MentionCustomization],
    // Roadmap 357: @ tags a colleague (notified) or a citizen (initials only).
    mention: mentionConfig(),
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
    extraPlugins: [NoteUploadAdapterPlugin, Mention, MentionCustomization],
    mention: mentionConfig(),
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
        is_ai_used: false,
        assessment: null,
        note: '',
        risk_assessment_tags: [],
        score: '',
        teeth: [],
        is_for_teeth: false,
        mentioned_user_uuids: [],
        field_answers: [] as Array<{ journal_title_field_uuid: string, response: string | string[] }>,
    } as any,
    selectedJournalTitleFields: [] as Array<{ uuid: string, label: string, field_type: string, options: string[] }>,
    pendingSurveys: [] as any[],
    surveyAnswers: {} as Record<string, Record<string, any>>,
    hasChanges: false,
    modal: {
        isAddJournalNoteTagsOpen: false,
        isUpgradeStorageOpen: false,
        isSelectJournalContent: false,
        isAiGeneratePreviewOpen: false,
    },
    // Audit P2.1/P2.2: lets the user see and deselect specific journals/plans
    // before AI generation, rather than the AI silently having access to
    // everything with no visibility or control.
    aiGenerate: {
        target: null as 'content' | 'note' | null,
        isLoading: false,
        journals: [] as Array<{ uuid: string, title: string, date: string }>,
        plans: [] as Array<{ uuid: string, name: string }>,
        includedJournalUuids: [] as string[],
        includedPlanUuids: [] as string[],
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
        journal_titles_raw: [] as any[],
        risk_assessment_plans: [],
        risk_assessment_goals: [],
        risk_assessment_subgoals: [],
        journal_note_tags: [],
        risk_assessment_tags: [],
        colleagues: [],
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
    formFieldConfig: {
        create: { risk_assessment: true } as Record<string, boolean>,
        edit: { risk_assessment: true } as Record<string, boolean>,
    },
})

function isFieldVisible(fieldKey: string): boolean {
    const formTypeKey = props.formType === 'create' ? 'create' : 'edit'
    return state.formFieldConfig[formTypeKey]?.[fieldKey] !== false
}

async function fetchFormFieldConfig() {
    try {
        const response = await formFieldConfigService.getFormConfigs({ entity_type: 'citizen_journal' })
        if (response?.data) {
            response.data.forEach((config: any) => {
                if (config.form_type === 'create' || config.form_type === 'edit') {
                    state.formFieldConfig[config.form_type as 'create' | 'edit'] = {
                        risk_assessment: config.form_fields?.risk_assessment !== false,
                    }
                }
            })
        }
    } catch (error: any) {
        // silently ignore — default to visible when config can't be loaded
    }
}

const linkedCompletedSurveys = computed(() => {
    return (props.selectedJournal as any)?.survey_assignments?.filter((a: any) => a?.status === 'completed') ?? []
})

function linkedSurveyAnswerEntries(assignment: any) {
    const entries: any[] = []
    ;(assignment?.survey?.questions ?? []).forEach((q: any) => {
        const def = q.question ?? q
        entries.push({ question: def?.value, answer: resolveSurveyAnswer(def, assignment.answers?.[q.uuid]) })
    })
    return entries
}

function resolveSurveyAnswer(def: any, answer: any) {
    if (answer === undefined || answer === null || answer === '') return '-'
    if (def?.type === 'choice') return def?.options?.[answer] ?? '-'
    if (def?.type === 'checkbox' && Array.isArray(answer)) return answer.map((i: any) => def?.options?.[i]).filter(Boolean).join(', ') || '-'
    return String(answer)
}

const surveyFillRefs: Record<string, any> = {}

function setSurveyFillRef(assignmentUuid: string, el: any) {
    if (el) {
        surveyFillRefs[assignmentUuid] = el
    }
}

async function fetchPendingSurveys() {
    if (!citizenUuid) return
    try {
        const response = await surveyService.getCitizenAssignments(citizenUuid)
        const assignments = response?.data ?? []
        state.pendingSurveys = assignments.filter((a: any) => a?.status === 'pending' && !a?.linked_to)
        state.pendingSurveys.forEach((a: any) => {
            if (!state.surveyAnswers[a.uuid]) {
                state.surveyAnswers[a.uuid] = {}
            }
        })
    } catch (error: any) {
        // silently ignore - surveys are optional, must not block journal note creation
    }
}

function missingRequiredSurveyQuestions() {
    return state.pendingSurveys.filter((a: any) => {
        const answered = Object.keys(state.surveyAnswers[a.uuid] ?? {}).length > 0
        if (!answered) return false
        const missing = surveyFillRefs[a.uuid]?.missingRequiredQuestions?.() ?? []
        return missing.length > 0
    })
}

function collectAnsweredSurveyPayloads() {
    return state.pendingSurveys
        .filter((a: any) => Object.keys(state.surveyAnswers[a.uuid] ?? {}).length > 0)
        .map((a: any) => ({ assignment_uuid: a.uuid, answers: state.surveyAnswers[a.uuid] }))
}

onMounted(() => {
    suppressChangeTracking = true

    fetchFormFieldConfig()
    fetchAllPlans()
    fetchAllGoalsForJournalNote()
    fetchAllGoalsForRiskAssessment()
    fetchAllJournalNoteTags()
    fetchAllJournalTitles()
    fetchAllTeeth()
    fetchColleagues()
    fetchPendingSurveys()
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

watch([() => state.formJournal.title, () => state.usePredefinedJournalTitle], () => {
    if (suppressChangeTracking) return
    if (!state.usePredefinedJournalTitle) {
        state.selectedJournalTitleFields = []
        state.formJournal.field_answers = []
        return
    }
    const match = state.options.journal_titles_raw.find((o: any) => o.value === state.formJournal.title)
    const fields = match?.fields ?? []
    state.selectedJournalTitleFields = fields.map((f: any) => ({
        uuid: f.uuid,
        label: f.label,
        field_type: f.field_type ?? 'text',
        options: f.options ?? [],
    }))
    state.formJournal.field_answers = state.selectedJournalTitleFields.map((f: any) => ({
        journal_title_field_uuid: f.uuid,
        response: f.field_type === 'checkbox' ? [] : '',
    }))

    // Auto-populate the content field from the title's template. Only when the
    // content is empty or still holds a previously auto-inserted template, so a
    // user's own edits are never overwritten when they switch titles.
    const template = match?.content ?? ''
    const currentContent = state.formJournal.content ?? ''
    if (template && (currentContent.trim() === '' || currentContent === lastAppliedTitleTemplate)) {
        state.formJournal.content = template
        lastAppliedTitleTemplate = template
    } else if (!template && currentContent === lastAppliedTitleTemplate) {
        // Switched to a title with no template: clear the prior auto-insert
        state.formJournal.content = ''
        lastAppliedTitleTemplate = ''
    }
})

function toggleCheckboxAnswer(fieldIndex: number, option: string) {
    const current = state.formJournal.field_answers[fieldIndex].response || []
    const idx = current.indexOf(option)
    if (idx === -1) {
        current.push(option)
    } else {
        current.splice(idx, 1)
    }
    state.formJournal.field_answers[fieldIndex].response = current
}

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
        is_ai_used: journal.is_ai_used ?? false,
        assessment: journal.assessment,
        note: journal.note === null ? '' : journal.note,
        risk_assessment_tags: [],
        score: journal.score,
        is_for_teeth: journal.is_for_teeth,
        teeth: [],
        mentioned_user_uuids: [],
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

    const savedAnswers = journal.journal_field_answers ?? []
    if (savedAnswers.length > 0) {
        state.usePredefinedJournalTitle = true
        state.selectedJournalTitleFields = savedAnswers.map((a: any) => ({
            uuid: a.journal_title_field_uuid,
            label: a.label ?? '',
            field_type: a.field_type ?? 'text',
            options: a.options ?? [],
        }))
        state.formJournal.field_answers = savedAnswers.map((a: any) => ({
            journal_title_field_uuid: a.journal_title_field_uuid,
            response: a.field_type === 'checkbox' ? (a.response ?? []) : (a.response ?? ''),
        }))
    } else {
        state.selectedJournalTitleFields = []
        state.formJournal.field_answers = []
    }
}

const rules = computed(() => {
    if (state.formJournal.copy_journal_note_to_plan_or_goal_or_subgoal) {
        return {
            formJournal: {
                title: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                date: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                content: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else if (state.formJournal.copy_risk_assessment_to_plan_or_goal_or_subgoal) {
        return {
            formJournal: {
                title: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                date: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                note: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formJournal: {
                title: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                date: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (missingRequiredSurveyQuestions().length > 0) {
        state.error = { message: `${t('validation.thisFieldIsRequired')}.` } as any
        return
    }
    if (!v$.value.$error && state.hasChanges) {
        state.hasChanges = false
        emit('submitForm', {
            isAutoSaving: state.isAutoSaving,
            formJournal: state.formJournal,
            pending_survey_answers: collectAnsweredSurveyPayloads(),
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
            let raw: any = []
            response.data.forEach(
                (item: any) => {
                    options.push({ value: item?.title, label: item?.title })
                    raw.push({ value: item?.title, label: item?.title, uuid: item?.uuid, content: item?.content ?? '', fields: item?.journal_fields ?? [] })
                }
            )
            state.options.journal_titles = options
            state.options.journal_titles_raw = raw
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

// Audit P2.1/P2.2/P2.3/P2.4: opens the pre-generation preview/selection modal
// instead of calling the AI immediately - fetches this citizen's journals and
// plans (reusing the same endpoints already used elsewhere in this form) so
// the user can see and deselect what will be available to the AI.
async function openAiGeneratePreview(target: 'content' | 'note') {
    state.aiGenerate.target = target
    state.modal.isAiGeneratePreviewOpen = true
    state.aiGenerate.isLoading = true
    try {
        const [journalsRes, plansRes] = await Promise.allSettled([
            journalService.getJournals({ citizen_uuid: citizenUuid }),
            planService.getAllPlans(citizenUuid),
        ])
        state.aiGenerate.journals = journalsRes.status === 'fulfilled' ? (journalsRes.value?.data ?? []) : []
        state.aiGenerate.plans = plansRes.status === 'fulfilled' ? (plansRes.value?.data ?? []) : []
    } catch {
        state.aiGenerate.journals = []
        state.aiGenerate.plans = []
    }
    // Default to everything included/checked - the user deselects what they
    // don't want the AI to see, rather than opting in to each item.
    state.aiGenerate.includedJournalUuids = state.aiGenerate.journals.map((j) => j.uuid)
    state.aiGenerate.includedPlanUuids = state.aiGenerate.plans.map((p) => p.uuid)
    state.aiGenerate.isLoading = false
}

function confirmAiGenerate() {
    const excludedJournalUuids = state.aiGenerate.journals
        .filter((j) => !state.aiGenerate.includedJournalUuids.includes(j.uuid))
        .map((j) => j.uuid)
    const excludedPlanUuids = state.aiGenerate.plans
        .filter((p) => !state.aiGenerate.includedPlanUuids.includes(p.uuid))
        .map((p) => p.uuid)

    if (state.aiGenerate.target === 'content') {
        generateNoteForJournalContent(excludedJournalUuids, excludedPlanUuids)
    } else if (state.aiGenerate.target === 'note') {
        generateNoteForRiskAssessmentNote(excludedJournalUuids, excludedPlanUuids)
    }
}

// --- Dictate to journal (audio -> Whisper transcript -> AI-structured note) ---
const isRecording = ref(false)
const isTranscribing = ref(false)
let mediaRecorder: any = null
let audioChunks: any[] = []

async function toggleDictation() {
    if (isRecording.value) {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
        isRecording.value = false
        return
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioChunks = []
        mediaRecorder = new MediaRecorder(stream)
        mediaRecorder.ondataavailable = (e: any) => { if (e.data && e.data.size) audioChunks.push(e.data) }
        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach((tr: any) => tr.stop())
            await transcribeAndStructure()
        }
        mediaRecorder.start()
        isRecording.value = true
    } catch (error: any) {
        state.error = { message: t('citizens.citizenJournals.form.micError') } as any
    }
}

async function transcribeAndStructure() {
    if (!audioChunks.length) return
    isTranscribing.value = true
    state.error = {} as any
    try {
        const blob = new Blob(audioChunks, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', blob, 'dictation.webm')
        const response = await aIAssistantService.transcribeAudio(formData)
        const transcript = (response?.data?.text ?? '').trim()
        if (transcript) {
            // Drop the raw transcript into the editor, then let the existing AI pass
            // structure it into a proper journal note. No exclusions here - dictation
            // is a direct action, not routed through the preview/selection modal.
            state.formJournal.content = state.formJournal.content
                ? `${state.formJournal.content}<p>${transcript}</p>`
                : `<p>${transcript}</p>`
            await generateNoteForJournalContent()
        }
    } catch (error: any) {
        state.error = error
    }
    isTranscribing.value = false
}

async function generateNoteForJournalContent(excludedJournalUuids: string[] = [], excludedPlanUuids: string[] = []) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            citizen_uuid: citizenUuid,
            prompt: state.formJournal.content,
            excluded_journal_uuids: excludedJournalUuids,
            excluded_plan_uuids: excludedPlanUuids,
        }
        const response = await aIAssistantService.generateNote(params)
        if (response?.data) {
            state.formJournal.content = response?.data?.answer
            state.formJournal.is_ai_used = true
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function generateNoteForRiskAssessmentNote(excludedJournalUuids: string[] = [], excludedPlanUuids: string[] = []) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            citizen_uuid: citizenUuid,
            prompt: state.formJournal.note,
            excluded_journal_uuids: excludedJournalUuids,
            excluded_plan_uuids: excludedPlanUuids,
        }
        const response = await aIAssistantService.generateNote(params)
        if (response?.data) {
            state.formJournal.note = response?.data?.answer
            state.formJournal.is_ai_used = true
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

async function fetchColleagues() {
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        const list = Array.isArray(response) ? response : (response?.data ?? [])
        const currentUuid = userStore.getUser?.uuid
        state.options.colleagues = list
            .filter((item: any) => item?.uuid && item.uuid !== currentUuid)
            .map((item: any) => ({
                value: item.uuid,
                label: `${item.firstname} ${item.lastname ?? ''}`.trim(),
            }))
    } catch (error: any) {
        state.error = error
    }
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

/* Polish the CKEditor chrome to match the form: rounded, soft border, tinted toolbar. */
.co-editor :deep(.ck) {
    --ck-border-radius: 10px;
    --ck-color-base-border: #e5e7eb;
    --ck-color-toolbar-border: #e5e7eb;
    --ck-color-toolbar-background: #f9fafb;
    --ck-color-focus-border: #0f4c75;
}

.co-editor :deep(.ck.ck-editor__main > .ck-editor__editable) {
    min-height: 170px;
}

.co-editor :deep(.ck.ck-editor__editable.ck-focused) {
    box-shadow: 0 0 0 3px rgba(15, 76, 117, 0.12);
}
</style>