<template>
    <NuxtLink :to="card.link ?? undefined"
        class="group block rounded-xl border border-gray-200 bg-white transition-colors hover:border-cody/50">
        <div class="flex items-start gap-2.5 px-3 py-2.5">
            <Icon :name="ICONS[card.type] ?? 'ph:file-text'" class="mt-0.5 size-4 shrink-0 text-cody-deep"
                aria-hidden="true" />
            <div class="min-w-0 flex-1">
                <p class="truncate text-[13px] font-semibold text-gray-900">{{ card.title }}</p>
                <p v-if="card.subtitle" class="truncate text-xs text-gray-500">{{ card.subtitle }}</p>

                <div v-if="card.badges?.length || card.facts?.length" class="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span v-for="badge in card.badges ?? []" :key="badge"
                        :class="['rounded-full px-2 py-0.5 text-[10.5px] font-medium',
                            badge === 'draft' ? 'bg-primary-50 text-primary' : 'bg-violet-100 text-violet-700']">
                        {{ $t(`assistants.cards.badges.${badge}`) }}
                    </span>
                    <span v-for="fact in card.facts ?? []" :key="fact.label" class="text-[11px] text-gray-400">
                        {{ $t(`assistants.cards.facts.${fact.label}`) }}: {{ fact.value }}
                    </span>
                </div>
            </div>
            <Icon name="ph:arrow-up-right"
                class="mt-0.5 size-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-cody" aria-hidden="true" />
        </div>
    </NuxtLink>
</template>

<script setup lang="ts">
import type { AnswerCard } from '@/composables/useCodyChat'

/**
 * A record the answer is about, drawn the way the product draws it.
 *
 * Every field here was built by the server from a reference, for the person
 * asking - the model supplies neither the values nor the destination. So this
 * component renders what it is given and nothing else: no fetching, no
 * formatting of dates it was not handed, and no type it does not know.
 *
 * A type the client has not learned yet simply never reaches this component
 * (see the registry in the thread), which is what lets a new card ship on the
 * server before the component that draws it exists.
 */
const props = defineProps<{ card: AnswerCard }>()

const ICONS: Record<string, string> = {
    task: 'ph:check-square-offset',
    journal_note: 'ph:notebook',
    shift_day: 'ph:calendar-blank',
}

const card = computed(() => props.card)
</script>
