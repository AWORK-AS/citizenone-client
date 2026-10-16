<template>
    <!--
        Choosing the options of a predefined text before it goes into the note:
        "Patienten starter på {tablet | serum}" becomes the case at hand, so one
        saved text covers every medication form (see composables/journalChoiceLists).
    -->
    <Modal size="lg" :title="$t('journalContents.choices.title')" titleIcon="ph:list-checks" titleIconColor="174560"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <div class="space-y-5" data-testid="journal-choices">
                <p class="text-sm text-gray-600">{{ $t('journalContents.choices.hint') }}</p>

                <div v-for="list in lists" :key="list.index" class="space-y-1">
                    <FormLabel :for="`journal_choice_${list.index}`"
                        :label="list.context ? `${list.index + 1}. …${list.context}` : `${list.index + 1}.`" />
                    <select :id="`journal_choice_${list.index}`" v-model.number="state.choices[list.index]"
                        :data-testid="`journal-choice-${list.index}`"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#174560]">
                        <option v-for="(option, optionIndex) in list.options" :key="optionIndex" :value="optionIndex">
                            {{ choiceOptionLabel(option) }}
                        </option>
                    </select>
                </div>

                <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('journalContents.choices.preview') }}</p>
                    <div class="prose prose-sm max-w-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                        data-testid="journal-choices-preview" v-html="preview" />
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="button" buttonStyle="primary" data-testid="journal-choices-insert" @click="insert">
                        <Icon name="ph:text-indent" class="size-4" />
                        {{ $t('journalContents.choices.insert') }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { choiceOptionLabel, parseChoiceLists, resolveChoiceLists } from '@/composables/journalChoiceLists'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    content: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['close', 'insert'])

const state = reactive({
    choices: [] as number[],
})

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) state.choices = lists.value.map(() => 0)
})

// Each list with the few words before it, so "1. …starter på" says which
// choice it is without the person having to count braces.
const lists = computed(() => {
    const segments = parseChoiceLists(props.content)
    return segments.flatMap((segment, position) => {
        if (segment.type !== 'choice') return []
        const before = segments[position - 1]
        const text = before?.type === 'text' ? choiceOptionLabel(before.html) : ''
        const context = text.split(/\s+/).filter(Boolean).slice(-4).join(' ')
        return [{ index: segment.index, options: segment.options, context }]
    })
})

const preview = computed(() => resolveChoiceLists(props.content, state.choices))

function insert() {
    emit('insert', resolveChoiceLists(props.content, state.choices))
}
</script>
