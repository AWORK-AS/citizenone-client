<template>
    <div class="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <video ref="videoEl" autoplay playsinline :muted="isLocal" v-show="hasVideo"
            class="w-full h-full" :class="[isScreen ? 'object-contain' : 'object-cover', isLocal && !isScreen && '-scale-x-100']" />
        <div v-if="!hasVideo" class="absolute inset-0 flex items-center justify-center">
            <div class="h-16 w-16 rounded-full bg-gray-700 text-gray-100 flex items-center justify-center text-xl font-semibold">
                {{ initials }}
            </div>
        </div>
        <div class="absolute left-2 bottom-2 flex items-center gap-1.5 bg-black/60 text-white text-xs sm:text-sm rounded px-2 py-1 max-w-[85%]">
            <Icon v-if="microphoneMuted && !isScreen" name="ph:microphone-slash" class="h-4 w-4 text-red-400 shrink-0" />
            <Icon v-if="isScreen" name="ph:monitor" class="h-4 w-4 shrink-0" />
            <span class="truncate">{{ label }}</span>
        </div>
        <div v-if="speaking" class="absolute inset-0 rounded-lg ring-2 ring-teal-400 pointer-events-none" />
    </div>
</template>

<script setup lang="ts">
import type { Track } from 'livekit-client'

/**
 * One video tile in a meeting: a participant's camera or a shared screen.
 * Attaches the track to its own <video> and detaches it when it changes.
 */
const props = defineProps<{
    track?: Track | null
    label: string
    isLocal?: boolean
    isScreen?: boolean
    microphoneMuted?: boolean
    speaking?: boolean
}>()

const videoEl = ref<HTMLVideoElement>()
const hasVideo = computed(() => !!props.track && !props.track.isMuted)

const initials = computed(() => (props.label || '?')
    .split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase())

watch(() => [props.track, videoEl.value] as const, ([track, el], old) => {
    const previous = old?.[0]
    if (previous && previous !== track && el) previous.detach(el)
    if (track && el) track.attach(el)
}, { immediate: true, flush: 'post' })

onBeforeUnmount(() => {
    if (props.track && videoEl.value) props.track.detach(videoEl.value)
})
</script>
