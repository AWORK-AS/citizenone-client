<template>
    <div>
        <Modal size="sm" :title="$t('dailyOverview.filter.chooseWhatToDisplay')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowCitizensAdmissionAndDischarged(!dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged)">
                        <FormCheckbox
                            :value="dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged" />
                        {{ $t('dailyOverview.filter.items.citizensAdmissionAndDischarged') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowRiskAssessment(!dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment" />
                        {{ customPagesStore.getCustomPagesName?.riskAssessment }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowGender(!dailyOverviewStore.getDailyOverviewFilter.showGender)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showGender" />
                        {{ $t('dailyOverview.filter.items.gender') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowCitizensOrigin(!dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin" />
                        {{ $t('dailyOverview.filter.items.citizensOrigin') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowCitizenAdditictions(!dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions" />
                        {{ $t('dailyOverview.filter.items.citizensAddictions') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowCitizensDiagnoses(!dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses" />
                        {{ $t('dailyOverview.filter.items.citizensDiagnoses') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowMyDailyEvents(!dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents" />
                        {{ $t('dailyOverview.filter.items.myDailyEvents') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowCitizensDailyEvents(!dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents" />
                        {{ $t('dailyOverview.filter.items.citizensDailyEvents') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowLatestJournal(!dailyOverviewStore.getDailyOverviewFilter.showLatestJournal)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showLatestJournal" />
                        {{ $t('dailyOverview.filter.items.latestJournal') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowJournalScoreStatistics(!dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics" />
                        {{ $t('dailyOverview.filter.items.journalStatistics') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowDailyMedicineOverview(!dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview" />
                        {{ $t('dailyOverview.filter.items.dailyMedicineOverview') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowBulletBoard(!dailyOverviewStore.getDailyOverviewFilter.showBulletBoard)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showBulletBoard" />
                        {{ $t('dailyOverview.filter.items.bulletBoard') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowGoalsScoreStatistics(!dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics" />
                        {{ $t('dailyOverview.filter.items.goalsStatistics') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowSubgoalsScoreStatistics(!dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics" />
                        {{ $t('dailyOverview.filter.items.subgoalsStatistics') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowStatusesScoreStatistics(!dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics" />
                        {{ $t('dailyOverview.filter.items.statusesStatistics') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowIncidentStatistics(!dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics" />
                        {{ $t('dailyOverview.filter.items.incidentStatistics') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowUseOfForceStatistics(!dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics)">
                        <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics" />
                        {{ $t('dailyOverview.filter.items.useOfForceStatistics') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer text-sm"
                        @click="dailyOverviewStore.setDailyOverviewFilterShowMedicineDeviationStatistics(!dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics)">
                        <FormCheckbox
                            :value="dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics" />
                        {{ $t('dailyOverview.filter.items.medicineDeviationStatistics') }}
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