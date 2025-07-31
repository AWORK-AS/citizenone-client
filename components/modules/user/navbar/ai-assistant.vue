<template>
    <div class="py-1">
        <button class="py-2.5 flex items-center gap-x-1 text-sm text-primary hover:text-primary-700"
            @click="state.modal.isAIAssistantOpen = true">
            <Icon name="ic:round-accessibility" class="h-8 w-8 md:w-6 md:h-6" aria-hidden="true" />
            <p class="hidden md:block">
                {{ $t('assistants.assistants') }}
            </p>
        </button>
        <ModulesUserAssistantModalAssistant :isModalOpen="state.modal.isAIAssistantOpen"
            @close="state.modal.isAIAssistantOpen = false" />
    </div>
</template>

<script setup lang="ts">
const state = reactive({
    modal: {
        isAIAssistantOpen: false,
    }
})
</script>