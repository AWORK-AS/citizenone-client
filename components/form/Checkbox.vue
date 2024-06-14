<template>
    <input type="checkbox" class="w-5 h-5 accent-primary cursor-pointer focus:ring-transparent mr-2"
        :checked="props.value">
</template>

<script setup lang="ts">
const props = defineProps({
    value: {
        type: Boolean,
        required: false,
    },
})
</script>