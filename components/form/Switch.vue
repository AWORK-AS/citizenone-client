<template>
    <div @click="!props.disabled && $emit('toggleSwitch')" class="w-fit">
        <Switch :value="props.value.toString()" :class="[
            props.value ? 'bg-primary' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full transition-colors ease-in-out duration-200',
            props.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        ]">
            <span aria-hidden="true"
                :class="[props.value ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200']" />
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