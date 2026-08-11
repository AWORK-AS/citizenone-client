<template>
    <div class="p-5">
        <h2 v-if="props.field?.type === 'heading'"
            class="text-base font-bold uppercase tracking-wide text-primary border-b border-primary pb-1">
            {{ props.field?.value }}
        </h2>
        <h3 v-else-if="props.field?.type === 'subheading'" class="text-sm font-bold text-primary">
            {{ props.field?.value }}
        </h3>
        <p v-else-if="props.field?.type === 'paragraph'" class="text-sm whitespace-pre-line">
            {{ props.field?.value }}
        </p>
        <div v-else-if="props.field?.type === 'guidance'"
            class="text-sm text-gray-600 whitespace-pre-line border-l-2 border-gray-300 pl-3">
            <p>{{ props.field?.value }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ $t('forms.fields.guidanceHint') }}</p>
        </div>
        <div v-else-if="props.field?.type === 'pagebreak'" class="flex items-center gap-x-2 text-xs text-gray-400">
            <span class="grow border-t border-dashed border-gray-300"></span>
            {{ $t('forms.fields.pagebreak') }}
            <span class="grow border-t border-dashed border-gray-300"></span>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    field: {
        type: Object,
        required: true,
    },
})
</script>
