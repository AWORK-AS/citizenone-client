<template>
    <div class="mt-8 flex flex-col-reverse md:grid md:grid-cols-3 items-center gap-y-3"
        v-if="props.data && props.data.links">
        <div class="grow flex flex-row gap-x-3">
            <button class="w-28 bg-tertiary text-white rounded-full text-sm px-4 py-3 hover:bg-tertiary/90"
                v-if="props.data.links && props.data.links.prev !== null"
                @click="!(props.data.links && props.data.links.prev === null) && $emit('previous')">
                {{ $t('pagination.previous') }}
            </button>
            <button class="w-28 bg-tertiary text-white rounded-full text-sm px-4 py-3 hover:bg-tertiary/90"
                v-if="props.data.links && props.data.links.next !== null"
                @click="!(props.data.links && props.data.links.next === null) && $emit('next')">
                {{ $t('pagination.next') }}
            </button>
        </div>
        <div class="text-sm flex flex-col items-center justify-center gap-y-2">
            <p v-if="props.data?.meta?.total > 0">
                {{ $t('pagination.showingFrom') }}
                {{ props.data?.meta && props.data?.meta?.from ? props.data?.meta?.from : 0 }}
                {{ $t('pagination.to') }}
                {{ props.data?.meta && props.data?.meta?.to ? props.data?.meta?.to : 0 }}
                {{ $t('pagination.of') }}
                {{ props.data?.meta && props.data?.meta?.total ? props.data?.meta?.total : 0 }}
            </p>
            <!-- Opt in per page. Previous and next is fine for a short list and
                 useless for one that is forty pages long. -->
            <nav v-if="props.showPages && pages.length > 1" class="flex items-center gap-x-1">
                <button v-for="(page, index) in pages" :key="index" type="button" :disabled="page === null"
                    @click="page !== null && page !== currentPage && $emit('page', page)"
                    :aria-current="page === currentPage ? 'page' : undefined"
                    :class="[
                        'min-w-8 rounded-md px-2 py-1 text-sm',
                        page === null ? 'cursor-default text-gray-400' : 'hover:bg-gray-100',
                        page === currentPage ? 'bg-tertiary text-white hover:bg-tertiary' : '',
                    ]">
                    {{ page === null ? '...' : page }}
                </button>
            </nav>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
    data: {
        type: Object,
        default: null,
    },
    showPages: {
        type: Boolean,
        default: false,
    },
})

defineEmits(['previous', 'next', 'page'])

const currentPage = computed<number>(() => props.data?.meta?.current_page ?? 1)
const lastPage = computed<number>(() => props.data?.meta?.last_page ?? 1)

/** First, last, and a window around the current page. null renders as a gap. */
const pages = computed<(number | null)[]>(() => {
    const last = lastPage.value
    if (last <= 7) {
        return Array.from({ length: last }, (_, index) => index + 1)
    }

    const current = currentPage.value
    const window = new Set<number>([1, last, current, current - 1, current + 1])
    if (current <= 3) [2, 3, 4].forEach(page => window.add(page))
    if (current >= last - 2) [last - 3, last - 2, last - 1].forEach(page => window.add(page))

    const sorted = [...window].filter(page => page >= 1 && page <= last).sort((a, b) => a - b)

    return sorted.flatMap((page, index) =>
        index > 0 && page - sorted[index - 1] > 1 ? [null, page] : [page])
})
</script>