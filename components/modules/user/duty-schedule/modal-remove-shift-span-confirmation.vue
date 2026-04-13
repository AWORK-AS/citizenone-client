<template>
    <div>
        <Modal size="xs" :title="props.title ? props.title : $t('confirmation')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <p>
                    {{ $t('dutySchedules.shiftSpan.deleteConfirmMessage') }}
                </p>
                <div class="mt-5 flex gap-x-3">
                    <FormButton buttonStyle="primary" @click="handleSingle" class="w-full">
                        {{ $t('dutySchedules.shiftSpan.onlyShift') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="handleEntire" class="w-full">
                        {{ $t('dutySchedules.shiftSpan.entireShift') }}
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
    title: {
        type: String,
        required: false,
    },
})

const emit = defineEmits(['close', 'confirmSingle', 'confirmEntire'])

function closeModal() {
    emit('close')
}

function handleSingle() {
    emit('confirmSingle')
    emit('close')
}

function handleEntire() {
    emit('confirmEntire')
    emit('close')
}
</script>