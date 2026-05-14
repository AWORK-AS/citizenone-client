<template>
    <div>
        <Modal size="xs" :title="$t('events.journalNotePrompt.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <p class="text-sm text-gray-700">
                    {{ $t('events.journalNotePrompt.message') }}
                </p>
                <div class="mt-5 flex gap-x-3">
                    <FormButton buttonStyle="cancel" @click="handleNo" class="w-full">
                        {{ $t('no') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="handleYes" class="w-full">
                        {{ $t('yes') }}
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
})

const emit = defineEmits(['close', 'yes', 'no'])

function closeModal() {
    emit('close')
}

function handleYes() {
    emit('yes')
    emit('close')
}

function handleNo() {
    emit('no')
    emit('close')
}
</script>
