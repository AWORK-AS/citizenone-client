<template>
    <div class="relative inline-block" @mouseover="showTooltip" @mouseleave="hideTooltip">
        <div class="flex items-center">
            <slot />
            <div v-if="visible"
                class="absolute z-50 p-2 text-white bg-primary rounded shadow-lg top-full mt-2 left-1/2 transform -translate-x-1/2">
                <p v-for="(name, index) in names" :key="index" class="text-xxs whitespace-nowrap">
                    {{ name }}
                </p>
                <!-- Arrow pointing up -->
                <div class="absolute left-1/2 transform -translate-x-1/2 -top-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-primary"></div>
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

const showTooltip = () => {
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
