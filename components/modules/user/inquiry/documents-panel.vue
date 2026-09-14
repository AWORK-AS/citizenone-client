<template>
    <div>
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
                <a :href="doc.file_url" target="_blank" rel="noopener"
                    class="block truncate text-[13px] font-semibold text-secondary hover:underline">
                    {{ doc.name }}
                </a>
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
    </div>
</template>

<script setup lang="ts">
import { inquiryDocumentService } from '@/components/api/user/InquiryDocumentService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
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
    selected: null as any,
})

const canManage = computed(() => (userStore.getUser?.roles?.[0]?.level ?? 0) >= 60)

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

    state.isUploading = true
    try {
        await inquiryDocumentService.uploadDocument(props.inquiryUuid, file, file.name)
        await fetchDocuments()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.errors?.file?.[0] ?? error?.message ?? t('inquiryDocuments.uploadFailed'))
    }
    state.isUploading = false
    // Cleared so picking the same file twice fires the change event again.
    if (fileInput.value) fileInput.value.value = ''
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
