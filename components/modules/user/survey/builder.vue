<template>
    <form @submit.prevent="submitForm()" class="max-w-5xl mx-auto space-y-5">
        <div class="space-y-4 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('surveys.builder.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('surveys.builder.titlePlaceholder')"
                    v-model="state.survey.title" />
                <FormError :error="v$?.survey?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('surveys.builder.description')" />
                <FormTextArea id="description" name="description"
                    :placeholder="$t('surveys.builder.descriptionPlaceholder')" :rows="3"
                    v-model="state.survey.description" />
            </div>

            <div class="space-y-1 flex items-center gap-x-2">
                <FormSwitch :value="state.survey.writes_to_journal"
                    @toggleSwitch="state.survey.writes_to_journal = !state.survey.writes_to_journal" />
                <div>
                    <p>{{ $t('patient.staff.surveyWritesToJournal') }}</p>
                    <p class="text-xs text-gray-500">{{ $t('patient.staff.surveyWritesToJournalHelp') }}</p>
                </div>
            </div>

            <!-- Score interpretation ranges -->
            <div class="pt-2 space-y-3">
                <div>
                    <p class="text-sm font-medium text-gray-700">{{ $t('surveys.builder.scoreRanges.title') }}</p>
                    <p class="text-xs text-gray-500">{{ $t('surveys.builder.scoreRanges.subtitle') }}</p>
                </div>
                <div v-for="(range, rangeIndex) in state.survey.score_ranges" :key="rangeIndex"
                    class="flex items-center gap-x-2">
                    <div class="w-24">
                        <FormTextField :name="`range_from_${rangeIndex}`"
                            :placeholder="$t('surveys.builder.scoreRanges.from')" v-model="range.from" />
                    </div>
                    <span class="text-gray-400">-</span>
                    <div class="w-24">
                        <FormTextField :name="`range_to_${rangeIndex}`"
                            :placeholder="$t('surveys.builder.scoreRanges.to')" v-model="range.to" />
                    </div>
                    <div class="grow">
                        <FormTextField :name="`range_label_${rangeIndex}`"
                            :placeholder="$t('surveys.builder.scoreRanges.label')" v-model="range.label" />
                    </div>
                    <button type="button" class="flex items-center" @click="removeScoreRange(rangeIndex)">
                        <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
                <button type="button" class="text-primary-500 text-sm hover:text-primary-700" @click="addScoreRange">
                    {{ $t('surveys.builder.scoreRanges.addRange') }}
                </button>
            </div>
        </div>

        <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
            <div class="space-y-8" v-if="state.survey.questions.length > 0">
                <div v-for="(question, qi) in state.survey.questions" :key="question.key"
                    class="bg-gray-100 rounded-md border-t-2 border-primary"
                    :style="{ marginLeft: `${depthOf(question) * 2}rem` }">
                    <div class="p-5 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {{ $t('surveys.builder.types.' + question.type) }}
                            </span>
                            <button type="button" @click="removeQuestion(qi)">
                                <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>

                        <!-- follow-up condition: which answers on the parent show this question -->
                        <div v-if="question.show_if && parentOf(question)" class="space-y-2">
                            <p class="text-sm text-gray-600">
                                {{ $t('surveys.builder.followUpShownWhen', { question: parentOf(question)?.value }) }}
                            </p>
                            <div class="flex flex-wrap gap-2">
                                <button v-for="(option, oi) in parentOf(question)?.options ?? []" :key="oi" type="button"
                                    class="px-3 py-1 rounded-full border text-sm"
                                    :class="question.show_if.options.includes(oi) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'"
                                    @click="toggleConditionOption(question, oi)">
                                    {{ option }}
                                </button>
                            </div>
                            <FormError
                                :error="state.submitted && question.show_if.options.length === 0 ? $t('surveys.builder.followUpPickOption') : ''" />
                        </div>

                        <div class="flex gap-x-3">
                            <div class="mt-2">{{ questionNumbers[qi] }}.</div>
                            <div class="grow space-y-3">
                                <FormTextField :name="`q_${qi}`"
                                    :placeholder="$t('surveys.builder.questionPlaceholder')" v-model="question.value" />

                                <!-- choice / checkbox options with per-option scores -->
                                <div v-if="['choice', 'checkbox'].includes(question.type)" class="space-y-3">
                                    <div v-for="(option, oi) in question.options" :key="oi"
                                        class="flex items-center gap-x-2">
                                        <Icon :name="question.type === 'choice' ? 'ph:circle' : 'ph:square'"
                                            class="h-4 w-4 text-gray-400 shrink-0" aria-hidden="true" />
                                        <FormTextField :name="`q_${qi}_o_${oi}`" :placeholder="`Option ${oi + 1}`"
                                            v-model="question.options[oi]" />
                                        <div class="w-24 shrink-0" :title="$t('surveys.builder.score')">
                                            <FormTextField :name="`q_${qi}_s_${oi}`"
                                                :placeholder="$t('surveys.builder.score')"
                                                v-model="question.scores[oi]" />
                                        </div>
                                        <button type="button" class="flex items-center"
                                            @click="removeOption(qi, oi)" v-if="question.options.length > 1">
                                            <Icon name="ph:trash" class="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <button type="button" class="text-primary-500 text-sm hover:text-primary-700"
                                        @click="addOption(qi)">
                                        {{ $t('surveys.builder.addOption') }}
                                    </button>
                                </div>

                                <!-- rating levels -->
                                <div v-else-if="question.type === 'rating'" class="flex items-center gap-x-2">
                                    <span class="text-sm text-gray-600">{{ $t('surveys.builder.levels') }}</span>
                                    <select v-model.number="question.levels"
                                        class="border border-gray-300 rounded-md px-2 py-1 text-sm">
                                        <option v-for="n in [2, 3, 4, 5, 6, 7, 10]" :key="n" :value="n">{{ n }}</option>
                                    </select>
                                </div>

                                <!-- text/date preview -->
                                <FormTextField v-else :name="`q_${qi}_preview`"
                                    :placeholder="$t('surveys.builder.answerPreview')" :disabled="true" />
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div class="px-5 py-3 flex items-center justify-between gap-x-2">
                        <div>
                            <button v-if="['choice', 'checkbox'].includes(question.type)" type="button"
                                class="flex items-center gap-x-1 text-primary-500 text-sm hover:text-primary-700"
                                @click="state.followUpFor = state.followUpFor === question.key ? null : question.key">
                                <Icon :name="state.followUpFor === question.key ? 'ph:x-circle' : 'ph:arrow-elbow-down-right'"
                                    class="h-4 w-4" aria-hidden="true" />
                                {{ $t('surveys.builder.addFollowUp') }}
                            </button>
                        </div>
                        <div class="flex items-center gap-x-2">
                            <FormSwitch :value="question.required"
                                @toggleSwitch="question.required = !question.required" />
                            <p>{{ $t('surveys.builder.required') }}</p>
                        </div>
                    </div>
                    <div v-if="state.followUpFor === question.key" class="px-5 pb-5 grid grid-cols-3 gap-3">
                        <button v-for="type in questionTypes" :key="type.value" type="button"
                            class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-white"
                            @click="addFollowUp(qi, type.value)">
                            <div class="flex items-center gap-x-2 text-sm">
                                <Icon :name="type.icon" class="w-5 h-5 text-primary" aria-hidden="true" />
                                {{ type.label }}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div class="space-y-3" :class="state.survey.questions.length > 0 && 'mt-6'">
                <div class="w-fit flex items-center gap-x-2 cursor-pointer"
                    @click="state.showAdder = !state.showAdder">
                    <Icon :name="state.showAdder ? 'ph:x-circle-fill' : 'ph:plus-circle-fill'"
                        class="h-5 w-5 text-primary" aria-hidden="true" />
                    <p>{{ state.survey.questions.length === 0 ? $t('surveys.builder.getStarted') : $t('surveys.builder.addQuestion') }}</p>
                </div>

                <div v-if="state.showAdder && state.survey.questions.length === 0" class="space-y-2">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {{ $t('surveys.builder.templates') }}
                    </p>
                    <div class="grid grid-cols-3 gap-3">
                        <button v-for="template in surveyTemplates" :key="template.key" type="button"
                            class="px-5 py-4 border border-primary rounded-md bg-primary/5 hover:bg-primary/10 text-left"
                            @click="applyTemplate(template)">
                            <div class="flex items-center gap-x-2 text-sm font-semibold">
                                <Icon name="ph:clipboard-text" class="w-5 h-5 text-primary shrink-0" />
                                {{ template.name }}
                            </div>
                            <p class="mt-1 text-xs text-gray-500">{{ template.title }}</p>
                        </button>
                    </div>
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">
                        {{ $t('surveys.builder.orBuildYourOwn') }}
                    </p>
                </div>

                <div class="grid grid-cols-3 gap-3" v-if="state.showAdder">
                    <button v-for="type in questionTypes" :key="type.value" type="button"
                        class="px-5 py-4 border border-primary rounded-md bg-gray-50 hover:bg-gray-100"
                        @click="addQuestion(type.value)">
                        <div class="flex items-center gap-x-2 text-sm">
                            <Icon :name="type.icon" class="w-5 h-5 text-primary" aria-hidden="true" />
                            {{ type.label }}
                        </div>
                    </button>
                </div>
                <FormError :error="props?.error?.errors?.questions?.[0]" />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/surveys')">
                {{ $t('cancel') }}
            </FormButton>
            <FormButton type="submit" buttonStyle="primary">
                {{ props.formType === 'create' ? $t('save') : $t('update') }}
            </FormButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
