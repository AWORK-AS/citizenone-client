<template>
    <div ref="root" class="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img v-if="state.url && !state.failed" :src="state.url" :alt="props.photo?.name" loading="lazy"
            class="h-full w-full object-cover" @error="state.failed = true" />

        <!-- A browser that cannot draw the file (HEIC outside Safari) or a failed
             download shows what the file is instead of a broken image. -->
        <div v-else-if="state.failed"
            class="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center text-gray-500">
            <Icon name="ph:image-broken" class="size-8" aria-hidden="true" />
            <span class="line-clamp-2 break-all text-xs">{{ props.photo?.name }}</span>
            <span class="text-[11px] text-gray-400">{{ $t('treatmentPhotos.noPreview') }}</span>
        </div>

        <div v-else class="flex h-full w-full animate-pulse items-center justify-center text-gray-300">
            <Icon name="ph:image" class="size-8" aria-hidden="true" />
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    photo: {
        type: Object,
        required: true,
    },
    // Supplied by the page, which owns (and revokes) the object URLs.
    loadImage: {
        type: Function as unknown as () => (photo: any) => Promise<string>,
        required: true,
    },
})

const root = ref<HTMLElement | null>(null)
const state = reactive({
    url: '',
    failed: false,
    started: false,
})

let observer: IntersectionObserver | null = null

async function load() {
    if (state.started) return
    state.started = true
    try {
        state.url = await props.loadImage(props.photo)
    } catch {
        state.failed = true
    }
}

onMounted(() => {
    if (typeof IntersectionObserver === 'undefined' || !root.value) {
        load()
        return
    }
    observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect()
            observer = null
            load()
        }
    }, { rootMargin: '200px' })
    observer.observe(root.value)
})

onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
})
</script>
