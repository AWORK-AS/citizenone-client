<template>
    <div class="relative" @dragenter.prevent="state.isDragging = true"
        @dragover.prevent="state.isDragging = true"
        @dragleave.prevent="state.isDragging = false"
        @drop.prevent="onDrop">
        <!-- The paperwork that arrives with an inquiry arrives as an attachment
             somebody has just saved, so dragging it here is the shortest route
             from where it is to where it belongs. -->
        <div v-if="state.isDragging"
            class="pointer-events-none absolute inset-0 z-40 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5">
            <span class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary shadow-lg">
                {{ $t('inquiryDocuments.dropHere') }}
            </span>
        </div>
        <div class="mb-3 flex items-center justify-between gap-3">
            <p class="text-sm font-semibold text-gray-900">
                {{ $t('inquiryDocuments.title') }}
            </p>
            <span class="text-xs text-slate-400">
                {{ $t('inquiryDocuments.count', { count: state.documents.length }) }}
            </span>
        </div>

        <p class="mb-3 text-[11px] text-slate-400">{{ $t('inquiryDocuments.hint') }}</p>

        <div class="mb-4">
            <input ref="fileInput" type="file" class="hidden" :accept="ACCEPT" @change="onPick" />
            <FormButton type="button" buttonStyle="action" :disabled="state.isUploading"
                @click="fileInput?.click()">
                <Icon name="ph:upload-simple" class="size-4" />
                {{ state.isUploading ? $t('inquiryDocuments.uploading') : $t('inquiryDocuments.upload') }}
            </FormButton>
        </div>

        <p v-if="!state.documents.length" class="border-t border-surface-100 pt-4 text-[13px] text-slate-400">
            {{ $t('inquiryDocuments.empty') }}
        </p>

        <div v-for="doc in state.documents" :key="doc.uuid"
            class="flex flex-wrap items-center gap-3 border-t border-surface-100 py-2.5">
            <Icon name="ph:file-text" class="size-5 shrink-0 text-slate-400" />
            <div class="min-w-0 flex-1">
                <!-- Opens in the app's viewer through the API, not the stored
                     file's public address. -->
                <button type="button" @click="openDocument(doc)"
                    class="block max-w-full truncate text-left text-[13px] font-semibold text-secondary hover:underline"
                    data-testid="inquiry-document-open">
                    {{ doc.name }}
                </button>
                <p class="text-[11px] text-slate-400">
                    {{ [readableSize(doc.size), uploaderName(doc), formatDateToReadable(doc.created_at)].filter(Boolean).join(' · ') }}
                </p>
            </div>
            <span v-if="doc.is_copied_to_citizen"
                class="shrink-0 rounded-full bg-[#e6f6ee] px-2 py-px text-[11px] font-semibold text-[#177a53]">
                {{ $t('inquiryDocuments.onCitizen') }}
            </span>
            <!-- Once on the citizen it cannot be removed here, so the action is
                 not offered. -->
            <FormButton v-if="!doc.is_copied_to_citizen && (doc.is_own || canManage)" type="button"
                buttonStyle="danger" :aria-label="$t('inquiryDocuments.delete')" @click="confirmDelete(doc)">
                <Icon name="ph:trash" class="size-4" />
            </FormButton>
        </div>

        <DialogConfirmation :isModalOpen="state.isDeleteOpen" :message="$t('inquiryDocuments.confirmDelete') + '?'"
            @close="state.isDeleteOpen = false" @confirm="remove" />
        <ModulesUserDocumentDocsFileModalPreview :isModalOpen="preview.isOpen" :selectedDocument="preview.document"
            :loadFile="loadDocument" :downloadFile="downloadDocument" :canDownload="canDownloadDocuments"
            @close="preview.isOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { inquiryDocumentService } from '@/components/api/user/InquiryDocumentService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'

const { errorAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const { formatDateToReadable } = useDatetimeFormatter()

// Mirrors what the server accepts, so a rejected file is caught in the picker
// rather than after the upload.
const ACCEPT = '.pdf,.doc,.docx,.odt,.rtf,.txt,.png,.jpg,.jpeg,.heic,.xlsx,.xls,.csv'

const props = defineProps({
    inquiryUuid: {
        type: String,
        required: true,
    },
})

const fileInput = ref<HTMLInputElement | null>(null)

const state = reactive({
    documents: [] as any[],
    isDeleteOpen: false,
    isUploading: false,
    isDragging: false,
    selected: null as any,
})

const canManage = computed(() => (userStore.getUser?.roles?.[0]?.level ?? 0) >= 60)

const { isAtLeast, can } = usePermissions()
// Without download_documents a document can still be viewed, but not saved.
const canDownloadDocuments = computed(() => isAtLeast('Admin') || can('download_documents'))

const preview = reactive({
    isOpen: false,
    document: {} as any,
})

function openDocument(doc: any) {
    preview.document = doc
    preview.isOpen = true
}

function loadDocument(doc: any): Promise<Blob | null> {
    return inquiryDocumentService.viewDocument(doc?.uuid)
}

function downloadDocument(doc: any): Promise<Blob | null> {
    return inquiryDocumentService.downloadDocument(doc?.uuid)
}

onMounted(() => {
    fetchDocuments()
})

watch(() => props.inquiryUuid, () => fetchDocuments())

function uploaderName(doc: any) {
    const up = doc.uploader ?? {}

    return `${up.firstname ?? ''} ${up.lastname ?? ''}`.trim()
}

function readableSize(size: any) {
    if (!size) return ''
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`

    return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

async function fetchDocuments() {
    try {
        const response = await inquiryDocumentService.getDocuments(props.inquiryUuid)
        state.documents = response?.data ?? []
    } catch (_) {
        state.documents = []
    }
}

async function onPick(event: any) {
    const file = event.target?.files?.[0]
    if (!file) return

    await upload([file])
    // Cleared so picking the same file twice fires the change event again.
    if (fileInput.value) fileInput.value.value = ''
}

async function onDrop(event: DragEvent) {
    state.isDragging = false

    const files = Array.from(event.dataTransfer?.files ?? [])
    if (!files.length) return

    await upload(files)
}

/**
 * Split out so a drop feeds exactly the same path as the file picker, rather
 * than a second one that can fail differently. Uploaded one at a time because
 * the endpoint takes one file, and stopping on the first failure so the error
 * names the file it is about.
 */
async function upload(files: File[]) {
    state.isUploading = true
    try {
        for (const file of files) {
            await inquiryDocumentService.uploadDocument(props.inquiryUuid, file, file.name)
        }
        await fetchDocuments()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.errors?.file?.[0] ?? error?.message ?? t('inquiryDocuments.uploadFailed'))
        await fetchDocuments()
    }
    state.isUploading = false
}

function confirmDelete(doc: any) {
    state.selected = doc
    state.isDeleteOpen = true
}

async function remove() {
    state.isDeleteOpen = false
    try {
        await inquiryDocumentService.deleteDocument(state.selected.uuid)
        await fetchDocuments()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryDocuments.deleteFailed'))
    }
}
</script>
