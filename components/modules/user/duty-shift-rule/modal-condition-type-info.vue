<template>
    <div>
        <Modal size="md" :title="$t('dutyShiftRules.form.conditionType')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <div class="flex gap-3">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:hash" class="w-4 h-4 text-primary" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm font-semibold text-gray-800">{{ $t('dutyShiftRules.form.conditionTypes.count') }}</p>
                            <p class="text-sm text-gray-600">{{ $t('dutyShiftRules.form.conditionTypeInfoCountDesc') }}</p>
                        </div>
                    </div>

                    <div class="border-t border-gray-100" />

                    <div class="flex gap-3">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:arrows-merge" class="w-4 h-4 text-primary" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm font-semibold text-gray-800">{{ $t('dutyShiftRules.form.conditionTypes.consecutive') }}</p>
                            <p class="text-sm text-gray-600">{{ $t('dutyShiftRules.form.conditionTypeInfoConsecutiveDesc') }}</p>
                        </div>
                    </div>

                    <div class="border-t border-gray-100" />

                    <div class="flex gap-3">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Icon name="ph:info" class="w-4 h-4 text-secondary" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm font-semibold text-gray-800">{{ $t('dutyShiftRules.form.conditionTypeInfoThresholdTitle') }}</p>
                            <p class="text-sm text-gray-600">{{ $t('dutyShiftRules.form.conditionTypeInfoThresholdDesc') }}</p>
                        </div>
                    </div>

                    <div class="flex justify-end">
                        <FormButton buttonStyle="cancel" @click="closeModal" class="rounded-md">
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
