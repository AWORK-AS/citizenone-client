<template>
    <!-- Which columns a table shows, and in what order. Shown columns come first,
         in their order; the rest follow, ready to be ticked. Order changes by
         dragging or with the arrow buttons, which also work from the keyboard. -->
    <ul class="space-y-1" role="list">
        <li v-for="(column, index) in ordered" :key="column.key"
            class="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-slate-700"
            :class="[
                dragKey === column.key ? 'opacity-40' : '',
                overKey === column.key && dragKey !== column.key ? 'bg-primary/5 ring-1 ring-primary/30' : 'hover:bg-slate-50',
            ]"
            :draggable="isShown(column.key)"
            @dragstart="onDragStart(column.key)" @dragend="onDragEnd"
            @dragover.prevent="isShown(column.key) && (overKey = column.key)"
            @drop.prevent="onDrop(column.key)">
            <Icon name="ph:dots-six-vertical" class="size-4 shrink-0"
                :class="isShown(column.key) ? 'cursor-grab text-slate-400' : 'text-slate-200'" aria-hidden="true" />
            <label class="flex flex-1 cursor-pointer items-center gap-2.5">
                <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                    :checked="isShown(column.key)" @change="toggle(column.key)" />
                {{ $t(column.label) }}
            </label>
            <template v-if="isShown(column.key)">
                <button type="button" class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                    :disabled="index === 0" :aria-label="$t('tableColumns.moveUp', { column: $t(column.label) })"
                    @click="move(column.key, -1)">
                    <Icon name="ph:arrow-up" class="size-3.5" aria-hidden="true" />
                </button>
                <button type="button" class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                    :disabled="index === props.modelValue.length - 1"
                    :aria-label="$t('tableColumns.moveDown', { column: $t(column.label) })"
                    @click="move(column.key, 1)">
                    <Icon name="ph:arrow-down" class="size-3.5" aria-hidden="true" />
                </button>
            </template>
        </li>
    </ul>
</template>

<script setup lang="ts">
type Column = { key: string, label: string }

const props = defineProps({
    // Every column that can be shown, with its label key.
    columns: {
        type: Array as () => Column[],
        required: true,
    },
    // The shown columns, in the order they are shown.
    modelValue: {
        type: Array as () => string[],
        required: true,
    },
})

const emit = defineEmits(['update:modelValue'])

const dragKey = ref<string | null>(null)
const overKey = ref<string | null>(null)

const known = computed(() => new Set(props.columns.map((c) => c.key)))

const ordered = computed<Column[]>(() => {
    const byKey = new Map(props.columns.map((c) => [c.key, c]))
    const shown = props.modelValue.filter((key) => byKey.has(key)).map((key) => byKey.get(key) as Column)
    const rest = props.columns.filter((c) => !props.modelValue.includes(c.key))
    return [...shown, ...rest]
})

function isShown(key: string): boolean {
    return props.modelValue.includes(key)
}

function current(): string[] {
    return props.modelValue.filter((key) => known.value.has(key))
}

function toggle(key: string) {
    const list = current()
    emit('update:modelValue', isShown(key) ? list.filter((k) => k !== key) : [...list, key])
}

function move(key: string, step: number) {
    const list = current()
    const from = list.indexOf(key)
    const to = from + step
    if (from < 0 || to < 0 || to >= list.length) return
    list.splice(to, 0, list.splice(from, 1)[0])
    emit('update:modelValue', list)
}

function onDragStart(key: string) {
    dragKey.value = key
}

function onDragEnd() {
    dragKey.value = null
    overKey.value = null
}

function onDrop(targetKey: string) {
    const key = dragKey.value
    onDragEnd()
    if (!key || key === targetKey || !isShown(targetKey)) return
    const list = current()
    const from = list.indexOf(key)
    const to = list.indexOf(targetKey)
    list.splice(to, 0, list.splice(from, 1)[0])
    emit('update:modelValue', list)
}
</script>
