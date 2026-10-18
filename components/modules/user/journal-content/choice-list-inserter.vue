<template>
    <!--
        Writes a choice list for a predefined text: one option per line becomes
        "{finasterid 1 mg tablet | finasterid 5% serum}" at the cursor, so nobody
        has to remember the braces and bars (see composables/journalChoiceLists).
    -->
    <div class="space-y-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3" data-testid="choice-list-inserter">
        <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-xs text-gray-600">
                {{ $t('journalContents.choices.syntaxHint', { example }) }}
            </p>
            <button type="button" v-if="!state.isOpen" data-testid="choice-list-open"
                class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#174560] ring-1 ring-gray-200 hover:bg-gray-100"
                @click="state.isOpen = true">
                <Icon name="ph:list-plus" class="size-4" aria-hidden="true" />
                {{ $t('journalContents.choices.addList') }}
            </button>
        </div>
        <div v-if="state.isOpen" class="space-y-2">
            <FormLabel for="choice_list_options" :label="$t('journalContents.choices.optionsLabel')" />
            <textarea id="choice_list_options" v-model="state.options" rows="3" data-testid="choice-list-options"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#174560]"
                :placeholder="$t('journalContents.choices.optionsPlaceholder')" />
            <FormError :error="state.error" />
            <div class="flex justify-end gap-2">
                <FormButton type="button" buttonStyle="cancel" class="!w-auto" @click="close">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="button" buttonStyle="primary" class="!w-auto" data-testid="choice-list-insert" @click="insert">
                    {{ $t('journalContents.choices.insertList') }}
                </FormButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { choiceListToken } from '@/composables/journalChoiceLists'

const emit = defineEmits(['insert'])
const { t } = useI18n()

// The example list, built from the placeholder: braces and bars cannot sit in
// a vue-i18n message, which reads them as its own syntax.
const example = computed(() => choiceListToken(t('journalContents.choices.optionsPlaceholder').split('\n')))

const state = reactive({
    isOpen: false,
    options: '',
    error: '',
})

function close() {
    state.isOpen = false
    state.options = ''
    state.error = ''
}

function insert() {
    const token = choiceListToken(state.options.split('\n'))
    if (!token) {
        state.error = t('journalContents.choices.needTwo')
        return
    }
    emit('insert', token)
    close()
}
</script>
