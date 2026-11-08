<template>
    <!-- An app's logo, or its first letter when there is no logo or it will not load.
         A broken-image icon told the reader nothing about which app the row was. -->
    <span class="shrink-0 overflow-hidden flex items-center justify-center bg-white border border-line"
        :class="size === 'lg' ? 'w-12 h-12 rounded-xl' : 'w-9 h-9 rounded-lg'">
        <img v-if="src && !failed" :src="src" alt="" class="w-full h-full object-contain p-1" loading="lazy"
            @error="failed = true" />
        <span v-else class="text-[13px] font-semibold text-tertiary">{{ initial }}</span>
    </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ app: any; size?: 'md' | 'lg' }>(), { size: 'md' })

const failed = ref(false)
const src = computed<string | null>(() => props.app?.logo || props.app?.image || null)
const initial = computed(() => (props.app?.name ?? '?').trim().charAt(0).toUpperCase())

watch(src, () => { failed.value = false })
</script>
