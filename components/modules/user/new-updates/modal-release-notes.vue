<template>
    <div>
        <Modal size="lg" :title="$t('updates.updates')" :show="props.isModalOpen" @close="closeModal">
            <template #header-actions>
                <button type="button" @click="state.showHistory = !state.showHistory"
                    class="flex items-center gap-x-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                    :class="state.showHistory ? 'bg-tertiary/10 text-tertiary' : 'text-gray-500 hover:bg-gray-100'">
                    <Icon name="ph:clock-counter-clockwise" class="h-4 w-4" aria-hidden="true" />
                    {{ state.showHistory ? $t('updates.newUpdates') : $t('updates.history') }}
                </button>
            </template>
            <template #modal-body>
                <LoadingSpinner :isActive="state.isLoading">
                    <div class="min-h-[8rem]">
                        <!-- Hero banner -->
                        <div class="mb-6 flex items-center gap-x-3 rounded-2xl bg-gradient-to-br from-tertiary/10 to-primary/5 px-4 py-3.5">
                            <span class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-tertiary/15">
                                <Icon name="ph:sparkle-fill" class="h-5 w-5 text-tertiary" />
                            </span>
                            <div>
                                <p class="text-sm font-semibold text-gray-900">{{ $t('updates.newUpdates') }}</p>
                                <p class="text-xs text-gray-500">{{ $t('updates.tagline') }}</p>
                            </div>
                        </div>

                        <!-- Empty state -->
                        <p v-if="!state.isLoading && visibleNotes.length === 0"
                            class="flex flex-col items-center gap-y-2 py-10 text-center text-sm text-gray-400">
                            <Icon name="ph:confetti" class="h-8 w-8 text-gray-300" />
                            {{ state.showHistory ? $t('updates.noUpdates') : $t('updates.noNewUpdates') }}
                        </p>

                        <!-- Default view: only unseen notes. "History" (header-actions slot above)
                        switches to everything ever published, newest first - nothing is ever hidden
                        or moved, seen notes just mute in place there. -->
                        <ol v-else class="relative ml-1.5 space-y-6 border-l border-gray-200 pl-6">
                            <li v-for="note in visibleNotes" :key="note.uuid" class="relative">
                                <span class="absolute -left-[31px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white"
                                    :class="note.is_new ? 'bg-tertiary' : 'bg-gray-300'"></span>
                                <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <h4 class="text-[15px] font-semibold" :class="note.is_new ? 'text-gray-900' : 'text-gray-500'">
                                        {{ note.title }}
                                    </h4>
                                    <span v-if="note.version"
                                        class="rounded-full bg-tertiary/10 px-2 py-0.5 text-[11px] font-semibold text-tertiary">
                                        {{ note.version }}
                                    </span>
                                    <span v-if="note.is_new"
                                        class="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                        {{ $t('updates.newBadge') }}
                                    </span>
                                </div>
                                <p v-if="note.published_at" class="mt-0.5 flex items-center gap-x-1 text-xs text-gray-400">
                                    <Icon name="ph:calendar-blank" class="h-3.5 w-3.5" />
                                    {{ formatDateToReadable(note.published_at) }}
                                </p>
                                <p v-if="note.content" class="mt-2 whitespace-pre-line text-sm leading-relaxed"
                                    :class="note.is_new ? 'text-gray-600' : 'text-gray-400'">
                                    {{ note.content }}
                                </p>
                                <img v-if="note.image_url" :src="note.image_url" alt="" loading="lazy"
                                    class="mt-3 w-full rounded-lg border border-gray-200" />
                                <div v-if="videoEmbedUrl(note.video_url)" class="mt-3 aspect-video w-full">
                                    <iframe :src="videoEmbedUrl(note.video_url)" class="h-full w-full rounded-lg"
                                        frameborder="0" allowfullscreen loading="lazy"></iframe>
                                </div>
                            </li>
                        </ol>

                        <div class="mt-8 flex justify-end border-t border-gray-100 pt-4">
                            <FormButton buttonStyle="primary" @click="closeModal">
                                {{ $t('close') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { releaseNoteService } from '@/components/api/user/ReleaseNoteService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useVideoEmbed } from '@/composables/videoEmbed'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'marked-seen'])
const { formatDateToReadable } = useDatetimeFormatter()
const { videoEmbedUrl } = useVideoEmbed()

const state = reactive({
    isLoading: false,
    notes: [] as any[],
    showHistory: false,
})

const visibleNotes = computed(() => state.showHistory ? state.notes : state.notes.filter((n: any) => n.is_new))

watch(() => props.isModalOpen, (open: boolean) => {
    if (open) {
        state.showHistory = false
        fetchNotes()
    }
})

async function fetchNotes() {
    state.isLoading = true
    try {
        const response = await releaseNoteService.getReleaseNotes()
        state.notes = response?.data ?? []
    } catch (error: any) {
        state.notes = []
    }
    state.isLoading = false

    // Mark as seen only after this view's is_new flags are captured, so the highlighting
    // shown right now reflects what was actually new when the user opened the panel -
    // the badge clears immediately, but this session's items stay highlighted until next open.
    try {
        await releaseNoteService.markSeen()
        emit('marked-seen')
    } catch (error: any) {
        // keep the badge as-is if marking seen fails
    }
}

function closeModal() {
    emit('close')
}
</script>
