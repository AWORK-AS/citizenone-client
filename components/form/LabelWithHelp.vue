<template>
    <div class="flex items-center gap-x-1">
        <FormLabel :for="props.for" :label="props.label" />
        <span ref="triggerRef" class="inline-flex" @pointerenter="onPointerEnter" @pointerleave="onPointerLeave">
            <!-- type="button": a click must never submit the form around it. -->
            <button type="button" :aria-label="props.helpLabel" :aria-expanded="state.visible"
                class="inline-flex items-center justify-center rounded-full text-gray-400 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                :class="state.visible ? 'text-primary' : ''" @click.stop.prevent="toggle">
                <Icon name="ph:question" class="h-4 w-4" />
            </button>
        </span>

        <Teleport to="body">
            <div v-if="state.visible" ref="popoverRef" role="tooltip"
                class="fixed z-[9999] rounded-md bg-primary px-2.5 py-1.5 text-xs text-white shadow-lg"
                :style="state.style" @pointerenter="cancelHide" @pointerleave="onPointerLeave">
                <p class="whitespace-pre-wrap break-words">{{ props.help }}</p>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
// A field label with a small (?) next to it. Hover (mouse) or tap shows the help text.
// The shared Tooltip only reacts to hover, so a phone could never open it.
const props = defineProps({
    for: { type: String, required: false },
    label: { type: String, required: true },
    help: { type: String, required: true },
    helpLabel: { type: String, required: true },
})

const POPOVER_WIDTH = 288
const GAP = 8
const EDGE = 8

const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const state = reactive({
    visible: false,
    // A click keeps it open until clicked again, so leaving with the mouse does not close it.
    pinned: false,
    style: {} as Record<string, string>,
})
let hideTimer: ReturnType<typeof setTimeout> | null = null

function cancelHide() {
    if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
    }
}

async function show() {
    cancelHide()
    place()
    state.visible = true
    await nextTick()
    placeBelowOrAbove()
}

function place() {
    const trigger = triggerRef.value
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const width = Math.min(POPOVER_WIDTH, window.innerWidth - EDGE * 2)
    const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, EDGE), window.innerWidth - EDGE - width)
    state.style = { width: `${width}px`, left: `${left}px`, top: `${rect.bottom + GAP}px` }
}

// Below the icon, unless that runs off the bottom of the screen.
function placeBelowOrAbove() {
    const trigger = triggerRef.value
    const popover = popoverRef.value
    if (!trigger || !popover) return
    const rect = trigger.getBoundingClientRect()
    const height = popover.getBoundingClientRect().height
    if (rect.bottom + GAP + height > window.innerHeight - EDGE && rect.top - GAP - height > EDGE) {
        state.style = { ...state.style, top: `${rect.top - GAP - height}px` }
    }
}

function close() {
    cancelHide()
    state.visible = false
    state.pinned = false
}

function toggle() {
    if (state.visible && state.pinned) {
        close()
        return
    }
    state.pinned = true
    show()
}

// A finger also fires pointerenter just before the tap; only a mouse opens it by hovering.
function onPointerEnter(event: PointerEvent) {
    if (event.pointerType === 'mouse') show()
}

function onPointerLeave(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || state.pinned) return
    cancelHide()
    hideTimer = setTimeout(() => (state.visible = false), 100)
}

function onOutsidePointerDown(event: Event) {
    const target = event.target as Node
    if (triggerRef.value?.contains(target) || popoverRef.value?.contains(target)) return
    close()
}

// Escape closes only this help, not the modal around it.
function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !state.visible) return
    event.stopPropagation()
    close()
}

watch(() => state.visible, (visible) => {
    if (visible) {
        document.addEventListener('pointerdown', onOutsidePointerDown, true)
        document.addEventListener('keydown', onKeydown, true)
        window.addEventListener('resize', close)
        window.addEventListener('scroll', close, true)
    } else {
        document.removeEventListener('pointerdown', onOutsidePointerDown, true)
        document.removeEventListener('keydown', onKeydown, true)
        window.removeEventListener('resize', close)
        window.removeEventListener('scroll', close, true)
    }
})

onBeforeUnmount(() => {
    cancelHide()
    document.removeEventListener('pointerdown', onOutsidePointerDown, true)
    document.removeEventListener('keydown', onKeydown, true)
    window.removeEventListener('resize', close)
    window.removeEventListener('scroll', close, true)
})
</script>
