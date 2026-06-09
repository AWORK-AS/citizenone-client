<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Section label shown in the header. */
    title: string
    /** Whether the section starts expanded (used when no stored state exists). */
    defaultOpen?: boolean
    /** When set, the user's open/collapsed choice is remembered under this key. */
    storageKey?: string
  }>(),
  { defaultOpen: true },
)

const STORAGE_PREFIX = 'co-section:'

function readStored(): boolean | null {
  if (!props.storageKey || typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(STORAGE_PREFIX + props.storageKey)
  return stored === null ? null : stored === '1'
}

const open = ref(readStored() ?? props.defaultOpen)
// Lazy mount: the slot is only rendered once the section has been opened at least
// once, so a collapsed-by-default section never mounts its widgets (or fires their
// API calls) until the user actually expands it. It stays mounted afterwards.
const hasOpened = ref(open.value)

watch(open, (value) => {
  if (value) hasOpened.value = true
  if (props.storageKey && typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_PREFIX + props.storageKey, value ? '1' : '0')
  }
})
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
        <template v-if="hasOpened">
          <slot />
        </template>
      </div>
    </div>
  </section>
</template>
