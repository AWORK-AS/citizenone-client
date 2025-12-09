<template>
    <div class="py-1">
        <FormButton buttonStyle="AI" buttonSize="xs" class="px-0 md:px-4" @click="state.modal.isAIAssistantOpen = true">
            <Icon name="ic:round-accessibility" class="h-8 w-8 md:w-6 md:h-6" aria-hidden="true" />
            <p class="text-sm font-semibold hidden md:block">
                {{ $t('assistants.assistants') }}
            </p>
        </FormButton>
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