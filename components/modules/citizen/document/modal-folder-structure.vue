<template>
    <div>
        <Modal size="xl" :title="$t('citizens.documents.folderStructure.folderStructure')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>

            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
})

function closeModal() {
    emit('close')
}
</script>