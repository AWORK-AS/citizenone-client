import { defineStore } from 'pinia'

export const useCitizenJournalStore = defineStore('citizenJournalStore',
    {
        persist: true,
        state: () => ({
            filterView: 'Standard view',
        }),
        actions: {
            setFilterView(view) {
                this.filterView = view
            },
            resetFilterView() {
                this.filterView = 'Standard view'
            },
        },
        getters: {
            getFilterView: (state) => state.filterView,
        },
    },
)
