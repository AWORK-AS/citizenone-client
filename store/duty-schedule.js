import { defineStore } from 'pinia'

export const useDutyScheduleStore = defineStore('dutyScheduleStore',
    {
        persist: true,
        state: () => ({
            currentPageLength: 50,
            currentPageNumber: 1,
            showEmployeesWorkingToday: false,
            // Week view department groups the viewer opened or folded, by name.
            departmentGroupsOpen: {},
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
            setDepartmentGroupOpen(name, open) {
                this.departmentGroupsOpen = { ...this.departmentGroupsOpen, [name]: open }
            },
        },
        getters: {
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
            getShowEmployeesWorkingToday: (state) => state.showEmployeesWorkingToday,
            getDepartmentGroupOpen: (state) => (name) => state.departmentGroupsOpen?.[name],
        },
    },
)
