<template>
    <div class="py-1">
        <button class="relative w-full text-primary hover:text-primary-700 rounded-md py-3 flex items-center gap-x-2"
            @click="openUpdatesModal">
            <Icon name="ph:lightbulb" class="h-6 w-6" aria-hidden="true" />
            <p class="text-xs font-semibold hidden lg:block">
                {{ $t('updates.updates') }}
            </p>
            <Badge v-if="!userStore.getUser?.is_read_updates" type="notification"
                class="w-5 h-5 flex items-center justify-center absolute top-0 left-3">
                21
            </Badge>
        </button>
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