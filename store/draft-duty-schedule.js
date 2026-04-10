import { defineStore } from 'pinia'

export const useDraftDutyScheduleStore = defineStore('draftDutyScheduleStore',
    {
        persist: true,
        state: () => ({
            showEmployeesWorkingToday: false,
            currentPageLength: 10,
            currentPageNumber: 1,
        }),
        actions: {
            setShowEmployeesWorkingToday(value) {
                this.showEmployeesWorkingToday = value
            },
            setCurrentPageLength(pageLength) {
                this.currentPageLength = pageLength
            },
            setCurrentPageNumber(pageNumber) {
                this.currentPageNumber = pageNumber
            },
        },
        getters: {
            getShowEmployeesWorkingToday: (state) => state.showEmployeesWorkingToday,
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
        },
    },
)
