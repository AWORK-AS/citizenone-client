<template>
    <div>
        <Modal size="sm" :title="$t('events.subscribe.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-5">
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />

                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-1.5">
                                {{ $t('events.subscribe.yourCalendarUrl') }}
                            </p>
                            <div class="flex items-center gap-2">
                                <input ref="urlInputRef" type="text" readonly :value="state.icalUrl"
                                    class="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:outline-none select-all truncate"
                                    @click="selectAll" />
                                <button type="button"
                                    class="shrink-0 flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-700 transition-colors"
                                    @click="copyUrl">
                                    <Icon :name="state.copied ? 'ph:check' : 'ph:copy'" class="size-3.5" />
                                    {{
                                        state.copied ?
                                            $t('events.subscribe.copied') :
                                            $t('events.subscribe.copy')
                                    }}
                                </button>
                            </div>
                        </div>

                        <div class="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <Icon name="ph:warning" class="mt-0.5 size-4 shrink-0 text-amber-500" />
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-amber-800 leading-relaxed">
                                    {{ $t('events.subscribe.regenerateWarning') }}
                                </p>
                            </div>
                            <button type="button"
                                class="shrink-0 flex items-center gap-1.5 rounded-md border border-amber-400 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                                :disabled="state.isRefreshing" @click="regenerateToken">
                                <Icon name="ph:arrows-clockwise" class="size-3.5"
                                    :class="state.isRefreshing && 'animate-spin'" />
                                {{ $t('events.subscribe.regenerate') }}
                            </button>
                        </div>

                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-3">
                                {{ $t('events.subscribe.howToSubscribe') }}
                            </p>
                            <div class="space-y-3">
                                <div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div class="flex items-center gap-2 mb-1.5">
                                        <Icon name="logos:google-calendar" class="size-4" />
                                        <span class="text-xs font-semibold text-gray-800">Google Calendar</span>
                                    </div>
                                    <p class="text-xs text-gray-600 leading-relaxed">
                                        {{ $t('events.subscribe.instructions.google') }}.
                                    </p>
                                </div>

                                <div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div class="flex items-center gap-2 mb-1.5">
                                        <Icon name="mdi:microsoft-outlook" class="size-4 text-[#0078D4]" />
                                        <span class="text-xs font-semibold text-gray-800">Outlook</span>
                                    </div>
                                    <p class="text-xs text-gray-600 leading-relaxed">
                                        {{ $t('events.subscribe.instructions.outlook') }}.
                                    </p>
                                </div>

                                <div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div class="flex items-center gap-2 mb-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"
                                            class="size-4 shrink-0">
                                            <rect width="16" height="16" rx="3.5" fill="#fff" stroke="#e5e7eb" />
                                            <rect width="16" height="5" rx="0" fill="#FF3B30" />
                                            <rect width="16" height="5" rx="3.5" fill="#FF3B30" />
                                            <rect y="2" width="16" height="3" fill="#FF3B30" />
                                            <text x="8" y="13.5" text-anchor="middle" font-family="system-ui,sans-serif"
                                                font-size="7" font-weight="700" fill="#1d1d1f">31</text>
                                            <text x="8" y="4.8" text-anchor="middle" font-family="system-ui,sans-serif"
                                                font-size="3.5" font-weight="600" fill="#fff"
                                                letter-spacing="0.2">SUN</text>
                                        </svg>
                                        <span class="text-xs font-semibold text-gray-800">Apple Calendar</span>
                                    </div>
                                    <p class="text-xs text-gray-600 leading-relaxed">
                                        {{ $t('events.subscribe.instructions.apple') }}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { useRuntimeConfig } from '#app'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    dutySchedule: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['close'])

const urlInputRef = ref<HTMLInputElement | null>(null)

const state = reactive({
    isPageLoading: false,
    isRefreshing: false,
    copied: false,
    icalUrl: '',
    error: {} as Error,
})

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        fetchToken()
    } else {
        state.icalUrl = ''
        state.error = {}
        state.copied = false
    }
})

function closeModal() {
    emit('close')
}

async function fetchToken() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = props.dutySchedule
            ? await myCalendarService.getDutyScheduleIcalUrl()
            : await myCalendarService.getIcalToken()
        if (response?.url) {
            state.icalUrl = response?.url
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function regenerateToken() {
    state.error = {}
    state.isRefreshing = true
    try {
        const response = await myCalendarService.refreshIcalToken()
        if (props.dutySchedule) {
            // The refresh endpoint returns the calendar URL; re-fetch the
            // duty-schedule URL so the displayed path is correct.
            const dutyResponse = await myCalendarService.getDutyScheduleIcalUrl()
            if (dutyResponse?.url) {
                state.icalUrl = dutyResponse?.url
            }
        } else if (response?.url) {
            state.icalUrl = response?.url
        }
        state.copied = false
    } catch (error: any) {
        state.error = error
    }
    state.isRefreshing = false
}

function selectAll() {
    urlInputRef.value?.select()
}

async function copyUrl() {
    if (!state.icalUrl) return
    try {
        await navigator.clipboard.writeText(state.icalUrl)
        state.copied = true
        setTimeout(() => { state.copied = false }, 2000)
    } catch {
        // Fallback for older browsers
        urlInputRef.value?.select()
        document.execCommand('copy')
        state.copied = true
        setTimeout(() => { state.copied = false }, 2000)
    }
}
</script>
