<template>
    <div @click="!props.disabled && $emit('toggleSwitch')" class="flex items-center">
        <Switch :value="props.value.toString()" :class="[
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
})
</script>