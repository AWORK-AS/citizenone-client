<template>
    <div class="py-1">
        <button class="w-full text-primary hover:text-primary-700 rounded-md py-3 flex items-center gap-x-2"
            @click="state.modal.isNewUpdatesOpen = true">
            <Icon name="ph:lightbulb" class="h-6 w-6 md:h-4 md:w-4" aria-hidden="true" />
            <p class="text-sm font-semibold hidden md:block">
                {{ $t('updates.updates') }}
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