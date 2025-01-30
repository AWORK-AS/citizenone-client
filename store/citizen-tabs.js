import { defineStore } from 'pinia'

export const useCitizenTabsStore = defineStore('citizenTabsStore',
    {
        persist: true,
        state: () => ({
            citizenTabsFilter: {
                showJournals: true
            },
        }),
        actions: {
            setCitizenTabsFilterShowJournals(flag) {
                this.citizenTabsFilter.showJournals = flag
            },
        },
        getters: {
            getCitizenTabsFilter: (state) => state.citizenTabsFilter,
        },
    },
)
