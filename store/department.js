import { defineStore } from 'pinia'

export const useDepartmentStore = defineStore('departmentStore',
    {
        persist: true,
        state: () => ({
            selectedDepartment: '',
            selectedDepartmentColor: '',
            selectedDepartmentName: '',
        }),
        actions: {
            setSelectedDepartment(department) {
                this.selectedDepartment = department
            },
            setSelectedDepartmentColor(color) {
                this.selectedDepartmentColor = color
            },
            setSelectedDepartmentName(department) {
                this.selectedDepartmentName = department
            },
            resetSelectedDepartment() {
                this.selectedDepartment = ''
            },
            resetSelectedDepartmentColor() {
                this.selectedDepartmentColor = ''
            },
            resetSelectedDepartmentName() {
                this.selectedDepartmentName = ''
            },
        },
        getters: {
            getSelectedDepartment: (state) => state.selectedDepartment,
            getSelectedDepartmentColor: (state) => state.selectedDepartmentColor,
            getSelectedDepartmentName: (state) => state.selectedDepartmentName,
        },
    },
)
