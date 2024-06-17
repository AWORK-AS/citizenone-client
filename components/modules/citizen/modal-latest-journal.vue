<template>
    <div>
        <Modal size="sm" :title="$t('citizens.note.citizenNote')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <p v-if="props.selectedCitizen?.note" v-html="props.selectedCitizen?.note"></p>
                <p v-else>
                    {{ $t('citizens.note.noJournalToDisplay') }}
                </p>
                <div class="mt-5 flex gap-x-3 justify-end">
                    <FormButton buttonStyle="primary" @click="closeModal" class="rounded-md">
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
    selectedCitizen: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

function formatAmount(amount: any) {
    return 'DKK' + numberWithCommas(parseFloat(amount).toFixed(2))
}

function numberWithCommas(number: string) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
</script>