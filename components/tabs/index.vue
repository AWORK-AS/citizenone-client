<template>
    <div class="relative">
        <!-- Mobile: Dropdown -->
        <div class="block md:hidden">
            <label :for="`selected-tab${props.id && '-' + props.id}`" class="sr-only">Select a tab</label>
            <select :id="`selected-tab${props.id && '-' + props.id}`" name="selected-tab"
                class="block w-full rounded-md border border-tertiary py-2 pl-3 pr-10 text-base focus:border-tertiary focus:outline-none focus:ring-tertiary-500 sm:text-sm"
                @change="changeTab">
                <option v-for="tab in props.tabs" :key="tab.name" :selected="tab.routeNames?.includes($route.name)"
                    :value="tab.href">
                    <span v-if="tab.isTranslateName">
                        {{ tab.name && $t(tab.name) }}
                    </span>
                    <span v-else>
                        {{ tab.name }}
                    </span>
                </option>
            </select>
        </div>

        <!-- Desktop: scrollable tabs with overflow affordance -->
        <div :class="[
            props.tabs?.length > 0 &&
            'bg-white ring-1 ring-gray-200 rounded-md px-5 border-l-4 border-secondary',
            'hidden md:block'
        ]">
            <div class="relative">
                <!-- Left fade + scroll chevron (only when there's more to the left) -->
                <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent transition-opacity duration-200"
                    :class="canScrollLeft ? 'opacity-100' : 'opacity-0'"></div>
                <button type="button" v-show="canScrollLeft" @click="swipeLeft" aria-label="Scroll tabs left"
                    class="absolute left-0 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-500 shadow-card-hover ring-1 ring-gray-200 transition-colors hover:text-primary">
                    <Icon name="heroicons:chevron-left-20-solid" class="h-4 w-4" aria-hidden="true" />
                </button>

                <div ref="tabContainer" @scroll="updateScrollState"
                    class="border-b border-gray-200 overflow-x-auto touch-auto scrollbar-hide">
                    <nav :class="[
                        props.isJustifyBetween ? 'xl:justify-between' : '',
                        'flex space-x-2 min-w-max whitespace-nowrap'
                    ]">
                        <a v-for="tab in props.tabs" :key="tab.name" :class="[
                            tab.routeNames?.includes($route.name)
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:border-secondary-200 hover:text-gray-700',
                            'inline-flex items-center gap-x-1.5 px-4 py-4 border-b-2 font-medium text-sm cursor-pointer transition-all duration-200'
                        ]" @click="navigate(tab.href)">
                            <Icon v-if="tab.icon" :name="tab.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span v-if="tab.isTranslateName">
                                {{ tab.name && $t(tab.name) }}
                            </span>
                            <span v-else>
                                {{ tab.name }}
                            </span>
                        </a>
                    </nav>
                </div>

                <!-- Right fade + scroll chevron (only when there's more to the right) -->
                <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent transition-opacity duration-200"
                    :class="canScrollRight ? 'opacity-100' : 'opacity-0'"></div>
                <button type="button" v-show="canScrollRight" @click="swipeRight" aria-label="Scroll tabs right"
                    class="absolute right-0 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-500 shadow-card-hover ring-1 ring-gray-200 transition-colors hover:text-primary">
                    <Icon name="heroicons:chevron-right-20-solid" class="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>

        <!-- Swipe Left -->
        <div class="bg-white border-0.5 border-gray-300 w-6 h-6 rounded-full absolute -left-3 top-4 flex items-center justify-center cursor-pointer"
            v-if="props?.isSwipeable" @click="swipeLeft">
            <Icon name="ph:hand-swipe-left" class="h-4 w-4" aria-hidden="true" />
        </div>

        <!-- Swipe Right -->
        <div class="bg-white border-0.5 border-gray-300 w-6 h-6 rounded-full absolute -right-3 top-4 flex items-center justify-center cursor-pointer"
            v-if="props?.isSwipeable" @click="swipeRight">
            <Icon name="ph:hand-swipe-right" class="h-4 w-4" aria-hidden="true" />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    id: {
        type: String,
        required: false,
    },
    isJustifyBetween: {
        type: Boolean,
        required: false,
    },
    isSwipeable: {
        type: Boolean,
        required: false,
        default: false,
    },
    tabs: {
        type: Object,
        required: true,
    },
})

function navigate(href) {
    navigateTo(href)
}

const emit = defineEmits(['changeTab'])

function changeTab(event) {
    emit('changeTab', event.target.value)
}

// Reference to the tab container
const tabContainer = ref(null)

// Overflow affordance: track whether there are more tabs to scroll to in each
// direction, so we can show fade edges + scroll chevrons (the scrollbar is hidden).
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
    const el = tabContainer.value
    if (!el) return
    canScrollLeft.value = el.scrollLeft > 4
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

onMounted(() => {
    nextTick(updateScrollState)
    window.addEventListener('resize', updateScrollState)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateScrollState)
})

watch(() => props.tabs, () => nextTick(updateScrollState), { deep: true })

function swipeLeft() {
    tabContainer.value?.scrollBy({ left: -240, behavior: 'smooth' })
}

function swipeRight() {
    tabContainer.value?.scrollBy({ left: 240, behavior: 'smooth' })
}
</script>

<style scoped>
/* Optional: Hide scrollbar */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}
</style>