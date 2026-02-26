<template>
    <Tooltip :text="tooltip" v-if="tooltip">
        <button type="button"
            class="relative inline-flex mx-1 text-primary hover:text-primary-700"
            @click="$emit('click')">
            <Icon :name="icon" class="w-6 h-6" />
            <span v-if="count > 0"
                class="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                {{ count }}
            </span>
        </button>
    </Tooltip>
    <button v-else type="button"
        class="relative inline-flex mx-1 text-primary hover:text-primary-700"
        @click="$emit('click')">
        <Icon :name="icon" class="w-6 h-6" />
        <span v-if="count > 0"
            class="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {{ count }}
        </span>
    </button>
</template>

<script setup lang="ts">
defineProps({
    count: {
        type: Number,
        default: 0,
    },
    icon: {
        type: String,
        default: 'ph:bell-ringing-light',
    },
    tooltip: {
        type: String,
        default: '',
    },
})

defineEmits(['click'])
</script>
