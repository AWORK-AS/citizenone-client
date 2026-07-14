import { defineStore } from 'pinia'

export const useCitizenChildrenStore = defineStore('citizenChildrenStore',
    {
        persist: true,
        state: () => ({
            currentPageLength: 10,
            currentPageNumber: 1,
            sortData: {
                sortField: 'parent_name',
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
            setSortData(sortField, sortOrder) {
                this.sortData.sortField = sortField
                this.sortData.sortOrder = sortOrder
            },
        },
        getters: {
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
            getSortData: (state) => state.sortData,
        },
    },
)
