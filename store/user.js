import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore',
    {
        persist: true,
        state: () => ({
            isLoggedIn: false,
            language: 'dk',
            user: null,
        }),
        actions: {
            setIsLoggedIn(status) {
                this.isLoggedIn = status
            },
            setLanguage(language) {
                this.language = language
            },
            setUser(user) {
                this.user = user
            },
            resetIsLoggedIn() {
                this.isLoggedIn = false
            },
            resetLanguage() {
                this.language = 'en'
            },
            resetUser() {
                this.user = null
            },
        },
        getters: {
            getIsLoggedIn: (state) => state.isLoggedIn,
            getLanguage: (state) => state.language,
            getUser: (state) => state.user,
        },
    },
)
