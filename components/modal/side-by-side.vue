<template>
    <TransitionRoot as="template">
        <Dialog as="div" class="relative z-50" @close="$emit('close')">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed z-10 inset-0 overflow-y-auto">
                <div class="flex flex-col md:flex-row lg:items-center justify-center gap-6 px-4 pt-16 pb-4 text-center">

                    <TransitionChild as="template" enter="ease-out duration-300" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 scale-100" leave-to="opacity-0 translate-y-0 scale-95"
                        :class="!props.showLeftModal && 'hidden'">
                        <div class="bg-white relative overflow-clip text-left shadow-xl transform transition-all px-8 pt-6 pb-0 w-full rounded-md"
                            :class="[props.sizeLeft === 'xxs' && 'max-w-md', props.sizeLeft === 'xs' && 'max-w-lg', props.sizeLeft === 'sm' && 'max-w-xl', props.sizeLeft === 'md' && 'max-w-2xl', props.sizeLeft === 'lg' && 'max-w-3xl', props.sizeLeft === 'xl' && 'max-w-4xl', props.sizeLeft === '2xl' && 'max-w-5xl', props.sizeLeft === '3xl' && 'max-w-6xl', props.sizeLeft === '4xl' && 'max-w-7xl', props.sizeLeft === 'full' && 'max-w-full']">
                            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                                class="w-52 absolute -top-14 -right-14 z-10 opacity-70" id="animatedImage">
                            <div class="relative z-20">
                                <div class="flex items-center">
                                    <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                                        {{ props.titleLeft }}
                                    </DialogTitle>
                                    <div class="grow flex justify-end">
                                        <button type="button"
                                            class="flex items-center justify-center gap-x-2 outline-none px-0 py-2 text-gray-800 hover:text-gray-700">
                                            <Icon name="heroicons:x-mark" class="h-6 w-6 cursor-pointer"
                                                aria-hidden="true" @click="$emit('close')" />
                                        </button>
                                    </div>
                                </div>
                                <div class="py-6">
                                    <slot name="modal-left"></slot>
                                </div>
                            </div>
                        </div>
                    </TransitionChild>

                    <TransitionChild as="template" enter="ease-out duration-300" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 scale-100" leave-to="opacity-0 translate-y-0 scale-95"
                        :class="!props.showRightModal && 'hidden'">
                        <div class="bg-white relative overflow-clip text-left shadow-xl transform transition-all px-8 pt-6 pb-0 w-full rounded-md"
                            :class="[props.sizeRight === 'xxs' && 'max-w-md', props.sizeRight === 'xs' && 'max-w-lg', props.sizeRight === 'sm' && 'max-w-xl', props.sizeRight === 'md' && 'max-w-2xl', props.sizeRight === 'lg' && 'max-w-3xl', props.sizeRight === 'xl' && 'max-w-4xl', props.sizeRight === '2xl' && 'max-w-5xl', props.sizeRight === '3xl' && 'max-w-6xl', props.sizeRight === '4xl' && 'max-w-7xl', props.sizeRight === 'full' && 'max-w-full']">
                            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                                class="w-52 absolute -top-14 -right-14 z-10 opacity-70" id="animatedImage">
                            <div class="relative z-20">
                                <div class="flex items-center">
                                    <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                                        {{ props.titleRight }}
                                    </DialogTitle>
                                    <div class="grow flex justify-end">
                                        <button type="button"
                                            class="flex items-center justify-center gap-x-2 outline-none px-0 py-2 text-gray-800 hover:text-gray-700">
                                            <Icon name="heroicons:x-mark" class="h-6 w-6 cursor-pointer"
                                                aria-hidden="true" @click="$emit('close')" />
                                        </button>
                                    </div>
                                </div>
                                <div class="py-6">
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