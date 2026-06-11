import { defineStore } from 'pinia'

export const useReferralStore = defineStore('referralStore',
    {
        persist: true,
        state: () => ({
            currentPageLength: 10,
            currentPageNumber: 1,
            selectedReferral: {},
            sortData: {
                sortField: 'created_at',
                sortOrder: 'descend',
            },
        }),
        actions: {
            setCurrentPageLength(pageLength) {
                this.currentPageLength = pageLength
            },
            setCurrentPageNumber(pageNumber) {
                this.currentPageNumber = pageNumber
            },
            setSelectedReferral(selectedReferral) {
                this.selectedReferral = selectedReferral
            },
            setSortData(sortField, sortOrder) {
                this.sortData.sortField = sortField
                this.sortData.sortOrder = sortOrder
            },
        },
        getters: {
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
            getSelectedReferral: (state) => state.selectedReferral,
            getSortData: (state) => state.sortData,
        },
    },
)
