import { defineStore } from 'pinia'

export const useDraftDutyScheduleStore = defineStore('draftDutyScheduleStore',
    {
        persist: true,
        state: () => ({
            currentPageLength: 10,
            currentPageNumber: 1,
            showDepartmentPopup: true,
        }),
        actions: {
            setCurrentPageLength(pageLength) {
                this.currentPageLength = pageLength
            },
            setCurrentPageNumber(pageNumber) {
                this.currentPageNumber = pageNumber
            },
            setShowDepartmentPopup(status) {
                this.showDepartmentPopup = status
            }
        },
        getters: {
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
            getShowDepartmentPopup: (state) => state.showDepartmentPopup,
        },
    },
)
