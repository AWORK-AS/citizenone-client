<template>
    <div class="flex items-center px-4 py-3 mb-4 rounded-lg" role="alert" :class="[
        props.type === 'default' && 'bg-gray-100 text-black',
        props.type === 'success' && 'bg-green-800 text-white',
        props.type === 'danger' && 'bg-red-100 text-black',
    ]">
        <div v-if="props.type === 'danger'">
            <svg class="flex-shrink-0 w-5 h-5 text-red-700 dark:text-red-800" fill="currentColor" viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"></path>
            </svg>
        </div>
        <div v-if="props.type === 'success'">
            <Icon name="heroicons:check-circle" class="w-5 h-5 text-white rounded-full" />
        </div>
        <div class="ml-3 text-sm font-medium" :class="[
            props.type === 'default' && 'text-primary',
            props.type === 'danger' && 'text-red-700']">
            {{ props.text }}
        </div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    type: {
        type: String,
        default: 'default',
        required: true,
    },
    text: {
        type: String,
        default: '',
        required: true,
    },
})
</script>