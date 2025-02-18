import { defineStore } from 'pinia'

export const useCitizenPlansAndGoalsStore = defineStore('citizenPlansAndGoalsStore',
    {
        persist: true,
        state: () => ({
            filterView: 'Plans and goals',
        }),
        actions: {
            setFilterView(view) {
                this.filterView = view
            },
            resetFilterView() {
                this.filterView = 'Plans and goals'
            },
        },
        getters: {
            getFilterView: (state) => state.filterView,
        },
    },
)
