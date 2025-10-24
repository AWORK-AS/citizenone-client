import { defineStore } from 'pinia'

export const useCalendarStore = defineStore('calendarStore',
    {
        persist: true,
        state: () => ({
            calendarView: 'default',
            filterView: 'default'
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
        },
        getters: {
            getCalendarView: (state) => state.calendarView,
            getFilterView: (state) => state.filterView,
        },
    },
)
