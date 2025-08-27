import { defineStore } from 'pinia'

export const useCitizenStore = defineStore('citizenStore',
    {
        persist: true,
        state: () => ({
            selectedCitizen: {},
        }),
        actions: {
            setSelectedCitizen(selectedCitizen) {
                this.selectedCitizen = selectedCitizen
            },
        },
        getters: {
            getSelectedCitizen: (state) => state.selectedCitizen,
        },
    },
)
