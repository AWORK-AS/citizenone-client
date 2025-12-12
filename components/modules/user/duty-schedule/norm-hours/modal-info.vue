<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.normHours.annualNormHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-1">
                    <div class="flex items-center gap-x-1">
                        <ul class="space-y-2 list-disc">
                            <li>
                                <p class="text-sm">{{ $t('dutySchedules.normHours.info1') }}</p>
                            </li>
                            <li>
                                <p class="text-sm">{{ $t('dutySchedules.normHours.info2') }}</p>
                            </li>
                            <li>
                                <p class="text-sm">{{ $t('dutySchedules.normHours.info3') }}</p>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="mt-5 flex justify-end">
                    <FormButton buttonStyle="cancel" @click="closeModal" class="rounded-md">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

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