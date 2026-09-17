<template>
    <div v-if="live.length || receipts.length" class="space-y-1.5">
        <!-- Running now. One line per tool, named, because the four to nine
        seconds this takes used to be a typing indicator and nothing else. -->
        <p v-for="call in live" :key="`${call.tool}-${call.turn}`"
            class="flex items-center gap-2 text-xs text-gray-500">
            <ModulesUserNavbarCodyMark :size="14" :stroke-width="3.2" state="working" class="shrink-0 text-primary" />
            <span>{{ label(call.tool) }}</span>
        </p>

        <!-- Finished, and kept. An answer built from the wrong source looks
        exactly like one built from the right source until you can see what was
        read - which is how a colleague's name in a citizen's journal became an
        answer about that citizen. Closed by default: it is a receipt, not the
        point of the screen. -->
        <details v-if="receipts.length" class="group">
            <summary
                class="flex cursor-pointer list-none items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
                <Icon name="ph:caret-right"
                    class="size-3 shrink-0 transition-transform group-open:rotate-90" aria-hidden="true" />
                <span>{{ $t('assistants.toolTrace.title') }} ({{ receipts.length }})</span>
            </summary>
            <ul class="mt-1.5 space-y-1 border-l border-gray-200 pl-2.5">
                <li v-for="(receipt, index) in receipts" :key="index" class="text-xs leading-snug">
                    <span class="flex items-start gap-1.5">
                        <Icon :name="receipt.ok ? 'ph:check' : 'ph:warning-circle'"
                            :class="['mt-0.5 size-3 shrink-0', receipt.ok ? 'text-gray-400' : 'text-amber-600']"
                            aria-hidden="true" />
                        <span class="min-w-0">
                            <span class="font-medium text-gray-500">{{ label(receipt.tool) }}</span>
                            <span v-if="receipt.summary" class="text-gray-400"> — {{ receipt.summary }}</span>
                            <span v-else-if="!receipt.ok" class="text-gray-400">
                                — {{ $t('assistants.toolTrace.failed') }}</span>
                            <span v-if="receipt.ms" class="ml-1 tabular-nums text-gray-300">
                                {{ $t('assistants.toolTrace.duration', { ms: receipt.ms }) }}</span>
                        </span>
                    </span>
                </li>
            </ul>
        </details>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

/**
 * What Cody is doing, and what it read.
 *
 * The tool names come off the stream exactly as the model called them
 * (`my_shifts`), and the reader never sees one: the label is looked up in the
 * language files next to every other string in the product, so a Danish user
 * reads "Læser dine vagter". A tool with no translation yet falls back to a
 * generic line rather than showing a snake_case identifier - a missing
 * translation should look plain, not broken.
 */
export interface ToolCall {
    tool: string
    turn: number
}

export interface ToolReceipt {
    tool: string
    summary?: string
    ms?: number
    ok?: boolean
}

const props = withDefaults(defineProps<{
    live?: ToolCall[]
    receipts?: ToolReceipt[]
}>(), {
    live: () => [],
    receipts: () => [],
})

const { t } = useI18n()

/**
 * Listed rather than looked up, mirroring the backend's ToolRegistry: the set
 * of things Cody may do is something a person should read in one screen, and a
 * tool added on the server shows up here as a plain line until somebody writes
 * its label in all four languages.
 */
const KNOWN_TOOLS = [
    'daily_brief',
    'my_shifts',
    'my_tasks',
    'my_messages',
    'create_task',
    'draft_journal_note',
]

const live = computed(() => props.live ?? [])
const receipts = computed(() => props.receipts ?? [])

function label(tool: string): string {
    return KNOWN_TOOLS.includes(tool)
        ? t(`assistants.tools.${tool}`)
        : t('assistants.toolTrace.unknown')
}
</script>
