<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Section label shown in the header. */
    title: string
    /** Whether the section starts expanded. */
    defaultOpen?: boolean
  }>(),
  { defaultOpen: true },
)

const open = ref(props.defaultOpen)
</script>

<template>
  <section class="space-y-4">
    <button
      type="button"
      class="group flex w-full items-center gap-3 text-left"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
        {{ title }}
      </span>
      <span class="h-px flex-1 bg-surface-200 transition-colors group-hover:bg-secondary-200"></span>
      <Icon
        name="heroicons:chevron-down-20-solid"
        class="size-4 shrink-0 text-slate-400 transition-transform duration-300 ease-out group-hover:text-secondary"
        :class="{ '-rotate-180': open }"
      />
    </button>

    <!-- Smooth auto-height collapse via grid-template-rows (0fr <-> 1fr). -->
    <div
      class="grid transition-[grid-template-rows] duration-300 ease-out"
      :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
        <slot />
      </div>
    </div>
  </section>
</template>
