<template>
    <div>
        <!-- Mobile: select dropdown -->
        <div class="block md:hidden">
            <select
                class="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-primary"
                :value="modelValue"
                @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
            >
                <option v-for="tab in tabs" :key="tab.key" :value="tab.key">
                    {{ tab.label }}
                </option>
            </select>
        </div>

        <!-- Desktop: tab bar -->
        <div class="hidden md:block bg-white ring-1 ring-gray-200 rounded-md pl-5 pr-5 border-l-4 border-secondary">
            <div class="border-b border-gray-200 overflow-x-auto scrollbar-hide">
                <nav class="flex space-x-2 min-w-max whitespace-nowrap">
                    <button
                        v-for="tab in tabs"
                        :key="tab.key"
                        type="button"
                        :class="[
                            modelValue === tab.key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                            'flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm cursor-pointer transition-colors',
                        ]"
                        @click="emit('update:modelValue', tab.key)"
                    >
                        <Icon v-if="tab.icon" :name="tab.icon" class="h-4 w-4" aria-hidden="true" />
                        {{ tab.label }}
                        <span
                            v-if="tab.count !== undefined"
                            class="ml-1 rounded-full px-2 py-0.5 text-xs"
                            :class="modelValue === tab.key ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'"
                        >
                            {{ tab.count }}
                        </span>
                    </button>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineOptions({ name: 'TabsLocal' })

defineProps({
    tabs: {
        type: Array as PropType<Array<{
            key: string
            label: string
            icon?: string
            count?: number
        }>>,
        required: true,
    },
    modelValue: {
        type: String,
        required: true,
    },
})

const emit = defineEmits<{
    (e: 'update:modelValue', key: string): void
}>()
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
