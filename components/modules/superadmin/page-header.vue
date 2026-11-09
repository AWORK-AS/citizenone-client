<template>
    <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
            <div v-if="$slots.back" class="mb-3">
                <slot name="back" />
            </div>
            <h1 class="text-2xl font-light leading-tight text-ink">
                <slot name="title">{{ title }}</slot>
            </h1>
            <p v-if="subtitle || $slots.subtitle" class="mt-1 max-w-2xl text-sm text-ink-body">
                <slot name="subtitle">{{ subtitle }}</slot>
            </p>
        </div>
        <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2 shrink-0">
            <slot name="actions" />
        </div>
    </header>
</template>

<script setup lang="ts">
/**
 * The top of a superadmin page. The layout's top bar carries the breadcrumb
 * (where you are); this carries the page itself: its title, one line on what
 * it is for, and the page's own actions on the right.
 */
withDefaults(defineProps<{
    title?: string
    subtitle?: string
}>(), {
    title: '',
    subtitle: '',
})
</script>
