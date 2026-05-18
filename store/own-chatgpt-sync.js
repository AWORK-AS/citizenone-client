import { defineStore } from 'pinia'
import { ownChatGptService } from '@/components/api/user/OwnChatGptService'
import pusher from '@/services/pusher'
import { useUserStore } from '@/store/user'

let _channel = null
let _fakeTimer = null

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

            this._subscribe()
            this._startFakeProgress()

            try {
                await ownChatGptService.sync()
            } catch (e) {
                this._stopFakeTimer()
                if (_channel) {
                    pusher.unsubscribe(_channel.name)
                    _channel = null
                }
                this.error = e?.response?.data?.message ?? e?.message ?? 'Sync failed.'
                this.isSyncing = false
            }
        },

        cancelSync() {
            this._stopFakeTimer()
            if (_channel) {
                pusher.unsubscribe(_channel.name)
                _channel = null
            }
            this.isSyncing = false
            this.progress = 0
            this.error = null
        },

        _startFakeProgress() {
            const tick = () => {
                if (_fakeTimer === null) return
                if (this.progress < 80) {
                    this.progress = Math.min(80, this.progress + (80 - this.progress) * 0.02)
                    _fakeTimer = setTimeout(tick, 300)
                } else {
                    _fakeTimer = null
                }
            }
            _fakeTimer = setTimeout(tick, 200)
        },

        _stopFakeTimer() {
            if (_fakeTimer !== null) {
                clearTimeout(_fakeTimer)
                _fakeTimer = null
            }
        },

        _subscribe() {
            if (_channel) return

            const userStore = useUserStore()
            const companyId = userStore.getUser?.company_id
            if (!companyId) return

            const channelName = `citizenone.owngpt.${companyId}`
            _channel = pusher.subscribe(channelName)

            _channel.bind('sync-progress', (data) => {
                const status = data?.status

                if (status === 'ready') {
                    this._stopFakeTimer()

                    if (_channel) {
                        pusher.unsubscribe(_channel.name)
                        _channel = null
                    }

                    const animateTo100 = () => {
                        if (this.progress < 100) {
                            this.progress = Math.min(100, this.progress + 2)
                            setTimeout(animateTo100, 20)
                        } else {
                            this.isSyncing = false
                            this.isComplete = true
                            setTimeout(() => { this.isComplete = false }, 3000)
                        }
                    }
                    animateTo100()
                } else if (status === 'failed') {
                    this._stopFakeTimer()
                    this.error = data?.error_message ?? 'Sync failed.'

                    if (_channel) {
                        pusher.unsubscribe(_channel.name)
                        _channel = null
                    }
                    this.isSyncing = false
                }
            })
        },
    },
})
