import { defineStore } from 'pinia'
import { ownChatGptService } from '@/components/api/user/OwnChatGptService'
import pusher from '@/services/pusher'
import { useUserStore } from '@/store/user'

export const useOwnChatGptSyncStore = defineStore('ownChatGptSync', {
    state: () => ({
        isSyncing: false,
        isComplete: false,
        progress: 0,
        error: null,
        _channel: null,
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

            this._subscribe()
        },



        cancelSync() {
            if (this._channel) {
                pusher.unsubscribe(this._channel.name)
                this._channel = null
            }
            this.isSyncing = false
            this.progress = 0
            this.error = null
        },

        _subscribe() {
            if (this._channel) return

            const userStore = useUserStore()
            const companyId = userStore.getUser?.company_id
            if (!companyId) return

            const channelName = `citizenone.owngpt.${companyId}`
            this._channel = pusher.subscribe(channelName)

            this._channel.bind('sync-progress', (data) => {
                const status = data?.status
                if (status === 'building' || status === 'pending') {
                    const uploaded = data?.uploaded_count ?? 0
                    const total = data?.total_count ?? 0
                    if (total > 0) {
                        this.progress = Math.min(95, Math.round((uploaded / total) * 100))
                    } else if (this.progress < 30) {
                        this.progress = Math.min(30, this.progress + 2)
                    }
                } else if (status === 'ready') {
                    this.progress = 100
                    this.isSyncing = false
                    this.isComplete = true
                    
                    if (this._channel) {
                        pusher.unsubscribe(this._channel.name)
                        this._channel = null
                    }

                    setTimeout(() => { this.isComplete = false }, 3000)
                } else if (status === 'failed') {
                    this.error = data?.error_message ?? 'Sync failed.'
                    
                    if (this._channel) {
                        pusher.unsubscribe(this._channel.name)
                        this._channel = null
                    }
                    this.isSyncing = false
                }
            })
        },
    },
})
