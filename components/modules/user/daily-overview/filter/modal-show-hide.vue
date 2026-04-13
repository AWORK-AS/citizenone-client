<template>
    <div>
        <Modal size="sm" :title="$t('overview.filter.chooseWhatToDisplay')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowCitizensDailyEvents()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents" />
                            {{ $t('overview.filter.items.citizensEvents') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowLatestJournal()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showLatestJournal" />
                            {{ $t('overview.filter.items.latestJournal') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowDailyMedicineOverview()">
                            <FormCheckbox
                                :value="dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview" />
                            {{ $t('overview.filter.items.medicationOverview') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowTreatments()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showTreatments" />
                            {{ $t('overview.filter.items.treatments') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowMyDailyEvents()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents" />
                            {{ $t('overview.filter.items.calendar') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowBulletBoard()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showBulletBoard" />
                            {{ $t('overview.filter.items.bulletBoard') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowCitizensAdmissionAndDischarged()">
                            <FormCheckbox
                                :value="dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged" />
                            {{ $t('overview.filter.items.citizensAdmissionAndDischarged') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowCitizensOrigin()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin" />
                            {{ $t('overview.filter.items.citizensOrigin') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowCitizenAdditictions()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions" />
                            {{ $t('overview.filter.items.citizensAddictions') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowCitizensDiagnoses()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses" />
                            {{ $t('overview.filter.items.citizensDiagnoses') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowRiskAssessment()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment" />
                            {{ customPagesStore.getCustomPagesName?.riskAssessment }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowGender()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showGender" />
                            {{ $t('overview.filter.items.gender') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowStatusesScoreStatistics()">
                            <FormCheckbox
                                :value="dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics" />
                            {{ $t('overview.filter.items.statusesStatistics') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowGoalsScoreStatistics()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics" />
                            {{ $t('overview.filter.items.goalsStatistics') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowIncidentStatistics()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics" />
                            {{ $t('overview.filter.items.incidentStatistics') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowMedicineDeviationStatistics()">
                            <FormCheckbox
                                :value="dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics" />
                            {{ $t('overview.filter.items.medicineDeviationStatistics') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowJournalScoreStatistics()">
                            <FormCheckbox
                                :value="dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics" />
                            {{ $t('overview.filter.items.journalStatistics') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowSubgoalsScoreStatistics()">
                            <FormCheckbox
                                :value="dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics" />
                            {{ $t('overview.filter.items.subgoalsStatistics') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowUseOfForceStatistics()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics" />
                            {{ $t('overview.filter.items.useOfForceStatistics') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowScheduleSlots()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots" />
                            {{ $t('overview.filter.items.scheduleSlots') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowPlansAndGoals()">
                            <FormCheckbox :value="dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals" />
                            {{ $t('overview.filter.items.plansAndGoals') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setDailyOverviewFilterShowCitizensFollowUpReminders()">
                            <FormCheckbox
                                :value="dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders" />
                            {{ $t('overview.filter.items.citizensFollowUpReminders') }}
                        </div>
                    </div>
                    <div class="mt-5 flex gap-x-3 justify-end">
                        <FormButton buttonStyle="primary" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useDailyOverviewStore } from '@/store/daily-overview'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const dailyOverviewStore = useDailyOverviewStore()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

watch(() => userStore.getUser, (user: any) => {
    if (Object.keys(user)?.length > 0) {
        dailyOverviewStore.setDailyOverviewFilterShowBulletBoard(JSON.parse(user?.daily_overview_filter)?.showBulletBoard)
        dailyOverviewStore.setDailyOverviewFilterShowCitizenAdditictions(JSON.parse(user?.daily_overview_filter)?.showCitizensAddictions)
        dailyOverviewStore.setDailyOverviewFilterShowCitizensAdmissionAndDischarged(JSON.parse(user?.daily_overview_filter)?.showCitizensAdmissionAndDischarged)
        dailyOverviewStore.setDailyOverviewFilterShowCitizensDailyEvents(JSON.parse(user?.daily_overview_filter)?.showCitizensDailyEvents)
        dailyOverviewStore.setDailyOverviewFilterShowCitizensDiagnoses(JSON.parse(user?.daily_overview_filter)?.showCitizensDiagnoses)
        dailyOverviewStore.setDailyOverviewFilterShowCitizensFollowUpReminders(JSON.parse(user?.daily_overview_filter)?.showCitizensFollowUpReminders)
        dailyOverviewStore.setDailyOverviewFilterShowCitizensOrigin(JSON.parse(user?.daily_overview_filter)?.showCitizensOrigin)
        dailyOverviewStore.setDailyOverviewFilterShowDailyMedicineOverview(JSON.parse(user?.daily_overview_filter)?.showDailyMedicineOverview)
        dailyOverviewStore.setDailyOverviewFilterShowGender(JSON.parse(user?.daily_overview_filter)?.showGender)
        dailyOverviewStore.setDailyOverviewFilterShowLatestJournal(JSON.parse(user?.daily_overview_filter)?.showLatestJournal)
        dailyOverviewStore.setDailyOverviewFilterShowJournalScoreStatistics(JSON.parse(user?.daily_overview_filter)?.showJournalScoreStatistics)
        dailyOverviewStore.setDailyOverviewFilterShowMyDailyEvents(JSON.parse(user?.daily_overview_filter)?.showMyDailyEvents)
        dailyOverviewStore.setDailyOverviewFilterShowRiskAssessment(JSON.parse(user?.daily_overview_filter)?.showRiskAssessment)
        dailyOverviewStore.setDailyOverviewFilterShowGoalsScoreStatistics(JSON.parse(user?.daily_overview_filter)?.showGoalsScoreStatistics)
        dailyOverviewStore.setDailyOverviewFilterShowSubgoalsScoreStatistics(JSON.parse(user?.daily_overview_filter)?.showStatusesScoreStatistics)
        dailyOverviewStore.setDailyOverviewFilterShowStatusesScoreStatistics(JSON.parse(user?.daily_overview_filter)?.showSubgoalsScoreStatistics)
        dailyOverviewStore.setDailyOverviewFilterShowIncidentStatistics(JSON.parse(user?.daily_overview_filter)?.showIncidentStatistics)
        dailyOverviewStore.setDailyOverviewFilterShowUseOfForceStatistics(JSON.parse(user?.daily_overview_filter)?.showUseOfForceStatistics)
        dailyOverviewStore.setDailyOverviewFilterShowMedicineDeviationStatistics(JSON.parse(user?.daily_overview_filter)?.showMedicineDeviationStatistics)
        dailyOverviewStore.setDailyOverviewFilterShowTreatments(JSON.parse(user?.daily_overview_filter)?.showTreatments)
        dailyOverviewStore.setDailyOverviewFilterShowScheduleSlots(JSON.parse(user?.daily_overview_filter)?.showScheduleSlots)
        dailyOverviewStore.setDailyOverviewFilterShowPlansAndGoals(JSON.parse(user?.daily_overview_filter)?.showPlansAndGoals)
    }
})

function closeModal() {
    emit('close')
}

async function setDailyOverviewFilterShowBulletBoard() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: !dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowBulletBoard(!dailyOverviewStore.getDailyOverviewFilter.showBulletBoard)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowCitizenAdditictions() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: !dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowCitizenAdditictions(!dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowCitizensAdmissionAndDischarged() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: !dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowCitizensAdmissionAndDischarged(!dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowCitizensDailyEvents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: !dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowCitizensDailyEvents(!dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowCitizensDiagnoses() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: !dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowCitizensDiagnoses(!dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowCitizensOrigin() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensOrigin: !dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowCitizensOrigin(!dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowDailyMedicineOverview() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: !dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowDailyMedicineOverview(!dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowGender() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: !dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowGender(!dailyOverviewStore.getDailyOverviewFilter.showGender)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowLatestJournal() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: !dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowLatestJournal(!dailyOverviewStore.getDailyOverviewFilter.showLatestJournal)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowJournalScoreStatistics() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: !dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowJournalScoreStatistics(!dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowMyDailyEvents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: !dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowMyDailyEvents(!dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowRiskAssessment() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: !dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowRiskAssessment(!dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowGoalsScoreStatistics() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: !dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowGoalsScoreStatistics(!dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowSubgoalsScoreStatistics() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: !dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowSubgoalsScoreStatistics(!dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowStatusesScoreStatistics() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: !dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowStatusesScoreStatistics(!dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowIncidentStatistics() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: !dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowIncidentStatistics(!dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowUseOfForceStatistics() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: !dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowUseOfForceStatistics(!dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowMedicineDeviationStatistics() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: !dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowMedicineDeviationStatistics(!dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowTreatments() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: !dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowTreatments(!dailyOverviewStore.getDailyOverviewFilter.showTreatments)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowScheduleSlots() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: !dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowScheduleSlots(!dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowPlansAndGoals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: !dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowPlansAndGoals(!dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setDailyOverviewFilterShowCitizensFollowUpReminders() {
    state.error = {}
    state.isPageLoading = true
    try {
        const daily_overview_filter = {
            showBulletBoard: dailyOverviewStore.getDailyOverviewFilter.showBulletBoard,
            showCitizensAddictions: dailyOverviewStore.getDailyOverviewFilter.showCitizensAddictions,
            showCitizensAdmissionAndDischarged: dailyOverviewStore.getDailyOverviewFilter.showCitizensAdmissionAndDischarged,
            showCitizensDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showCitizensDailyEvents,
            showCitizensDiagnoses: dailyOverviewStore.getDailyOverviewFilter.showCitizensDiagnoses,
            showCitizensFollowUpReminders: !dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders,
            showCitizensOrigin: dailyOverviewStore.getDailyOverviewFilter.showCitizensOrigin,
            showDailyMedicineOverview: dailyOverviewStore.getDailyOverviewFilter.showDailyMedicineOverview,
            showGender: dailyOverviewStore.getDailyOverviewFilter.showGender,
            showGoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showGoalsScoreStatistics,
            showLatestJournal: dailyOverviewStore.getDailyOverviewFilter.showLatestJournal,
            showJournalScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showJournalScoreStatistics,
            showMyDailyEvents: dailyOverviewStore.getDailyOverviewFilter.showMyDailyEvents,
            showRiskAssessment: dailyOverviewStore.getDailyOverviewFilter.showRiskAssessment,
            showStatusesScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showStatusesScoreStatistics,
            showSubgoalsScoreStatistics: dailyOverviewStore.getDailyOverviewFilter.showSubgoalsScoreStatistics,
            showIncidentStatistics: dailyOverviewStore.getDailyOverviewFilter.showIncidentStatistics,
            showUseOfForceStatistics: dailyOverviewStore.getDailyOverviewFilter.showUseOfForceStatistics,
            showMedicineDeviationStatistics: dailyOverviewStore.getDailyOverviewFilter.showMedicineDeviationStatistics,
            showTreatments: dailyOverviewStore.getDailyOverviewFilter.showTreatments,
            showScheduleSlots: dailyOverviewStore.getDailyOverviewFilter.showScheduleSlots,
            showPlansAndGoals: dailyOverviewStore.getDailyOverviewFilter.showPlansAndGoals,
        }
        const params = {
            daily_overview_filter: daily_overview_filter
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterShowCitizensFollowUpReminders(!dailyOverviewStore.getDailyOverviewFilter.showCitizensFollowUpReminders)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>