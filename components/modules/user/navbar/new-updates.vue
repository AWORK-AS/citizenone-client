<template>
    <div class="py-1">
        <button class="relative w-full text-primary hover:text-primary-700 rounded-md py-3 flex items-center gap-x-2"
            @click="openUpdatesModal">
            <Icon name="ph:lightbulb" class="h-6 w-6" aria-hidden="true" />
            <p class="text-xs font-semibold hidden lg:block">
                {{ $t('updates.updates') }}
            </p>
            <Badge v-if="!hasSeenUpdates" type="notification"
                class="w-5 h-5 flex items-center justify-center absolute top-0 left-3">
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