import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore',
    {
        persist: true,
        state: () => ({
            isLoggedIn: false,
            language: 'dk',
            timer: {
                hours: 0,
                minutes: 0,
                seconds: 0,
            },
            user: null,
        }),
        actions: {
            setIsLoggedIn(status) {
                this.isLoggedIn = status
            },
            setLanguage(language) {
                this.language = language
            },
            setHours(hours) {
                this.timer.hours = hours
            },
            setMinutes(minutes) {
                this.timer.minutes = minutes
            },
            setSeconds(seconds) {
                this.timer.seconds = seconds
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
            resetTimer() {
                this.timer = {
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                }
            },
            resetUser() {
                this.user = null
            },
        },
        getters: {
            getIsLoggedIn: (state) => state.isLoggedIn,
            getLanguage: (state) => state.language,
            getTimer: (state) => state.timer,
            getUser: (state) => state.user,
        },
    },
)
