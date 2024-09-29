<template>
    <div>
        <div class="block md:hidden">
            <label for="selected-tab" class="sr-only">Select a tab</label>
            <select id="selected-tab" name="selected-tab"
                class="block w-full rounded-md border border-tertiary py-2 pl-3 pr-10 text-base focus:border-tertiary focus:outline-none focus:ring-tertiary-500 sm:text-sm"
                @change="changeTab">
                <option v-for="tab in props.tabs" :key="tab.name" :selected="tab.routeNames?.includes($route.name)">
                    {{ tab.name && $t(tab.name) }}
                </option>
            </select>
        </div>
        <div class="hidden md:block">
            <div class="border-b border-gray-200">
                <nav class="-mb-px flex flex-wrap space-x-2">
                    <a v-for="tab in props.tabs" :key="tab.name" :class="[
                        tab.routeNames?.includes($route.name)
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'whitespace-nowrap px-4 py-4 border-b-2 font-medium text-sm cursor-pointer',
                    ]" @click="navigate(tab.href)">
                        {{ tab.name && $t(tab.name) }}
                    </a>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
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
</script>