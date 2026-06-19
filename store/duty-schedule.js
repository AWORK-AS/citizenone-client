import { defineStore } from 'pinia'

export const useDutyScheduleStore = defineStore('dutyScheduleStore',
    {
        persist: true,
        state: () => ({
            currentPageLength: 50,
            currentPageNumber: 1,
            showEmployeesWorkingToday: false,
        }),
        actions: {
            setCurrentPageLength(pageLength) {
                this.currentPageLength = pageLength
            },
            setCurrentPageNumber(pageNumber) {
                this.currentPageNumber = pageNumber
            },
            setShowEmployeesWorkingToday(status) {
                this.showEmployeesWorkingToday = status
            },
        },
        getters: {
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
            getShowEmployeesWorkingToday: (state) => state.showEmployeesWorkingToday,
        },
    },
)
