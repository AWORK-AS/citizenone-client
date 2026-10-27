<template>
    <!-- A multi-select that applies on every click, so there is no Filter/Cancel
         step, and the trigger says how many are on. -->
    <Popover class="relative" v-slot="{ open }">
        <PopoverButton :class="[
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
            modelValue.length
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-slate-700 hover:border-primary hover:text-primary',
        ]">
            <Icon :name="icon" class="size-4" aria-hidden="true" />
            {{ label }}<span v-if="modelValue.length" class="-ms-1">({{ modelValue.length }})</span>
            <Icon :name="open ? 'ph:caret-up' : 'ph:caret-down'" class="size-3" aria-hidden="true" />
        </PopoverButton>
        <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <PopoverPanel
                class="absolute left-0 z-30 mt-2 w-72 origin-top-left rounded-md bg-white p-2 shadow-lg ring-1 ring-black/5 focus:outline-none">
                <input v-if="options.length > 8" v-model="query" type="search" :placeholder="$t('search')"
                    class="mb-2 w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                <ul class="max-h-64 overflow-y-auto">
                    <li v-for="option in filteredOptions" :key="option.value">
                        <label class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-100">
                            <input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary"
                                :checked="modelValue.includes(option.value)" @change="toggle(option.value)" />
                            <span class="truncate">{{ option.label }}</span>
                        </label>
                    </li>
                    <li v-if="!filteredOptions.length" class="px-2 py-2 text-sm text-gray-500">
                        {{ $t('noResultFound') }}
                    </li>
                </ul>
                <button v-if="modelValue.length" type="button" @click="emit('update:modelValue', [])"
                    class="mt-1 w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-gray-100 hover:text-primary-700">
                    {{ $t('citizens.citizenJournals.filter.clear') }}
                </button>
            </PopoverPanel>
        </transition>
    </Popover>
</template>

<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

type Option = { value: string, label: string }

const props = defineProps<{ label: string, icon: string, options: Option[], modelValue: string[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const query = ref('')

const filteredOptions = computed(() => {
    const needle = query.value.trim().toLowerCase()
    return needle ? props.options.filter((option) => option.label.toLowerCase().includes(needle)) : props.options
})

function toggle(value: string) {
    emit('update:modelValue', props.modelValue.includes(value)
        ? props.modelValue.filter((item) => item !== value)
        : [...props.modelValue, value])
}
</script>
