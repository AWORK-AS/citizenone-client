import { defineStore } from 'pinia'

export const useEmployeeStore = defineStore('employeeStore',
    {
        persist: true,
        state: () => ({
            selectedEmployee: null,
        }),
        actions: {
            setSelectedEmployee(employee) {
                this.selectedEmployee = employee
            },
            resetSelectedEmployee() {
                this.selectedEmployee = null
            },
        },
        getters: {
            getSelectedEmployee: (state) => state.selectedEmployee,
        },
    },
)
