<template>
    <div>
        <Modal size="sm" :title="$t('dailyOverview.filter.chooseWhatToDisplay')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setViewAllShowCitizenDailyEvents(!dailyOverviewStore.getViewAllFilter.showCitizenDailyEvents)">
                        <FormCheckbox :value="dailyOverviewStore.getViewAllFilter.showCitizenDailyEvents" />
                        {{ $t('dailyOverview.filter.items.citizensDailyEvents') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setViewAllShowCitizenMedicineOverview(!dailyOverviewStore.getViewAllFilter.showCitizenMedicineOverview)">
                        <FormCheckbox :value="dailyOverviewStore.getViewAllFilter.showCitizenMedicineOverview" />
                        {{ $t('dailyOverview.filter.items.dailyMedicineOverview') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setViewAllShowLatestJournalNotes(!dailyOverviewStore.getViewAllFilter.showLatestJournalNotes)">
                        <FormCheckbox :value="dailyOverviewStore.getViewAllFilter.showLatestJournalNotes" />
                        {{ $t('dailyOverview.filter.items.latestJournal') }}
                    </div>
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
import { useDailyOverviewStore } from '@/store/daily-overview'
import { useCustomPagesStore } from '@/store/custom-pages'

const dailyOverviewStore = useDailyOverviewStore()
const customPagesStore = useCustomPagesStore() as any

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