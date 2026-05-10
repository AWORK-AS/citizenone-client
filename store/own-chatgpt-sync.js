import { defineStore } from 'pinia'
import { ownChatGptService } from '@/components/api/user/OwnChatGptService'

let _intervalId = null

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

            this._poll()
        },

        async resumePolling() {
            if (this.isSyncing) return
            try {
                const res = await ownChatGptService.getStatus()
                const status = res?.data?.status ?? res?.status
                if (status === 'building' || status === 'pending') {
                    this.isSyncing = true
                    this.isComplete = false
                    this._poll()
                }
            } catch (_) {}
        },

        cancelSync() {
            if (_intervalId) {
                clearInterval(_intervalId)
                _intervalId = null
            }
            this.isSyncing = false
            this.progress = 0
            this.error = null
        },

        _poll() {
            _intervalId = setInterval(async () => {
                try {
                    const res = await ownChatGptService.getStatus()
                    const status = res?.data?.status ?? res?.status

                    if (status === 'building' || status === 'pending') {
                        const uploaded = res?.data?.uploaded_count ?? 0
                        const total = res?.data?.total_count ?? 0
                        if (total > 0) {
                            this.progress = Math.min(95, Math.round((uploaded / total) * 100))
                        } else if (this.progress < 30) {
                            this.progress = Math.min(30, this.progress + 2)
                        }
                    } else if (status === 'ready') {
                        this.progress = 100
                        this.isSyncing = false
                        this.isComplete = true
                        clearInterval(_intervalId)
                        _intervalId = null
                        setTimeout(() => { this.isComplete = false }, 3000)
                    } else if (status === 'failed') {
                        this.error = res?.data?.error_message ?? res?.error_message ?? 'Sync failed.'
                        this.isSyncing = false
                        clearInterval(_intervalId)
                        _intervalId = null
                    }
                } catch (e) {
                    this.error = e?.response?.data?.message ?? e?.message ?? 'Sync failed.'
                    this.isSyncing = false
                    clearInterval(_intervalId)
                    _intervalId = null
                }
            }, 3000)
        },
    },
})
