<template>
    <div>
        <Modal size="xs" :title="$t('confirmation')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <p>
                        {{ $t('drive.alert.modifyDocumentLayoutWarning') }}.
                    </p>
                    <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton buttonStyle="cancel" class="rounded-md" @click="closeModal">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" class="rounded-md"
                            @click="state.modal.isEditDocumentFileOpen = true">
                            {{ $t('confirm') }}
                        </FormButton>
                    </div>
                </div>
                <ModulesUserDocumentDocsFileModalEdit :isModalOpen="state.modal.isEditDocumentFileOpen"
                    :selectedDocument="props.selectedDocument" @close="state.modal.isEditDocumentFileOpen = false"
                    @refreshDocuments="$emit('fetchDocuments')" />
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
    selectedDocument: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'confirm', 'fetchDocuments'])

const state = reactive({
    modal: {
        isEditDocumentFileOpen: false,
    }
})

watch(() => state.modal.isEditDocumentFileOpen, (isOpen) => {
    if (!isOpen) {
        closeModal()
    }
})

function closeModal() {
    emit('close')
}

function confirm() {
    emit('confirm')
}
</script>