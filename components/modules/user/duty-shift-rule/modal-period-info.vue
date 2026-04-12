<template>
    <div>
        <Modal size="md" :title="$t('dutyShiftRules.form.periodFilter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <div class="flex gap-3">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:arrows-counter-clockwise" class="w-4 h-4 text-primary" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm font-semibold text-gray-800">{{ $t('dutyShiftRules.form.periodDays') }}
                            </p>
                            <p class="text-sm text-gray-600">{{ $t('dutyShiftRules.form.periodDaysBackInfo1') }}</p>
                            <p class="text-sm text-gray-600">{{ $t('dutyShiftRules.form.periodDaysBackInfo2') }}</p>
                        </div>
                    </div>

                    <div class="border-t border-gray-100" />

                    <div class="flex gap-3">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:calendar-blank" class="w-4 h-4 text-primary" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm font-semibold text-gray-800">{{ $t('dutyShiftRules.form.anchorDate') }}
                            </p>
                            <p class="text-sm text-gray-600">{{ $t('dutyShiftRules.form.periodInfoAnchorDesc') }}</p>
                            <p class="text-xs text-gray-400 italic">{{ $t('dutyShiftRules.form.anchorDateCheckboxHint')
                                }}</p>
                        </div>
                    </div>

                    <div class="border-t border-gray-100" />

                    <div class="flex gap-3">
                        <div
                            class="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Icon name="ph:info" class="w-4 h-4 text-secondary" />
                        </div>
                        <div class="space-y-2">
                            <p class="text-sm font-semibold text-gray-800">{{
                                $t('dutyShiftRules.form.periodInfoHowTitle') }}</p>
                            <p class="text-sm text-gray-600">{{ $t('dutyShiftRules.form.periodInfoHowDesc') }}</p>
                            <div class="rounded-md bg-gray-100 px-3 py-2 font-mono text-xs text-gray-700">
                                {{ $t('dutyShiftRules.form.periodInfoFormula') }}
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end">
                        <FormButton buttonStyle="cancel" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}
</script>
