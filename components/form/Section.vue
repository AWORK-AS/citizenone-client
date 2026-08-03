<template>
    <!-- The last section needs no divider: the action bar below draws its own. -->
    <section class="border-b border-gray-900/10 pb-10 mb-10 [&:last-of-type]:mb-0 [&:last-of-type]:border-b-0">
        <!-- The heading sits above the card, not in a column beside it. The old
             side column held nothing but a heading, which left a third of the
             form empty on wide screens. -->
        <div class="mb-4">
            <h2 class="text-base font-semibold leading-7 text-gray-900">{{ title }}</h2>
            <p v-if="description" class="mt-1 max-w-[65ch] text-sm leading-6 text-gray-500">{{ description }}</p>
            <slot name="intro" />
        </div>
        <!-- Sections that already bring their own cards opt out of this one. -->
        <div v-if="bare">
            <slot />
        </div>
        <div v-else class="space-y-3 rounded-lg bg-white px-4 py-6 shadow-sm ring-1 ring-gray-900/5 sm:p-8">
            <slot />
        </div>
    </section>
</template>

<script setup lang="ts">
defineProps({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    bare: {
        type: Boolean,
        default: false,
    },
})
</script>
