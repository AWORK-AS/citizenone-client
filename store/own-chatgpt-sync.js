import { defineStore } from 'pinia'

export const useOwnChatGptSyncStore = defineStore('ownChatGptSync', {
    state: () => ({
        isSyncing: false,
        isComplete: false,
        progress: 0,
    }),
    actions: {
        startSync() {
            if (this.isSyncing) return
            this.isSyncing = true
            this.isComplete = false
            this.progress = 0

            const interval = setInterval(() => {
                this.progress += Math.random() * 8 + 2
                if (this.progress >= 100) {
                    this.progress = 100
                    this.isSyncing = false
                    this.isComplete = true
                    clearInterval(interval)
                    setTimeout(() => { this.isComplete = false }, 3000)
                }
            }, 150)
        },
    },
})
