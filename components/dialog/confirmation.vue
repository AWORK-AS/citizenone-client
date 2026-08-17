<template>
    <div>
        <Modal size="xs" :title="props.title ? props.title : $t('confirmation')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <p>
                    {{ props.message }}
                </p>
                <slot name="extra" />
                <div class="mt-5 flex gap-x-3">
                    <FormButton buttonStyle="cancel" @click="closeModal" class="w-full">
                        {{ props.cancelLabel ?? $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="handleConfirmation" class="w-full">
                        {{ props.confirmLabel ?? $t('confirm') }}
                    </FormButton>
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
    message: {
        type: String,
        required: false,
    },
    title: {
        type: String,
        required: false,
    },
    // Optional overrides for the two footer buttons. Left unset, both fall
    // back to the plain cancel/confirm wording every other caller relies on.
    cancelLabel: {
        type: String,
        required: false,
    },
    confirmLabel: {
        type: String,
        required: false,
    },
})

const emit = defineEmits(['close', 'confirm'])

function closeModal() {
    emit('close')
}

function handleConfirmation() {
    emit('confirm')
    emit('close')
}
</script>