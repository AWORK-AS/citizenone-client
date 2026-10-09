<template>
    <div class="space-y-8">
        <div v-for="(question, qi) in visibleQuestions" :key="question.uuid" class="space-y-3">
            <!-- Text the patient reads rather than answers, such as the risks a consent form explains. -->
            <template v-if="isLayout(question)">
                <h2 v-if="def(question)?.type === 'heading'" class="text-lg font-semibold text-gray-900">
                    {{ def(question)?.value }}
                </h2>
                <h3 v-else-if="def(question)?.type === 'subheading'" class="text-base font-semibold text-gray-900">
                    {{ def(question)?.value }}
                </h3>
                <p v-else-if="def(question)?.type === 'guidance'"
                    class="text-sm text-gray-700 whitespace-pre-line rounded-md bg-primary/5 border border-primary/20 p-4">
                    {{ def(question)?.value }}
                </p>
                <p v-else class="text-sm text-gray-700 whitespace-pre-line">{{ def(question)?.value }}</p>
            </template>
            <div v-else class="bg-gray-100 rounded-md border-t-2 border-primary">
                <div class="p-5 space-y-3">
                    <div class="flex gap-x-3">
                        <div>{{ numberOf(question, qi) }}.</div>
                        <div class="grow space-y-3">
                            <h3>
                                {{ def(question)?.value }}
                                <span v-if="def(question)?.required" class="text-red-500">*</span>
                            </h3>
                            <FormTextField v-if="def(question)?.type === 'textfield'" :name="'q_' + qi"
                                :placeholder="$t('surveys.fill.enterAnswer')"
                                :modelValue="answers[question.uuid]"
                                @update:modelValue="answers[question.uuid] = $event" />
                            <FormTextArea v-if="def(question)?.type === 'textarea'" :name="'q_' + qi"
                                :placeholder="$t('surveys.fill.enterAnswer')"
                                :modelValue="answers[question.uuid]"
                                @update:modelValue="answers[question.uuid] = $event" />
                            <div v-if="def(question)?.type === 'datefield'" class="relative">
                                <FormDateField :name="'q_' + qi" :placeholder="$t('surveys.fill.enterAnswer')"
                                    :modelValue="answers[question.uuid]"
                                    @update:modelValue="answers[question.uuid] = $event" />
                                <Icon name="ph:calendar" class="h-5 w-5 absolute right-4 top-2.5 text-gray-500" />
                            </div>
                            <div v-if="def(question)?.type === 'choice'" class="space-y-3">
                                <div v-for="(radio, ri) in def(question)?.options" :key="ri"
                                    class="flex items-center gap-x-2">
                                    <label class="flex items-center gap-x-2 cursor-pointer"
                                        @click="answers[question.uuid] = ri">
                                        <span class="h-4 w-4 rounded-full border flex items-center justify-center"
                                            :class="answers[question.uuid] === ri ? 'border-primary' : 'border-gray-400'">
                                            <span v-if="answers[question.uuid] === ri"
                                                class="h-2.5 w-2.5 rounded-full bg-primary"></span>
                                        </span>
                                        <h3>{{ radio }}</h3>
                                    </label>
                                </div>
                            </div>
                            <div v-if="def(question)?.type === 'checkbox'" class="space-y-3">
                                <div v-for="(checkbox, ci) in def(question)?.options" :key="ci"
                                    class="flex items-center gap-x-2">
                                    <label class="flex items-center gap-x-2 cursor-pointer"
                                        @click="toggleCheckbox(question.uuid, ci)">
                                        <span class="h-4 w-4 rounded-sm border flex items-center justify-center"
                                            :class="isChecked(question.uuid, ci) ? 'border-primary bg-primary' : 'border-gray-400 bg-white'">
                                            <Icon v-if="isChecked(question.uuid, ci)" name="ph:check-bold"
                                                class="h-3 w-3 text-white" />
                                        </span>
                                        <h3>{{ checkbox }}</h3>
                                    </label>
                                </div>
                            </div>
                            <div v-if="def(question)?.type === 'rating'"
                                class="flex items-center justify-between gap-x-2">
                                <button v-for="rating in def(question)?.levels" :key="rating" type="button"
                                    class="w-full h-10 flex items-center justify-center border border-gray-300 rounded-sm"
                                    :class="answers[question.uuid] === rating && 'bg-primary text-white'"
                                    @click="answers[question.uuid] = rating">
                                    {{ rating }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    questions: { type: Array as any, required: true },
    answers: { type: Object as any, required: true },
    // Also show headings and paragraphs between the questions. Off by default, so surveys and
    // portal forms render exactly as before.
    withLayout: { type: Boolean, default: false },
})

const LAYOUT_TYPES = ['heading', 'subheading', 'paragraph', 'guidance']

// Only questions we can render/answer (all current types are supported).
const visibleQuestions = computed(() => props.questions ?? [])

function isLayout(question: any) {
    return props.withLayout && LAYOUT_TYPES.includes(def(question)?.type)
}

// Questions are numbered among themselves; a heading or paragraph does not take a number.
function numberOf(question: any, index: number) {
    if (!props.withLayout) return index + 1
    return visibleQuestions.value.slice(0, index + 1).filter((q: any) => !isLayout(q)).length
}

function def(question: any) {
    const q = question?.question ?? question
    try {
        return typeof q === 'string' ? JSON.parse(q) : q
    } catch {
        return null
    }
}

function toggleCheckbox(uuid: string, optionIndex: number) {
    if (!Array.isArray(props.answers[uuid])) props.answers[uuid] = []
    const i = props.answers[uuid].indexOf(optionIndex)
    if (i === -1) props.answers[uuid].push(optionIndex)
    else props.answers[uuid].splice(i, 1)
}

function isChecked(uuid: string, optionIndex: number) {
    return Array.isArray(props.answers[uuid]) && props.answers[uuid].includes(optionIndex)
}

function missingRequiredQuestions() {
    return visibleQuestions.value.filter((question: any) => {
        const d = def(question)
        if (!d?.required) return false
        const a = props.answers[question.uuid]
        if (a === undefined || a === null || a === '') return true
        if (Array.isArray(a) && a.length === 0) return true
        return false
    })
}

defineExpose({ missingRequiredQuestions })
</script>
