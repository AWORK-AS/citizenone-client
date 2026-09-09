import { defineStore } from 'pinia'

export const useCitizenStore = defineStore('citizenStore',
    {
        // selectedCitizen deliberately excluded (Phase 1 security fix): it holds
        // the full citizen record - CPR/social security number, diagnoses,
        // medication allergies, address - fetched fresh on every profile load,
        // with no product requirement to survive a browser restart. Only the
        // list-view UI prefs below are worth persisting.
        persist: {
            paths: ['currentPageLength', 'currentPageNumber', 'sortData'],
        },
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
