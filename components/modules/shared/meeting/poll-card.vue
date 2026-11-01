<template>
    <div class="rounded-xl bg-white p-4 space-y-2.5" :class="flat ? 'ring-1 ring-gray-200' : 'shadow-lg'">
        <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-semibold text-[#0f2b46]">{{ poll.question }}</p>
            <span class="shrink-0 text-[11px] rounded-full px-2 py-0.5" :class="poll.closed ? 'bg-gray-100 text-gray-600' : 'bg-[#f0faf9] text-[#1b6d8a]'">
                {{ poll.closed ? $t('meetings.polls.closed') : $t('meetings.polls.open') }}
            </span>
        </div>
        <div v-for="(option, index) in poll.options" :key="index">
            <button type="button" class="w-full text-left rounded-lg border px-3 py-2 text-sm relative overflow-hidden transition disabled:cursor-default"
                :class="myVote === index ? 'border-[#2dbab2] ring-1 ring-[#2dbab2]' : 'border-gray-200 hover:border-gray-300'"
                :disabled="poll.closed" @click="emit('vote', index)">
                <span v-if="showResult" class="absolute inset-y-0 left-0 bg-[#2dbab2]/15" :style="{ width: `${percent(index)}%` }" />
                <span class="relative flex justify-between gap-2">
                    <span>{{ option }}</span>
                    <span v-if="showResult" class="tabular-nums text-gray-600">{{ count(index) }} · {{ percent(index) }}%</span>
                </span>
            </button>
            <p v-if="!poll.anonymous && showResult && voters(index).length" class="mt-0.5 px-1 text-[11px] text-gray-500">
                {{ voters(index).join(', ') }}
            </p>
        </div>
        <p class="text-[11px] text-gray-500">
            {{ $t('meetings.polls.votes', { count: Object.keys(poll.votes).length }) }}
            <span v-if="poll.anonymous"> · {{ $t('meetings.polls.anonymousShort') }}</span>
        </p>
        <div v-if="mine" class="flex flex-wrap gap-2">
            <FormButton v-if="!poll.closed" type="button" buttonStyle="cancel" buttonSize="xs" @click="emit('close')">{{ $t('meetings.polls.close') }}</FormButton>
            <FormButton v-if="poll.closed" type="button" buttonStyle="secondary" buttonSize="xs" @click="emit('save')">{{ $t('meetings.polls.saveToNotes') }}</FormButton>
            <FormButton type="button" buttonStyle="cancel" buttonSize="xs" @click="emit('hide')">{{ $t('meetings.polls.hide') }}</FormButton>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * One poll in a meeting: the question, the options, and - once this person
 * has voted or the poll is closed - the live result. Shown floating over the
 * meeting, or inside the chat when the chat is open.
 */
const props = defineProps<{
    poll: { question: string, options: string[], anonymous: boolean, closed: boolean, votes: Record<string, number>, names: Record<string, string> }
    me: string
    mine: boolean
    flat?: boolean
}>()
const emit = defineEmits(['vote', 'close', 'save', 'hide'])

const myVote = computed(() => props.poll.votes[props.me])
const showResult = computed(() => myVote.value !== undefined || props.poll.closed)
const total = computed(() => Object.keys(props.poll.votes).length)
const count = (index: number) => Object.values(props.poll.votes).filter((v) => v === index).length
const percent = (index: number) => total.value ? Math.round((count(index) / total.value) * 100) : 0
const voters = (index: number) => Object.entries(props.poll.votes)
    .filter(([, v]) => v === index).map(([identity]) => props.poll.names[identity] || '')
</script>