import { surveyTemplates, type SurveyTemplate } from '@/components/modules/user/survey/survey-templates'
import type { Error } from '@/types'

const props = defineProps({
    error: { type: Object, required: false },
    formType: { type: String, required: true },
    selectedSurvey: { type: Object, required: false },
})
const emit = defineEmits(['submitForm'])
const { t } = useI18n()

const questionTypes = [
    { value: 'textfield', icon: 'solar:text-outline', label: t('surveys.builder.types.textfield') },
    { value: 'textarea', icon: 'ph:file-text', label: t('surveys.builder.types.textarea') },
    { value: 'datefield', icon: 'ph:calendar', label: t('surveys.builder.types.datefield') },
    { value: 'choice', icon: 'mdi:circle-slice-8', label: t('surveys.builder.types.choice') },
    { value: 'checkbox', icon: 'ph:check-square', label: t('surveys.builder.types.checkbox') },
    { value: 'rating', icon: 'material-symbols:thumb-up-outline-sharp', label: t('surveys.builder.types.rating') },
]

const state = reactive({
    survey: {
        title: '',
        description: '',
        is_active: true,
        writes_to_journal: false,
        score_ranges: [] as any[],
        questions: [] as any[],
    },
    showAdder: true,
    followUpFor: null as string | null,
    submitted: false,
})

