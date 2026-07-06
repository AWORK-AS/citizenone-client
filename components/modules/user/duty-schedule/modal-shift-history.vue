<template>
    <div>
        <Modal size="md" :title="$t('dutySchedules.history.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="min-h-[8rem]">
                    <div v-if="state.isLoading" class="py-10 text-center text-sm text-gray-500">
                        {{ $t('dutySchedules.history.loading') }}
                    </div>

                    <div v-else-if="!state.history.length" class="py-10 text-center text-sm text-gray-500">
                        {{ $t('dutySchedules.history.empty') }}
                    </div>

                    <ol v-else class="relative border-s border-gray-200 ms-2">
                        <li v-for="entry in state.history" :key="entry.id" class="mb-5 ms-4">
                            <span class="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full ring-4 ring-white"
                                :class="dotClass(entry.action_type)" />
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-sm font-semibold text-gray-900">
                                    {{ actionLabel(entry.action_type) }}
                                </span>
                                <time class="text-xs text-gray-400">
                                    {{ formatDate(entry.created_at) }}
                                </time>
                            </div>
                            <p class="mt-0.5 text-xs text-gray-500">
                                {{ $t('dutySchedules.history.by') }}
                                <span class="font-medium text-gray-700">
                                    {{ causerName(entry.causer) }}
                                </span>
                            </p>
                            <p v-if="entry.title" class="mt-0.5 text-xs text-gray-600">
                                {{ entry.title }}
                            </p>
                            <ul v-if="Array.isArray(entry.changes) && entry.changes.length" class="mt-1 space-y-0.5">
                                <li v-for="(change, i) in entry.changes" :key="i" class="text-xs text-gray-500">
                                    {{ changeText(change) }}
                                </li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <div class="mt-5 flex justify-end">
                    <FormButton buttonStyle="cancel" @click="closeModal">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { dutyScheduleService } from "@/components/api/user/DutyScheduleService"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    scheduleUuid: {
        type: String,
        required: false,
        default: "",
    },
})

const emit = defineEmits(["close"])
const { t, locale } = useI18n()

const state = reactive<{ isLoading: boolean; history: any[] }>({
    isLoading: false,
    history: [],
})

watch(() => props.isModalOpen, async (open) => {
    if (open && props.scheduleUuid) {
        await fetchHistory()
    }
})

async function fetchHistory() {
    state.isLoading = true
    try {
        const response = await dutyScheduleService.getDutyScheduleHistory(props.scheduleUuid)
        state.history = response?.data ?? response ?? []
    } catch (error) {
        state.history = []
    }
    state.isLoading = false
}

function actionLabel(action: string) {
    const key = `dutySchedules.history.actions.${action}`
    const label = t(key)
    return label === key ? action : label
}

function dotClass(action: string) {
    const map: Record<string, string> = {
        created: "bg-green-500",
        published: "bg-primary",
        updated: "bg-amber-500",
        deleted: "bg-red-500",
    }
    return map[action] ?? "bg-gray-400"
}

function causerName(causer: any) {
    if (!causer) return t("dutySchedules.history.system")
    return [causer.firstname, causer.lastname].filter(Boolean).join(" ") || t("dutySchedules.history.system")
}

function changeText(change: any) {
    if (typeof change === "string") return change
    const field = change?.label ?? change?.field ?? ""
    const from = change?.old ?? change?.from
    const to = change?.new ?? change?.to
    if (from !== undefined || to !== undefined) {
        return `${field}: ${from ?? "-"} -> ${to ?? "-"}`
    }
    return field
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
