import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', {
    persist: true,
    state: () => ({
        isCheckInNow: false,
        isLoggedIn: false,
        language: 'dk',
        inTutorial: false,
        isFirstTime: true,
        timer: {
            hours: 0,
            minutes: 0,
            seconds: 0,
        },
        unreadNewsCount: 0,
        user: {},
    }),
    actions: {
        setUserSystemNotificationCount(count) {
            this.user.unread_system_notification_count = count
        },
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
        setInTutorial(status) {
            this.inTutorial = status
        },
        setIsFirstTime(status) {
            this.isFirstTime = status
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
        setUnreadNewsCount(count) {
            this.unreadNewsCount = count
        },
        setUser(user) {
            this.user = user
        },
        setUserIsDraftSchedulePinned(status) {
            this.user.is_draft_schedule_pinned = status
        },
        setUserIsSchedulePinned(status) {
            this.user.is_schedule_pinned = status
        },
        setUserCheckinStatus(status) {
            this.user.checkin_enabled = status
        },
        resetIsCheckInNow() {
            this.isCheckInNow = false
        },
        resetInTutorial() {
            this.inTutorial = false
        },
        resetIsFirstTime() {
            this.isFirstTime = false
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
            this.user = {}
        },
    },
    getters: {
        getIsCheckInNow: (state) => state.isCheckInNow,
        getIsLoggedIn: (state) => state.isLoggedIn,
        getLanguage: (state) => state.language,
        getInTutorial: (state) => state.inTutorial,
        getIsFirstTime: (state) => state.isFirstTime,
        getTimer: (state) => state.timer,
        getUnreadNewsCount: (state) => state.unreadNewsCount,
        getUser: (state) => state.user,
    },
})
