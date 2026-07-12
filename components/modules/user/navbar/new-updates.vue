<template>
    <div>
        <Tooltip :text="$t('updates.newUpdates')" position="left">
            <button
                class="relative w-9 h-9 rounded-full flex items-center justify-center text-primary hover:text-primary-700 hover:bg-surface-100 transition-colors"
                @click="openUpdatesModal">
                <Icon name="ph:lightbulb" class="h-5 w-5" aria-hidden="true" />
                <Badge v-if="state.unseenCount > 0" type="notification"
                    class="w-4.5 h-4.5 flex items-center justify-center absolute -top-0.5 -right-0.5 text-[10px]">
                    {{ state.unseenCount > 9 ? '9+' : state.unseenCount }}
                </Badge>
            </button>
        </Tooltip>
        <ModulesUserNewUpdatesModalReleaseNotes :isModalOpen="state.modal.isNewUpdatesOpen" @close="closeUpdatesModal" />
    </div>
</template>

<script setup lang="ts">
import { releaseNoteService } from '@/components/api/user/ReleaseNoteService'
import type { Error } from '@/types'

const state = reactive({
    error: {} as Error,
    unseenCount: 0,
    modal: {
        isNewUpdatesOpen: false,
    },
})

onMounted(() => fetchUnseenCount())

async function fetchUnseenCount() {
    try {
        const response = await releaseNoteService.getUnseenCount()
        state.unseenCount = response?.count ?? 0
    } catch (error: any) {
        state.unseenCount = 0
    }
}

async function openUpdatesModal() {
    state.modal.isNewUpdatesOpen = true
    // Mark everything published-so-far as seen, then clear the badge.
    try {
        await releaseNoteService.markSeen()
        state.unseenCount = 0
    } catch (error: any) {
        state.error = error
    }
}

function closeUpdatesModal() {
    state.modal.isNewUpdatesOpen = false
}
</script>
