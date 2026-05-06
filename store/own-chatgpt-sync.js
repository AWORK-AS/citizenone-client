import { defineStore } from 'pinia'
import { ownChatGptService } from '@/components/api/user/OwnChatGptService'

export const useOwnChatGptSyncStore = defineStore('ownChatGptSync', {
    state: () => ({
        isSyncing: false,
        isComplete: false,
        progress: 0,
        error: null,
    }),
    actions: {
        async startSync() {
            if (this.isSyncing) return
            this.isSyncing = true
            this.isComplete = false
            this.progress = 0
            this.error = null

            try {
                await ownChatGptService.sync()
            } catch (e) {
                this.error = e?.response?.data?.message ?? e?.message ?? 'Sync failed.'
                this.isSyncing = false
                return
            }

            const interval = setInterval(async () => {
                try {
                    const res = await ownChatGptService.getStatus()
                    const status = res?.data?.status ?? res?.status

                    if (status === 'building' || status === 'pending') {
                        if (this.progress < 90) {
                            this.progress += Math.random() * 8 + 2
                            if (this.progress > 90) this.progress = 90
                        }
                    } else if (status === 'ready') {
                        this.progress = 100
                        this.isSyncing = false
                        this.isComplete = true
                        clearInterval(interval)
                        setTimeout(() => { this.isComplete = false }, 3000)
                    } else if (status === 'failed') {
                        this.error = res?.data?.error_message ?? res?.error_message ?? 'Sync failed.'
                        this.isSyncing = false
                        clearInterval(interval)
                    }
                } catch (e) {
                    this.error = e?.response?.data?.message ?? e?.message ?? 'Sync failed.'
                    this.isSyncing = false
                    clearInterval(interval)
                }
            }, 3000)
        },
    },
})
