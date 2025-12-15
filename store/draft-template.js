import { defineStore } from 'pinia'

export const useDraftTemplateStore = defineStore('draftTemplateStore',
    {
        persist: true,
        state: () => ({
            currentPageLength: 10,
            currentPageNumber: 1,
            selectedDraftTemplate: {},
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
            setSelectedDraftTemplate(draftTemplate) {
                this.selectedDraftTemplate = draftTemplate
            },
            setSortData(sortField, sortOrder) {
                this.sortData.sortField = sortField
                this.sortData.sortOrder = sortOrder
            },
        },
        getters: {
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
            getSelectedDraftTemplate: (state) => state.selectedDraftTemplate,
            getSortData: (state) => state.sortData,
        },
    },
)
