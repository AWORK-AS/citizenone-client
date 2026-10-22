<template>
    <div v-if="isVisible" class="mb-6 flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-25 p-4">
        <Icon name="ph:envelope-simple" class="size-5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
        <div class="min-w-0 flex-1 text-sm text-gray-600">
            <p class="font-semibold text-gray-800">{{ $t('invoiceMail.noticeTitle') }}</p>
            <p>{{ $t('invoiceMail.noticeBody') }}</p>
        </div>
        <button type="button" class="shrink-0 rounded-md p-1 text-gray-400 hover:bg-white/60 hover:text-gray-600 transition-colors"
            :aria-label="$t('close')" :title="$t('close')" @click="dismiss">
            <Icon name="ph:x" class="size-4" aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
/**
 * One-time note that automatic charges no longer send an invoice mail. Shown
 * until dismissed, per browser, like the other settings notes.
 */
const DISMISSED_KEY = 'co_invoice_mail_notice_dismissed'

const isVisible = ref(false)

onMounted(() => {
    try {
        isVisible.value = localStorage.getItem(DISMISSED_KEY) !== '1'
    } catch {
        isVisible.value = true
    }
})

function dismiss() {
    isVisible.value = false
    try {
        localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
        // A browser that refuses storage simply shows the note again next time.
    }
}
</script>
