<template>
    <Modal size="4xl" :title="$t('treatmentPhotos.compare.title')" :show="props.isModalOpen" @close="closeModal">
        <template #modal-body>
            <div class="space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <!-- Narrow screens: both photos stacked, or one at a time. -->
                    <div class="inline-flex rounded-lg bg-gray-100 p-0.5 md:hidden" role="group">
                        <button type="button" v-for="option in viewOptions" :key="option.value"
                            @click="state.view = option.value" :class="[
                                'rounded-md px-3 py-1.5 text-xs font-medium transition',
                                state.view === option.value ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            ]">
                            {{ option.label }}
                        </button>
                    </div>
                    <span class="hidden text-xs text-gray-500 md:inline">{{ $t('treatmentPhotos.compare.hint') }}</span>

                    <div class="flex items-center gap-1.5">
                        <button type="button" :title="$t('treatmentPhotos.compare.zoomOut')"
                            :aria-label="$t('treatmentPhotos.compare.zoomOut')" @click="zoomBy(1 / 1.25)"
                            class="rounded-lg border border-gray-200 p-2 text-gray-600 hover:border-gray-300">
                            <Icon name="ph:minus" class="size-4" />
                        </button>
                        <span class="w-12 text-center text-xs tabular-nums text-gray-600">{{ zoomLabel }}</span>
                        <button type="button" :title="$t('treatmentPhotos.compare.zoomIn')"
                            :aria-label="$t('treatmentPhotos.compare.zoomIn')" @click="zoomBy(1.25)"
                            class="rounded-lg border border-gray-200 p-2 text-gray-600 hover:border-gray-300">
                            <Icon name="ph:plus" class="size-4" />
                        </button>
                        <button type="button" @click="resetView"
                            class="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:border-gray-300">
                            {{ $t('treatmentPhotos.compare.reset') }}
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div v-for="(entry, index) in entries" :key="entry.photo?.uuid ?? index"
                        :class="[isShown(index) ? 'block' : 'hidden', 'md:block']">
                        <div class="mb-2">
                            <p class="text-sm font-semibold text-gray-900">
                                {{ entry.photo?.milestone?.name ?? $t('treatmentPhotos.noMilestone') }}
                            </p>
                            <p class="text-xs text-gray-500">
                                {{ formatDate(entry.photo?.taken_at) }}
                                <template v-if="entry.photo?.days_since_start !== null && entry.photo?.days_since_start !== undefined">
                                    &middot; {{ $t('treatmentPhotos.compare.daysSince', { days: entry.photo.days_since_start }) }}
                                </template>
                            </p>
                        </div>

                        <!-- Not zoomed: a swipe scrolls the page (on a phone the second photo is below the first),
                             and a pinch still reaches the handlers below. Zoomed: every touch pans the photo. -->
                        <div class="relative h-[45vh] select-none overflow-hidden rounded-lg bg-gray-900 md:h-[60vh]"
                            :class="state.scale > 1
                                ? ['touch-none', state.isDragging ? 'cursor-grabbing' : 'cursor-grab']
                                : ['touch-pan-y', 'cursor-zoom-in']"
                            @wheel.prevent="onWheel" @pointerdown="onPointerDown" @pointermove="onPointerMove"
                            @pointerup="onPointerEnd" @pointercancel="onPointerEnd" @dblclick="resetView">
                            <img v-if="entry.url && !entry.failed" :src="entry.url" :alt="entry.photo?.name"
                                draggable="false" class="absolute inset-0 h-full w-full object-contain"
                                :style="imageStyle" @error="entry.failed = true" />
                            <div v-else-if="entry.failed"
                                class="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-gray-300">
                                <Icon name="ph:image-broken" class="size-10" aria-hidden="true" />
                                <span class="break-all text-xs">{{ entry.photo?.name }}</span>
                                <span class="text-[11px] text-gray-400">{{ $t('treatmentPhotos.noPreview') }}</span>
                            </div>
                            <div v-else class="flex h-full w-full items-center justify-center text-gray-500">
                                <Icon name="ph:spinner" class="size-8 animate-spin" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'

