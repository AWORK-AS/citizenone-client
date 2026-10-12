<template>
    <Multiselect :close-on-select="true" :searchable="props.searchable" :options="props.options"
        :placeholder="props.placeholder"
        :canClear="props.canClear" :canDeselect="props.canDeselect" :no-options-text="$t('theListIsEmpty')"
        :noResultsText="$t('noResultFound')"
        :appendToBody="props.appendToBody" :openDirection="props.openDirection"
        :createOption="props.createOption"
        :modelValue="props.modelValue" @update:modelValue="$emit('update:modelValue', $event)" />
</template>

<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const props = defineProps({
    appendToBody: {
        type: Boolean,
        default: false,
    },
    canClear: {
        type: Boolean,
        default: true
    },
    // Multiselect's own default. Set false where the field must always hold a
    // value: otherwise clicking the already-selected option deselects it and
    // emits null, which callers binding straight to a model rarely expect.
    canDeselect: {
        type: Boolean,
        default: true
    },
    // Lets the user type a value that is not in the list and pick it, e.g. a
    // new gender. Off unless asked for, so every other dropdown is unchanged.
    createOption: {
        type: Boolean,
        default: false
    },
    modelValue: {
        default: null
    },
    // 'top' for a field near the bottom of a modal, whose panel clips a list
    // opening downwards. (appendToBody escapes the clip but lands under the
    // modal, and a click there counts as outside it.)
    openDirection: {
        type: String as () => 'top' | 'bottom',
        default: 'bottom',
    },
    options: {
        type: Object,
        required: true,
    },
    placeholder: {
        type: String,
        default: '',
    },
    searchable: {
        type: Boolean,
        default: true
    },
})

defineEmits(['update:modelValue'])
</script>
