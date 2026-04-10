<template>
    <div class="py-1">
        <button class="relative text-primary hover:text-primary-700 rounded-lg p-2 flex items-center hover:bg-surface-100 transition-colors"
            @click="openUpdatesModal">
            <Icon name="ph:lightbulb" class="h-5 w-5" aria-hidden="true" />
            <Badge v-if="!hasSeenUpdates" type="notification"
                class="w-4.5 h-4.5 flex items-center justify-center absolute -top-0.5 -right-0.5 text-[10px]">
                21
            </Badge>
        </button>
        <ModulesUserNewUpdatesModalUpdates :isModalOpen="state.modal.isNewUpdatesOpen" @close="closeUpdatesModal" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// Reactive state
const state = reactive({
    modal: {
        isNewUpdatesOpen: false,
    }
})

// Flag to check if updates have been seen (loaded from localStorage)
const hasSeenUpdates = ref(localStorage.getItem('hasSeenUpdates-02-20-2026') === 'true')

// Method to open the modal and remove the badge
const openUpdatesModal = () => {
    state.modal.isNewUpdatesOpen = true

    // Mark as seen by setting localStorage flag
    localStorage.setItem('hasSeenUpdates-02-20-2026', 'true')
    hasSeenUpdates.value = true  // Update the badge visibility
}

// Method to close the modal
const closeUpdatesModal = () => {
    state.modal.isNewUpdatesOpen = false
}
</script>