import { defineStore } from 'pinia'

export const useDutyScheduleStore = defineStore('dutyScheduleStore',
    {
        persist: true,
        state: () => ({
            currentPageLength: 10,
            currentPageNumber: 1,
            selectedCitizen: {},
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
            setSelectedCitizen(selectedCitizen) {
                this.selectedCitizen = selectedCitizen
            },
            setSortData(sortField, sortOrder) {
                this.sortData.sortField = sortField
                this.sortData.sortOrder = sortOrder
            },
        },
        getters: {
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
            getSelectedCitizen: (state) => state.selectedCitizen,
            getSortData: (state) => state.sortData,
        },
    },
)
