import { defineStore } from 'pinia'

export const useEmployeeStore = defineStore('employeeStore',
    {
        // selectedEmployee deliberately excluded (Phase 1 security fix): it holds
        // the full employee record - email/phone/address/emergency contact/
        // permissions - fetched fresh whenever a profile is opened, with no
        // product requirement to survive a browser restart. Only the list-view
        // UI prefs below are worth persisting.
        persist: {
            paths: ['currentPageLength', 'currentPageNumber', 'sortData'],
        },
        state: () => ({
            currentPageLength: 10,
            currentPageNumber: 1,
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
            getSelectedEmployee: (state) => state.selectedEmployee,
            getSortData: (state) => state.sortData,
        },
    },
)
