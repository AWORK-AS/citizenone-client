<template>
    <div class="flex gap-x-3 items-center text-sm">
        <span class="cursor-pointer text-primary-800 hover:text-primary-600" @click="navigateTo('/')">
            Home
        </span>
        <ChevronRightIcon class="w-4 h-4" />
        <span class="text-gray-500">
            <slot name="title"></slot>
        </span>
    </div>
</template>

<script setup type="ts">
import {
    ChevronRightIcon,
} from '@heroicons/vue/outline'
</script>