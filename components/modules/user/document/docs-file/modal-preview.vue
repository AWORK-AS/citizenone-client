<template>
    <!-- A full-screen viewer, like the ones in mail and file apps: a slim top bar
         with the name and actions, the document filling the rest. It stays an
         overlay rather than a page, so the list behind keeps its place. -->
    <TransitionRoot as="template" :show="props.isModalOpen">
        <Dialog as="div" class="relative z-50" :initialFocus="closeButton" @close="closeModal">
            <TransitionChild as="template" enter="ease-out duration-150" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
                <DialogPanel class="fixed inset-0 flex flex-col bg-gray-950/95 text-white"
                    data-testid="document-preview">
                    <header class="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-gray-900 px-3 sm:gap-3 sm:px-5">
                        <Icon name="ph:file" class="size-5 shrink-0 text-gray-400" aria-hidden="true" />
                        <DialogTitle as="h2" class="min-w-0 truncate text-sm font-medium sm:text-base" :title="title">
                            {{ title }}
                        </DialogTitle>
                        <template v-if="hasSiblings">
                            <span class="shrink-0 text-gray-500" aria-hidden="true">·</span>
                            <span class="shrink-0 text-sm tabular-nums text-gray-400"
                                data-testid="document-preview-position">
                                {{ $t('drive.preview.position', { current: currentIndex + 1, total: props.documents.length }) }}
                            </span>
                        </template>
                        <div class="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
                            <!-- Opens to the left: centred below, it ran off the right edge. -->
                            <Tooltip v-if="state.kind === 'docx' && !state.renderFailed" :text="previewNote"
                                position="left" wrap>
                                <span tabindex="0" :aria-label="previewNote"
                                    class="flex size-9 items-center justify-center rounded-full text-gray-300 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60"
                                    data-testid="document-preview-note">
                                    <Icon name="ph:info" class="size-5" aria-hidden="true" />
                                </span>
                            </Tooltip>
                            <button v-if="props.canDownload" type="button" @click="downloadOriginal"
                                :aria-label="$t('drive.preview.downloadOriginal')"
                                class="flex h-9 items-center gap-2 rounded-lg bg-white/10 px-2.5 text-sm font-medium text-white outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 sm:px-3"
                                data-testid="document-preview-download">
                                <Icon name="ph:download-simple" class="size-5" aria-hidden="true" />
                                <span class="hidden sm:inline">{{ $t('drive.preview.downloadOriginal') }}</span>
                            </button>
                            <button ref="closeButton" type="button" @click="closeModal" :aria-label="$t('close')"
                                :title="$t('close')"
                                class="flex size-9 items-center justify-center rounded-full text-gray-300 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
                                data-testid="document-preview-close">
                                <Icon name="heroicons:x-mark" class="size-6" aria-hidden="true" />
                            </button>
                        </div>
                    </header>

                    <div class="relative flex min-h-0 flex-1 flex-col">
                        <div v-if="state.error?.message && state.error.message.length > 0"
                            class="absolute inset-x-0 top-0 z-20 p-4">
                            <Alert type="danger" :text="state?.error?.message" />
                        </div>

                        <div v-if="state.renderFailed || state.kind === 'none'"
                            class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
                            :data-testid="state.kind === 'none' ? 'document-preview-unavailable' : 'document-preview-failed'">
                            <Icon :name="state.kind === 'none' ? 'ph:file' : 'ph:file-x'" class="size-14 text-gray-400" />
                            <p class="max-w-md text-gray-100">{{ unavailableText }}</p>
                            <p v-if="unavailableHint" class="max-w-md text-sm text-gray-400">{{ unavailableHint }}</p>
                        </div>
                        <template v-else>
                            <!-- No sandbox: Chrome refuses to show a PDF in a sandboxed frame.
                                 The blob is always typed application/pdf, so nothing else can
                                 run in it. -->
                            <iframe v-if="state.kind === 'pdf' && pdfSrc" :src="pdfSrc"
                                :title="props.selectedDocument?.name" class="w-full flex-1 border-0 bg-gray-800"
                                data-testid="document-preview-pdf"></iframe>
                            <div v-else-if="state.kind === 'image' && state.objectUrl"
                                class="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
                                <img :src="state.objectUrl" :alt="props.selectedDocument?.name"
                                    class="max-h-full max-w-full object-contain shadow-2xl"
                                    @error="state.renderFailed = true" data-testid="document-preview-image" />
                            </div>
                            <div v-else-if="state.kind === 'text'" class="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-8">
                                <pre class="mx-auto min-h-full max-w-4xl whitespace-pre-wrap break-words rounded bg-white p-6 font-mono text-sm text-gray-800 shadow-2xl sm:p-10"
                                    data-testid="document-preview-text">{{ state.text }}</pre>
                            </div>
                        </template>
                        <!-- Always in the DOM so docx-preview has somewhere to draw. Scrolls
                             sideways too: a Word page is wider than a phone. -->
                        <div v-show="state.kind === 'docx' && !state.renderFailed"
                            class="min-h-0 flex-1 overflow-auto bg-gray-800/70 p-4 sm:p-8">
                            <!-- docx-preview draws each page as its own element straight into
                                 this container. As a row the pages sat side by side, and centring
                                 pushed the first ones off the left edge where they cannot be
                                 scrolled to (Memox 01.10: "kun én side vises"). A column stacks them,
                                 and auto margins centre a page only while it fits: on a phone
                                 they drop to 0, so the page starts at the left and scrolls. -->
                            <div ref="previewContainer" class="flex w-full flex-col gap-6 [&>*]:mx-auto"
                                data-testid="document-preview-container"></div>
                        </div>

                        <template v-if="hasSiblings">
                            <button type="button" :disabled="!hasPrevious" @click="showSibling(-1)"
                                :aria-label="$t('drive.preview.previous')" :title="$t('drive.preview.previous')"
                                class="absolute left-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-900/85 text-white shadow-lg ring-1 ring-white/10 outline-none hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-30 sm:left-4 sm:size-12"
                                data-testid="document-preview-previous">
                                <Icon name="ph:caret-left" class="size-6" aria-hidden="true" />
                            </button>
                            <button type="button" :disabled="!hasNext" @click="showSibling(1)"
                                :aria-label="$t('drive.preview.next')" :title="$t('drive.preview.next')"
                                class="absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-900/85 text-white shadow-lg ring-1 ring-white/10 outline-none hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-30 sm:right-4 sm:size-12"
                                data-testid="document-preview-next">
                                <Icon name="ph:caret-right" class="size-6" aria-hidden="true" />
                            </button>
                        </template>

                        <div v-if="state.isPageLoading" class="absolute inset-0 z-10 grid place-items-center">
                            <LoadingSpinner :isActive="true" class="size-14" />
                        </div>
                    </div>
                </DialogPanel>
            </TransitionChild>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { documentService } from '@/components/api/user/DocumentService'
