<template>
    <div class="flex justify-between gap-x-2 mt-8">
        <div>
            <button type="button"
                class="flex items-center justify-center gap-x-3 text-sm outline-none rounded-md px-6 py-3"
                :class="!isPreviousPageButtonEnabled() ? 'bg-gray-100 text-gray-800 cursor-not-allowed' : 'bg-primary-800 text-white hover:bg-primary-600'"
                @click="isPreviousPageButtonEnabled() && previousPage()"
                v-if="props.data && props.data.links && props.data.links.prev !== null">
                <ArrowLeftIcon class="h-4 w-4 grow" aria-hidden="true" />
                <span class="grow">Previous</span>
            </button>
        </div>
        <div>
            <button type="button"
                class="flex items-center justify-center gap-x-3 text-sm outline-none rounded-md px-10 py-3"
                :class="!isNextPageButtonEnabled() ? 'bg-gray-100 text-gray-800 cursor-not-allowed' : 'bg-primary-800 text-white hover:bg-primary-600'"
                @click="isNextPageButtonEnabled() && nextPage()"
                v-if="props.data && props.data.links && props.data.links.next !== null">
                <span class="grow">Next</span>
                <ArrowRightIcon class="h-4 w-4 grow" aria-hidden="true" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ArrowLeftIcon,
    ArrowRightIcon,
} from '@heroicons/vue/outline'

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['previousPage', 'nextPage'])

function isPreviousPageButtonEnabled() {
    return props.data && props.data.links !== undefined && props.data.links && props.data.links.prev !== null
}

function isNextPageButtonEnabled() {
    return props.data && props.data.links !== undefined && props.data.links && props.data.links.next !== null
}

function previousPage() {
    emit('previousPage')
}

function nextPage() {
    emit('nextPage')
}
</script>