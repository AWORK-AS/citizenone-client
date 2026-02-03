<template>
    <Modal size="4xl" :title="documentName || 'Document Preview'" :show="isOpen" @close="closeModal">
        <template #modal-body>
            <div class="flex flex-col h-[80vh]">
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
                <div class="mt-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('close')">
            {{ $t('cancel') }}
        </FormButton>
        <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full" @click="downloadDocument">
            {{ $t('citizens.citizenJournals.download') }}
        </FormButton>
    </div>
</div>
            </div>
        </template>
    </Modal>
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
