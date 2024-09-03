import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore',
    {
        persist: true,
        state: () => ({
            isCheckInNow: false,
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
            minusUserNotificationCount() {
                this.user.unread_notification_count = this.user.unread_notification_count - 1
            },
            setIsCheckInNow(status) {
                this.isCheckInNow = status
            },
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
            resetIsCheckInNow() {
                this.isCheckInNow = false
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
            resetUserNotificationCount() {
                this.user.unread_notification_count = 0
            },
            resetUser() {
                this.user = null
            },
        },
        getters: {
            getIsCheckInNow: (state) => state.isCheckInNow,
            getIsLoggedIn: (state) => state.isLoggedIn,
            getLanguage: (state) => state.language,
            getTimer: (state) => state.timer,
            getUser: (state) => state.user,
        },
    },
)
