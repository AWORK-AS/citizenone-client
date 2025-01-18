<template>
    <TransitionRoot as="template">
        <Dialog as="div" class="relative z-50" @close="$emit('close')">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0" :class="{
                    'fixed inset-0 transition-opacity': true,
                    'bg-gray-500 bg-opacity-75': !userStore.getInTutorial
                }" />
            </TransitionChild>

            <div class="fixed z-10 inset-0 overflow-y-auto">
                <div class="flex lg:items-center justify-center px-4 pt-16 pb-4 text-center" :class="{
                    'fixed bottom-10 left-[20rem]': props.flag === 1,
                    'fixed top-32 left-[18rem]': props.flag === 2,
                    'fixed bottom-20 right-[1rem]': props.flag === 3,
                    'absolute inset-0 flex items-center justify-center': props.flag === 4
                }">

                    <TransitionChild as="template" enter="ease-out duration-300" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 scale-100" leave-to="opacity-0 translate-y-0 scale-95">
                        <DialogPanel
                            class="bg-white relative overflow-clip text-left shadow-xl transform transition-all px-8 pt-6 pb-0 w-full rounded-md"
                            :class="[props.size === 'xs' && 'max-w-lg', props.size === 'sm' && 'max-w-xl', props.size === 'md' && 'max-w-2xl', props.size === 'lg' && 'max-w-3xl', props.size === 'xl' && 'max-w-4xl', props.size === '2xl' && 'max-w-5xl', props.size === '3xl' && 'max-w-6xl', props.size === '4xl' && 'max-w-7xl', props.size === 'full' && 'max-w-full']">
                            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                                class="w-52 absolute -top-14 -right-14 z-10 opacity-70" id="animatedImage">
                            <div class="relative z-20">
                                <div class="flex items-center">
                                    <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                                        {{ props.title }}
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

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
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
    flag: {
        type: Number,
        required: false,
        default: 4,  // Default to 4 to center the modal if not provided
    },
})

</script>