// Every question gets a stable key: its uuid once saved, a temporary one
// until then. A follow-up's show_if.question refers to its parent's key, and
// the backend swaps temporary keys for the real uuids on save.
let keySeq = 0
function newKey() {
    return `new-${Date.now()}-${keySeq++}`
}

function parentOf(question: any) {
    if (!question.show_if) return undefined
    return state.survey.questions.find((q: any) => q.key === question.show_if.question)
}

function depthOf(question: any) {
    let depth = 0
    let parent = parentOf(question)
    while (parent && depth < state.survey.questions.length) {
        depth++
        parent = parentOf(parent)
    }
    return depth
}

function isDescendantOf(question: any, ancestorKey: string) {
    let parent = parentOf(question)
    for (let i = 0; parent && i < state.survey.questions.length; i++) {
        if (parent.key === ancestorKey) return true
        parent = parentOf(parent)
    }
    return false
}

// Follow-ups sit directly below their parent, so a question's follow-ups
// (and theirs) are the run of descendants right after it.
function lastDescendantIndex(index: number) {
    const key = state.survey.questions[index].key
    let end = index
    while (end + 1 < state.survey.questions.length && isDescendantOf(state.survey.questions[end + 1], key)) end++
    return end
}

// 1, 2, 2.1, 2.2, 3 ... so a follow-up reads as belonging to its parent.
const questionNumbers = computed(() => {
    const numbers = new Map<string, string>()
    const childCounts = new Map<string, number>()
    let top = 0
    return state.survey.questions.map((q: any) => {
        const parent = parentOf(q)
        let number: string
        if (parent && numbers.has(parent.key)) {
            const count = (childCounts.get(parent.key) ?? 0) + 1
            childCounts.set(parent.key, count)
            number = `${numbers.get(parent.key)}.${count}`
        } else {
            number = `${++top}`
        }
        numbers.set(q.key, number)
        return number
    })
})

watch(() => props.selectedSurvey, (survey: any) => {
    if (!survey) return
    state.survey.title = survey.title ?? ''
    state.survey.description = survey.description ?? ''
    state.survey.is_active = survey.is_active ?? true
    state.survey.writes_to_journal = survey.writes_to_journal ?? false
    state.survey.score_ranges = Array.isArray(survey.score_ranges)
        ? survey.score_ranges.map((r: any) => ({ ...r }))
        : []
    state.survey.questions = (survey.questions ?? []).map((q: any) => {
        const def = q.question ?? q
        return {
            uuid: q.uuid,
            key: q.uuid ?? newKey(),
            show_if: def.show_if?.question
                ? { question: def.show_if.question, options: [...(def.show_if.options ?? [])] }
                : undefined,
            type: def.type,
            value: def.value ?? '',
            required: !!def.required,
            options: def.options ? [...def.options] : undefined,
            scores: def.scores ? [...def.scores] : (def.options ? def.options.map(() => '') : undefined),
            levels: def.levels,
        }
    })
    if (state.survey.questions.length > 0) state.showAdder = false
}, { immediate: true })

