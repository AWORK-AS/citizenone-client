<template>
    <TransitionRoot as="template" :show="isOpen">
        <Dialog as="div" class="relative z-50" @close="close">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed z-10 inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center px-4 py-8 text-center">
                    <TransitionChild as="template" enter="ease-out duration-300" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 scale-100" leave-to="opacity-0 translate-y-0 scale-95">
                        <DialogPanel
                            class="bg-white relative overflow-clip text-left shadow-xl transform transition-all p-8 w-full max-w-xl rounded-md">
                            <img src="/img/icons/asset-01.svg" alt="" class="w-52 absolute -top-14 -right-14 z-10 opacity-70">
                            <div class="relative z-20">
                                <div class="flex justify-end">
                                    <button type="button"
                                        class="flex items-center justify-center outline-none text-gray-800 hover:text-gray-700"
                                        @click="close">
                                        <Icon name="heroicons:x-mark" class="h-6 w-6 cursor-pointer" aria-hidden="true" />
                                    </button>
                                </div>

                                <div class="mt-2 text-center space-y-4" v-if="currentStep">
                                    <div class="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Icon :name="currentStep.icon" class="h-8 w-8 text-primary" aria-hidden="true" />
                                    </div>
                                    <h3 class="text-xl md:text-2xl font-semibold text-secondary">
                                        {{ $t(currentStep.titleKey) }}
                                    </h3>
                                    <p class="text-primary text-sm md:text-base">
                                        {{ $t(currentStep.textKey) }}
                                    </p>
                                </div>

                                <!-- progress dots -->
                                <div class="mt-6 flex items-center justify-center gap-x-2">
                                    <span v-for="(step, index) in steps" :key="index"
                                        class="h-2 rounded-full transition-all"
                                        :class="index === state.stepIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-300'" />
                                </div>

                                <div class="mt-6 flex gap-x-2 justify-center lg:justify-end">
                                    <FormButton v-if="state.stepIndex > 0" buttonStyle="cancel" class="w-fit px-6"
                                        @click="state.stepIndex--">
                                        {{ $t('back') }}
                                    </FormButton>
                                    <FormButton v-if="state.stepIndex < steps.length - 1" buttonStyle="primary"
                                        class="w-fit px-6" @click="state.stepIndex++">
                                        {{ $t('next') }}
                                    </FormButton>
                                    <FormButton v-else buttonStyle="primary" class="w-fit px-6" @click="close">
                                        {{ $t('appTours.getStarted') }}
                                    </FormButton>
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
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useAppTours } from '@/composables/useAppTours'

const props = defineProps({
    appKey: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['close'])

const { getTour } = useAppTours()

const state = reactive({
    stepIndex: 0,
})

const steps = computed(() => getTour(props.appKey)?.steps ?? [])
const currentStep = computed(() => steps.value[state.stepIndex])
const isOpen = computed(() => steps.value.length > 0)

watch(() => props.appKey, () => {
    state.stepIndex = 0
})

function close() {
    emit('close')
}
</script>
