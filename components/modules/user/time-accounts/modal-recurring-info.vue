<template>
    <div>
        <Modal size="sm" :title="$t('timeAccounts.form.isRecurring')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <p class="text-sm">{{ $t('timeAccounts.form.recurringInfo') }}</p>
                    <div class="mt-5 flex justify-end">
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
