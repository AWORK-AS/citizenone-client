<template>
    <div ref="wrapperRef" class="relative flex-shrink-0">
        <button type="button" @click.stop="toggle" :title="$t('messageTemplates.insertTemplate')"
            class="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <Icon name="ph:chat-text" class="w-5 h-5 text-gray-500" aria-hidden="true" />
        </button>

        <div v-if="open" @click.stop
            class="absolute bottom-12 left-0 z-50 w-80 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
            <p class="px-2 py-1.5 text-xs font-medium text-gray-400">{{ $t('messageTemplates.quickReplies') }}</p>
            <div v-if="isLoading" class="px-2 py-4 text-center text-sm text-gray-400">…</div>
            <div v-else-if="templates.length === 0" class="px-2 py-4 text-center text-xs text-gray-400">
                {{ $t('messageTemplates.noTemplates') }}
            </div>
            <div v-else class="max-h-64 overflow-y-auto space-y-0.5">
                <button v-for="tpl in templates" :key="tpl.uuid" type="button" @click.stop="pick(tpl)"
                    class="w-full text-left rounded-md px-2.5 py-2 hover:bg-gray-100 transition-colors">
                    <p class="text-sm font-medium text-gray-800 truncate">{{ tpl.title }}</p>
                    <p class="text-xs text-gray-500 line-clamp-2">{{ tpl.body }}</p>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import { messageTemplatesService } from '@/components/api/user/MessageTemplatesService'

const emit = defineEmits(["select"])
const open = ref(false)
const isLoading = ref(false)
const loaded = ref(false)
const templates = ref<any[]>([])
const wrapperRef = ref<HTMLElement | null>(null)

async function fetchTemplates() {
    if (loaded.value) return
    isLoading.value = true
    try {
        const response = await messageTemplatesService.listMessageTemplates()
        templates.value = Array.isArray(response) ? response : (response?.data ?? [])
        loaded.value = true
    } catch {
        templates.value = []
    }
    isLoading.value = false
}

function toggle() {
    open.value = !open.value
    if (open.value) fetchTemplates()
}

function pick(tpl: any) {
    emit("select", tpl.body)
    open.value = false
}

function onDocumentClick(event: MouseEvent) {
    if (open.value && wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
        open.value = false
    }
}

onMounted(() => document.addEventListener("click", onDocumentClick, true))
onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick, true))
</script>
