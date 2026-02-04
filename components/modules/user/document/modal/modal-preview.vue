<template>
    <div>
        <Modal size="3xl" :title="props.selectedDocument?.name ?? $t('drive.viewDocument')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex flex-col h-[60vh]">
                        <div class="flex-1 relative flex flex-col bg-gray-300/50 overflow-hidden">
                            <div class="flex-1 overflow-y-auto overflow-x-hidden p-8 w-full bg-transparent">
                                <div ref="previewContainer" class="w-full flex justify-center"></div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('close')">
                                {{ $t('close') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full"
                                @click="downloadFile">
                                {{ $t('drive.download') }}
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
import { saveAs } from 'file-saver'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDocument: {
        type: Object,
        required: true,
    }
})
const previewContainer = ref<HTMLElement | null>(null)
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    selectedDocument: {} as any,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        fetchDocument()
    }
})

async function fetchDocument() {
    state.isPageLoading = true
    try {
        const documentUuid = props.selectedDocument?.uuid
        const params = {
            mode: 'preview',
        }
        const response = await documentService.getContent(documentUuid, params)
        if (response) {
            state.selectedDocument = response
            const binaryString = window.atob(state.selectedDocument?.data?.content)
            const len = binaryString.length
            const bytes = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }
            renderDocument(bytes.buffer)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function renderDocument(buffer: ArrayBuffer) {
    state.isPageLoading = true
    try {
        await nextTick()
        if (previewContainer.value) {
            previewContainer.value.innerHTML = ''
        }
        await renderAsync(
            buffer,
            previewContainer.value!,
            previewContainer.value!,
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
                debug: false
            }
        )
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}

async function downloadFile(document: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const documentUuid = props.selectedDocument?.uuid
        const response = await documentService.downloadFile(documentUuid)
        if (response) {
            saveAs(response, document?.name)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style scoped>
:deep(.docx-wrapper) {
    background: transparent !important;
    padding: 0 !important;
    box-shadow: none !important;
    margin: 0 auto !important;
    width: auto !important;
}

:deep(.docx-preview-wrapper) {
    background: white;
    margin-bottom: 2rem;
}

:deep(section.docx) {
    background: white !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    margin-bottom: 2rem !important;
    padding: 4rem !important;
}
</style>
