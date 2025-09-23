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

        <!-- Desktop: Swipeable Tabs -->
        <div :class="[
            props.tabs?.length > 0 &&
            'bg-white ring-1 ring-gray-200 rounded-md pl-5 pr-5 border-l-4 border-secondary',
            'hidden md:block'
        ]">
            <div ref="tabContainer" class="border-b border-gray-200 overflow-x-auto touch-auto scrollbar-hide">
                <nav :class="[
                    props.isJustifyBetween ? 'xl:justify-between' : '',
                    'flex space-x-2 min-w-max whitespace-nowrap'
                ]">
                    <a v-for="tab in props.tabs" :key="tab.name" :class="[
                        tab.routeNames?.includes($route.name)
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'px-4 py-4 border-b-2 font-medium text-sm cursor-pointer'
                    ]" @click="navigate(tab.href)">
                        <span v-if="tab.isTranslateName">
                            {{ tab.name && $t(tab.name) }}
                        </span>
                        <span v-else>
                            {{ tab.name }}
                        </span>
                    </a>
                </nav>
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

function swipeLeft() {
    if (tabContainer.value) {
        // Scroll to the left by a fixed amount (adjust as needed)
        tabContainer.value.scrollBy({ left: -200, behavior: 'smooth' })
    }
}

function swipeRight() {
    if (tabContainer.value) {
        // Scroll to the right by a fixed amount (adjust as needed)
        tabContainer.value.scrollBy({ left: 200, behavior: 'smooth' })
    }
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