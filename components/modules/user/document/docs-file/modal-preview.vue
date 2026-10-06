<template>
    <div>
        <Modal size="3xl" :title="props.selectedDocument?.name ?? $t('drive.viewDocument')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <p class="mb-3 flex items-start gap-2 text-sm text-gray-600" data-testid="document-preview-note">
                        <Icon name="ph:info" class="size-5 shrink-0" />
                        <span>{{ $t('drive.preview.originalKeptNote') }}</span>
                    </p>
                    <div class="flex flex-col h-[60vh]">
                        <div class="flex-1 relative flex flex-col bg-gray-300/50 overflow-hidden">
                            <div v-if="state.renderFailed"
                                class="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center text-gray-700"
                                data-testid="document-preview-failed">
                                <Icon name="ph:file-doc" class="size-12" />
                                <p>{{ $t('drive.preview.renderFailed') }}</p>
                            </div>
                            <div v-show="!state.renderFailed"
                                class="flex-1 overflow-y-auto overflow-x-hidden p-8 w-full bg-transparent">
                                <div ref="previewContainer" class="w-full flex justify-center"
                                    data-testid="document-preview-container"></div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 gap-3" :class="{ 'md:grid-cols-2': canDownload }">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                {{ $t('close') }}
                            </FormButton>
                            <FormButton v-if="canDownload" type="button" buttonStyle="primary" class="w-full"
                                @click="downloadOriginal" data-testid="document-preview-download">
                                {{ $t('drive.preview.downloadOriginal') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { documentService } from '@/components/api/user/DocumentService'
import { renderAsync } from 'docx-preview'
import type { Error } from '@/types'
import type { PropType } from 'vue'
import { saveAs } from 'file-saver'
import { documentFileName } from '@/composables/documentBlobViewer'

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
    // citizen, relative and OneDrive lists pass their own call.
    loadFile: {
        type: Function as PropType<(document: any) => Promise<Blob>>,
        default: null,
    },
    // Staff pages pass whether the user may download documents. The relative
    // portal leaves it at true: download_documents doesn't apply there.
    canDownload: {
        type: Boolean,
        default: true,
    },
})
const previewContainer = ref<HTMLElement | null>(null)
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    file: null as Blob | null,
    renderFailed: false,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        fetchDocument()
    } else {
        state.file = null
        if (previewContainer.value) {
            previewContainer.value.innerHTML = ''
        }
    }
})

async function fetchOriginal(): Promise<Blob> {
    if (props.loadFile) {
        return await props.loadFile(props.selectedDocument)
    }

    return await documentService.viewFile(props.selectedDocument?.uuid) as Blob
}

async function fetchDocument() {
    state.error = {}
    state.renderFailed = false
    state.file = null
    state.isPageLoading = true
    try {
        const file = await fetchOriginal()
        if (file) {
            state.file = file
            await renderDocument(await file.arrayBuffer())
        }
    } catch (error: any) {
        state.error = error
        state.renderFailed = true
    }
    state.isPageLoading = false
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
                useBase64URL: false,
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
        const file = state.file ?? await fetchOriginal()
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
/* Only the grey backdrop and page shadow are ours. Padding, width and fonts
   come from the document itself (its page size and margins) - overriding them
   here reflowed every line and made the preview look unlike the original. */
:deep(.docx-preview-wrapper-wrapper) {
    background: transparent !important;
    padding: 0 !important;
}

:deep(section.docx-preview-wrapper) {
    background: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin: 0 auto 2rem auto;
}
</style>
