<template>
    <div>
        <button type="button"
            class="relative w-9 h-9 rounded-full flex items-center justify-center text-primary hover:text-primary-700 hover:bg-surface-100 transition-colors"
            @click="navigateTo('/own-chatgpt')">
            <Icon name="simple-icons:openai" class="h-5 w-5" aria-hidden="true" />
        </button>
    </div>
</template>
