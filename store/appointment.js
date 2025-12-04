import { defineStore } from 'pinia'

export const useAppointmentStore = defineStore('appointmentStore',
    {
        persist: true,
        state: () => ({
            currentPageLength: 10,
            currentPageNumber: 1,
            selectedAppointment: {},
            sortData: {
                sortField: '',
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
            setSelectedAppointment(selectedAppointment) {
                this.selectedAppointment = selectedAppointment
            },
            setSortData(sortField, sortOrder) {
                this.sortData.sortField = sortField
                this.sortData.sortOrder = sortOrder
            },
        },
        getters: {
            getCurrentPageLength: (state) => state.currentPageLength,
            getCurrentPageNumber: (state) => state.currentPageNumber,
            getSelectedAppointment: (state) => state.selectedAppointment,
            getSortData: (state) => state.sortData,
        },
    },
)
