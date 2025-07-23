<template>
    <div class="py-1">
        <button
            class="w-full bg-tertiary hover:bg-tertiary-800 text-white rounded-md px-3 py-3 flex items-center gap-x-2"
            @click="state.modal.isNewUpdatesOpen = true">
            <Icon name="ph:lightbulb" class="h-4 w-4" aria-hidden="true" />
            <p class="text-xs font-semibold hidden md:block">
                {{ $t('updates.newUpdates') }}
            </p>
        </button>
        <ModulesUserNewUpdatesModalUpdates :isModalOpen="state.modal.isNewUpdatesOpen"
            @close="state.modal.isNewUpdatesOpen = false" />
    </div>
</template>

<script setup lang="ts">
const state = reactive({
    modal: {
        isNewUpdatesOpen: false,
    }
})
</script>