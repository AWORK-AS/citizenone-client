import { defineStore } from 'pinia'

export const useDailyOverviewStore = defineStore('dailyOverviewStore',
    {
        persist: true,
        state: () => ({
            filter: {
                showCitizenDailyEvents: true,
                showCitizenMedicineOverview: true,
                showLatestJournalNotes: true,
            },
        }),
        actions: {
            setShowCitizenDailyEvents(flag) {
                this.filter.showCitizenDailyEvents = flag
            },
            setShowCitizenMedicineOverview(flag) {
                this.filter.showCitizenMedicineOverview = flag
            },
            setShowLatestJournalNotes(flag) {
                this.filter.showLatestJournalNotes = flag
            },
            resetShowCitizenDailyEvents() {
                this.filter.showCitizenDailyEvents = false
            },
            resetShowCitizenMedicineOverview() {
                this.filter.showCitizenMedicineOverview = false
            },
            resetShowLatestJournalNotes() {
                this.filter.showLatestJournalNotes = false
            },
        },
        getters: {
            getFilter: (state) => state.filter,
        },
    },
)
