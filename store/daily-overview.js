import { defineStore } from 'pinia'

export const useDailyOverviewStore = defineStore('dailyOverviewStore',
    {
        persist: true,
        state: () => ({
            dailyOverviewFilter: {
                showBulletBoard: true,
                showCitizensAddictions: true,
                showCitizensAdmissionAndDischarged: true,
                showCitizensDailyEvents: true,
                showCitizensDiagnoses: true,
                showCitizensOrigin: true,
                showDailyMedicineOverview: true,
                showGender: true,
                showGoalsScoreStatistics: true,
                showLatestJournal: true,
                showJournalScoreStatistics: true,
                showMyDailyEvents: true,
                showRiskAssessment: true,
                showStatusesScoreStatistics: true,
                showSubgoalsScoreStatistics: true,
                showIncidentStatistics: true,
                showUseOfForceStatistics: true,
                showMedicineDeviationStatistics: true,
                showTreatments: true,
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
