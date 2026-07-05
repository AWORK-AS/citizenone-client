<template>
    <div>
        <Modal size="md" :title="props.title || $t('recordHistory.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="min-h-[8rem]">
                    <div v-if="state.isLoading" class="py-10 text-center text-sm text-gray-500">
                        {{ $t('recordHistory.loading') }}
                    </div>

                    <div v-else-if="!state.history.length" class="py-10 text-center text-sm text-gray-500">
                        {{ $t('recordHistory.empty') }}
                    </div>

                    <ol v-else class="relative border-s border-gray-200 ms-2">
                        <li v-for="entry in state.history" :key="entry.id" class="mb-5 ms-4">
                            <span class="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full ring-4 ring-white"
                                :class="dotClass(entry.event)" />
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-sm font-semibold text-gray-900">{{ eventLabel(entry.event) }}</span>
                                <time class="text-xs text-gray-400">{{ formatDate(entry.created_at) }}</time>
                            </div>
                            <p class="mt-0.5 text-xs text-gray-500">
                                {{ $t('recordHistory.by') }}
                                <span class="font-medium text-gray-700">{{ causerName(entry.causer) }}</span>
                            </p>
                            <ul v-if="Array.isArray(entry.changes) && entry.changes.length" class="mt-1 space-y-0.5">
                                <li v-for="(change, i) in entry.changes" :key="i" class="text-xs text-gray-500">
                                    <span class="font-medium text-gray-600">{{ humanField(change.field) }}:</span>
                                    <span class="text-gray-400">{{ display(change.old) }}</span>
                                    <span class="text-gray-300"> → </span>
                                    <span class="text-gray-700">{{ display(change.new) }}</span>
                                </li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <div class="mt-5 flex justify-end">
                    <FormButton buttonStyle="cancel" @click="closeModal">{{ $t('close') }}</FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue"
import { useI18n } from "vue-i18n"
import { historyService } from "@/components/api/user/HistoryService"

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    type: { type: String, required: true },
    uuid: { type: String, required: false, default: "" },
    title: { type: String, required: false, default: "" },
})

const emit = defineEmits(["close"])
const { t, locale } = useI18n()

const state = reactive<{ isLoading: boolean; history: any[] }>({ isLoading: false, history: [] })

watch(
    () => props.isModalOpen,
    async (open) => {
        if (open && props.type && props.uuid) await fetchHistory()
    }
)

async function fetchHistory() {
    state.isLoading = true
    try {
        const response = await historyService.getRecordHistory(props.type, props.uuid)
        state.history = response?.data ?? response ?? []
    } catch (error) {
        state.history = []
    }
    state.isLoading = false
}

function eventLabel(event: string) {
    const key = `recordHistory.events.${event}`
    const label = t(key)
    return label === key ? event : label
}

function dotClass(event: string) {
    const map: Record<string, string> = {
        created: "bg-green-500",
        updated: "bg-amber-500",
        deleted: "bg-red-500",
    }
    return map[event] ?? "bg-primary"
}

function causerName(causer: any) {
    if (!causer) return t("recordHistory.system")
    return [causer.firstname, causer.lastname].filter(Boolean).join(" ") || t("recordHistory.system")
}

function humanField(field: string) {
    if (!field) return ""
    return field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function display(value: any) {
    if (value === null || value === undefined || value === "") return "-"
    if (typeof value === "boolean") return value ? "✓" : "✗"
    return String(value)
}

function formatDate(value: string) {
    if (!value) return ""
    try {
        return new Date(value).toLocaleString(locale.value === "en" ? "en-GB" : "da-DK")
    } catch {
        return value
    }
}

function closeModal() {
    emit("close")
}
</script>
