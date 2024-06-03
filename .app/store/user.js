import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore',
    {
        persist: true,
        state: () => ({
            user: null,
        }),
        actions: {
            setUser(user) {
                this.user = user
            },
            resetUser() {
                this.user = null
            },
        },
        getters: {
            getUser: (state) => state.user,
        },
    },
)
