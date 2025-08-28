import { defineStore } from 'pinia'

export const useCitizenStore = defineStore('citizenStore',
    {
        persist: true,
        state: () => ({
            currentPage: 1,
            selectedCitizen: {},
            sortData: {
                sortField: 'firstname',
                sortOrder: 'descend',
            },
        }),
        actions: {
            setCurrentPage(pageNumber) {
                this.currentPage = pageNumber
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
            getCurrentPage: (state) => state.currentPage,
            getSelectedCitizen: (state) => state.selectedCitizen,
            getSortData: (state) => state.sortData,
        },
    },
)
