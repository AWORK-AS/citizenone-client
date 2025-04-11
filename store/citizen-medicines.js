import { defineStore } from 'pinia'

export const useCitizenMedicineStore = defineStore('citizenMedicineStore',
    {
        persist: true,
        state: () => ({
            filterByActiveInactiveDeactivated: 'active',
            selectedMedicines: [],
        }),
        actions: {
            addRemoveSelectedMedicine(medicine) {
                const index = this.selectedMedicines.indexOf(medicine?.uuid)

                if (index === -1) {
                    // Medicine uuid not found, add it
                    this.selectedMedicines.push(medicine?.uuid)
                } else {
                    // Medicine uuid found, remove it
                    this.selectedMedicines.splice(index, 1)
                }
            },
            setFilterByActiveInactiveDeactivated(status) {
                this.filterByActiveInactiveDeactivated = status
            },
            resetFilterByActiveInactiveDeactivated() {
                this.filterByActiveInactiveDeactivated = 'active'
            },
            resetSelectedMedicine() {
                this.selectedMedicines = []
            },
        },
        getters: {
            getFilterByActiveInactiveDeactivated: (state) => state.filterByActiveInactiveDeactivated,
            getSelectedMedicines: (state) => state.selectedMedicines,
        },
    },
)
