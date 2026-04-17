<template>
    <Multiselect mode="tags" :close-on-select="true" :searchable="true" :options="props.options" :limit="props.limit"
        :no-options-text="$t('theListIsEmpty')" :noResultsText="$t('noResultFound')" :max-height="props.maxHeight"
        class="multiselect-limited" :modelValue="modelValue" @update:modelValue="emit('update:modelValue', $event)" />
</template>

<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const props = defineProps({
    options: {
        type: Object,
        required: true,
    },
    limit: {
        type: Number,
        default: -1,
    },
    modelValue: {
        type: [Array, String, Number, Object],
        default: () => [],
    },
    maxHeight: {
        type: Number,
        default: 200,
    },
})

const emit = defineEmits(['update:modelValue'])
</script>

<style>
.multiselect-limited {
    --ms-max-height: 200px;
}

.multiselect-limited .multiselect-tags {
    max-height: 30px;
    overflow-y: auto;
}

.multiselect-limited .multiselect-dropdown {
    max-height: var(--ms-max-height) !important;
    overflow-y: auto !important;
}
</style>
