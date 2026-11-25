import { defineStore } from 'pinia'

export const useCalendarStore = defineStore('calendarStore',
    {
        persist: true,
        state: () => ({
            calendarView: 'default',
            filterView: 'default',
            // Roadmap #499: the "Enhed" filter.
            unitUuids: [],
        }),
        actions: {
            setCalendarView(view) {
                this.calendarView = view
            },
            setFilterView(view) {
                this.filterView = view
            },
            resetCalendarView() {
                this.calendarView = 'default'
            },
            resetFilterView() {
                this.filterView = 'default'
            },
            setUnitUuids(uuids) {
                this.unitUuids = Array.isArray(uuids) ? uuids : []
            },
        },
        getters: {
            getCalendarView: (state) => state.calendarView,
            getFilterView: (state) => state.filterView,
            getUnitUuids: (state) => state.unitUuids ?? [],
        },
    },
)
