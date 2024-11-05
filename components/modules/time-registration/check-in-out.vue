<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="bg-white rounded-md flex items-center justify-between gap-x-2 p-4">
            <p class="text-sm text-primary font-bold">
                {{ userStore.getIsLoggedIn ? $t('timeRegistration.checkOut') : $t('timeRegistration.checkIn') }}
            </p>
            <div class="flex items-center gap-x-1">
                <p class="text-xs text-primary">{{ formattedTime }}</p>
                <FormSwitch :value="userStore.getIsLoggedIn" @toggleSwitch="toggleLogin" />
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/UserService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const userStore = useUserStore()

const hours = ref<number>(0)
const seconds = ref<number>(0)
const minutes = ref<number>(0)
let timer: number | null = null

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

const formattedTime = computed<string>(() => {
    const formatNumber = (num: number): string => String(num).padStart(2, '0')
    return `${formatNumber(hours.value)}:${formatNumber(minutes.value)}:${formatNumber(seconds.value)}`
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        if (newValue?.time_summary) {
            const totalTime = newValue?.time_summary.split(":")
            hours.value = totalTime[0]
            minutes.value = totalTime[1]
            seconds.value = totalTime[2]
        }
        if (newValue?.is_checked_in) {
            userStore.setIsLoggedIn(true)
        } else {
            userStore.setIsLoggedIn(false)
        }
        if (userStore.getIsLoggedIn) {
            startTimer()
        }
    }
})

watch(() => userStore.isCheckInNow, (newValue: any) => {
    if (newValue && !userStore.getIsLoggedIn) {
        toggleLogin()
    }
})

async function toggleLogin() {
    state.error = {}
    state.isPageLoading = true
    try {
        if (!userStore.getIsLoggedIn) {
            const response = await userService.checkin()
            if (response?.data) {
                userStore.setIsLoggedIn(!userStore.getIsLoggedIn)
                if (response?.data?.running_time) {
                    const totalTime = response?.data?.running_time.split(":")
                    hours.value = totalTime[0]
                    minutes.value = totalTime[1]
                    seconds.value = totalTime[2]
                }
                startTimer()
            }
        } else {
            const response = await userService.checkout()
            if (response?.data) {
                userStore.setIsLoggedIn(!userStore.getIsLoggedIn)
                if (response?.data?.running_time) {
                    const totalTime = response?.data?.running_time.split(":")
                    hours.value = totalTime[0]
                    minutes.value = totalTime[1]
                    seconds.value = totalTime[2]
                }
                stopTimer()
            }
        }
    } catch (error: any) {
        state.error = error
        userStore.setIsLoggedIn(!userStore.getIsLoggedIn)
        stopTimer()
    }
    state.isPageLoading = false
}

const startTimer = (): void => {
    if (timer) return
    timer = window.setInterval(() => {
        if (seconds.value === 59) {
            seconds.value = 0
            if (minutes.value === 59) {
                minutes.value = 0
                hours.value++
            } else {
                minutes.value++
            }
        } else {
            seconds.value++
        }
    }, 1000)
}

const stopTimer = (): void => {
    if (timer) {
        clearInterval(timer)
        timer = null
    }
}
</script>