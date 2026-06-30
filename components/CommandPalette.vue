<template>
    <Teleport to="body">
        <transition enter-active-class="transition ease-out duration-150" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
                @click.self="close">
                <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="close"></div>
                <div
                    class="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                    <!-- search -->
                    <div class="flex items-center gap-2 border-b border-gray-100 px-4">
                        <Icon name="ph:magnifying-glass" class="size-5 shrink-0 text-gray-400" />
                        <input ref="inputRef" v-model="query" type="text"
                            :placeholder="$t('commandPalette.placeholder')"
                            class="w-full bg-transparent py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                            @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)"
                            @keydown.enter.prevent="runActive" @keydown.esc.prevent="close" />
                        <kbd
                            class="hidden shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:block">esc</kbd>
                    </div>
                    <!-- results -->
                    <div ref="listRef" class="max-h-80 overflow-y-auto py-2">
                        <template v-for="(group, gi) in filteredGroups" :key="group.key">
                            <p class="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {{ group.label }}
                            </p>
                            <button v-for="cmd in group.items" :key="cmd.id" type="button" :data-idx="cmd._idx" :class="[
                                'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm',
                                cmd._idx === activeIndex ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'
                            ]" @mousemove="activeIndex = cmd._idx" @click="run(cmd)">
                                <Icon v-if="cmd.icon" :name="cmd.icon" class="size-4 shrink-0"
                                    :class="cmd._idx === activeIndex ? 'text-primary' : 'text-gray-400'" />
                                <span class="flex-1 truncate">{{ cmd.label }}</span>
                                <kbd v-if="cmd.hint"
                                    class="shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                                    {{ cmd.hint }}
                                </kbd>
                            </button>
                            <div v-if="gi < filteredGroups.length - 1" class="my-1 border-t border-gray-50"></div>
                        </template>
                        <p v-if="flat.length === 0" class="px-4 py-8 text-center text-sm text-gray-400">
                            {{ $t('commandPalette.empty') }}
                        </p>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup lang="ts">
interface Command {
    id: string
    label: string
    icon?: string
    hint?: string
    group?: string
    run: () => void
}

const props = defineProps<{ commands: Command[] }>()

const { isOpen, close, toggle } = useCommandPalette()

function onKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
    }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

// Reset + focus whenever the palette opens (from ⌘K or the top-bar button).
watch(isOpen, (v) => {
    if (v) {
        query.value = ''
        activeIndex.value = 0
        nextTick(() => inputRef.value?.focus())
    }
})

const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    const list = q
        ? props.commands.filter((c) => c.label.toLowerCase().includes(q))
        : props.commands
    return list
})

// group, and stamp a flat index for keyboard navigation
const filteredGroups = computed(() => {
    const groups: Record<string, { key: string; label: string; items: any[] }> = {}
    let idx = 0
    for (const cmd of filtered.value) {
        const key = cmd.group || 'general'
        if (!groups[key]) groups[key] = { key, label: key, items: [] }
        groups[key].items.push({ ...cmd, _idx: idx++ })
    }
    return Object.values(groups)
})
const flat = computed(() => filteredGroups.value.flatMap((g) => g.items))

watch(query, () => { activeIndex.value = 0 })

function move(delta: number) {
    const n = flat.value.length
    if (!n) return
    activeIndex.value = (activeIndex.value + delta + n) % n
    nextTick(() => {
        listRef.value?.querySelector(`[data-idx="${activeIndex.value}"]`)
            ?.scrollIntoView({ block: 'nearest' })
    })
}
function runActive() {
    const cmd = flat.value[activeIndex.value]
    if (cmd) run(cmd)
}
function run(cmd: Command) {
    close()
    cmd.run()
}

</script>
