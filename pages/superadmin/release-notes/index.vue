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
                    <div class="flex items-center gap-x-2">
                        <button type="button" @click="toggleFilter"
                            class="flex items-center gap-x-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                            :class="state.filterStatus === 'all' ? 'bg-tertiary/10 text-tertiary' : 'text-gray-500 hover:bg-gray-100'">
                            <Icon name="ph:clock-counter-clockwise" class="h-4 w-4" aria-hidden="true" />
                            {{ state.filterStatus === 'all' ? $t('releaseNotes.pendingReview') : $t('releaseNotes.allNotes') }}
                        </button>
                        <FormButton buttonStyle="primary" @click="openForm()">
                            <Icon name="ph:plus" class="h-4 w-4" /> {{ $t('releaseNotes.newNote') }}
                        </FormButton>
                    </div>
                </div>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.isLoading && !state.notes.data?.length"
                        class="flex flex-col items-center gap-y-2 py-12 text-center text-sm text-[#6B7280]">
                        <Icon name="ph:sparkle" class="h-8 w-8 text-gray-300" />
                        {{ state.filterStatus === 'draft' ? $t('releaseNotes.noPendingNotes') : $t('releaseNotes.noNotes') }}
                    </div>
                    <ul class="space-y-3">
                        <li v-for="note in state.notes.data" :key="note.uuid"
                            class="flex items-start justify-between gap-x-4 rounded-lg border border-gray-200 bg-white p-4">
                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span v-if="note.number"
                                        class="rounded-full bg-[#EEF4F7] px-2 py-0.5 text-[11px] font-semibold text-[#205E77]">#{{ note.number }}</span>
                                    <span class="font-semibold text-gray-900">{{ note.title }}</span>
                                    <span v-if="note.version"
                                        class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">{{ note.version }}</span>
                                    <span class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                        :class="note.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                                        {{ note.status === 'published' ? $t('releaseNotes.published') : $t('releaseNotes.draft') }}
                                    </span>
                                    <span v-if="note.is_public"
                                        class="inline-flex items-center gap-1 rounded-full bg-[#EEF4F7] px-2 py-0.5 text-[11px] font-medium text-[#205E77]">
                                        <Icon name="ph:globe" class="h-3 w-3" />
                                        {{ $t('releaseNotes.onWebsite') }}
                                    </span>
                                    <span v-if="note.status === 'published' && note.send_to_milo"
                                        class="inline-flex items-center gap-1 rounded-full bg-[#EEF4F7] px-2 py-0.5 text-[11px] font-medium text-[#205E77]">
                                        <Icon name="ph:lifebuoy" class="h-3 w-3" />
                                        {{ $t('releaseNotes.toMilo') }}
                                    </span>
                                    <span v-if="note.review_required_at"
                                        class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                        <Icon name="ph:eye" class="h-3 w-3" />
                                        {{ $t('releaseNotes.reviewBadge') }}
                                    </span>
                                    <span v-if="note.status !== 'published' && note.ai_status === 'pending'"
                                        class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                        <Icon name="ph:sparkle" class="h-3 w-3 animate-pulse" />
                                        {{ $t('releaseNotes.aiPending') }}
                                    </span>
                                </div>
                                <p v-if="note.status !== 'published' && note.ai_status === 'failed'"
                                    class="mt-1 flex items-center gap-1 text-xs text-[#CC3B2D]">
                                    <Icon name="ph:warning-circle" class="h-3.5 w-3.5 shrink-0" />
                                    {{ $t('releaseNotes.aiFailed', { error: note.ai_error ?? '' }) }}
                                </p>
                                <p v-if="note.content" class="mt-1 line-clamp-2 whitespace-pre-line text-sm text-gray-600">{{ note.content }}</p>
                                <p class="mt-1 text-xs text-gray-400">{{ formatNoteDate(note) }}</p>
                                <p v-if="note.status === 'published'" class="mt-1 text-xs text-gray-400">
                                    {{ $t('releaseNotes.publishedTo') }}
                                </p>
                                <p v-else-if="note.approver_notification_error"
                                    class="mt-1 flex items-center gap-1 text-xs text-[#CC3B2D]">
                                    <Icon name="ph:warning-circle" class="h-3.5 w-3.5 shrink-0" />
                                    {{ $t('releaseNotes.approvalRequestFailed', { error: note.approver_notification_error }) }}
                                </p>
                                <p v-else-if="note.approver_notified_at" class="mt-1 text-xs text-gray-400">
                                    {{ $t('releaseNotes.approvalRequestSent', { date: formatDateTime(note.approver_notified_at) }) }}
                                </p>
                                <p v-else class="mt-1 flex items-center gap-1 text-xs text-[#D4900A]">
                                    <Icon name="ph:warning-circle" class="h-3.5 w-3.5 shrink-0" />
                                    {{ $t('releaseNotes.approvalRequestNotSent') }}
                                </p>
                            </div>
                            <div class="flex flex-none items-center gap-x-2">
                                <FormButton buttonStyle="action" buttonSize="sm" @click="openRead(note)">
                                    <Icon name="ph:eye" class="h-4 w-4" />
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="sm" @click="openForm(note)">
                                    <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                </FormButton>
                                <FormButton v-if="note.status !== 'published'" buttonStyle="cancel" buttonSize="sm"
                                    :disabled="state.notifyingUuid === note.uuid" @click="notifyApprover(note)">
                                    <Icon name="ph:paper-plane-tilt" class="h-4 w-4"
                                        :class="state.notifyingUuid === note.uuid ? 'animate-pulse' : ''" />
                                    {{ $t('releaseNotes.remindApprover') }}
                                </FormButton>
                                <FormButton v-if="note.status !== 'published'" buttonStyle="success" buttonSize="sm"
                                    @click="openApprove(note)">
                                    {{ $t('releaseNotes.publish') }}
                                </FormButton>
                                <FormButton v-else buttonStyle="cancel" buttonSize="sm"
                                    @click="confirmUnpublish(note)">
                                    {{ $t('releaseNotes.unpublish') }}
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
                        <!-- A deploy draft is edited as classified items; the text customers see is rendered from them. -->
                        <div v-if="itemsMode" class="space-y-3 text-left">
                            <div v-if="state.form.reviewCount" role="status"
                                class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                <span class="flex items-center gap-1.5">
                                    <Icon name="ph:warning-circle" class="h-4 w-4 shrink-0" />
                                    {{ $t('releaseNotes.reviewBanner', { count: state.form.reviewCount }) }}
                                </span>
                                <FormButton buttonStyle="cancel" buttonSize="sm" @click="state.form.markReviewed = true; state.form.reviewCount = 0">
                                    {{ $t('releaseNotes.markReviewed') }}
                                </FormButton>
                            </div>

                            <div class="flex items-center justify-between gap-2">
                                <label class="text-sm font-medium text-gray-700">{{ $t('releaseNotes.items') }}</label>
                                <FormButton v-if="state.form.uuid && state.form.sourceItems.length && state.form.status !== 'published'"
                                    buttonStyle="cancel" buttonSize="sm" @click="state.regenerateOpen = true">
                                    <Icon name="ph:sparkle" class="h-4 w-4" /> {{ $t('releaseNotes.regenerate') }}
                                </FormButton>
                            </div>
                            <p class="text-xs text-gray-500">{{ $t('releaseNotes.itemsHint') }}</p>

                            <section v-for="kind in ITEM_KINDS" :key="kind" class="space-y-2">
                                <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ kindLabel(kind) }}</h3>
                                <div v-for="item in itemsOfKind(kind)" :key="item.key"
                                    class="space-y-2 rounded-md border border-gray-200 p-2">
                                    <textarea v-model="item.text" rows="2" :placeholder="$t('releaseNotes.itemPlaceholder')"
                                        :aria-label="kindLabel(kind)"
                                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"></textarea>
                                    <div class="flex flex-wrap items-center gap-2">
                                        <input v-model="item.area" type="text" :placeholder="$t('releaseNotes.itemArea')"
                                            :aria-label="$t('releaseNotes.itemArea')"
                                            class="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-primary focus:outline-none" />
                                        <select v-model="item.kind" :aria-label="$t('releaseNotes.itemKind')"
                                            class="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-primary focus:outline-none">
                                            <option v-for="k in ITEM_KINDS" :key="k" :value="k">{{ kindLabel(k) }}</option>
                                        </select>
                                        <button type="button" class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-[#CC3B2D]"
                                            :aria-label="$t('releaseNotes.removeItem')" :title="$t('releaseNotes.removeItem')"
                                            @click="removeItem(item.key)">
                                            <Icon name="ph:trash" class="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <button type="button" class="inline-flex items-center gap-1 text-xs font-medium text-tertiary hover:underline"
                                    @click="addItem(kind)">
                                    <Icon name="ph:plus" class="h-3.5 w-3.5" /> {{ $t('releaseNotes.addItem') }}
                                </button>
                            </section>

                            <details v-if="state.form.sourceItems.length" class="rounded-md border border-gray-200 bg-gray-50 p-3">
                                <summary class="cursor-pointer text-xs font-medium text-gray-600">
                                    {{ $t('releaseNotes.sourceItems', { count: state.form.sourceItems.length }) }}
                                </summary>
                                <ul class="mt-2 space-y-1">
                                    <li v-for="(source, i) in state.form.sourceItems" :key="source.sha ?? i"
                                        class="flex flex-wrap items-baseline gap-x-2 text-xs text-gray-600">
                                        <span class="font-mono">{{ source.subject }}</span>
                                        <span v-if="source.repo" class="text-gray-400">{{ source.repo }}</span>
                                        <span v-if="source.needs_review"
                                            class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                            {{ $t('releaseNotes.needsReview') }}
                                        </span>
                                    </li>
                                </ul>
                            </details>
                        </div>
                        <div v-else class="space-y-1 text-left">
                            <label class="text-sm font-medium text-gray-700">{{ $t('releaseNotes.content') }}</label>
                            <textarea v-model="state.form.content" rows="6"
                                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"></textarea>
                        </div>
                        <!-- Screenshot -->
                        <div class="space-y-1 text-left">
                            <label class="text-sm font-medium text-gray-700">{{ $t('releaseNotes.image') }}</label>
                            <p class="text-xs text-gray-500">{{ $t('releaseNotes.imageHint') }}</p>
                            <div v-if="imagePreview" class="mt-2 flex items-start gap-3">
                                <img :src="imagePreview" alt=""
                                    class="h-24 w-40 rounded-md border border-gray-200 object-cover" />
                                <FormButton buttonStyle="cancel" buttonSize="sm" @click="removeImage">
                                    {{ $t('releaseNotes.removeImage') }}
                                </FormButton>
                            </div>
                            <input ref="imageInput" type="file" accept="image/png,image/jpeg,image/webp"
                                class="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
                                @change="onImagePicked" />
                        </div>

                        <!-- Video -->
                        <div class="space-y-1 text-left">
                            <label class="text-sm font-medium text-gray-700">{{ $t('releaseNotes.videoUrl') }}</label>
                            <input v-model="state.form.video_url" type="url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                            <p class="text-xs text-gray-500">{{ $t('releaseNotes.videoHint') }}</p>
                        </div>

                        <!-- Public web is a different audience from customers in the product -->
                        <label class="flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-left">
                            <input v-model="state.form.is_public" type="checkbox" class="mt-0.5" />
                            <span>
                                <span class="block text-sm font-medium text-gray-800">{{ $t('releaseNotes.showOnWebsite') }}</span>
                                <span class="block text-xs text-gray-500">{{ $t('releaseNotes.showOnWebsiteHint') }}</span>
                            </span>
                        </label>
                        <label class="flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-left">
                            <input v-model="state.form.send_to_milo" type="checkbox" class="mt-0.5" />
                            <span>
                                <span class="block text-sm font-medium text-gray-800">{{ $t('releaseNotes.sendToMilo') }}</span>
                                <span class="block text-xs text-gray-500">{{ $t('releaseNotes.sendToMiloHint') }}</span>
                            </span>
                        </label>

                        <div class="flex justify-end gap-x-2 pb-6">
                            <FormButton buttonStyle="cancel" @click="closeForm">{{ $t('cancel') }}</FormButton>
                            <FormButton buttonStyle="primary" @click="saveDraft">{{ $t('releaseNotes.save') }}</FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <Modal size="md" :title="state.readNote?.title" :show="state.readOpen" @close="state.readOpen = false">
                <template #modal-body>
                    <div class="space-y-3">
                        <div class="flex flex-wrap items-center gap-2">
                            <span v-if="state.readNote?.version"
                                class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">{{ state.readNote.version }}</span>
                            <span class="text-xs text-gray-400">{{ formatNoteDate(state.readNote) }}</span>
                        </div>
                        <div class="whitespace-pre-line text-sm text-gray-700">{{ state.readNote?.content }}</div>
                        <img v-if="state.readNote?.image_url" :src="state.readNote.image_url" alt=""
                            class="w-full rounded-lg border border-gray-200" />
                        <div v-if="videoEmbedUrl(state.readNote?.video_url)" class="aspect-video w-full">
                            <iframe :src="videoEmbedUrl(state.readNote?.video_url)" class="h-full w-full rounded-lg"
                                frameborder="0" allowfullscreen></iframe>
                        </div>
                    </div>
                </template>
            </Modal>

            <Modal size="md" :title="$t('releaseNotes.approveTitle')" :show="state.approveOpen" @close="state.approveOpen = false">
                <template #modal-body>
                    <div class="space-y-3 text-left">
                        <p class="text-sm text-gray-600">{{ $t('releaseNotes.approveIntro') }}</p>
                        <label class="flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                            <input v-model="state.approve.is_public" type="checkbox" class="mt-0.5" />
                            <span>
                                <span class="block text-sm font-medium text-gray-800">{{ $t('releaseNotes.showAsNews') }}</span>
                                <span class="block text-xs text-gray-500">{{ $t('releaseNotes.showAsNewsHint') }}</span>
                            </span>
                        </label>
                        <label class="flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                            <input v-model="state.approve.send_to_milo" type="checkbox" class="mt-0.5" />
                            <span>
                                <span class="block text-sm font-medium text-gray-800">{{ $t('releaseNotes.sendToMilo') }}</span>
                                <span class="block text-xs text-gray-500">{{ $t('releaseNotes.sendToMiloHint') }}</span>
                            </span>
                        </label>
                        <div class="flex justify-end gap-x-2 pb-6">
                            <FormButton buttonStyle="cancel" @click="state.approveOpen = false">{{ $t('cancel') }}</FormButton>
                            <FormButton buttonStyle="success" @click="publish">{{ $t('releaseNotes.publish') }}</FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.regenerateOpen" :message="$t('releaseNotes.regenerateConfirm')"
                @close="state.regenerateOpen = false" @confirm="doRegenerate" />

            <DialogConfirmation :isModalOpen="state.deleteOpen" :message="$t('releaseNotes.deleteConfirm')"
                @close="state.deleteOpen = false" @confirm="doDelete" />

            <DialogConfirmation :isModalOpen="state.unpublishOpen" :message="$t('releaseNotes.unpublishConfirm')"
                @close="state.unpublishOpen = false" @confirm="doUnpublish" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { releaseNoteService } from '@/components/api/superadmin/ReleaseNoteService'
import { useAlert } from '@/composables/alert'
import { useVideoEmbed } from '@/composables/videoEmbed'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { videoEmbedUrl } = useVideoEmbed()
const imageInput = ref<HTMLInputElement | null>(null)
const objectUrl = ref<string | null>(null)
const { t } = useI18n()

let currentPage = 1

type ItemKind = 'feature' | 'improvement' | 'fix'
interface EditableItem { key: number; kind: ItemKind; text: string; area: string }

// The order the groups are shown in, and the only kinds an item can have.
const ITEM_KINDS: ItemKind[] = ['feature', 'improvement', 'fix']
let itemKey = 0

function emptyForm() {
    return {
        uuid: '', title: '', version: '', content: '', video_url: '', image_url: null as string | null,
        imageFile: null as File | null, removeImage: false, is_public: false, send_to_milo: true,
        status: 'draft', items: [] as EditableItem[], sourceItems: [] as any[], reviewCount: 0, markReviewed: false,
    }
}

function toEditable(items: any[] | null | undefined): EditableItem[] {
    return (items ?? [])
        .filter((item) => ITEM_KINDS.includes(item?.kind))
        .map((item) => ({ key: ++itemKey, kind: item.kind, text: item.text ?? '', area: item.area ?? '' }))
}

const state = reactive({
    isLoading: false,
    error: '',
    notes: {} as any,
    showForm: false,
    form: emptyForm(),
    approveOpen: false,
    approve: { uuid: '', is_public: false, send_to_milo: true },
    regenerateOpen: false,
    deleteOpen: false,
    deleteTarget: null as any,
    unpublishOpen: false,
    unpublishTarget: null as any,
    readOpen: false,
    readNote: null as any,
    // Defaults to drafts pending review, not the full history - the full,
    // newest-first paginated list buries new drafts behind however many
    // published notes came before them, so "Next" only ever moves further
    // into the past. Pending review is normally a small, bounded set.
    filterStatus: 'draft' as 'draft' | 'all',
    notifyingUuid: '' as string,
})

onMounted(() => fetchNotes())

async function fetchNotes() {
    state.isLoading = true
    state.error = ''
    try {
        const params: Record<string, any> = { page: currentPage }
        if (state.filterStatus === 'draft') params.status = 'draft'
        const response = await releaseNoteService.getReleaseNotes(params)
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

function toggleFilter() {
    state.filterStatus = state.filterStatus === 'draft' ? 'all' : 'draft'
    currentPage = 1
    fetchNotes()
}

function openForm(note: any = null) {
    clearPickedImage()
    const form = emptyForm()
    if (note) {
        const sourceItems = Array.isArray(note.source_items) ? note.source_items : []
        Object.assign(form, {
            uuid: note.uuid, title: note.title, version: note.version ?? '', content: note.content ?? '',
            video_url: note.video_url ?? '', image_url: note.image_url ?? null,
            is_public: !!note.is_public, send_to_milo: note.send_to_milo ?? true, status: note.status,
            items: toEditable(note.items), sourceItems,
            reviewCount: note.review_required_at ? sourceItems.filter((item: any) => item?.needs_review).length : 0,
        })
    }
    state.form = form
    state.showForm = true
}

// A note built from deploys is edited as items; a hand-written one as free text.
const itemsMode = computed(() => state.form.items.length > 0 || state.form.sourceItems.length > 0)

function kindLabel(kind: ItemKind): string {
    return {
        feature: t('releaseNotes.kindFeature'),
        improvement: t('releaseNotes.kindImprovement'),
        fix: t('releaseNotes.kindFix'),
    }[kind]
}

function itemsOfKind(kind: ItemKind): EditableItem[] {
    return state.form.items.filter((item) => item.kind === kind)
}

function addItem(kind: ItemKind) {
    state.form.items.push({ key: ++itemKey, kind, text: '', area: '' })
}

function removeItem(key: number) {
    state.form.items = state.form.items.filter((item) => item.key !== key)
}

function closeForm() {
    clearPickedImage()
    state.showForm = false
}

function clearPickedImage() {
    if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value)
        objectUrl.value = null
    }
    if (imageInput.value) imageInput.value.value = ''
}

function openRead(note: any) {
    state.readNote = note
    state.readOpen = true
}

const imagePreview = computed(() => objectUrl.value ?? (state.form.removeImage ? null : state.form.image_url))

function onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null
    state.form.imageFile = file
    state.form.removeImage = false

    if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = file ? URL.createObjectURL(file) : null
}

