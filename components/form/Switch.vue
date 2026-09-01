<template>
    <div class="flex items-center">
        <!-- The toggle drives itself. It used to be a Headless UI Switch handed a
             stringified `value` it does not read, wrapped in a div that carried
             the click: the switch never learned whether it was on, so every one
             of them announced itself as off, and a keyboard could focus one but
             never flip it. Binding the model fixes the announcement, and moving
             the event onto the switch makes space and enter work like the
             mouse. -->
        <Switch :model-value="props.value" :disabled="props.disabled"
            :aria-label="props.label || undefined"
            @update:model-value="emit('toggleSwitch')" :class="[
                props.value ? 'bg-tertiary' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-5 w-9 border-2 border-transparent rounded-full transition-colors ease-in-out duration-200',
                props.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            ]">
            <span aria-hidden="true"
                :class="[props.value ? 'translate-x-4 bg-white' : 'translate-x-0 bg-secondary', 'pointer-events-none inline-block h-4 w-4 rounded-full shadow transform ring-0 transition ease-in-out duration-200']" />
        </Switch>
    </div>
</template>

<script setup lang="ts">
import { Switch } from '@headlessui/vue'

const props = defineProps({
    value: {
        type: Boolean,
        required: false,
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false,
    },
    /**
     * What this toggle is called, for anyone who cannot see the text beside it.
     * Optional so the existing call sites keep working, but a page of unlabelled
     * switches reads as fifty-five identical controls.
     */
    label: {
        type: String,
        required: false,
        default: '',
    },
})

const emit = defineEmits(['toggleSwitch'])
</script>
