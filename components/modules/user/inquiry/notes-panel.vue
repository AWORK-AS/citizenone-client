<template>
    <div>
        <div class="mb-3 flex items-center justify-between gap-3">
            <p class="text-sm font-semibold text-gray-900">
                {{ $t('inquiryNotes.title') }}
            </p>
            <span class="text-xs text-slate-400">
                {{ $t('inquiryNotes.count', { count: state.notes.length }) }}
            </span>
        </div>

        <!-- Writing a note is the common action here, so the box is open rather
             than behind a button. -->
        <div class="mb-4">
            <FormTextArea id="new-note" name="new-note" v-model="state.draft"
                :placeholder="$t('inquiryNotes.placeholder')" :rows="3" />
            <div class="mt-2 flex items-center justify-between gap-3">
                <p class="text-[11px] text-slate-400">{{ $t('inquiryNotes.hint') }}</p>
                <FormButton type="button" buttonStyle="primary" :disabled="!state.draft.trim() || state.isSaving"
                    @click="add">
                    {{ state.isSaving ? $t('inquiryFields.saving') : $t('inquiryNotes.add') }}
                </FormButton>
            </div>
        </div>

        <p v-if="!state.notes.length" class="border-t border-surface-100 pt-4 text-[13px] text-slate-400">
            {{ $t('inquiryNotes.empty') }}
        </p>

        <div v-for="note in state.notes" :key="note.uuid" class="border-t border-surface-100 py-3.5">
            <div class="flex flex-wrap items-center gap-2">
                <span
                    class="grid size-[22px] shrink-0 place-items-center rounded-[7px] bg-gradient-to-br from-[#8fd6ea] to-[#3aa7c4] text-[10px] font-bold text-white">
                    {{ initialsOf(note) }}
                </span>
                <p class="text-[13px] font-semibold text-slate-800">{{ authorName(note) }}</p>
                <span class="text-[11px] text-slate-400">
                    {{ formatDateTimeToReadable(note.created_at) }}
                </span>
                <span v-if="note.pipeline_status"
                    class="rounded-full bg-surface-100 px-2 py-px text-[11px] font-semibold text-slate-500">
                    {{ stageName(note.pipeline_status) }}
                </span>
                <span v-if="note.is_copied_to_journal"
                    class="rounded-full bg-[#e6f6ee] px-2 py-px text-[11px] font-semibold text-[#177a53]">
                    {{ $t('inquiryNotes.inJournal') }}
                </span>

                <div class="ml-auto flex items-center gap-1.5">
                    <template v-if="state.editing === note.uuid">
                        <FormButton type="button" buttonStyle="cancel" @click="state.editing = ''">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="primary" :disabled="!state.editDraft.trim()"
                            @click="save(note)">
                            {{ $t('save') }}
                        </FormButton>
                    </template>
                    <template v-else>
                        <FormButton v-if="note.is_own || canManage" type="button" buttonStyle="action"
                            :aria-label="$t('inquiryNotes.edit')" @click="startEdit(note)">
                            <Icon name="ph:pencil-simple" class="size-4" />
                        </FormButton>
                        <!-- A note already in the citizen's journal cannot be
                             removed here, so the action is not offered. -->
                        <Tooltip v-if="!note.is_copied_to_journal && (note.is_own || canManage)"
                            :text="$t('inquiryNotes.delete')">
                            <FormButton type="button" buttonStyle="danger" :aria-label="$t('inquiryNotes.delete')"
                                @click="confirmDelete(note)">
                                <Icon name="ph:trash" class="size-4" />
                            </FormButton>
                        </Tooltip>
                    </template>
                </div>
            </div>

            <div v-if="state.editing === note.uuid" class="mt-2">
                <FormTextArea :id="`note-${note.uuid}`" :name="`note-${note.uuid}`" v-model="state.editDraft"
                    :placeholder="$t('inquiryNotes.placeholder')" :rows="3" />
            </div>
            <p v-else class="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-slate-700">
                {{ note.content }}
            </p>
        </div>

        <DialogConfirmation :isModalOpen="state.isDeleteOpen" :message="$t('inquiryNotes.confirmDelete') + '?'"
            @close="state.isDeleteOpen = false" @confirm="remove" />
    </div>
</template>

<script setup lang="ts">
import { inquiryNoteService } from '@/components/api/user/InquiryNoteService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const { errorAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const { formatDateTimeToReadable } = useDatetimeFormatter()

const props = defineProps({
    inquiryUuid: {
        type: String,
        required: true,
    },
    // The company's stages, so a note's stage reads as its name rather than its
    // slug. Passed in because the page has already loaded them.
    stages: {
        type: Array,
        required: false,
        default: () => [],
    },
})

const state = reactive({
    draft: '',
    editDraft: '',
    editing: '',
    isDeleteOpen: false,
    isSaving: false,
    notes: [] as any[],
    selected: null as any,
})

const canManage = computed(() => {
    const level = userStore.getUser?.roles?.[0]?.level ?? 0

    // Manager and above may correct a note on a case, matching the server.
    return level >= 60
})

onMounted(() => {
    fetchNotes()
})

watch(() => props.inquiryUuid, () => fetchNotes())

function authorName(note: any) {
    const author = note.author ?? {}

    return `${author.firstname ?? ''} ${author.lastname ?? ''}`.trim() || t('inquiryNotes.unknownAuthor')
}

function initialsOf(note: any) {
    const parts = authorName(note).split(/\s+/).filter((word: string) => /^\p{L}/u.test(word))

    if (!parts.length) return '?'

    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

function stageName(slug: string) {
    return (props.stages as any[]).find((stage: any) => stage.slug === slug)?.name ?? slug
}

async function fetchNotes() {
    try {
        const response = await inquiryNoteService.getNotes(props.inquiryUuid)
        state.notes = response?.data ?? []
    } catch (_) {
        state.notes = []
    }
}

async function add() {
    state.isSaving = true
    try {
        await inquiryNoteService.saveNote(props.inquiryUuid, state.draft.trim())
        state.draft = ''
        await fetchNotes()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryNotes.saveFailed'))
    }
    state.isSaving = false
}

function startEdit(note: any) {
    state.editing = note.uuid
    state.editDraft = note.content
}

async function save(note: any) {
    try {
        await inquiryNoteService.updateNote(note.uuid, state.editDraft.trim())
        state.editing = ''
        await fetchNotes()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryNotes.saveFailed'))
    }
}

function confirmDelete(note: any) {
    state.selected = note
    state.isDeleteOpen = true
}

async function remove() {
    state.isDeleteOpen = false
    try {
        await inquiryNoteService.deleteNote(state.selected.uuid)
        await fetchNotes()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryNotes.deleteFailed'))
    }
}
</script>
