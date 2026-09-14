<template>
    <div class="relative space-y-1">
        <div class="relative">
            <input :id="props.id" ref="inputRef" type="text" :name="props.name" :disabled="props.disabled"
                autocomplete="off" role="combobox" aria-autocomplete="list" :aria-expanded="isOpen"
                :aria-controls="listboxId" :aria-activedescendant="activeIndex >= 0 ? optionId(activeIndex) : undefined"
                :aria-describedby="descriptionId"
                class="appearance-none block w-full pl-4 pr-10 h-11 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm"
                :class="props.error && 'border-red-300'" :placeholder="props.placeholder || $t('mileageLog.form.address.placeholder')"
                :value="props.modelValue" @input="onInput" @focus="onFocus" @keydown.down.prevent="move(1)"
                @keydown.up.prevent="move(-1)" @keydown.home.prevent="moveTo(0)"
                @keydown.end.prevent="moveTo(suggestions.length - 1)" @keydown.enter.prevent="onEnter"
                @keydown.esc="onEscape" @keydown.tab="isOpen = false" />

            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <Icon v-if="props.busy || isSearching" name="ph:spinner-gap" class="w-4 h-4 text-tertiary animate-spin" />
                <button v-else-if="props.modelValue" type="button" class="text-gray-300 hover:text-gray-500"
                    :title="$t('mileageLog.form.address.clear')" @click="onClearClick">
                    <Icon name="ph:x-circle" class="w-4 h-4" />
                </button>
            </div>
        </div>

        <ul v-if="isOpen && suggestions.length > 0" :id="listboxId" role="listbox"
            class="relative z-30 mt-1 w-full border border-gray-200 rounded-lg shadow-sm bg-white max-h-60 overflow-y-auto">
            <li v-for="(s, i) in suggestions" :key="s.id" :id="optionId(i)" role="option"
                :aria-selected="i === activeIndex" class="px-4 py-2 text-sm cursor-pointer"
                :class="i === activeIndex ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'"
                @mousemove="activeIndex = i" @mousedown.prevent="selectSuggestion(s)">
                <p class="font-medium">{{ s.primary }}</p>
                <p class="text-xs text-tertiary">{{ s.secondary }}</p>
            </li>
        </ul>

        <p v-if="isOpen && !isSearching && searchError" class="text-xs text-red-500">{{ searchError }}</p>
        <p v-else-if="isOpen && !isSearching && searchedOnce && suggestions.length === 0 && props.modelValue.trim().length >= props.minChars"
            class="text-xs text-tertiary">
            {{ $t('mileageLog.form.address.noResults') }}
        </p>

        <div v-if="props.showConfirmation && props.coords" class="flex items-center gap-x-1.5">
            <Icon name="ph:check-circle" class="w-4 h-4 text-green-600 shrink-0" />
            <p class="text-xs text-green-700">
                {{ $t('mileageLog.form.address.confirmed') }}
                <span class="font-mono text-gray-400">
                    ({{ props.coords.lat.toFixed(5) }}, {{ props.coords.lng.toFixed(5) }})
                </span>
            </p>
        </div>
        <div v-else-if="props.modelValue && !props.coords" class="flex items-center gap-x-1.5">
            <Icon name="ph:warning-circle" class="w-4 h-4 text-amber-500 shrink-0" />
            <p class="text-xs text-amber-600">{{ $t('mileageLog.form.address.notConfirmed') }}</p>
        </div>

        <span :id="descriptionId" role="status" aria-live="polite" class="sr-only">{{ liveAnnouncement }}</span>

        <div v-if="$slots.actions" class="flex gap-x-3 items-center">
            <slot name="actions" />
        </div>

        <FormError :error="props.error" />
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAddressSearch, type AddressSuggestion, type ResolvedAddressSuggestion } from '@/composables/addressSearch'