const MIN_SCALE = 1
const MAX_SCALE = 8

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    // Exactly two TreatmentPhoto objects.
    photos: {
        type: Array as () => any[],
        required: true,
    },
    // How the caller fetches a photo: resolves to an object URL. The caller
    // owns that URL and releases it, so staff and patient pages can each use
    // their own endpoint.
    loadImage: {
        type: Function as unknown as () => (photo: any) => Promise<string>,
        required: true,
    },
})

const emit = defineEmits(['close'])
const { t } = useI18n()

const state = reactive({
    view: 'both' as 'both' | 'a' | 'b',
    scale: 1,
    x: 0,
    y: 0,
    isDragging: false,
})

const entries = ref<{ photo: any; url: string; failed: boolean }[]>([])

const viewOptions = computed(() => [
    { value: 'both', label: t('treatmentPhotos.compare.sideBySide') },
    { value: 'a', label: t('treatmentPhotos.compare.photoA') },
    { value: 'b', label: t('treatmentPhotos.compare.photoB') },
])

const zoomLabel = computed(() => `${Math.round(state.scale * 100)}%`)

// One transform for both photos, so they always show the same spot.
const imageStyle = computed(() => ({
    transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale})`,
    transformOrigin: 'center center',
    transition: state.isDragging ? 'none' : 'transform 80ms ease-out',
}))

function isShown(index: number): boolean {
    return state.view === 'both' || (state.view === 'a' && index === 0) || (state.view === 'b' && index === 1)
}

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}

function closeModal() {
    emit('close')
}

async function loadPhotos() {
    const list = (props.photos ?? []).slice(0, 2)
    const loaded = list.map((photo: any) => ({ photo, url: '', failed: false }))
    entries.value = loaded

    await Promise.all(loaded.map(async (entry, index) => {
        try {
            const url = await props.loadImage(entry.photo)
            // Still the same pair on screen, or the answer is stale.
            if (entries.value[index]?.photo?.uuid === entry.photo?.uuid) entries.value[index].url = url
        } catch {
            if (entries.value[index]?.photo?.uuid === entry.photo?.uuid) entries.value[index].failed = true
        }
    }))
}

function resetView() {
    state.scale = 1
    state.x = 0
    state.y = 0
}

function setScale(next: number) {
    state.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
    if (state.scale === MIN_SCALE) {
        state.x = 0
        state.y = 0
    }
}

function zoomBy(factor: number) {
    setScale(state.scale * factor)
}

function onWheel(event: WheelEvent) {
    zoomBy(event.deltaY < 0 ? 1.15 : 1 / 1.15)
}

// Drag to pan with one pointer, pinch to zoom with two.
const pointers = new Map<number, { x: number; y: number }>()
let pinchDistance = 0

function pinchSpan(): number {
    const [a, b] = [...pointers.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
}

function onPointerDown(event: PointerEvent) {
    ; (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId)
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size === 2) pinchDistance = pinchSpan()
    state.isDragging = pointers.size === 1 && state.scale > 1
}

function onPointerMove(event: PointerEvent) {
    const previous = pointers.get(event.pointerId)
    if (!previous) return
    const next = { x: event.clientX, y: event.clientY }
    pointers.set(event.pointerId, next)

    if (pointers.size === 2) {
        const span = pinchSpan()
        if (pinchDistance > 0 && span > 0) zoomBy(span / pinchDistance)
        pinchDistance = span
        return
    }

    if (pointers.size === 1 && state.scale > 1) {
        state.x += next.x - previous.x
        state.y += next.y - previous.y
    }
}

function onPointerEnd(event: PointerEvent) {
    pointers.delete(event.pointerId)
    pinchDistance = 0
    state.isDragging = false
}

watch(() => [props.isModalOpen, props.photos?.map((photo: any) => photo?.uuid).join('|')], () => {
    pointers.clear()
    resetView()
    state.view = 'both'
    if (props.isModalOpen && props.photos?.length) {
        loadPhotos()
    }
}, { immediate: true })

// Escape and a click outside both arrive as the modal's close event; this only
// covers Escape pressed while focus sits on a control inside it.
function onKeydown(event: KeyboardEvent) {
    if (props.isModalOpen && event.key === 'Escape') closeModal()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
