import { defineStore } from 'pinia'

export const useCitizenJournalStore = defineStore('citizenJournalStore',
    {
        persist: true,
        state: () => ({
            filterDataBy: '',
            filterView: 'Standard view',
            sortDataBy: '',
        }),
        actions: {
            setFilterDataBy(filter) {
                this.filterDataBy = filter
            },
            setFilterView(view) {
                this.filterView = view
            },
            setSortDataBy(sorting) {
                this.sortDataBy = sorting
            },
            resetFilterDataBy() {
                this.filterDataBy = ''
            },
            resetFilterView() {
                this.filterView = 'Standard view'
            },
            resetSortDataBy() {
                this.sortDataBy = ''
            },
        },
        getters: {
            getFilterDataBy: (state) => state.filterDataBy,
            getFilterView: (state) => state.filterView,
            getSortDataBy: (state) => state.sortDataBy,
        },
    },
)
