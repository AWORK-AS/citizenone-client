import { defineStore } from 'pinia'

export const useCustomPagesStore = defineStore('customPagesStore', {
    persist: true,
    state: () => ({
        customName: {
            citizens: '',
            dutySchedules: '',
            riskAssessment: '',
        },
    }),
    actions: {
        setCitizensNaming(name) {
            this.customName.citizens = name
        },
        setDutySchedulesNaming(name) {
            this.customName.dutySchedules = name
        },
        setRiskAssessmentNaming(name) {
            this.customName.riskAssessment = name
        },
    },
    getters: {
        getCustomPagesName: (state) => state.customName,
    },
})
