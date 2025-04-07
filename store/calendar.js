import { defineStore } from 'pinia'

export const useCalendarStore = defineStore('calendarStore',
    {
        persist: true,
        state: () => ({
            calendarView: 'default',
        }),
        actions: {
            setCalendarView(view) {
                this.calendarView = view
            },
            resetCalendarView() {
                this.calendarView = 'default'
            },
        },
        getters: {
            getCalendarView: (state) => state.calendarView,
        },
    },
)
