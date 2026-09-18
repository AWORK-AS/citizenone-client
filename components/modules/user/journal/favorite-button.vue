<template>
    <div class="relative inline-block">
        <Tooltip
            :text="journal?.is_favorite ? (journal?.favorite_note || $t('citizens.citizenJournals.actions.removeFromFavorite')) : $t('citizens.citizenJournals.actions.addToFavorite')"
            :wrap="!!journal?.favorite_note">
            <FormButton
                :aria-label="journal?.is_favorite ? $t('citizens.citizenJournals.actions.removeFromFavorite') : $t('citizens.citizenJournals.actions.addToFavorite')"
                buttonSize="xs"
                :class="[journal?.is_favorite && activeClass, buttonClass]"
                @click="onClick">
                <Icon name="ph:star" class="size-4" />
            </FormButton>
        </Tooltip>

        <div v-if="state.isPanelOpen" ref="panelRef"
            class="absolute left-0 bottom-full z-20 mb-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-surface-200 bg-white p-3 shadow-lg">
            <label class="block text-xs font-medium text-slate-600 mb-1">
                {{ $t('citizens.citizenJournals.actions.favoriteNoteLabel') }}
            </label>
            <textarea v-model="state.noteDraft" rows="2" maxlength="255"
                class="w-full rounded border border-surface-200 text-sm p-1.5 focus:outline-none focus:ring-1 focus:ring-primary" />
            <div class="flex justify-end gap-x-2 mt-2">
                <button type="button" class="text-xs text-slate-500 hover:text-slate-700" @click="cancelPanel">
                    {{ $t('citizens.citizenJournals.actions.favoriteNoteCancel') }}
                </button>
                <FormButton buttonSize="xs" @click="confirmFavorite">
                    {{ $t('citizens.citizenJournals.actions.favoriteNoteSave') }}
                </FormButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'

const props = withDefaults(defineProps<{
    journal: any,
    activeClass?: string,
    buttonClass?: string,
}>(), {
    activeClass: 'border-primary bg-primary text-white',
    buttonClass: 'w-full md:w-fit',
})
const emit = defineEmits<{ updated: [any] }>()

const panelRef = ref<HTMLElement | null>(null)

const state = reactive({
    isPanelOpen: false,
    noteDraft: '',
})

function onClick() {
    if (props.journal?.is_favorite) {
        toggleFavorite()
        return
    }
    state.noteDraft = ''
    state.isPanelOpen = true
}

function cancelPanel() {
    state.isPanelOpen = false
}

function confirmFavorite() {
    toggleFavorite(state.noteDraft.trim() || undefined)
    state.isPanelOpen = false
}

async function toggleFavorite(note?: string) {
    const response = await journalService.updateJournalFavorite(props.journal.uuid, note)
    emit('updated', response?.data)
}

function handleClickOutside(event: MouseEvent) {
    if (state.isPanelOpen && panelRef.value && !panelRef.value.contains(event.target as Node)) {
        state.isPanelOpen = false
    }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>
