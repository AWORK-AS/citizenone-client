<template>
    <div>
        <Modal size="lg" :title="$t('updates.newUpdates')" :show="props.isModalOpen" @close="closeModal">
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
                        <p v-if="!state.isLoading && state.notes.length === 0"
                            class="flex flex-col items-center gap-y-2 py-10 text-center text-sm text-gray-400">
                            <Icon name="ph:confetti" class="h-8 w-8 text-gray-300" />
                            {{ $t('updates.noUpdates') }}
                        </p>

                        <!-- Timeline -->
                        <ol v-else class="relative ml-1.5 space-y-6 border-l border-gray-200 pl-6">
                            <li v-for="(note, i) in state.notes" :key="note.uuid" class="relative">
                                <span class="absolute -left-[31px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white"
                                    :class="i === 0 ? 'bg-tertiary' : 'bg-gray-300'"></span>
                                <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <h4 class="text-[15px] font-semibold text-gray-900">{{ note.title }}</h4>
                                    <span v-if="note.version"
                                        class="rounded-full bg-tertiary/10 px-2 py-0.5 text-[11px] font-semibold text-tertiary">
                                        {{ note.version }}
                                    </span>
                                    <span v-if="i === 0"
                                        class="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                        {{ $t('releaseNotes.published') }}
                                    </span>
                                </div>
                                <p v-if="note.published_at" class="mt-0.5 flex items-center gap-x-1 text-xs text-gray-400">
                                    <Icon name="ph:calendar-blank" class="h-3.5 w-3.5" />
                                    {{ formatDateToReadable(note.published_at) }}
                                </p>
                                <p v-if="note.content" class="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                                    {{ note.content }}
                                </p>
                                <a v-if="note.link_url" :href="note.link_url" target="_blank" rel="noopener noreferrer"
                                    class="mt-2 inline-flex items-center gap-x-1 text-sm font-medium text-tertiary hover:text-tertiary-800">
                                    {{ $t('updates.readMore') }}
                                    <Icon name="ph:arrow-up-right" class="h-3.5 w-3.5" />
                                </a>
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

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    isLoading: false,
    notes: [] as any[],
})

watch(() => props.isModalOpen, (open: boolean) => {
    if (open) fetchNotes()
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
}

function closeModal() {
    emit('close')
}
</script>
