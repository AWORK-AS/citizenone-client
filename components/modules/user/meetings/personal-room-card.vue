<template>
    <div class="mb-4 rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 p-4 flex flex-wrap items-center gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0faf9]">
            <Icon name="ph:door-open" class="h-5 w-5 text-[#0f4c75]" />
        </span>
        <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-900">{{ $t('meetings.personalRoom.title') }}</p>
            <p v-if="!state.room" class="text-[13px] text-gray-500">{{ $t('meetings.personalRoom.intro') }}</p>
            <p v-else class="text-[13px] text-gray-700 truncate">
                <span class="font-mono">{{ state.room.url }}</span>
            </p>
        </div>

        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" class="w-full" />

        <div class="flex flex-wrap items-center gap-2">
            <template v-if="state.room">
                <button type="button" class="h-9 px-3 rounded-full ring-1 ring-gray-200 bg-white hover:bg-gray-50 text-sm inline-flex items-center gap-1.5"
                    @click="copy">
                    <Icon :name="state.copied ? 'ph:check' : 'ph:copy'" class="h-4 w-4" />
                    {{ state.copied ? $t('meetings.personalRoom.copied') : $t('meetings.personalRoom.copy') }}
                </button>
                <button type="button" class="h-9 px-3 rounded-full ring-1 ring-gray-200 bg-white hover:bg-gray-50 text-sm inline-flex items-center gap-1.5"
                    :title="$t('meetings.personalRoom.newLinkHint')" :disabled="state.isBusy" @click="newLink">
                    <Icon name="ph:arrows-clockwise" class="h-4 w-4" /> {{ $t('meetings.personalRoom.newLink') }}
                </button>
                <NuxtLink :to="`/meetings/${state.room.uuid}`"
                    class="h-9 px-4 rounded-full bg-[#0f4c75] hover:bg-[#0f2b46] text-white text-sm font-semibold inline-flex items-center gap-1.5">
                    <Icon name="ph:sign-in" class="h-4 w-4" /> {{ $t('meetings.personalRoom.enter') }}
                </NuxtLink>
            </template>
            <button v-else type="button" :disabled="state.isBusy"
                class="h-9 px-4 rounded-full ring-1 ring-[#0f4c75] text-[#0f4c75] bg-white hover:bg-[#f0faf9] text-sm font-semibold inline-flex items-center gap-1.5"
                @click="open">
                <Icon name="ph:plus" class="h-4 w-4" /> {{ $t('meetings.personalRoom.create') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { meetingService } from '@/components/api/user/MeetingService'

/**
 * "Mit mødelokale": the host's standing room with a link that always works,
 * for an email signature or a chat. Visitors give a name and wait in the
 * waiting room until the host lets them in. A new link closes the old one.
 */
const { t } = useI18n()

const state = reactive({
    room: null as null | { uuid: string, url: string },
    isBusy: false,
    copied: false,
    error: {} as any,
})

async function load() {
    try {
        const response = await meetingService.personalRoom()
        state.room = response?.data ?? null
    } catch (error: any) {
        state.error = error
    }
}

async function open() {
    state.isBusy = true
    state.error = {}
    try {
        const response = await meetingService.openPersonalRoom()
        state.room = response?.data ?? null
    } catch (error: any) {
        state.error = error
    }
    state.isBusy = false
}

async function newLink() {
    if (!window.confirm(t('meetings.personalRoom.newLinkConfirm'))) return
    state.isBusy = true
    state.error = {}
    try {
        const response = await meetingService.newPersonalRoomLink()
        state.room = response?.data ?? null
        state.copied = false
    } catch (error: any) {
        state.error = error
    }
    state.isBusy = false
}

async function copy() {
    if (!state.room) return
    try {
        await navigator.clipboard.writeText(state.room.url)
        state.copied = true
        setTimeout(() => { state.copied = false }, 2000)
    } catch {
        // The link is on screen to copy by hand.
    }
}

onMounted(load)
</script>
