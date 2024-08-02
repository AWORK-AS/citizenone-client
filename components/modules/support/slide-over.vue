<template>
    <TransitionRoot as="template" :show="props.isOpen">
        <Dialog class="relative z-50" @close="closeSlide">
            <div class="fixed inset-0" />

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <TransitionChild as="template"
                            enter="transform transition ease-in-out duration-500 sm:duration-600"
                            enter-from="translate-x-full" enter-to="translate-x-0"
                            leave="transform transition ease-in-out duration-500 sm:duration-700"
                            leave-from="translate-x-0" leave-to="translate-x-full">
                            <DialogPanel class="pointer-events-auto w-screen max-w-sm">
                                <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                    <div class="px-4 sm:px-6">
                                        <div class="flex items-start justify-between">
                                            <DialogTitle class="text-base font-semibold leading-6 text-gray-900">
                                                {{ $t('support.support') }}
                                            </DialogTitle>
                                            <div class="ml-3 flex h-7 items-center">
                                                <button type="button"
                                                    class="relative rounded-md bg-white text-tertiary-800 hover:text-tertiary focus:outline-none"
                                                    @click="closeSlide">
                                                    <span class="absolute -inset-2.5" />
                                                    <span class="sr-only">Close panel</span>
                                                    <Icon name="ph:x" class="h-6 w-6" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="relative mt-10 flex-1 px-4 sm:px-6">
                                        <div class="space-y-3">
                                            <img src="https://app.citizenone.dk/wp-content/uploads/2024/01/1.png"
                                                alt="Support">
                                            <p class="text-xl">Mads Frederiksen</p>
                                            <div class="space-y-1.5">
                                                <div class="flex items-center gap-x-1">
                                                    <Icon name="ph:phone" class="h-4 w-4" aria-hidden="true" />
                                                    <span class="text-sm">+45 80 83 01 14</span>
                                                </div>
                                                <div class="flex items-center gap-x-1">
                                                    <Icon name="ph:envelope" class="h-4 w-4" aria-hidden="true" />
                                                    <span class="text-sm">support@citizenone.dk</span>
                                                </div>
                                                <div>
                                                    <p class="text-tertiary hover:text-tertiary-700 cursor-pointer"
                                                        @click="navigateToSupport()">
                                                        {{ $t('support.goToSupportcenterHere') }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

function closeSlide() {
    emit('close')
}

async function navigateToSupport() {
    await navigateTo('https://citizenone.dk/support', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>