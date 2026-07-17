<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head>
                <Title>{{ $t('releaseNotes.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('releaseNotes.title') }}</template>

            <div class="p-1">
                <div class="mb-5 flex items-start justify-between gap-x-4">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">{{ $t('releaseNotes.title') }}</h1>
                        <p class="text-sm text-[#6B7280]">{{ $t('releaseNotes.gate') }}</p>
                    </div>
                    <FormButton buttonStyle="primary" @click="openForm()">
                        <Icon name="ph:plus" class="h-4 w-4" /> {{ $t('releaseNotes.newNote') }}
                    </FormButton>
                </div>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.isLoading && !state.notes.data?.length"
                        class="flex flex-col items-center gap-y-2 py-12 text-center text-sm text-[#6B7280]">
                        <Icon name="ph:sparkle" class="h-8 w-8 text-gray-300" />
                        {{ $t('releaseNotes.noNotes') }}
                    </div>
                    <ul class="space-y-3">
                        <li v-for="note in state.notes.data" :key="note.uuid"
                            class="flex items-start justify-between gap-x-4 rounded-lg border border-gray-200 bg-white p-4">
                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span class="font-semibold text-gray-900">{{ note.title }}</span>
                                    <span v-if="note.version"
                                        class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">{{ note.version }}</span>
                                    <span class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                        :class="note.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                                        {{ note.status === 'published' ? $t('releaseNotes.published') : $t('releaseNotes.draft') }}
                                    </span>
                                </div>
                                <p v-if="note.content" class="mt-1 line-clamp-2 whitespace-pre-line text-sm text-gray-600">{{ note.content }}</p>
                                <p v-if="note.status === 'published'" class="mt-1 text-xs text-gray-400">
                                    {{ $t('releaseNotes.publishedTo') }}
                                </p>
                            </div>
                            <div class="flex flex-none items-center gap-x-2">
                                <FormButton buttonStyle="action" buttonSize="sm" @click="openForm(note)">
                                    <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                </FormButton>
                                <FormButton v-if="note.status !== 'published'" buttonStyle="success" buttonSize="sm"
                                    @click="publish(note)">
                                    {{ $t('releaseNotes.publish') }}
                                </FormButton>
                                <FormButton buttonStyle="danger" buttonSize="sm" @click="confirmDelete(note)">
                                    <Icon name="ph:trash" class="h-4 w-4" />
                                </FormButton>
                            </div>
                        </li>
                    </ul>
                    <Pagination :data="state.notes" @previous="previousPage" @next="nextPage" />
                </LoadingSpinner>
            </div>

            <Modal size="md" :title="state.form.uuid ? $t('releaseNotes.editNote') : $t('releaseNotes.newNote')"
                :show="state.showForm" @close="closeForm">
                <template #modal-body>
                    <div class="space-y-4">
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div class="md:col-span-2 space-y-1 text-left">
                                <label class="text-sm font-medium text-gray-700">{{ $t('releaseNotes.titleField') }}</label>
                                <input v-model="state.form.title" type="text"
                                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                            </div>
                            <div class="space-y-1 text-left">
                                <label class="text-sm font-medium text-gray-700">{{ $t('releaseNotes.version') }}</label>
                                <input v-model="state.form.version" type="text" placeholder="1.4.0"
                                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                            </div>
                        </div>
                        <div class="space-y-1 text-left">
                            <label class="text-sm font-medium text-gray-700">{{ $t('releaseNotes.content') }}</label>
                            <textarea v-model="state.form.content" rows="6"
                                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"></textarea>
                        </div>
                        <div class="flex justify-end gap-x-2 pb-6">
                            <FormButton buttonStyle="cancel" @click="closeForm">{{ $t('cancel') }}</FormButton>
                            <FormButton buttonStyle="primary" @click="saveDraft">{{ $t('releaseNotes.save') }}</FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.deleteOpen" :message="$t('releaseNotes.deleteConfirm')"
                @close="state.deleteOpen = false" @confirm="doDelete" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { releaseNoteService } from '@/components/api/superadmin/ReleaseNoteService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

let currentPage = 1

const state = reactive({
    isLoading: false,
    error: '',
    notes: {} as any,
    showForm: false,
    form: { uuid: '', title: '', version: '', content: '' },
    deleteOpen: false,
    deleteTarget: null as any,
})

onMounted(() => fetchNotes())

async function fetchNotes() {
    state.isLoading = true
    state.error = ''
    try {
        const response = await releaseNoteService.getReleaseNotes({ page: currentPage })
        if (response) state.notes = response
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
    state.isLoading = false
}

function previousPage() {
    currentPage--
    fetchNotes()
}

function nextPage() {
    currentPage++
    fetchNotes()
}

function openForm(note: any = null) {
    state.form = note
        ? { uuid: note.uuid, title: note.title, version: note.version ?? '', content: note.content ?? '' }
        : { uuid: '', title: '', version: '', content: '' }
    state.showForm = true
}

function closeForm() {
    state.showForm = false
}

async function saveDraft() {
    state.error = ''
    try {
        const payload = { title: state.form.title, version: state.form.version, content: state.form.content }
        if (state.form.uuid) {
            await releaseNoteService.updateReleaseNote(state.form.uuid, payload)
        } else {
            await releaseNoteService.createReleaseNote(payload)
            currentPage = 1
        }
        state.showForm = false
        successAlert(`${t('alert.success')}!`, '')
        fetchNotes()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}

async function publish(note: any) {
    state.error = ''
    try {
        await releaseNoteService.publishReleaseNote(note.uuid)
        successAlert(`${t('alert.success')}!`, '')
        fetchNotes()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}

function confirmDelete(note: any) {
    state.deleteTarget = note
    state.deleteOpen = true
}

async function doDelete() {
    state.deleteOpen = false
    try {
        await releaseNoteService.deleteReleaseNote(state.deleteTarget.uuid)
        fetchNotes()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}
</script>
