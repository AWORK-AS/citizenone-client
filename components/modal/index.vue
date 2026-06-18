<template>
    <TransitionRoot as="template">
        <Dialog as="div" class="relative z-50" :open="props.show" @close="$emit('close')">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
            </TransitionChild>

            <div class="fixed z-10 inset-0 overflow-y-auto">
                <div class="flex lg:items-center justify-center px-4 pt-16 pb-4 text-center">
                    <TransitionChild as="template" enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-2 scale-95" enter-to="opacity-100 translate-y-0 scale-100"
                        leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 scale-100" leave-to="opacity-0 translate-y-0 scale-95">
                        <DialogPanel
                            class="bg-white relative overflow-clip text-left shadow-2xl ring-1 ring-black/5 transform transition-all px-8 pt-6 pb-0 w-full rounded-2xl"
                            :class="[props.size === 'xs' && 'max-w-lg', props.size === 'sm' && 'max-w-xl', props.size === 'md' && 'max-w-2xl', props.size === 'lg' && 'max-w-3xl', props.size === 'xl' && 'max-w-4xl', props.size === '2xl' && 'max-w-5xl', props.size === '3xl' && 'max-w-6xl', props.size === '4xl' && 'max-w-7xl', props.size === 'full' && 'max-w-full']">
                            <div class="relative z-20">
                                <div class="flex items-center">
                                    <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                                        <div class="flex items-center gap-x-1">
                                            <div class="flex items-center" v-if="props.titleIcon">
                                                <Icon :name="props.titleIcon" class="w-5 h-5"
                                                    :style="`color: #${props.titleIconColor};`" />
                                            </div>
                                            {{ props.title }}
                                        </div>
                                    </DialogTitle>
                                    <div class="grow flex justify-end">
                                        <button type="button" @click="$emit('close')"
                                            class="flex items-center justify-center rounded-full p-1.5 -mr-1.5 outline-none text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                            <Icon name="heroicons:x-mark" class="h-5 w-5 cursor-pointer"
                                                aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                                <div class="py-6">
                                    <slot name="modal-body"></slot>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const props = defineProps({
    size: {
        type: String,
        required: false,
        default: 'sm',
    },
    title: {
        type: String,
        required: false,
    },
    titleIcon: {
        type: String,
        required: false,
    },
    titleIconColor: {
        type: String,
        required: false,
    },
})

defineSlots<{
    'modal-body'?: () => any
}>()
</script>