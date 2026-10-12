<template>
    <!-- Once per person: the duty schedule changed a lot at once, and a planner
         who opens it to find their buttons moved deserves to be told why and
         where help is - not a modal in their way. Bottom left, clear of Milo. -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2"
        leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 translate-y-2">
        <aside v-if="visible" role="status" aria-live="polite"
            class="fixed bottom-5 left-5 z-[60] w-[22rem] max-w-[calc(100vw-2.5rem)] rounded-xl bg-white ring-1 ring-slate-200 shadow-lg p-4">
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Icon name="ph:sparkle" class="h-4 w-4" aria-hidden="true" />
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-slate-900">{{ $t('dutySchedules.optimizedNotice.title') }}</p>
                    <ul class="mt-1.5 space-y-1 text-xs text-slate-600 list-disc pl-4">
                        <li>{{ $t('dutySchedules.optimizedNotice.compact') }}</li>
                        <li>{{ $t('dutySchedules.optimizedNotice.groups') }}</li>
                        <li>{{ $t('dutySchedules.optimizedNotice.tooltips') }}</li>
                    </ul>
                    <div class="mt-3 flex items-center gap-2">
                        <Tooltip :text="$t('helpGuide.askMiloTooltip')">
                            <button type="button"
                                class="inline-flex items-center gap-1.5 rounded-lg bg-primary text-white text-xs font-semibold px-3 h-8 hover:bg-primary-700"
                                @click="askMilo">
                                <Icon name="ph:chat-circle-dots" class="h-3.5 w-3.5" aria-hidden="true" />
                                {{ $t('helpGuide.askMilo') }}
                            </button>
                        </Tooltip>
                        <Tooltip :text="$t('dutySchedules.optimizedNotice.dismissTooltip')">
                            <button type="button"
                                class="rounded-lg text-xs font-semibold text-slate-600 px-3 h-8 hover:bg-slate-100"
                                @click="dismiss">
                                {{ $t('dutySchedules.optimizedNotice.dismiss') }}
                            </button>
                        </Tooltip>
                    </div>
                </div>
                <Tooltip :text="$t('dutySchedules.optimizedNotice.dismissTooltip')">
                    <button type="button" :aria-label="$t('dutySchedules.optimizedNotice.dismissTooltip')"
                        class="-mr-1 -mt-1 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        @click="dismiss">
                        <Icon name="ph:x" class="h-4 w-4" aria-hidden="true" />
                    </button>
                </Tooltip>
            </div>
        </aside>
    </Transition>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

// Bump the version to announce a later round of changes to everyone again.
const VERSION = '2026-10'

const userStore = useUserStore() as any
const visible = ref(false)

const storageKey = computed(() => `c1:duty-optimized-notice:${VERSION}:${userStore.getUser?.uuid ?? 'anon'}`)

onMounted(() => {
    try {
        visible.value = !localStorage.getItem(storageKey.value)
    } catch {
        visible.value = false
    }
})

function dismiss() {
    visible.value = false
    try {
        localStorage.setItem(storageKey.value, new Date().toISOString())
    } catch { /* private mode: it shows again next time, which is harmless */ }
}

function askMilo() {
    dismiss()
    useObiyenChat().revealAndOpenChat()
}
</script>
