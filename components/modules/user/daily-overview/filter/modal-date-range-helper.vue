<template>
    <div>
        <Modal size="xs" :title="`${$t('overview.filter.dateRangeTitle')}`" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <p class="text-sm">
                    {{ $t('overview.filter.dateRangeDescription') }}.
                </p>
                <div class="mt-5 flex gap-x-3 justify-end">
                    <FormButton buttonStyle="cancel" @click="closeModal" class="rounded-md">
                        {{ $t('close') }}
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

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}
</script>