function makeQuestion(type: string) {
    const q: any = { key: newKey(), type, value: `${t('surveys.builder.question')}`, required: false }
    if (['choice', 'checkbox'].includes(type)) {
        q.options = [`${t('surveys.builder.option')} 1`, `${t('surveys.builder.option')} 2`]
        q.scores = ['', '']
    }
    if (type === 'rating') q.levels = 5
    return q
}

function addQuestion(type: string) {
    state.survey.questions.push(makeQuestion(type))
    state.showAdder = false
}

function addFollowUp(parentIndex: number, type: string) {
    const parent = state.survey.questions[parentIndex]
    const q = makeQuestion(type)
    q.show_if = { question: parent.key, options: [0] }
    state.survey.questions.splice(lastDescendantIndex(parentIndex) + 1, 0, q)
    state.followUpFor = null
}

function toggleConditionOption(question: any, oi: number) {
    const options: number[] = question.show_if.options
    question.show_if.options = options.includes(oi)
        ? options.filter((o) => o !== oi)
        : [...options, oi].sort((a, b) => a - b)
}

// Removing a question also removes its follow-ups, which would otherwise
// point at a question that no longer exists.
function removeQuestion(index: number) {
    state.survey.questions.splice(index, lastDescendantIndex(index) - index + 1)
    if (state.survey.questions.length === 0) state.showAdder = true
}

function addOption(qi: number) {
    state.survey.questions[qi].options.push(`${t('surveys.builder.option')} ${state.survey.questions[qi].options.length + 1}`)
    state.survey.questions[qi].scores.push('')
}

// Conditions refer to options by index, so follow-ups of this question shift
// their picked indexes along with the removed option.
function removeOption(qi: number, oi: number) {
    const parent = state.survey.questions[qi]
    parent.options.splice(oi, 1)
    parent.scores.splice(oi, 1)
    state.survey.questions
        .filter((q: any) => q.show_if?.question === parent.key)
        .forEach((q: any) => {
            q.show_if.options = q.show_if.options.filter((o: number) => o !== oi).map((o: number) => (o > oi ? o - 1 : o))
        })
}

function addScoreRange() {
    state.survey.score_ranges.push({ from: '', to: '', label: '' })
}

function removeScoreRange(index: number) {
    state.survey.score_ranges.splice(index, 1)
}

function applyTemplate(template: SurveyTemplate) {
    if (!state.survey.title) state.survey.title = template.title
    if (!state.survey.description) state.survey.description = template.description
    state.survey.questions = template.fields.map((f: any) => ({
        key: newKey(),
        type: f.type,
        value: f.value,
        required: !!f.required,
        options: f.options ? [...f.options] : undefined,
        scores: f.scores ? [...f.scores] : undefined,
        levels: f.levels,
    }))
    state.survey.score_ranges = template.score_ranges.map((r) => ({ ...r }))
    state.showAdder = false
}

function cleanScoreRanges(ranges: any[]) {
    return (ranges ?? [])
        .filter((r: any) => r.label && r.from !== '' && r.to !== '' && !isNaN(Number(r.from)) && !isNaN(Number(r.to)))
        .map((r: any) => ({ from: Number(r.from), to: Number(r.to), label: r.label }))
}

function normalizeQuestions(questions: any[]) {
    return questions.map((q: any) => {
        const out: any = { type: q.type, value: q.value, required: !!q.required, key: q.key }
        if (q.uuid) out.uuid = q.uuid
        if (q.show_if) out.show_if = { question: q.show_if.question, options: [...q.show_if.options] }
        if (['choice', 'checkbox'].includes(q.type)) {
            out.options = q.options
            out.scores = (q.scores ?? []).map((s: any) => {
                const v = String(s ?? '').trim().replace(',', '.')
                return v !== '' && !isNaN(Number(v)) ? v : ''
            })
        }
        if (q.type === 'rating') out.levels = q.levels
        return out
    })
}

const rules = computed(() => ({
    survey: {
        title: { required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required) },
    },
}))
const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    state.submitted = true
    const followUpWithoutCondition = state.survey.questions.some((q: any) => q.show_if && q.show_if.options.length === 0)
    if (v$.value.$error || state.survey.questions.length === 0 || followUpWithoutCondition) return
    emit('submitForm', {
        title: state.survey.title,
        description: state.survey.description,
        is_active: true,
        writes_to_journal: state.survey.writes_to_journal,
        score_ranges: cleanScoreRanges(state.survey.score_ranges),
        questions: normalizeQuestions(state.survey.questions),
    })
}
</script>
