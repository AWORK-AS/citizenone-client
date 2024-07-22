import { defineStore } from 'pinia'

export const useDepartmentStore = defineStore('departmentStore',
    {
        persist: true,
        state: () => ({
            selectedDepartmentName: '',
        }),
        actions: {
            setSelectedDepartmentName(department) {
                this.selectedDepartmentName = department
            },
            resetSelectedDepartmentName() {
                this.selectedDepartmentName = ''
            },
        },
        getters: {
            getSelectedDepartmentName: (state) => state.selectedDepartmentName,
        },
    },
)
