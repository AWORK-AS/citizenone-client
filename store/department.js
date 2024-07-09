import { defineStore } from 'pinia'

export const useDepartmentStore = defineStore('departmentStore',
    {
        persist: true,
        state: () => ({
            selectedDepartmentUuid: '',
        }),
        actions: {
            setSelectedDepartmentUuid(department) {
                this.selectedDepartmentUuid = department
            },
            resetSelectedDepartmentUuid() {
                this.selectedDepartmentUuid = ''
            },
        },
        getters: {
            getSelectedDepartmentUuid: (state) => state.selectedDepartmentUuid,
        },
    },
)
