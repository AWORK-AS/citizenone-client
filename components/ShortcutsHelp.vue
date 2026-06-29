<template>
    <Teleport to="body">
        <transition enter-active-class="transition ease-out duration-150"
            enter-from-class="opacity-0" enter-to-class="opacity-100"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isHelpOpen" class="fixed inset-0 z-[100] flex items-center justify-center px-4"
                @click.self="closeHelp">
                <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="closeHelp"></div>
                <div class="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                    <div class="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
                        <h2 class="text-sm font-semibold text-gray-800">{{ $t('shortcuts.title') }}</h2>
                        <button type="button" class="text-gray-400 hover:text-gray-600" @click="closeHelp">
                            <Icon name="ph:x" class="size-4" />
                        </button>
                    </div>
                    <div class="space-y-4 px-5 py-4">
                        <div>
                            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('shortcuts.general') }}
                            </p>
                            <ul class="space-y-2">
                                <li class="flex items-center justify-between text-sm text-gray-700">
                                    <span>{{ $t('shortcuts.palette') }}</span>
                                    <kbd :class="kbdClass">⌘K</kbd>
                                </li>
                                <li class="flex items-center justify-between text-sm text-gray-700">
                                    <span>{{ $t('shortcuts.help') }}</span>
                                    <kbd :class="kbdClass">?</kbd>
                                </li>
                                <li class="flex items-center justify-between text-sm text-gray-700">
                                    <span>{{ $t('shortcuts.close') }}</span>
                                    <kbd :class="kbdClass">esc</kbd>
                                </li>
                            </ul>
                        </div>
                        <div v-if="pageShortcuts.length">
                            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('shortcuts.onThisPage') }}
                            </p>
                            <ul class="space-y-2">
                                <li v-for="s in pageShortcuts" :key="s.keys"
                                    class="flex items-center justify-between text-sm text-gray-700">
                                    <span>{{ s.label }}</span>
                                    <kbd :class="kbdClass">{{ s.keys }}</kbd>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup lang="ts">
const { isHelpOpen, pageShortcuts, closeHelp, toggleHelp } = useCommandPalette()

const kbdClass = 'rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500'

function onKeydown(e: KeyboardEvent) {
    const el = e.target as HTMLElement
    const tag = (el?.tagName || '').toLowerCase()
    if (tag === 'input' || tag === 'textarea' || el?.isContentEditable) return
    if (e.key === '?') {
        e.preventDefault()
        toggleHelp()
    } else if (e.key === 'Escape' && isHelpOpen.value) {
        closeHelp()
    }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>
