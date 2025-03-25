<template>
    <Multiselect mode="tags" :close-on-select="true" :searchable="true" :options="props.options"
        :no-options-text="$t('theListIsEmpty')" :noResultsText="$t('noResultFound')" />
</template>

<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const props = defineProps({
    options: {
        type: Object,
        required: true,
    },
})
</script>