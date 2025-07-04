<template>
    <div :class="[
        props.tabs?.length > 0 && 'bg-white ring-1 ring-gray-200 rounded-md pl-5 pr-5 border-l-4 border-secondary',
        'hidden md:block'
    ]">
        <div class="border-b border-gray-200">
            <nav :class="[
                props.isJustifyBetween && 'xl:justify-between',
                '-mb-px flex flex-wrap space-x-2'
            ]">
                <a v-for="tab in props.tabs" :key="tab.name" :class="[
                    tab.isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'whitespace-nowrap px-4 py-4 border-b-2 font-medium text-sm cursor-pointer',
                ]" @click="changeTab(tab)">
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
    tabs: {
        type: Object,
        required: true,
    },
})

function navigate(href) {
    navigateTo(href)
}

const emit = defineEmits(['changeTab'])
function changeTab(tab) {
    emit('changeTab', tab)
}
</script>