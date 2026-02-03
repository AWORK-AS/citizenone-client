<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex justify-center items-center z-[9999] p-8"
        @click.self="closeModal"
    >
        <div 
            class="bg-gray-100 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/10 transition-all transform"
            :class="{ 'scale-100 opacity-100': isOpen, 'scale-95 opacity-0': !isOpen }"
        >
            <div class="bg-white flex justify-between items-center px-6 py-4 border-b border-gray-200 z-10 shadow-sm">
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="flex items-center justify-center w-9 h-9 bg-blue-50 text-blue-500 rounded-lg">
                        <Icon name="heroicons:document-text" class="w-5 h-5" />
                    </div>
                    <h2 class="text-lg font-semibold text-gray-900 m-0 truncate max-w-sm" :title="documentName">
                        {{ documentName || 'Document Preview' }}
                    </h2>
                </div>
        
                <div class="flex items-center gap-2">
                    <button 
                        v-if="documentData"
                        class="bg-transparent border-none text-gray-500 p-2 rounded-lg transition-colors hover:bg-gray-100 hover:text-gray-900 flex items-center justify-center cursor-pointer"
                        @click="downloadDocument"
                        title="Download Document"
                    >
                        <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
                    </button>

                    <button
                        class="bg-transparent border-none text-gray-500 p-2 rounded-lg transition-colors hover:bg-gray-100 hover:text-gray-900 flex items-center justify-center cursor-pointer"
                        @click="closeModal"
                        title="Close Preview"
                    >
                        <Icon name="heroicons:x-mark" class="w-6 h-6" />
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="flex-1 relative flex flex-col bg-gray-300/50 overflow-hidden">
                <div v-show="isLoading" class="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                    <div class="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p>Rendering document...</p>
                </div>

                <div v-if="error" class="flex-1 flex flex-col items-center justify-center text-red-500 p-8">
                    <div class="text-2xl font-bold mb-2">!</div>
                    <p class="mb-4">{{ error }}</p>
                    <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" @click="closeModal">Close</button>
                </div>

                <div
                    v-show="!isLoading && !error"
                    class="flex-1 overflow-y-auto overflow-x-hidden p-8 w-full bg-transparent"
                >
                    <div
                        ref="previewContainer"
                        class="w-full flex justify-center"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { renderAsync } from 'docx-preview'

interface Props {
    isOpen: boolean
    documentData?: ArrayBuffer | null
    documentName?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
}>()

const previewContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const closeModal = () => {
    emit('close')
}

const downloadDocument = () => {
    if (!props.documentData) return

    // Create blob from buffer
    const blob = new Blob([props.documentData], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    })
  
    // Create link and trigger download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = props.documentName || 'document.docx'
    document.body.appendChild(link)
    link.click()
  
    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

const renderDocument = async () => {
    if (!props.documentData || !previewContainer.value) {
        return
    }

    isLoading.value = true
    error.value = null

    try {
        await nextTick()
    
        if (previewContainer.value) {
            previewContainer.value.innerHTML = ''
        }

        await renderAsync(
            props.documentData,
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
    
    } catch (err: any) {
        console.error('Error rendering document:', err)
        error.value = `Failed to load document preview.`
    } finally {
        isLoading.value = false
    }
}

watch(
    () => props.isOpen,
    async (newValue) => {
        if (newValue && props.documentData) {
            await nextTick()
            renderDocument()
        }
    }
)

watch(
    () => props.documentData,
    async (newValue) => {
        if (newValue && props.isOpen) {
            await nextTick()
            renderDocument()
        }
    }
)
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
    box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
    margin-bottom: 2rem !important;
    padding: 4rem !important;
}
</style>
