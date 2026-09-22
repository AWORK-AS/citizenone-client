<template>
    <div class="relative">
        <div class="relative">
            <input :id="props.id" ref="inputRef" type="text" :name="props.name" :disabled="props.disabled"
                autocomplete="off" role="combobox" aria-autocomplete="list" :aria-expanded="isOpen"
                :aria-controls="listboxId" :aria-activedescendant="activeIndex >= 0 ? optionId(activeIndex) : undefined"
                class="appearance-none block w-full pl-4 pr-10 h-11 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm"
                :placeholder="props.placeholder" :value="props.modelValue" @input="onInput" @focus="open"
                @click="open" @blur="onBlur" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)"
                @keydown.home.prevent="moveTo(0)" @keydown.end.prevent="moveTo(visibleOptions.length - 1)"
                @keydown.enter="onEnter" @keydown.esc="onEscape" @keydown.tab="isOpen = false" />

            <button type="button" tabindex="-1" :disabled="props.disabled"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                :aria-label="props.toggleLabel" @mousedown.prevent="toggle">
                <Icon :name="isOpen ? 'ph:caret-up' : 'ph:caret-down'" class="w-4 h-4" />
            </button>
        </div>

        <ul v-if="isOpen && visibleOptions.length > 0" :id="listboxId" role="listbox"
            class="absolute z-30 mt-1 w-full border border-gray-200 rounded-lg shadow-sm bg-white max-h-60 overflow-y-auto">
            <li v-for="(option, i) in visibleOptions" :key="option.value" :id="optionId(i)" role="option"
                :aria-selected="option.value === props.modelValue" class="px-4 py-2 text-sm cursor-pointer"
                :class="i === activeIndex ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'"
                @mousemove="activeIndex = i" @mousedown.prevent="select(option)">
                {{ option.label }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
/**
 * A text field that offers a list of suggestions the moment it is focused,
 * while still accepting anything typed into it. Unlike FormSelect, picking
 * from the list is an offer, not a requirement, so a field does not need a
 * separate "use a predefined value" mode to be both.
 */
interface ComboOption {
    value: string
    label: string
}

let idCounter = 0
function uniqueId(prefix: string) {
    idCounter += 1
    return `${prefix}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`
}

const props = defineProps({
    id: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        required: true,
    },
    modelValue: {
        type: String,
        default: '',
    },
    /** { value, label } pairs, the same shape FormSelect takes. */
    options: {
        type: Array as () => ComboOption[],
        default: () => [],
    },
    placeholder: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    toggleLabel: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['update:modelValue', 'select'])

const inputRef = ref<HTMLInputElement | null>(null)
const listboxId = uniqueId('combo-listbox')
const isOpen = ref(false)
const activeIndex = ref(-1)
// Typing filters the list; opening it from an already chosen value must not,
// or picking a title would leave you looking at that one title alone.
const filterOnValue = ref(false)

const visibleOptions = computed(() => {
    const query = (props.modelValue ?? '').trim().toLowerCase()
    if (!filterOnValue.value || query.length === 0) return props.options

    return props.options.filter(option => option.label.toLowerCase().includes(query))
})

watch(() => props.options, () => {
    activeIndex.value = -1
})

function optionId(index: number) {
    return `${listboxId}-option-${index}`
}

function open() {
    isOpen.value = true
    activeIndex.value = visibleOptions.value.findIndex(option => option.value === props.modelValue)
}

function toggle() {
    if (isOpen.value) {
        isOpen.value = false
        return
    }
    filterOnValue.value = false
    inputRef.value?.focus()
    open()
}

function onInput(event: Event) {
    filterOnValue.value = true
    isOpen.value = true
    activeIndex.value = -1
    emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onBlur() {
    isOpen.value = false
    filterOnValue.value = false
}

function move(direction: number) {
    if (!isOpen.value) {
        open()
        return
    }
    const count = visibleOptions.value.length
    if (count === 0) return
    activeIndex.value = (activeIndex.value + direction + count) % count
}

function moveTo(index: number) {
    if (!isOpen.value || visibleOptions.value.length === 0) return
    activeIndex.value = Math.min(Math.max(index, 0), visibleOptions.value.length - 1)
}

function onEnter(event: KeyboardEvent) {
    // Only the highlighted suggestion is ours to take; otherwise the key
    // belongs to the form, which may well submit on it.
    if (!isOpen.value || activeIndex.value < 0) return
    event.preventDefault()
    select(visibleOptions.value[activeIndex.value])
}

function onEscape() {
    isOpen.value = false
    filterOnValue.value = false
}

function select(option: ComboOption) {
    emit('update:modelValue', option.value)
    emit('select', option)
    isOpen.value = false
    filterOnValue.value = false
}
</script>
