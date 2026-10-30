<template>
    <div>
        <Modal size="sm" :title="$t('messages.export.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state.downloadError" v-if="state.downloadError" class="mb-3" />

                <div class="flex flex-wrap gap-2 mb-4">
                    <button v-for="range in quickRanges" :key="range.key" type="button"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                        :class="isActiveRange(range.key)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                        :aria-pressed="isActiveRange(range.key)" :disabled="state.isDownloading"
                        @click="selectRange(range.key)">
                        {{ range.label }}
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="export_from" :label="$t('messages.export.from')" />
                        <FormDateField id="export_from" name="export_from" v-model="state.from"
                            :placeholder="$t('messages.export.from')" :maxDate="today()" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="export_to" :label="$t('messages.export.to')" />
                        <FormDateField id="export_to" name="export_to" v-model="state.to"
                            :placeholder="$t('messages.export.to')" :maxDate="today()" />
                    </div>
                </div>

                <!-- Preview result -->
                <div class="mt-4 min-h-[1.5rem] text-sm" role="status" aria-live="polite">
                    <span v-if="state.isPreviewing" class="flex items-center gap-2 text-gray-400">
                        <span class="w-4 h-4 border-b-2 border-gray-400 rounded-full animate-spin"></span>
                    </span>
                    <span v-else-if="previewMessage.text" :class="previewMessage.isError ? 'text-red-600' : 'text-gray-700'">
                        {{ previewMessage.text }}
                    </span>
                </div>

                <div class="mt-4">
                    <FormButton type="button" buttonStyle="primary" class="w-full" :disabled="!canDownload"
                        @click="download">
                        <template #icon-left>
                            <Icon :name="state.isDownloading ? 'ph:spinner' : 'ph:download-simple'"
                                class="h-4 w-4" :class="state.isDownloading && 'animate-spin'" aria-hidden="true" />
                        </template>
                        {{ state.isDownloading ? $t('messages.export.downloading') : $t('messages.export.download') }}
                    </FormButton>
                </div>

                <p class="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                    <Icon name="ph:info" class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {{ $t('messages.export.personalData') }}
                </p>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { messageService } from '@/components/api/user/MessageService'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    chatUuid: {
        type: String,
        required: false,
    },
    chatName: {
        type: String,
        required: false,
    },
})
const emit = defineEmits(['close'])
const { t } = useI18n()

const DATE_FORMAT = 'YYYY-MM-DD'
const DEBOUNCE_MS = 300
const DEFAULT_MAX_MONTHS = 12

const state = reactive({
    from: '',
    to: '',
    count: null as number | null,
    previewError: '',
    isPreviewing: false,
    isDownloading: false,
    downloadError: '',
    // From the latest successful preview; null when the chat holds no messages.
    firstMessageAt: null as string | null,
    isFirstMessageKnown: false,
    maxMonths: DEFAULT_MAX_MONTHS,
})

// Local-time dates, never toISOString (that shifts the day around midnight).
function today(): string {
    return moment().format(DATE_FORMAT)
}

function daysAgo(days: number): string {
    return moment().subtract(days, 'days').format(DATE_FORMAT)
}

function allRangeFrom(): string {
    const earliestAllowed = moment().subtract(state.maxMonths, 'months').format(DATE_FORMAT)
    if (state.firstMessageAt && state.firstMessageAt > earliestAllowed) {
        return state.firstMessageAt
    }
    return earliestAllowed
}

const quickRanges = computed(() => [
    { key: 'today', label: t('messages.export.today') },
    { key: 'last7', label: t('messages.export.last7') },
    { key: 'last30', label: t('messages.export.last30') },
    { key: 'all', label: t('messages.export.all') },
])

function rangeFor(key: string): { from: string, to: string } {
    switch (key) {
        case 'today':
            return { from: today(), to: today() }
        case 'last7':
            return { from: daysAgo(7), to: today() }
        case 'last30':
            return { from: daysAgo(30), to: today() }
        default:
            return { from: allRangeFrom(), to: today() }
    }
}

function isActiveRange(key: string): boolean {
    const range = rangeFor(key)
    return range.from === state.from && range.to === state.to
}

const isRangeValid = computed(() => !!state.from && !!state.to && state.from <= state.to)

const isRangeTooLong = computed(() =>
    isRangeValid.value && moment(state.to, DATE_FORMAT).isAfter(moment(state.from, DATE_FORMAT).add(state.maxMonths, 'months'))
)

