import { defineStore } from 'pinia'

export const useDailyOverviewStore = defineStore('dailyOverviewStore',
    {
        persist: true,
        state: () => ({
            dailyOverviewFilter: {
                showBulletBoard: false,
                showCitizensAddictions: false,
                showCitizensAdmissionAndDischarged: false,
                showCitizensDailyEvents: false,
                showCitizensDiagnoses: false,
                showCitizensFollowUpReminders: false,
                showCitizensOrigin: false,
                showDailyMedicineOverview: false,
                showIncidentStatistics: false,
                showGender: false,
                showGoalsScoreStatistics: false,
                showJournalScoreStatistics: false,
                showLatestJournal: false,
                showMedicineDeviationStatistics: false,
                showMyDailyEvents: false,
                showPlansAndGoals: false,
                showRiskAssessment: false,
                showScheduleSlots: false,
                showStatusesScoreStatistics: false,
                showSubgoalsScoreStatistics: false,
                showTreatments: false,
                showUseOfForceStatistics: false,
            },
            viewAllFilter: {
                showCitizenDailyEvents: true,
                showCitizenMedicineOverview: true,
                showLatestJournalNotes: true,
            },
        }),
        actions: {
            setDailyOverviewFilterShowBulletBoard(flag) {
                this.dailyOverviewFilter.showBulletBoard = flag
            },
            setDailyOverviewFilterShowCitizenAdditictions(flag) {
                this.dailyOverviewFilter.showCitizensAddictions = flag
            },
            setDailyOverviewFilterShowCitizensAdmissionAndDischarged(flag) {
                this.dailyOverviewFilter.showCitizensAdmissionAndDischarged = flag
            },
            setDailyOverviewFilterShowCitizensDailyEvents(flag) {
                this.dailyOverviewFilter.showCitizensDailyEvents = flag
            },
            setDailyOverviewFilterShowCitizensDiagnoses(flag) {
                this.dailyOverviewFilter.showCitizensDiagnoses = flag
            },
            setDailyOverviewFilterShowCitizensFollowUpReminders(flag) {
                this.dailyOverviewFilter.showCitizensFollowUpReminders = flag
            },
            setDailyOverviewFilterShowCitizensOrigin(flag) {
                this.dailyOverviewFilter.showCitizensOrigin = flag
            },
            setDailyOverviewFilterShowDailyMedicineOverview(flag) {
                this.dailyOverviewFilter.showDailyMedicineOverview = flag
            },
            setDailyOverviewFilterShowGender(flag) {
                this.dailyOverviewFilter.showGender = flag
            },
            setDailyOverviewFilterShowLatestJournal(flag) {
                this.dailyOverviewFilter.showLatestJournal = flag
            },
            setDailyOverviewFilterShowJournalScoreStatistics(flag) {
                this.dailyOverviewFilter.showJournalScoreStatistics = flag
            },
            setDailyOverviewFilterShowMyDailyEvents(flag) {
                this.dailyOverviewFilter.showMyDailyEvents = flag
            },
            setDailyOverviewFilterShowRiskAssessment(flag) {
                this.dailyOverviewFilter.showRiskAssessment = flag
            },
            setDailyOverviewFilterShowGoalsScoreStatistics(flag) {
                this.dailyOverviewFilter.showGoalsScoreStatistics = flag
            },
            setDailyOverviewFilterShowSubgoalsScoreStatistics(flag) {
                this.dailyOverviewFilter.showSubgoalsScoreStatistics = flag
            },
            setDailyOverviewFilterShowStatusesScoreStatistics(flag) {
                this.dailyOverviewFilter.showStatusesScoreStatistics = flag
            },
            setDailyOverviewFilterShowIncidentStatistics(flag) {
                this.dailyOverviewFilter.showIncidentStatistics = flag
            },
            setDailyOverviewFilterShowUseOfForceStatistics(flag) {
                this.dailyOverviewFilter.showUseOfForceStatistics = flag
            },
            setDailyOverviewFilterShowMedicineDeviationStatistics(flag) {
                this.dailyOverviewFilter.showMedicineDeviationStatistics = flag
            },
            setDailyOverviewFilterShowTreatments(flag) {
                this.dailyOverviewFilter.showTreatments = flag
            },
            setDailyOverviewFilterShowScheduleSlots(flag) {
                this.dailyOverviewFilter.showScheduleSlots = flag
            },
            setDailyOverviewFilterShowPlansAndGoals(flag) {
                this.dailyOverviewFilter.showPlansAndGoals = flag
            },
            setViewAllShowCitizenDailyEvents(flag) {
                this.viewAllFilter.showCitizenDailyEvents = flag
            },
            setViewAllShowCitizenMedicineOverview(flag) {
                this.viewAllFilter.showCitizenMedicineOverview = flag
            },
            setViewAllShowLatestJournalNotes(flag) {
                this.viewAllFilter.showLatestJournalNotes = flag
            },
        },
        getters: {
            getDailyOverviewFilter: (state) => state.dailyOverviewFilter,
            getViewAllFilter: (state) => state.viewAllFilter,
        },
    },
)
