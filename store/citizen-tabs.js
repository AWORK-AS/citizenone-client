import { defineStore } from 'pinia'

export const useCitizenTabsStore = defineStore('citizenTabsStore',
    {
        persist: true,
        state: () => ({
            citizenTabsFilter: {
                showJournals: true,
                showMedicineCard: true,
                showPlansAndGoals: true,
                showHealth: true,
                showDocuments: true,
                showAttendance: true,
                showCalendar: true,
                showEconomy: true,
                showContacts: true,
            },
        }),
        actions: {
            setCitizenTabsFilterShowJournals(flag) {
                this.citizenTabsFilter.showJournals = flag
            },
            setCitizenTabsFilterShowMedicineCard(flag) {
                this.citizenTabsFilter.showMedicineCard = flag
            },
            setCitizenTabsFilterShowPlansAndGoals(flag) {
                this.citizenTabsFilter.showPlansAndGoals = flag
            },
            setCitizenTabsFilterShowHealth(flag) {
                this.citizenTabsFilter.showHealth = flag
            },
            setCitizenTabsFilterShowDocuments(flag) {
                this.citizenTabsFilter.showDocuments = flag
            },
            setCitizenTabsFilterShowAttendance(flag) {
                this.citizenTabsFilter.showAttendance = flag
            },
            setCitizenTabsFilterShowCalendar(flag) {
                this.citizenTabsFilter.showCalendar = flag
            },
            setCitizenTabsFilterShowEconomy(flag) {
                this.citizenTabsFilter.showEconomy = flag
            },
            setCitizenTabsFilterShowContacts(flag) {
                this.citizenTabsFilter.showContacts = flag
            },
        },
        getters: {
            getCitizenTabsFilter: (state) => state.citizenTabsFilter,
        },
    },
)
