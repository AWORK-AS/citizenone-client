<template>
    <div v-if="hint && !isDismissed"
        class="mb-5 flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-25 p-4">
        <Icon name="ph:lightbulb" class="size-5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
        <div class="min-w-0 flex-1 text-sm text-gray-600">
            <p class="font-semibold text-gray-800">{{ $t(hint.titleKey) }}</p>
            <p>{{ $t(hint.bodyKey) }}</p>
        </div>
        <button type="button" class="shrink-0 rounded-md p-1 text-gray-400 hover:bg-white/60 hover:text-gray-600 transition-colors"
            :aria-label="$t('close')" :title="$t('close')" @click="dismiss">
            <Icon name="ph:x" class="size-4" aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
/**
 * The one-paragraph answer to "what is this page for", above the page itself.
 *
 * It is dismissible and stays dismissed, per page and per browser: the answer is
 * worth having the first time you open a setting you have never used, and worth
 * nothing the fiftieth time. Which is also why it is a note rather than a panel
 * - it explains, it never holds a control.
 */
const route = useRoute()
const { hintForRoute } = useSettingsHints()

const hint = computed(() => hintForRoute(route.name as string))

const DISMISSED_KEY = 'co_settings_hints_dismissed'
const dismissed = ref<string[]>([])

onMounted(() => {
    try {
        const stored = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')
        if (Array.isArray(stored)) dismissed.value = stored.filter((key) => typeof key === 'string')
    } catch {
        dismissed.value = []
    }
})

const isDismissed = computed(() => !!hint.value && dismissed.value.includes(hint.value.key))

function dismiss() {
    if (!hint.value) return
    dismissed.value = [...dismissed.value, hint.value.key]
    try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed.value))
    } catch {
        // A browser that refuses storage simply shows the note again next time.
    }
}
</script>
