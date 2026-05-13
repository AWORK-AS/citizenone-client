import { defineStore } from 'pinia'

export const useCompanyStore = defineStore('companyStore',
    {
        persist: true,
        state: () => ({
            selectedCompany: {},
            companyAddress: null,
            citizenDisplays: [],
        }),
        actions: {
            setSelectedCompany(company) {
                this.selectedCompany = company
            },
            resetSelectedCompany() {
                this.selectedCompany = {}
            },
            setCompanyAddress(address) {
                this.companyAddress = address
            },
            setCitizenDisplays(displays) {
                this.citizenDisplays = displays
            },
        },
        getters: {
            getSelectedCompany: (state) => state.selectedCompany,
            getCompanyAddress: (state) => state.companyAddress,
            getCitizenDisplays: (state) => state.citizenDisplays,
        },
    },
)
