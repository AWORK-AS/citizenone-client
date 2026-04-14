<template>
    <div>
        <Modal size="md" :title="$t('dutyShiftRules.form.scopeConditions')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <div class="flex gap-3">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:funnel" class="w-4 h-4 text-primary" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm font-semibold text-gray-800">{{
                                $t('dutyShiftRules.form.scopeConditionsInfoWhatTitle') }}</p>
                            <p class="text-sm text-gray-600">{{ $t('dutyShiftRules.form.scopeConditionsInfoWhatDesc') }}
                            </p>
                        </div>
                    </div>

                    <div class="border-t border-gray-100" />

                    <div class="flex gap-3">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:intersect" class="w-4 h-4 text-primary" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm font-semibold text-gray-800">{{
                                $t('dutyShiftRules.form.scopeConditionsInfoAndTitle') }}</p>
                            <p class="text-sm text-gray-600">{{ $t('dutyShiftRules.form.scopeConditionsInfoAndDesc') }}
                            </p>
                        </div>
                    </div>

                    <div class="border-t border-gray-100" />

                    <div class="flex gap-3">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:unite" class="w-4 h-4 text-primary" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm font-semibold text-gray-800">{{
                                $t('dutyShiftRules.form.scopeConditionsInfoOrTitle') }}</p>
                            <p class="text-sm text-gray-600">{{ $t('dutyShiftRules.form.scopeConditionsInfoOrDesc') }}
                            </p>
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
