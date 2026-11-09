<template>
    <!-- "What's new on this page": a published release note with a popup page
         set in Superadmin -> Release notes. Shown once per user until closed;
         closing is saved on the server, so it stays closed on other devices.
         Bottom left, clear of Milo. -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2"
        leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 translate-y-2">
        <aside v-if="note" role="status" aria-live="polite"
            class="fixed bottom-5 left-5 z-[60] w-[22rem] max-w-[calc(100vw-2.5rem)] rounded-xl bg-white ring-1 ring-slate-200 shadow-lg p-4">
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Icon name="ph:sparkle" class="h-4 w-4" aria-hidden="true" />
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-slate-900">{{ note.title }}</p>
                    <ul v-if="note.items?.length" class="mt-1.5 space-y-1 text-xs text-slate-600 list-disc pl-4">
                        <li v-for="(item, index) in note.items" :key="index">{{ item }}</li>
                    </ul>
                    <p v-else-if="note.content" class="mt-1.5 text-xs text-slate-600 whitespace-pre-line line-clamp-6">
                        {{ note.content }}
                    </p>
                    <div class="mt-3 flex items-center gap-2">
                        <Tooltip :text="$t('helpGuide.askMiloTooltip')">
                            <button type="button"
                                class="inline-flex items-center gap-1.5 rounded-lg bg-primary text-white text-xs font-semibold px-3 h-8 hover:bg-primary-700"
                                @click="askMilo">
                                <Icon name="ph:chat-circle-dots" class="h-3.5 w-3.5" aria-hidden="true" />
                                {{ $t('helpGuide.askMilo') }}
                            </button>
                        </Tooltip>
                        <Tooltip :text="$t('releaseNotePopup.dismissTooltip')">
                            <button type="button"
                                class="rounded-lg text-xs font-semibold text-slate-600 px-3 h-8 hover:bg-slate-100"
                                @click="dismiss">
                                {{ $t('releaseNotePopup.dismiss') }}
                            </button>
                        </Tooltip>
                    </div>
                </div>
                <Tooltip :text="$t('releaseNotePopup.dismissTooltip')">
                    <button type="button" :aria-label="$t('releaseNotePopup.dismissTooltip')"
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
import { releaseNoteService } from '@/components/api/user/ReleaseNoteService'

type PopupNote = { uuid: string; title: string; items: string[]; content: string | null }

const route = useRoute()
const note = ref<PopupNote | null>(null)

// Only the path counts: /schedules?week=45 is still the schedule page.
watch(() => route.path, (path) => fetchPopup(path), { immediate: true })

async function fetchPopup(path: string) {
    note.value = null
    try {
        const response = await releaseNoteService.getPopup(path)
        // The user may have moved on while we asked.
        if (route.path === path) note.value = response?.data ?? null
    } catch {
        note.value = null
    }
}

async function dismiss() {
    const current = note.value
    note.value = null
    if (!current) return
    try {
        await releaseNoteService.dismissPopup(current.uuid)
    } catch { /* it shows again next time, which is harmless */ }
}

function askMilo() {
    dismiss()
    useObiyenChat().revealAndOpenChat()
}
</script>
