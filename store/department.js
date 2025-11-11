import { defineStore } from 'pinia'

export const useDepartmentStore = defineStore('departmentStore',
    {
        persist: true,
        state: () => ({
            selectedDepartmentColor: '',
            selectedDepartmentName: '',
        }),
        actions: {
            setSelectedDepartmentColor(color) {
                this.selectedDepartmentColor = color
            },
            setSelectedDepartmentName(department) {
                this.selectedDepartmentName = department
            },
            resetSelectedDepartmentColor() {
                this.selectedDepartmentColor = ''
            },
            resetSelectedDepartmentName() {
                this.selectedDepartmentName = ''
            },
        },
        getters: {
            getSelectedDepartmentColor: (state) => state.selectedDepartmentColor,
            getSelectedDepartmentName: (state) => state.selectedDepartmentName,
        },
    },
)