import { renderAsync } from 'docx-preview'
import type { Error } from '@/types'
import type { PropType } from 'vue'
import { saveAs } from 'file-saver'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'
import {
    blobForPreview,
    documentExtension,
    documentFileName,
    documentPreviewKind,
    type DocumentPreviewKind,
} from '@/composables/documentBlobViewer'

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDocument: {
        type: Object,
        required: true,
    },
    // Where the original bytes come from. Defaults to the company drive; the
    // other lists pass their own view call.
    loadFile: {
        type: Function as PropType<(document: any) => Promise<Blob | null>>,
        default: null,
    },
    // Staff pages pass whether the user may download documents. The relative
    // portal leaves it at true: download_documents doesn't apply there.
    canDownload: {
        type: Boolean,
        default: true,
    },
    // The download route, so the server checks the permission on the download
    // itself. Without it, "Download original" saves the bytes already shown.
    downloadFile: {
        type: Function as PropType<(document: any) => Promise<Blob | null>>,
        default: null,
    },
    // The documents "Open selected" picked. With more than one, the header
    // steps through them; the page follows along via update:selectedDocument.
    documents: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
})
const previewContainer = ref<HTMLElement | null>(null)
// Focused on open, so Enter or Space never downloads by accident.
const closeButton = ref<HTMLElement | null>(null)
const emit = defineEmits(['close', 'update:selectedDocument'])

