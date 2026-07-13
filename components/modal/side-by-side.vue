<template>
    <TransitionRoot as="template">
        <Dialog as="div" class="relative z-50" @close="$emit('close')">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] transition-opacity" />
            </TransitionChild>

            <div class="fixed z-10 inset-0 overflow-y-auto">
                <div class="flex flex-col md:flex-row lg:items-start justify-center gap-6 px-4 pt-12 pb-8 text-center">

                    <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-2 scale-95"
                        enter-to="opacity-100 translate-y-0 scale-100" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 scale-100" leave-to="opacity-0 translate-y-0 scale-95"
                        :class="!props.showLeftModal && 'hidden'">
                        <div class="bg-white relative overflow-clip text-left shadow-2xl ring-1 ring-black/5 transform transition-all w-full rounded-2xl"
                            :class="[props.sizeLeft === 'xxs' && 'max-w-md', props.sizeLeft === 'xs' && 'max-w-lg', props.sizeLeft === 'sm' && 'max-w-xl', props.sizeLeft === 'md' && 'max-w-2xl', props.sizeLeft === 'lg' && 'max-w-3xl', props.sizeLeft === 'xl' && 'max-w-4xl', props.sizeLeft === '2xl' && 'max-w-5xl', props.sizeLeft === '3xl' && 'max-w-6xl', props.sizeLeft === '4xl' && 'max-w-7xl', props.sizeLeft === 'full' && 'max-w-full']">
                            <img src="/img/icons/asset-01.svg" alt=""
                                class="w-48 absolute -top-12 -right-12 z-10 opacity-40 pointer-events-none select-none">
                            <div class="relative z-20">
                                <div class="flex items-center gap-4 px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100">
                                    <DialogTitle as="h3" class="text-lg leading-6 font-semibold tracking-tight text-gray-900">
                                        {{ props.titleLeft }}
                                    </DialogTitle>
                                    <button type="button" aria-label="Close"
                                        class="ml-auto shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                        @click="$emit('close')">
                                        <Icon name="heroicons:x-mark" class="h-5 w-5 cursor-pointer" aria-hidden="true" />
                                    </button>
                                </div>
                                <div class="px-6 sm:px-8 py-6">
                                    <slot name="modal-left"></slot>
                                </div>
                            </div>
                        </div>
                    </TransitionChild>

                    <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-2 scale-95"
                        enter-to="opacity-100 translate-y-0 scale-100" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 scale-100" leave-to="opacity-0 translate-y-0 scale-95"
                        :class="!props.showRightModal && 'hidden'">
                        <div class="bg-white relative overflow-clip text-left shadow-2xl ring-1 ring-black/5 transform transition-all w-full rounded-2xl"
                            :class="[props.sizeRight === 'xxs' && 'max-w-md', props.sizeRight === 'xs' && 'max-w-lg', props.sizeRight === 'sm' && 'max-w-xl', props.sizeRight === 'md' && 'max-w-2xl', props.sizeRight === 'lg' && 'max-w-3xl', props.sizeRight === 'xl' && 'max-w-4xl', props.sizeRight === '2xl' && 'max-w-5xl', props.sizeRight === '3xl' && 'max-w-6xl', props.sizeRight === '4xl' && 'max-w-7xl', props.sizeRight === 'full' && 'max-w-full']">
                            <img src="/img/icons/asset-01.svg" alt=""
                                class="w-48 absolute -top-12 -right-12 z-10 opacity-40 pointer-events-none select-none">
                            <div class="relative z-20">
                                <div class="flex items-center gap-4 px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100">
                                    <DialogTitle as="h3" class="text-lg leading-6 font-semibold tracking-tight text-gray-900">
                                        {{ props.titleRight }}
                                    </DialogTitle>
                                    <button type="button" aria-label="Close"
                                        class="ml-auto shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                        @click="$emit('closeRightModal')">
                                        <Icon name="heroicons:x-mark" class="h-5 w-5 cursor-pointer" aria-hidden="true" />
                                    </button>
                                </div>
                                <div class="px-6 sm:px-8 py-6">
                                    <slot name="modal-right"></slot>
                                </div>
                            </div>
                        </div>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const props = defineProps({
    showLeftModal: {
        type: Boolean,
        required: false,
        default: true,
    },
    showRightModal: {
        type: Boolean,
        required: false,
        default: false,
    },
    sizeLeft: {
        type: String,
        required: false,
        default: 'sm',
    },
    sizeRight: {
        type: String,
        required: false,
        default: 'sm',
    },
    titleLeft: {
        type: String,
        required: false,
    },
    titleRight: {
        type: String,
        required: false,
    },
})
</script>
