<template>
    <!-- Company documents an Admin shows to every patient. Read-only here: no
         delete, rename or upload, for staff and patients alike. Nothing is
         drawn when there are none, so a clinic that does not use the feature
         sees no empty box. -->
    <div v-if="state.documents.length" data-testid="standard-documents">
        <CollapsibleSection :title="$t('standardDocuments.title')" :storageKey="`standard-documents-${props.scope}`"
            :defaultOpen="true">
            <div class="space-y-3 pb-2">
                <p class="text-sm text-gray-500">{{ introText }}</p>
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div v-for="document in state.documents" :key="document.uuid" data-testid="standard-document-row"
                    class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                    <div class="min-w-0">
                        <button type="button"
                            class="flex max-w-full items-center gap-x-2 text-left font-medium text-tertiary hover:text-tertiary-700"
                            @click="openPreview(document)">
                            <Icon name="ph:file" class="size-5 shrink-0" aria-hidden="true" />
                            <span class="truncate">{{ document.name }}</span>
                        </button>
                        <p class="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                            <span v-if="document.folder_path" class="flex items-center gap-x-1">
                                <Icon name="ph:folder-simple" class="size-3.5 shrink-0" aria-hidden="true" />
                                <span class="truncate">{{ document.folder_path }}</span>
                            </span>
                            <span v-if="document.updated_at">{{ $t('standardDocuments.updated') }}: {{ formatDate(document.updated_at) }}</span>
                            <span v-if="document.size">{{ formatSize(document.size) }}</span>
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <FormButton type="button" buttonStyle="action" buttonSize="xs" class="!px-3"
                            @click="openPreview(document)">
                            <Icon name="ph:eye" class="size-4" aria-hidden="true" />
                            {{ $t('standardDocuments.view') }}
                        </FormButton>
                        <FormButton v-if="canDownload" type="button" buttonStyle="action" buttonSize="xs"
                            class="!px-3" @click="download(document)">
                            <Icon name="ph:download-simple" class="size-4" aria-hidden="true" />
                            {{ $t('standardDocuments.download') }}
                        </FormButton>
                    </div>
                </div>
            </div>
        </CollapsibleSection>

        <ModulesUserDocumentDocsFileModalPreview :isModalOpen="preview.isOpen"
            v-model:selectedDocument="preview.document" :documents="[]" :loadFile="loadFile"
            :downloadFile="downloadFile" :canDownload="canDownload" @close="preview.isOpen = false" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { saveAs } from 'file-saver'
import type { PropType } from 'vue'
import { standardDocumentService } from '@/components/api/user/StandardDocumentService'
import { documentFileName } from '@/composables/documentBlobViewer'
import { usePermissions } from '@/composables/usePermissions'
import { useTerminology } from '@/composables/useTerminology'
import type { Error } from '@/types'

const props = defineProps({
    // Which API the list comes from: a staff user reading a patient's record,
    // or the patient reading their own portal.
    scope: {
        type: String as PropType<'staff' | 'patient'>,
        default: 'staff',
    },
    // The patient whose record is open (staff scope only).
    citizenUuid: {
        type: String,
        default: '',
    },
})

const { isAtLeast, can } = usePermissions()
const { tt } = useTerminology()

const state = reactive({
    documents: [] as any[],
    error: {} as Error,
})

const preview = reactive({
    isOpen: false,
    document: {} as any,
})

// A patient may always save what the clinic shows them; staff follow the same
// download_documents rule as the rest of the documents page.
const canDownload = computed(() =>
    props.scope === 'patient' ? true : isAtLeast('Admin') || can('download_documents'))

const introText = computed(() =>
    props.scope === 'patient'
        ? tt('standardDocuments.introPatient')
        : tt('standardDocuments.introStaff'))

// The viewer decides how to draw a file from its extension, and a company file's
// name often has none. The server's mime type is the only thing that says.
const EXTENSION_BY_MIME: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'text/plain': 'txt',
}

function withViewerFields(document: any) {
    const mime = String(document?.mime_type || '').split(';')[0].trim().toLowerCase()
    const extension = EXTENSION_BY_MIME[mime]
    return extension ? { ...document, file_url: `${document.uuid}.${extension}` } : { ...document }
}

onMounted(fetchDocuments)
watch(() => [props.scope, props.citizenUuid], fetchDocuments)

async function fetchDocuments() {
    state.error = {}
    if (props.scope === 'staff' && !props.citizenUuid) {
        state.documents = []
        return
    }
    try {
        const response: any = props.scope === 'patient'
            ? await standardDocumentService.listForPatient()
            : await standardDocumentService.listForCitizen(props.citizenUuid)
        state.documents = (response?.data ?? []).map(withViewerFields)
    } catch (error: any) {
        // A list that cannot load is hidden rather than shown as an error: it
        // is an extra on a page whose own content is what the user came for.
        state.documents = []
    }
}

function openPreview(document: any) {
    preview.document = document
    preview.isOpen = true
}

function loadFile(document: any): Promise<Blob | null> {
    return props.scope === 'patient'
        ? standardDocumentService.viewForPatient(document?.uuid)
        : standardDocumentService.viewForCitizen(props.citizenUuid, document?.uuid)
}

function downloadFile(document: any): Promise<Blob | null> {
    return props.scope === 'patient'
        ? standardDocumentService.downloadForPatient(document?.uuid)
        : standardDocumentService.downloadForCitizen(props.citizenUuid, document?.uuid)
}

async function download(document: any) {
    state.error = {}
    try {
        const file = await downloadFile(document)
        if (file) saveAs(file, documentFileName(document))
    } catch (error: any) {
        state.error = error
    }
}

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : ''
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
