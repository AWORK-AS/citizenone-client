<template>
    <div>
        <Modal size="4xl" :title="$t('citizens.medicineJournals.synchronizeWithFMK')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <iframe :src="iframeSrc" width="100%" height="600" frameborder="0"></iframe>
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
const iframeSrc = ref('https://www.google.com/')

function closeModal() {
    emit('close')
}
</script>