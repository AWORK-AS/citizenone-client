import { defineStore } from 'pinia'

export const useCitizenMedicineStore = defineStore('citizenMedicineStore',
    {
        persist: true,
        state: () => ({
            selectedMedicines: [],
        }),
        actions: {
            addRemoveMedicine(medicine) {
                const index = this.selectedMedicines.indexOf(medicine?.uuid)

                if (index === -1) {
                    // Medicine uuid not found, add it
                    this.selectedMedicines.push(medicine?.uuid)
                } else {
                    // Medicine uuid found, remove it
                    this.selectedMedicines.splice(index, 1)
                }
            },
            resetMedicine() {
                this.selectedMedicines = []
            },
        },
        getters: {
            getSelectedMedicines: (state) => state.selectedMedicines,
        },
    },
)
