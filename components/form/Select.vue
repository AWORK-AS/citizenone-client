<template>
    <Multiselect :close-on-select="true" :searchable="props.searchable" :options="props.options"
        :canClear="props.canClear" :no-options-text="$t('theListIsEmpty')" :noResultsText="$t('noResultFound')" />
</template>

<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const props = defineProps({
    canClear: {
        type: Boolean,
        required: false,
        default: false
    },
    options: {
        type: Object,
        required: true,
    },
    searchable: {
        type: Boolean,
        required: false,
        default: true
    },
})
</script>
