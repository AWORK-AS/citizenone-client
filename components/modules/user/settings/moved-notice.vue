<template>
    <TransitionRoot as="template" :show="isOpen">
        <Dialog as="div" class="relative z-50" @close="close">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <TransitionChild as="template" enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-2 scale-95" enter-to="opacity-100 translate-y-0 scale-100"
                        leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 scale-100"
                        leave-to="opacity-0 translate-y-0 scale-95">
                        <DialogPanel
                            class="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white text-left shadow-modal ring-1 ring-black/5">
                            <!-- The brand band carries the apology; the white below carries the
                                 three facts someone needs to find their way again. -->
                            <div class="relative bg-gradient-to-br from-primary via-tertiary to-secondary px-7 pb-6 pt-7">
                                <div class="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-white/10"
                                    aria-hidden="true" />
                                <div class="pointer-events-none absolute -bottom-16 right-10 size-28 rounded-full bg-white/5"
                                    aria-hidden="true" />
                                <button type="button" @click="close" :aria-label="$t('close')"
                                    class="absolute right-4 top-4 rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                                    <Icon name="heroicons:x-mark" class="size-5" aria-hidden="true" />
                                </button>
                                <div class="relative flex size-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                                    <Icon name="ph:broom" class="size-6 text-white" aria-hidden="true" />
                                </div>
                                <DialogTitle as="h2" class="relative mt-4 text-xl font-semibold tracking-tight text-white">
                                    {{ $t('settings.movedNotice.title') }}
                                </DialogTitle>
                                <p class="relative mt-1.5 text-sm leading-6 text-white/80">
                                    {{ $t('settings.movedNotice.body') }}
                                </p>
                            </div>

                            <div class="px-7 py-6">
                                <ul class="space-y-4">
                                    <li v-for="point in points" :key="point.key" class="flex gap-3.5">
                                        <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-25 text-primary">
                                            <Icon :name="point.icon" class="size-5" aria-hidden="true" />
                                        </div>
                                        <p class="pt-1.5 text-sm leading-6 text-slate-600">{{ point.text }}</p>
                                    </li>
                                </ul>

                                <div class="mt-7 flex justify-end border-t border-surface-200 pt-5">
                                    <FormButton buttonStyle="primary" @click="close">
                                        {{ $t('settings.movedNotice.button') }}
                                    </FormButton>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
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
    { key: 'rail', icon: 'ph:list-dashes', text: t('settings.movedNotice.points.rail') },
    { key: 'search', icon: 'ph:magnifying-glass', text: t('settings.movedNotice.points.search') },
    { key: 'billing', icon: 'ph:receipt', text: t('settings.movedNotice.points.billing') },
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
