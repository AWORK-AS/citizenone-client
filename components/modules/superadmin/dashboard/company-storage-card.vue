<template>
    <div class="bg-white shadow-md rounded-md py-4 pl-4 pr-1 border-l-4 border-secondary">
        <h3 class="text-primary text-sm font-medium py-2">
            {{ props.title }}
        </h3>
        <div class="mt-2 space-y-2 overflow-scroll max-h-28">
            <div v-for="(company, index) in props.companies" :key="index" class="flex justify-between items-center">
                <div>
                    <p class="text-sm font-semibold">{{ company.name }}</p>
                    <p class="text-xs text-gray-600">Usage: {{ company.usage }}</p>
                    <p class="text-xs" :class="company.isPaid ? 'text-green-600' : 'text-red-600'">
                        {{ company.isPaid ? 'Paid' : 'Not Paid' }} - {{ company.cost }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    title: String,
    companies: {
        type: Array,
        required: true
    } as any
});
</script>