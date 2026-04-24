import { defineStore } from 'pinia'

export const useCustomPagesStore = defineStore('customPagesStore', {
    persist: true,
    state: () => ({
        customName: {
            addictions: 'asdasda',
            citizens: '',
            crisisCenter: '',
            department: '',
            dutySchedules: '',
            giveMedicine: '',
            riskAssessment: '',
            rooms: '',
            shelter: '',
        },
    }),
    actions: {
        setAddictionsNaming(name) {
            this.customName.addictions = name
        },
        setCitizensNaming(name) {
            this.customName.citizens = name
        },
        setCrisisCenterNaming(name) {
            this.customName.crisisCenter = name
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
        setRoomsNaming(name) {
            this.customName.rooms = name
        },
        setShelterNaming(name) {
            this.customName.shelter = name
        },
    },
    getters: {
        getCustomPagesName: (state) => state.customName,
    },
})
