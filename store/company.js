import { defineStore } from 'pinia'

export const useCompanyStore = defineStore('companyStore',
    {
        persist: true,
        state: () => ({
            selectedCompany: {},
        }),
        actions: {
            setSelectedCompany(company) {
                this.selectedCompany = company
            },
            resetSelectedCompany() {
                this.selectedCompany = {}
            },
        },
        getters: {
            getSelectedCompany: (state) => state.selectedCompany,
        },
    },
)
