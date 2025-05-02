<template>
    <div>
        <Modal size="xs" :title="props.title ? props.title : $t('confirmation')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <p>
                    {{ props.message }}
                </p>
                <div class="mt-5 flex gap-x-3">
                    <FormButton @click="closeModal" class="w-full rounded-md">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="handleConfirmation" class="w-full rounded-md">
                        {{ $t('dutySchedules.scheduleSlots.confirmation.requestConfirmButton') }}
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