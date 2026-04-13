<template>
    <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" :id="props.id" :checked="props.value" class="peer w-5 h-5 appearance-none border border-gray-200 rounded-sm mr-2 
             checked:bg-primary checked:border-primary focus:ring-0" />
        <span class="pointer-events-none absolute w-5 h-5 flex items-center justify-center">
            <Icon name="ph:check-bold" class="h-4 w-4 text-white" />
        </span>
    </label>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: false,
    },
    value: {
        type: Boolean,
        required: false,
    },
})
</script>
