<template>
    <div class="py-1">
        <FormButton buttonStyle="AI" buttonSize="xs" class="px-0 md:px-4"
            :aria-expanded="assistantStore.isOpen"
            @click="userStore.getUser?.has_ai_access ? assistantStore.toggle() : navigateTo('/apps')">
            <Icon name="ic:round-accessibility" class="h-8 w-8 md:w-5 md:h-5" aria-hidden="true" />
            <p class="text-sm font-semibold hidden lg:block">
                {{ $t('assistants.askAI') }}
            </p>
        </FormButton>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useAssistantStore } from '@/store/assistant'

// The panel itself is rendered once by the user layout, not here - it has to
// outlive this button and the layout needs the open state to make room for it.
const userStore = useUserStore() as any
const assistantStore = useAssistantStore()
</script>