const previewMessage = computed((): { text: string, isError: boolean } => {
    if (state.from && state.to && state.from > state.to) {
        return { text: t('messages.export.invalidRange'), isError: true }
    }
    if (isRangeTooLong.value) {
        return { text: t('messages.export.tooLarge'), isError: true }
    }
    if (state.previewError) {
        return { text: state.previewError, isError: true }
    }
    if (state.count === null) {
        return { text: '', isError: false }
    }
    if (state.count === 0) {
        return { text: t('messages.export.noMessages'), isError: false }
    }
    return {
        text: state.count === 1
            ? t('messages.export.countOne')
            : t('messages.export.countMany', { count: state.count }),
        isError: false,
    }
})

const canDownload = computed(() =>
    !!props.chatUuid
    && isRangeValid.value
    && !isRangeTooLong.value
    && !state.isPreviewing
    && !state.isDownloading
    && !state.previewError
    && state.count !== null
    && state.count > 0
)

let previewRequestId = 0
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function clearDebounce() {
    if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
    }
}

async function runPreview(): Promise<void> {
    // A newer call (or a close) makes every older response stale.
    const requestId = ++previewRequestId
    state.previewError = ''
    state.count = null

    if (!props.chatUuid || !isRangeValid.value || isRangeTooLong.value) {
        state.isPreviewing = false
        return
    }

    state.isPreviewing = true
    try {
        const response = await messageService.previewExport(props.chatUuid, state.from, state.to)
        if (requestId !== previewRequestId) return
        const data = response?.data
        state.count = Number(data?.count ?? 0)
        state.firstMessageAt = data?.first_message_at ?? null
        state.isFirstMessageKnown = true
        if (data?.max_months) state.maxMonths = Number(data.max_months)
    } catch (error: any) {
        if (requestId !== previewRequestId) return
        state.previewError = error?.message || t('messages.export.error')
    }
    if (requestId === previewRequestId) state.isPreviewing = false
}

function schedulePreview() {
    clearDebounce()
    // Not loading yet is fine, but stale numbers must not stay clickable.
    previewRequestId++
    state.count = null
    state.previewError = ''
    state.isPreviewing = isRangeValid.value && !isRangeTooLong.value
    debounceTimer = setTimeout(runPreview, DEBOUNCE_MS)
}

watch(() => [state.from, state.to], () => {
    if (props.isModalOpen) schedulePreview()
})

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (isOpen) {
        state.downloadError = ''
        state.isDownloading = false
        state.isFirstMessageKnown = false
        state.firstMessageAt = null
        state.maxMonths = DEFAULT_MAX_MONTHS
        const wasDefault = state.from === daysAgo(30) && state.to === today()
        state.from = daysAgo(30)
        state.to = today()
        // The dates may be unchanged from last time, so the watcher will not fire.
        if (wasDefault) {
            clearDebounce()
            runPreview()
        }
    } else {
        clearDebounce()
        previewRequestId++
        state.isPreviewing = false
    }
}, { immediate: true })

onBeforeUnmount(() => {
    clearDebounce()
    previewRequestId++
})

async function selectRange(key: string) {
    if (key === 'all' && !state.isFirstMessageKnown && isRangeValid.value && !isRangeTooLong.value) {
        // The earliest message date comes with a preview, so ask once first.
        clearDebounce()
        await runPreview()
    }
    const range = rangeFor(key)
    state.from = range.from
    state.to = range.to
}

function filenameFromHeaders(headers: Headers | null): string {
    const disposition = headers?.get('content-disposition') || ''
    if (!disposition) return ''

    const encoded = disposition.match(/filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/i)
    if (encoded?.[1]) {
        try {
            return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ''))
        } catch {
            // Fall through to the plain filename.
        }
    }

    const plain = disposition.match(/filename\s*=\s*"([^"]+)"/i) || disposition.match(/filename\s*=\s*([^;]+)/i)
    return plain?.[1]?.trim() || ''
}

function fallbackFilename(): string {
    const name = (props.chatName || '')
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
    return `chat-${name || 'chat'}-${state.from}-to-${state.to}.pdf`
}

async function download() {
    if (!canDownload.value || !props.chatUuid) return

    state.downloadError = ''
    state.isDownloading = true
    let responseHeaders: Headers | null = null

    try {
        const blob = await messageService.downloadExport(props.chatUuid, state.from, state.to, (headers: Headers) => {
            responseHeaders = headers
        })
        if (!blob) {
            state.downloadError = t('messages.export.error')
            return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filenameFromHeaders(responseHeaders) || fallbackFilename()
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(url), 60000)

        closeModal()
    } catch (error: any) {
        state.downloadError = error?.status === 429
            ? t('messages.export.tooManyRequests')
            : (error?.message || t('messages.export.error'))
    } finally {
        state.isDownloading = false
    }
}

function closeModal() {
    emit('close')
}
</script>
