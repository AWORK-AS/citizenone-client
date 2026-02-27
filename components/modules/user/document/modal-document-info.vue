<template>
    <div>
        <Modal size="sm" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div>
                        <ul class="space-y-3">
                            <li>
                                <p class="text-sm">{{ $t(`drive.${props.variant}.info-drive-1`) }}</p>
                            </li>
                            <li>
                                <p class="text-sm">{{ $t(`drive.${props.variant}.info-drive-2`) }}</p>
                            </li>
                            <li>
                                <p class="text-sm">{{ $t(`drive.${props.variant}.info-drive-3`) }}</p>
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
    variant: {
        type: String,
        required: true,
    }
})
const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}
</script>