import { defineStore } from 'pinia'

export const useCitizenPlansAndGoalsStore = defineStore('citizenPlansAndGoalsStore',
    {
        persist: true,
        state: () => ({
            filterIsCompleted: false,
            filterView: 'Plans and goals',
        }),
        actions: {
            setFilterIsCompleted(status) {
                this.filterIsCompleted = status
            },
            setFilterView(view) {
                this.filterView = view
            },
            resetFilterIsCompleted() {
                this.filterIsCompleted = false
            },
            resetFilterView() {
                this.filterView = 'Plans and goals'
            },
        },
        getters: {
            getFilterIsCompleted: (state) => state.filterIsCompleted,
            getFilterView: (state) => state.filterView,
        },
    },
)