let idCounter = 0
function uniqueId(prefix: string) {
    idCounter += 1
    return `${prefix}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`
}

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    coords: {
        type: Object as PropType<{ lat: number; lng: number } | null>,
        default: null,
    },
    id: {
        type: String,
        default: undefined,
    },
    name: {
        type: String,
        required: true,
    },
    placeholder: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    minChars: {
        type: Number,
        default: 2,
    },
    limit: {
        type: Number,
        default: 8,
    },
    showConfirmation: {
        type: Boolean,
        default: true,
    },
    busy: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: undefined,
    },
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'select', suggestion: ResolvedAddressSuggestion): void
    (e: 'clear'): void
}>()

const { t } = useI18n()
const { suggestions, isSearching, searchError, searchDebounced, resolveSuggestion, clear: clearSearch } = useAddressSearch(t)

const inputRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const activeIndex = ref(-1)
const searchedOnce = ref(false)
const listboxId = uniqueId('address-listbox')
const descriptionId = uniqueId('address-desc')

function optionId(index: number) {
    return `${listboxId}-option-${index}`
}

// Tracks the label that was last explicitly confirmed (via selection, "use my
// location", or a map pick), so a subsequent edit can tell the parent to null
// the coords rather than silently keeping stale ones.
const lastConfirmedLabel = ref<string | null>(props.coords ? props.modelValue : null)
watch(() => props.coords, (c) => {
    if (c) lastConfirmedLabel.value = props.modelValue
})

const liveAnnouncement = computed(() => {
    if (isSearching.value) return t('mileageLog.form.address.searching')
    if (!searchedOnce.value) return ''
    if (suggestions.value.length === 0) return t('mileageLog.form.address.noResults')
    return t('mileageLog.form.address.resultsAvailable', { count: suggestions.value.length })
})

function onFocus() {
    if (suggestions.value.length > 0) isOpen.value = true
}

function onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    emit('update:modelValue', value)
    activeIndex.value = -1
    isOpen.value = true

    if (lastConfirmedLabel.value !== null && value !== lastConfirmedLabel.value) {
        lastConfirmedLabel.value = null
        emit('clear')
    }

    if (value.trim().length < props.minChars) {
        searchedOnce.value = false
        clearSearch()
        return
    }

    searchedOnce.value = true
    searchDebounced(value, { limit: props.limit })
}

function onClearClick() {
    emit('update:modelValue', '')
    lastConfirmedLabel.value = null
    emit('clear')
    clearSearch()
    isOpen.value = false
    searchedOnce.value = false
    inputRef.value?.focus()
}

function move(direction: 1 | -1) {
    if (!isOpen.value || suggestions.value.length === 0) return
    const len = suggestions.value.length
    activeIndex.value = (activeIndex.value + direction + len) % len
    scrollActiveIntoView()
}

function moveTo(index: number) {
    if (!isOpen.value || suggestions.value.length === 0) return
    activeIndex.value = Math.max(0, Math.min(index, suggestions.value.length - 1))
    scrollActiveIntoView()
}

function scrollActiveIntoView() {
    nextTick(() => {
        document.getElementById(optionId(activeIndex.value))?.scrollIntoView({ block: 'nearest' })
    })
}

function onEnter() {
    if (isOpen.value && activeIndex.value >= 0 && suggestions.value[activeIndex.value]) {
        selectSuggestion(suggestions.value[activeIndex.value])
    }
}

function onEscape(event: KeyboardEvent) {
    if (isOpen.value) {
        // Critical: stop propagation so this only closes the dropdown, not
        // the enclosing map-pick Modal (headlessui's Dialog listens for the
        // same Escape key and would otherwise close on this same keypress).
        event.stopPropagation()
        event.preventDefault()
        isOpen.value = false
        return
    }
    // Dropdown already closed — let Escape bubble to close the modal.
}

async function selectSuggestion(suggestion: AddressSuggestion) {
    isOpen.value = false
    const resolved = await resolveSuggestion(suggestion)
    if (!resolved) {
        searchError.value = t('mileageLog.form.address.resolveFailed')
        return
    }
    lastConfirmedLabel.value = resolved.label
    emit('update:modelValue', resolved.label)
    emit('select', resolved)
}

defineSlots<{
    actions?: () => any
}>()
</script>
