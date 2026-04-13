<template>
    <Multiselect mode="tags" :close-on-select="true" :searchable="true" :options="props.options" :limit="props.limit"
        :no-options-text="$t('theListIsEmpty')" :noResultsText="$t('noResultFound')" class="multiselect-limited" />
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
        default: 3,
    },
})
</script>

<style>
.multiselect-limited .multiselect-tags {
    max-height: 30px;
    overflow-y: auto;
}
</style>
