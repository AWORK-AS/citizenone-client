import { defineStore } from 'pinia'

export const useEmployeeStore = defineStore('employeeStore',
    {
        persist: true,
        state: () => ({
            currentPageLength: 10,
            currentPageNumber: 1,
            isSidebarPinned: false,
            selectedEmployee: {},
            sortData: {
                sortField: 'firstname',
                sortOrder: 'ascend',
            },
        }),
        actions: {
            setCurrentPageLength(pageLength) {
                this.currentPageLength = pageLength
            },
            setCurrentPageNumber(pageNumber) {
                this.currentPageNumber = pageNumber
            },
            setIsSidebarPinned(status) {
                this.isSidebarPinned = status
            },
            setSelectedEmployee(employee) {
                this.selectedEmployee = employee
            },
            setSortData(sortField, sortOrder) {
                this.sortData.sortField = sortField
                this.sortData.sortOrder = sortOrder
            },
        },
        getters: {
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
            getIsSidebarPinned: (state) => state.isSidebarPinned,
            getSelectedEmployee: (state) => state.selectedEmployee,
            getSortData: (state) => state.sortData,
        },
    },
)
