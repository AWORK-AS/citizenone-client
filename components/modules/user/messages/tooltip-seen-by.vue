<template>
    <div class="relative inline-block" ref="triggerRef" @mouseover="showTooltip" @mouseleave="hideTooltip">
        <div class="flex items-center">
            <slot />
            <div v-if="visible"
                :class="[
                    'absolute z-50 p-2 text-white bg-primary rounded shadow-lg left-1/2 transform -translate-x-1/2',
                    showAbove ? 'bottom-full mb-2' : 'top-full mt-2'
                ]">
                <p v-for="(name, index) in names" :key="index" class="text-xxs whitespace-nowrap">
                    {{ name }}
                </p>
                <!-- Arrow -->
                <div :class="[
                    'absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent',
                    showAbove
                        ? '-bottom-1 border-t-4 border-t-primary'
                        : '-top-1 border-b-4 border-b-primary'
                ]"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    receipts: {
        type: Array,
        required: true,
    },
})

const visible = ref(false)
const triggerRef = ref(null)
const showAbove = ref(false)

const showTooltip = () => {
    if (triggerRef.value) {
        const rect = triggerRef.value.getBoundingClientRect()
        // Find the scrollable parent container
        const scrollableParent = triggerRef.value.closest('.overflow-y-auto')
        if (scrollableParent) {
            const containerRect = scrollableParent.getBoundingClientRect()
            const spaceBelow = containerRect.bottom - rect.bottom
            showAbove.value = spaceBelow < 100
        } else {
            // Fallback to window if no scrollable parent
            const spaceBelow = window.innerHeight - rect.bottom
            showAbove.value = spaceBelow < 100
        }
    }
    visible.value = true
}

const hideTooltip = () => {
    visible.value = false
}

const names = computed(() => {
    return props.receipts.map(r =>
        `${r?.user?.firstname} ${r?.user?.lastname ?? ''}`.trim()
    )
})
</script>
