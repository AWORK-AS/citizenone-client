<template>
    <input type="checkbox" :id="props.id" class="w-5 h-5 accent-primary cursor-pointer focus:ring-transparent mr-2"
        :checked="props.value">
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