const state = reactive({
    error: {} as Error,
    file: null as Blob | null,
    kind: null as DocumentPreviewKind | null,
    objectUrl: null as string | null,
    text: '',
    renderFailed: false,
    isPageLoading: false,
})

// Bumped on every load and on close, so a response that arrives after the
// user moved on is dropped instead of drawn over the current document.
let loadToken = 0

const currentIndex = computed(() =>
    props.documents.findIndex((document: any) => document?.uuid === props.selectedDocument?.uuid))
const hasSiblings = computed(() => props.documents.length > 1 && currentIndex.value !== -1)
const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value !== -1 && currentIndex.value < props.documents.length - 1)

const title = computed(() => props.selectedDocument?.name ?? t('drive.viewDocument'))

const previewNote = computed(() =>
    props.canDownload ? t('drive.preview.originalKeptNote') : t('drive.preview.previewNote'))

// Chrome and Edge hide their PDF toolbar (download, print) for these; other
// browsers ignore them. It stops the obvious button, not a determined user.
const pdfSrc = computed(() => {
    if (!state.objectUrl) {
        return null
    }

    return props.canDownload ? state.objectUrl : `${state.objectUrl}#toolbar=0&navpanes=0`
})

const unavailableText = computed(() => {
    if (state.kind === 'none') {
        return t('drive.preview.notAvailable')
    }

    return state.kind === 'docx' && props.canDownload ? t('drive.preview.renderFailed') : t('drive.preview.cannotShow')
})

const unavailableHint = computed(() => {
    // The Word message already says to download the original.
    if (state.kind === 'docx' && state.renderFailed && props.canDownload) {
        return ''
    }

    return props.canDownload ? t('drive.preview.downloadToOpen') : t('drive.preview.noDownloadPermission')
})

function closeModal() {
    emit('close')
}

function showSibling(step: number) {
    const document = props.documents[currentIndex.value + step]
    if (document) {
        emit('update:selectedDocument', document)
    }
}

// Two sources, compared one by one: a list refresh that hands over a new
// object for the same document must not load it again.
// ← and → step through "Open selected". Keys pressed inside a PDF stay in
// Chrome's viewer and never reach here.
function onKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return
    }
    if (event.key === 'ArrowLeft' && hasPrevious.value) {
        event.preventDefault()
        showSibling(-1)
    } else if (event.key === 'ArrowRight' && hasNext.value) {
        event.preventDefault()
        showSibling(1)
    }
}

