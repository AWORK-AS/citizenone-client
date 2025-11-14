import { defineStore } from 'pinia'

export const useInquiryStore = defineStore('inquiryStore',
    {
        persist: true,
        state: () => ({
            currentPageLength: 10,
            currentPageNumber: 1,
            selectedInquiry: {},
            sortData: {
                sortField: 'created_at',
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
            setSelectedInquiry(selectedInquiry) {
                this.selectedInquiry = selectedInquiry
            },
            setSortData(sortField, sortOrder) {
                this.sortData.sortField = sortField
                this.sortData.sortOrder = sortOrder
            },
        },
        getters: {
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
            getSelectedInquiry: (state) => state.selectedInquiry,
            getSortData: (state) => state.sortData,
        },
    },
)
