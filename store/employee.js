import { defineStore } from 'pinia'

export const useEmployeeStore = defineStore('employeeStore',
    {
        persist: true,
        state: () => ({
            currentPage: 1,
            selectedEmployee: {},
            sortData: {
                sortField: 'firstname',
                sortOrder: 'ascend',
            },
        }),
        actions: {
            setCurrentPage(pageNumber) {
                this.currentPage = pageNumber
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
            getCurrentPage: (state) => state.currentPage,
            getSelectedEmployee: (state) => state.selectedEmployee,
            getSortData: (state) => state.sortData,
        },
    },
)
