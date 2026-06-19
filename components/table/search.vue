<template>
    <form class="flex" @submit.prevent="handleSearch">
        <div class="grow relative">
            <span :class="[
                props.type === 'duty-schedule' ? 'top-2' : 'top-3',
                'flex items-center gap-x-1 text-gray-800 absolute left-3'
            ]">
                <Icon name="ic:search" class="text-primary w-6 h-6" />
            </span>
            <input type="text" :id="props.id" :name="props.name" :autocomplete="props.name"
                class="appearance-none block w-full pl-10 h-12 border border-surface-200 placeholder-gray-400 text-gray-900 rounded-l-lg transition-all duration-200 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:z-10 sm:text-sm"
                :placeholder="props.placeholder ?? $t('search')" v-model="state.search" />
        </div>
        <button type="submit"
            class="bg-primary h-12 px-6 border border-primary text-white transition-all duration-200 hover:bg-primary-800 hover:border-primary-800 active:scale-[0.98] rounded-l-none rounded-r-lg text-sm font-medium">
            {{ $t('search') }}
        </button>
    </form>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: false,
        default: 'search'
    },
    placeholder: {
        type: String,
        required: false,
    },
    type: {
        type: String,
        required: false,
    },
})

const emit = defineEmits(['search'])

const state = reactive({
    search: '',
})

function handleSearch() {
    const searchArray = state.search.trim().split(/\s+/) // Split by whitespace
    emit('search', Array(searchArray))
}

// Live search: emit while typing (debounced) so results update without
// clicking the button. Same payload shape, so existing consumers are unaffected.
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(() => state.search, () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => handleSearch(), 350)
})
onBeforeUnmount(() => { if (debounceTimer) clearTimeout(debounceTimer) })
</script>