import { defineStore } from 'pinia'

export const useDailyOverviewStore = defineStore('dailyOverviewStore',
    {
        persist: true,
        state: () => ({
            filter: {
                showCitizenDailyEvents: true,
                showLatestJournalNotes: true
            },
        }),
        actions: {
            setShowCitizenDailyEvents(flag) {
                this.filter.showCitizenDailyEvents = flag
            },
            setShowLatestJournalNotes(flag) {
                this.filter.showLatestJournalNotes = flag
            },
            resetShowCitizenDailyEvents() {
                this.filter.showCitizenDailyEvents = false
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
