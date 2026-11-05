<template>
    <div>
        <Modal size="4xl" :title="$t('citizens.riskHistory.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <ModulesUserCitizenRiskHistoryChart v-if="props.citizenUuid" :citizenUuid="props.citizenUuid" @openNote="openNote" />
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

// A point was clicked: close the modal, then open that note through the
// journals page deep link (also works when we're already on that page).
function openNote(journalUuid: string) {
    closeModal()
    navigateTo(`/citizens/${props.citizenUuid}/journals?open_journal=${encodeURIComponent(journalUuid)}`)
}
</script>
