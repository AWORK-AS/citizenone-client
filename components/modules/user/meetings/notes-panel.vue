<template>
    <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 p-4 sm:p-5 space-y-4">
        <div class="flex items-center justify-between gap-3">
            <h3 class="font-semibold text-[#0f2b46] flex items-center gap-2">
                <Icon name="ph:note-pencil" class="h-5 w-5" /> {{ $t('meetings.notes.title') }}
            </h3>
            <span class="text-xs text-gray-400">
                <template v-if="state.saving">{{ $t('meetings.notes.saving') }}</template>
                <template v-else-if="state.savedAt">{{ $t('meetings.notes.saved', { time: state.savedAt }) }}</template>
            </span>
        </div>

        <div v-if="meeting.agenda" class="rounded-xl bg-[#f0faf9] px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-[#1b6d8a] mb-1">{{ $t('meetings.notes.agenda') }}</p>
            <p class="text-sm text-[#0f2b46] whitespace-pre-line">{{ meeting.agenda }}</p>
        </div>

        <div v-if="state.conflict" class="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm space-y-2">
            <p>{{ $t('meetings.notes.conflict', { name: state.conflict.notes_updated_by || '' }) }}</p>
            <div class="flex gap-2">
                <FormButton type="button" buttonStyle="primary" buttonSize="xs" @click="takeTheirs">{{ $t('meetings.notes.useLatest') }}</FormButton>
                <FormButton type="button" buttonStyle="cancel" buttonSize="xs" @click="keepMine">{{ $t('meetings.notes.keepMine') }}</FormButton>
            </div>
        </div>

        <textarea v-model="state.text" rows="8" :placeholder="$t('meetings.notes.placeholder')" @input="scheduleSave"
            class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm leading-relaxed focus:border-[#2dbab2] focus:ring-[#2dbab2]" />

        <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-xs text-gray-500">{{ $t('meetings.notes.hint') }}</p>
            <FormButton v-if="meeting.citizen" type="button" buttonStyle="secondary" :disabled="state.filing" @click="toJournal">
                <Icon name="ph:notebook" class="h-4 w-4 mr-1" />
                {{ meeting.notes_in_journal ? $t('meetings.notes.updateJournal') : $t('meetings.notes.toJournal') }}
            </FormButton>
        </div>
        <p v-if="state.filed" class="text-sm text-[#1b6d8a]">
            {{ $t('meetings.notes.filed') }}
            <NuxtLink :to="`/citizens/${meeting.citizen.uuid}/journals`" class="underline">{{ $t('meetings.notes.openJournal') }}</NuxtLink>
        </p>
        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { meetingService } from '@/components/api/user/MeetingService'

/**
 * The meeting's agenda and the staff's shared notes. Notes save themselves a
 * moment after typing stops. If a colleague saved in between, nothing is
 * overwritten: the newer text is offered, or this person keeps theirs.
 * Guests never see the notes.
 */
const props = defineProps<{ meeting: any }>()
const emit = defineEmits(['filed'])

const state = reactive({
    text: props.meeting.notes ?? '',
    seen: props.meeting.notes_updated_at ?? null as string | null,
    saving: false,
    savedAt: '',
    conflict: null as any,
    filing: false,
    filed: false,
    error: {} as any,
})

// A colleague's newer notes arrive with the page's refresh; take them while
// this person is not typing.
watch(() => props.meeting.notes_updated_at, (updatedAt) => {
    if (!timer && !state.saving && updatedAt && updatedAt !== state.seen) {
        state.text = props.meeting.notes ?? ''
        state.seen = updatedAt
    }
})

let timer: ReturnType<typeof setTimeout> | null = null

function scheduleSave() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(save, 1200)
}

async function save(force = false) {
    timer = null
    state.saving = true
    state.error = {}
    try {
        const data = (await meetingService.updateNotes(props.meeting.uuid, state.text, force ? null : state.seen))?.data
        state.seen = data?.notes_updated_at ?? state.seen
        state.savedAt = moment().format('HH:mm')
        state.conflict = null
    } catch (error: any) {
        if (error?.code === 'meeting_notes_conflict') state.conflict = error.data
        else state.error = error
    }
    state.saving = false
}

function takeTheirs() {
    state.text = state.conflict?.notes ?? ''
    state.seen = state.conflict?.notes_updated_at ?? null
    state.conflict = null
}

async function keepMine() {
    state.seen = state.conflict?.notes_updated_at ?? null
    await save()
}

async function toJournal() {
    if (timer) {
        clearTimeout(timer)
        await save()
    }
    state.filing = true
    state.error = {}
    try {
        await meetingService.notesToJournal(props.meeting.uuid)
        state.filed = true
        emit('filed')
    } catch (error: any) {
        state.error = error
    }
    state.filing = false
}

onBeforeUnmount(() => {
    if (timer) {
        clearTimeout(timer)
        save()
    }
})
</script>
