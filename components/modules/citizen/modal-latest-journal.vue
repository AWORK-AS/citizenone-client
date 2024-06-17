<template>
    <div>
        <Modal size="sm" :title="$t('citizens.note.latestJournalEntry')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div v-if="props.selectedCitizen?.citizen_journal" class="space-y-1.5">
                        <h3 class="text-md font-semibold">
                            {{ props.selectedCitizen?.citizen_journal?.title }}
                        </h3>
                        <p class="text-muted-400">
                            <span>{{ props.selectedCitizen?.citizen_journal?.content }}</span>
                        </p>
                        <p class="text-xs text-muted-400">
                            <span>{{ formatDateToReadable(props.selectedCitizen?.citizen_journal?.date) }}</span>
                        </p>
                    </div>
                    <p v-else>
                        {{ $t('citizens.note.noJournalToDisplay') }}
                    </p>
                </div>
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
import moment from 'moment'

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

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('LL')
}
</script>