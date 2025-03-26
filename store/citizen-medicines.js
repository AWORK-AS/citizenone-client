import { defineStore } from 'pinia'

export const useCitizenMedicineStore = defineStore('citizenMedicineStore',
    {
        persist: true,
        state: () => ({
            selectedMedicines: [],
        }),
        actions: {
            addRemoveMedicine(medicine) {
                const index = this.selectedMedicines.findIndex(
                    (med) => med.uuid === medicine.uuid
                )

                if (index === -1) {
                    // Medicine not found, add it
                    this.selectedMedicines.push({
                        id: medicine?.id,
                        uuid: medicine?.uuid,
                        en_name: medicine?.medicine_name?.en_name,
                        dk_name: medicine?.medicine_name?.dk_name,
                        medicine_type: medicine?.medicine_type,
                        is_pn_medicine: medicine?.is_pn_medicine,
                        max_daily_dose: medicine?.max_daily_dose,
                        max_dosage_per_time: medicine?.max_dosage_per_time,
                    })
                } else {
                    // Medicine found, remove it
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
