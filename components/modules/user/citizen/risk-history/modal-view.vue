<template>
    <div>
        <Modal size="4xl" :title="$t('citizens.riskHistory.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <ModulesUserCitizenRiskHistoryChart v-if="props.citizenUuid" :citizenUuid="props.citizenUuid" />
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
    citizenUuid: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}
</script>
