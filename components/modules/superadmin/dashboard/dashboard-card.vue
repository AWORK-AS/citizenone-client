<template>
    <div class="bg-white shadow-md rounded-md p-4 border-l-4 border-secondary">
        <h3 class="text-primary text-sm font-medium py-2">
            {{ props.title }}
        </h3>
        <p class="text-xl font-semibold">{{ formatNumber(language.locale.value, value) }}</p>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useNumberFormatter } from '@/composables/numberFormatter'

const props = defineProps({
    title: String,
    value: [String, Number]
})
const language = useI18n()
const { formatNumber } = useNumberFormatter()
</script>