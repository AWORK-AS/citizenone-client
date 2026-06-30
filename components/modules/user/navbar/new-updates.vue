<template>
    <div>
        <Tooltip :text="$t('updates.newUpdates')" position="left">
            <button
                class="relative w-9 h-9 rounded-full flex items-center justify-center text-primary hover:text-primary-700 hover:bg-surface-100 transition-colors"
                @click="openUpdatesModal">
                <Icon name="ph:lightbulb" class="h-5 w-5" aria-hidden="true" />
                <Badge v-if="!userStore.getUser?.is_read_updates" type="notification"
                    class="w-4.5 h-4.5 flex items-center justify-center absolute -top-0.5 -right-0.5 text-[10px]">
                    21
                </Badge>
            </button>
        </Tooltip>
        <ModulesUserNewUpdatesModalUpdates :isModalOpen="state.modal.isNewUpdatesOpen" @close="closeUpdatesModal" />
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const emit = defineEmits(['fetchUser'])
const userStore = useUserStore() as any

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isNewUpdatesOpen: false,
    },
})

async function openUpdatesModal() {
    state.modal.isNewUpdatesOpen = true
    localStorage.setItem('hasSeenUpdates-02-20-2026', 'true')
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.readUpdates()
        if (response) {
            localStorage.setItem('hasSeenUpdates-02-20-2026', 'true')
            emit('fetchUser')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

const closeUpdatesModal = () => {
    state.modal.isNewUpdatesOpen = false
}
</script>