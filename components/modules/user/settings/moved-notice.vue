<template>
    <Modal :show="isOpen" size="xs" :title="$t('settings.movedNotice.title')" titleIcon="ph:broom"
        @close="close">
        <template #modal-body>
            <p class="text-sm text-gray-600">{{ $t('settings.movedNotice.body') }}</p>
            <ul class="mt-3 space-y-1.5 text-sm text-gray-600">
                <li v-for="point in points" :key="point" class="flex gap-2">
                    <Icon name="ph:check" class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{{ point }}</span>
                </li>
            </ul>
            <div class="mt-6 flex justify-end">
                <FormButton buttonStyle="primary" @click="close">
                    {{ $t('settings.movedNotice.button') }}
                </FormButton>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

/**
 * Said once, the first time someone opens settings after the rebuild: the menu
 * moved, here is where things went, sorry for the mess.
 *
 * It is keyed by a version rather than a flag, so the next reorganisation can
 * say its own piece without everyone who dismissed this one being skipped.
 */
const { t } = useI18n()

const SEEN_KEY = 'co_settings_moved_notice'
const VERSION = '2026-09-rail'

const isOpen = ref(false)

const points = computed(() => [
    t('settings.movedNotice.points.rail'),
    t('settings.movedNotice.points.search'),
    t('settings.movedNotice.points.billing'),
])

onMounted(() => {
    try {
        isOpen.value = localStorage.getItem(SEEN_KEY) !== VERSION
    } catch {
        // A browser that refuses storage is shown the note and nothing breaks.
        isOpen.value = true
    }
})

function close() {
    isOpen.value = false
    try {
        localStorage.setItem(SEEN_KEY, VERSION)
    } catch {
        // Nothing to remember it with: it shows again next time, which is harmless.
    }
}
</script>
