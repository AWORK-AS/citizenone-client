<template>
    <div class="group relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
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
        <div v-if="handRaised" class="absolute right-2 top-2 bg-amber-400 text-black rounded-full h-8 w-8 flex items-center justify-center shadow">
            <Icon name="ph:hand-palm-fill" class="h-5 w-5" />
        </div>
        <!-- A reaction from this person, for a few seconds. -->
        <Transition enter-from-class="opacity-0 scale-50" leave-to-class="opacity-0 -translate-y-4"
            enter-active-class="transition duration-200" leave-active-class="transition duration-500">
            <div v-if="reaction" :key="reaction" class="absolute left-2 top-2 text-4xl drop-shadow-lg pointer-events-none select-none" aria-hidden="true">
                {{ reaction }}
            </div>
        </Transition>
        <button v-if="focusable" type="button"
            class="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition"
            :title="focused ? $t('meetings.room.unfocus') : $t('meetings.room.focus')" :aria-pressed="!!focused"
            @click="$emit('toggle-focus')">
            <Icon :name="focused ? 'ph:arrows-in' : 'ph:arrows-out'" class="h-4 w-4" />
        </button>
    </div>
</template>

<script setup lang="ts">
import type { Track } from 'livekit-client'
import { initials as initialsOf } from '@/utils/meetings'

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
    handRaised?: boolean
    reaction?: string
    // Offers a button to show this tile large, or back in the row when it is.
    focusable?: boolean
    focused?: boolean
}>()

defineEmits<{ (e: 'toggle-focus'): void }>()

const videoEl = ref<HTMLVideoElement>()
const hasVideo = computed(() => !!props.track && !props.track.isMuted)

const initials = computed(() => initialsOf(props.label))

watch(() => [props.track, videoEl.value] as const, ([track, el], old) => {
    const previous = old?.[0]
    if (previous && previous !== track && el) previous.detach(el)
    if (track && el) track.attach(el)
}, { immediate: true, flush: 'post' })

onBeforeUnmount(() => {
    if (props.track && videoEl.value) props.track.detach(videoEl.value)
})
</script>
