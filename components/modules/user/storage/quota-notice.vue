<template>
    <div v-if="isVisible" class="mb-4 rounded-lg border px-4 py-3 flex items-start gap-3" :class="toneClass">
        <Icon :name="state.status?.level === 'full' ? 'ph:warning-circle' : 'ph:warning'"
            class="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />

        <div class="min-w-0 flex-1">
            <p class="text-sm font-medium">
                {{ state.status?.level === 'full' ? $t('storage.notice.fullTitle') : $t('storage.notice.warningTitle') }}
            </p>
            <p class="text-sm mt-0.5 opacity-90">
                {{ $t(state.status?.level === 'full' ? 'storage.notice.fullBody' : 'storage.notice.warningBody',
                    { percent: Math.round(state.status?.percent ?? 0), quota: quotaLabel }) }}
            </p>

            <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <button v-if="state.status?.can_upgrade" class="text-sm font-semibold underline underline-offset-2"
                    @click="navigateTo('/storage/upgrade')">
                    {{ $t('storage.upgrade') }}
                </button>
                <button class="text-sm underline underline-offset-2 opacity-90"
                    @click="navigateTo('/settings/storage')">
                    {{ $t('storage.notice.seeDetails') }}
                </button>
            </div>
        </div>

        <button class="shrink-0 opacity-60 hover:opacity-100 transition-opacity" :aria-label="$t('close')"
            @click="dismiss">
            <Icon name="ph:x" class="h-4 w-4" aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { storageService } from '@/components/api/user/StorageService'

const DISMISSED_KEY = 'storage-quota-notice-dismissed'

const state = reactive({
    status: null as any,
    dismissedLevel: '' as string,
})

// Dismissal is remembered per level, so hiding the 80% notice does not also
// hide the "storage is full" one when it later escalates.
const isVisible = computed(() =>
    ['warning', 'full'].includes(state.status?.level)
    && state.dismissedLevel !== state.status?.level
)

const toneClass = computed(() =>
    state.status?.level === 'full'
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-amber-50 border-amber-200 text-amber-900'
)

const quotaLabel = computed(() =>
    Number(state.status?.quota_gb ?? 0).toLocaleString('da-DK', { maximumFractionDigits: 2 })
)

function dismiss() {
    state.dismissedLevel = state.status?.level ?? ''
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DISMISSED_KEY, state.dismissedLevel)
    }
}

onMounted(async () => {
    if (typeof localStorage !== 'undefined') {
        state.dismissedLevel = localStorage.getItem(DISMISSED_KEY) ?? ''
    }

    try {
        const response = await storageService.getQuotaStatus()
        if (response) state.status = response

        // Back below the threshold: clear the remembered dismissal so the next
        // time they fill up, the notice shows again.
        if (state.status?.level === 'ok' && typeof localStorage !== 'undefined') {
            localStorage.removeItem(DISMISSED_KEY)
        }
    } catch (_) {
        // A missing quota reading must never block the page.
    }
})
</script>
