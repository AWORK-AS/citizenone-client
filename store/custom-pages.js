import { defineStore } from 'pinia'

export const useCustomPagesStore = defineStore('customPagesStore', {
    persist: true,
    state: () => ({
        customName: {
            addictions: 'asdasda',
            citizens: '',
            department: '',
            dutySchedules: '',
            giveMedicine: '',
            riskAssessment: '',
        },
    }),
    actions: {
        setAddictionsNaming(name) {
            this.customName.addictions = name
        },
        setCitizensNaming(name) {
            this.customName.citizens = name
        },
        setDepartmentNaming(name) {
            this.customName.department = name
        },
        setDutySchedulesNaming(name) {
            this.customName.dutySchedules = name
        },
        setRiskAssessmentNaming(name) {
            this.customName.riskAssessment = name
        },
        setGiveMedicineNaming(name) {
            this.customName.giveMedicine = name
        },
    },
    getters: {
        getCustomPagesName: (state) => state.customName,
    },
})
