import { defineStore } from 'pinia'

export const useZenegySyncStore = defineStore('zenegySyncStore',
    {
        persist: true,
        state: () => ({
            presets: [],
        }),
        actions: {
            addPreset(preset) {
                this.presets.push(preset)
            },
            removePreset(index) {
                this.presets.splice(index, 1)
            },
        },
        getters: {
            getPresets: (state) => state.presets,
        },
    },
)
