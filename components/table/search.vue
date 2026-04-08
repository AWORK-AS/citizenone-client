<template>
    <form class="flex" @submit.prevent="handleSearch">
        <div class="grow relative">
            <span class="flex items-center gap-x-1 text-gray-800 absolute left-3 top-3">
                <Icon name="ic:search" class="text-primary w-6 h-6" />
            </span>
            <input type="text" :id="props.id" :name="props.name" :autocomplete="props.name"
                class="appearance-none block w-full pl-10 h-12 border border-primary placeholder-gray-500 text-gray-900 rounded-tl-md rounded-bl-md focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm"
                :placeholder="$t('search')" v-model="state.search" />
        </div>
        <button type="submit"
            class="bg-primary px-6 py-1.5 border border-primary text-white hover:bg-primary-800 hover:border-primary-800 right-0.5 top-0.5 rounded-tr-md rounded-br-md text-xs">
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
})

const emit = defineEmits(['search'])

const state = reactive({
    search: '',
})

function handleSearch() {
    const searchArray = state.search.trim().split(/\s+/) // Split by whitespace
    emit('search', Array(searchArray))
}
</script>