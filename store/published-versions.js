import { defineStore } from 'pinia'

export const usePublishedVersionsStore = defineStore('publishedVersionsStore',
    {
        persist: true,
        state: () => ({
            currentPageLength: 10,
            currentPageNumber: 1,
            selectedPublishedVersion: {},
            sortData: {
                sortField: 'name',
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
            setSelectedPublishedVersion(publishedVersion) {
                this.selectedPublishedVersion = publishedVersion
            },
            setSortData(sortField, sortOrder) {
                this.sortData.sortField = sortField
                this.sortData.sortOrder = sortOrder
            },
        },
        getters: {
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
            getSelectedPublishedVersion: (state) => state.selectedPublishedVersion,
            getSortData: (state) => state.sortData,
        },
    },
)
