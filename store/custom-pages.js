import { defineStore } from 'pinia'

export const useCustomPagesStore = defineStore('customPagesStore', {
    persist: true,
    state: () => ({
        customName: {
            riskAssessment: ''
        },
    }),
    actions: {
        setRiskAssessmentsNaming(name) {
            this.customName.riskAssessment = name
        },
    },
    getters: {
        getCustomPagesName: (state) => state.customName,
    },
})