watch([() => props.isModalOpen, () => props.selectedDocument?.uuid], () => {
    if (props.isModalOpen) {
        window.addEventListener('keydown', onKeydown)
        fetchDocument()
    } else {
        window.removeEventListener('keydown', onKeydown)
        clearPreview()
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    clearPreview()
})

function clearPreview() {
    loadToken++
    if (state.objectUrl) {
        URL.revokeObjectURL(state.objectUrl)
        state.objectUrl = null
    }
    state.file = null
    state.kind = null
    state.text = ''
    state.isPageLoading = false
    if (previewContainer.value) {
        previewContainer.value.innerHTML = ''
    }
}

async function fetchOriginal(document: any): Promise<Blob | null> {
    if (props.loadFile) {
        return await props.loadFile(document)
    }

    return await documentService.viewFile(document?.uuid)
}

async function fetchDocument() {
    clearPreview()
    const token = loadToken
    const document = props.selectedDocument
    state.error = {}
    state.renderFailed = false

    // A type nothing here can draw isn't fetched at all; Download fetches it if
    // asked. Without an extension the bytes' type has to decide.
    const knownKind = documentExtension(document) ? documentPreviewKind(document) : null
    if (knownKind === 'none') {
        state.kind = 'none'
        return
    }

    state.isPageLoading = true
    try {
        const file = await fetchOriginal(document)
        if (token !== loadToken) {
            return
        }

        state.file = file
        const kind = file ? knownKind ?? documentPreviewKind(document, file) : null
        state.kind = kind

        if (!file) {
            state.renderFailed = true
        } else if (kind === 'pdf' || kind === 'image') {
            state.objectUrl = URL.createObjectURL(blobForPreview(file, document, kind))
        } else if (kind === 'text') {
            const text = await readText(file)
            if (token === loadToken) {
                state.text = text
            }
        } else if (kind === 'docx') {
            const buffer = await file.arrayBuffer()
            if (token === loadToken) {
                await renderDocument(buffer)
            }
        }
    } catch (error: any) {
        if (token !== loadToken) {
            return
        }
        state.error = error
        state.renderFailed = true
    }
    if (token === loadToken) {
        state.isPageLoading = false
    }
}

// Notepad on older Windows saves æ, ø and å as Windows-1252; read as UTF-8
// they would turn into question marks.
async function readText(file: Blob): Promise<string> {
    const buffer = await file.arrayBuffer()
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
    } catch {
        return new TextDecoder('windows-1252').decode(buffer)
    }
}

// The preview is drawn in the browser from the untouched original; nothing is
// converted or saved back. Fonts the viewer's own computer lacks are
// substituted on screen only - the stored file keeps them.
async function renderDocument(buffer: ArrayBuffer) {
    await nextTick()
    if (!previewContainer.value) {
        return
    }
    previewContainer.value.innerHTML = ''
    try {
        await renderAsync(
            buffer,
            previewContainer.value,
            previewContainer.value,
            {
                className: 'docx-preview-wrapper',
                inWrapper: false,
                ignoreWidth: false,
                ignoreHeight: false,
                ignoreFonts: false,
                breakPages: true,
                ignoreLastRenderedPageBreak: true,
                experimental: false,
                trimXmlDeclaration: true,
                // Data URLs, not blob: URLs - docx-preview never revokes the
                // object URLs it makes for pictures and fonts, so every opened
                // document would stay in memory.
                useBase64URL: true,
                renderChanges: false,
                renderHeaders: true,
                renderFooters: true,
                renderFootnotes: true,
                renderEndnotes: true,
                debug: false
            }
        )
        // A file docx-preview could open but found nothing to draw in would
        // otherwise leave a white box that looks like an empty document.
        if (!previewContainer.value.textContent?.trim() && !previewContainer.value.querySelector('img, svg')) {
            state.renderFailed = true
        }
    } catch (error: any) {
        previewContainer.value.innerHTML = ''
        state.renderFailed = true
    }
}

async function downloadOriginal() {
    state.error = {}
    state.isPageLoading = true
    try {
        const file = props.downloadFile
            ? await props.downloadFile(props.selectedDocument)
            : state.file ?? await fetchOriginal(props.selectedDocument)
        if (file) {
            saveAs(file, documentFileName(props.selectedDocument))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style scoped>
/* Only the backdrop and page shadow are ours. Padding, width and fonts
   come from the document itself (its page size and margins) - overriding them
   here reflowed every line and made the preview look unlike the original. */
:deep(.docx-preview-wrapper-wrapper) {
    background: transparent !important;
    padding: 0 !important;
}

:deep(section.docx-preview-wrapper) {
    background: white;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
    margin: 0 auto 2rem auto;
}
</style>
