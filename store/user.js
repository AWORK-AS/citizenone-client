import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore',
    {
        persist: true,
        state: () => ({
            language: 'en',
            user: null,
        }),
        actions: {
            setLanguage(language) {
                this.language = language
            },
            setUser(user) {
                this.user = user
            },
            resetLanguage() {
                this.language = 'en'
            },
            resetUser() {
                this.user = null
            },
        },
        getters: {
            getLanguage: (state) => state.language,
            getUser: (state) => state.user,
        },
    },
)