function removeImage() {
    state.form.imageFile = null
    state.form.removeImage = true
    if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value)
        objectUrl.value = null
    }
    if (imageInput.value) imageInput.value.value = ''
}

function formatDateTime(value: string): string {
    return new Date(value).toLocaleString('da-DK', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
}

// The approval mail is sent when the note is created, including by the CI
// ingest. If that attempt failed, this is how it gets asked again.
async function notifyApprover(note: any) {
    state.error = ''
    state.notifyingUuid = note.uuid
    try {
        const response = await releaseNoteService.notifyApprover(note.uuid)
        const failure = response?.data?.approver_notification_error ?? response?.approver_notification_error
        if (failure) {
            state.error = failure
        } else {
            successAlert(`${t('alert.success')}!`, '')
        }
        fetchNotes()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
    state.notifyingUuid = ''
}

function formatNoteDate(note: any): string {
    const d = note?.published_at ?? note?.created_at
    if (!d) return ''
    return new Date(d).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function saveDraft() {
    state.error = ''
    try {
        // Multipart throughout: a note can carry a screenshot, and PUT with a
        // file body is spoofed with _method the way Laravel expects.
        const form = new FormData()
        form.append('title', state.form.title ?? '')
        form.append('version', state.form.version ?? '')
        if (itemsMode.value) {
            // The backend renders the text from the items; sending the old text
            // too would keep it from following the edit.
            const items = state.form.items
                .filter((item) => item.text.trim() !== '')
                .map((item) => ({ kind: item.kind, text: item.text.trim(), ...(item.area.trim() ? { area: item.area.trim() } : {}) }))
            form.append('items', JSON.stringify(items))
            if (state.form.markReviewed) form.append('mark_reviewed', '1')
        } else {
            form.append('content', state.form.content ?? '')
        }
        form.append('video_url', state.form.video_url ?? '')
        if (state.form.imageFile) form.append('image', state.form.imageFile)
        if (state.form.removeImage) form.append('remove_image', '1')
        form.append('is_public', state.form.is_public ? '1' : '0')
        form.append('send_to_milo', state.form.send_to_milo ? '1' : '0')

        if (state.form.uuid) {
            form.append('_method', 'PUT')
            await releaseNoteService.updateReleaseNote(state.form.uuid, form)
        } else {
            await releaseNoteService.createReleaseNote(form)
            currentPage = 1
        }
        state.showForm = false
        successAlert(`${t('alert.success')}!`, '')
        fetchNotes()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}

function openApprove(note: any) {
    state.approve = { uuid: note.uuid, is_public: !!note.is_public, send_to_milo: note.send_to_milo ?? true }
    state.approveOpen = true
}

async function publish() {
    state.error = ''
    state.approveOpen = false
    try {
        await releaseNoteService.publishReleaseNote(state.approve.uuid, {
            is_public: state.approve.is_public,
            send_to_milo: state.approve.send_to_milo,
        })
        successAlert(`${t('alert.success')}!`, '')
        fetchNotes()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}

async function doRegenerate() {
    state.regenerateOpen = false
    state.error = ''
    try {
        await releaseNoteService.regenerateReleaseNote(state.form.uuid)
        state.showForm = false
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

function confirmUnpublish(note: any) {
    state.unpublishTarget = note
    state.unpublishOpen = true
}

async function doUnpublish() {
    state.unpublishOpen = false
    try {
        await releaseNoteService.unpublishReleaseNote(state.unpublishTarget.uuid)
        successAlert(`${t('alert.success')}!`, '')
        fetchNotes()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}
</script>
