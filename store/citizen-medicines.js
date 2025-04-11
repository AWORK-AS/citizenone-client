import { defineStore } from 'pinia'

export const useCitizenMedicineStore = defineStore('citizenMedicineStore',
    {
        persist: true,
        state: () => ({
            filterByActiveInactive: 'active',
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
            setFilterByActiveInactive(status) {
                this.filterByActiveInactive = status
            },
            resetFilterByActiveInactive() {
                this.filterByActiveInactive = 'active'
            },
            resetSelectedMedicine() {
                this.selectedMedicines = []
            },
        },
        getters: {
            getFilterByActiveInactive: (state) => state.filterByActiveInactive,
            getSelectedMedicines: (state) => state.selectedMedicines,
        },
    },
)
