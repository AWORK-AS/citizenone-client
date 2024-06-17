<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div
            class="mb-2 flex items-center justify-between gap-x-2 border-b border-t py-4 px-2 border-tertiary-25 border-dashed">
            <p class="text-sm text-white">
                {{ userStore.getIsLoggedIn ? 'Checked in' : 'Check out' }}
            </p>
            <div class="flex items-center gap-x-1">
                <p class="text-xs text-white">{{ formattedTime }}</p>
                <FormSwitch :value="userStore.getIsLoggedIn" @toggleSwitch="toggleLogin" />
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/UserService'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const hours = ref<number>(0)
const seconds = ref<number>(0)
const minutes = ref<number>(0)
let timer: number | null = null

const state = reactive({
    error: [],
    isPageLoading: false,
})

const formattedTime = computed<string>(() => {
    const formatNumber = (num: number): string => String(num).padStart(2, '0')
    return `${formatNumber(hours.value)}:${formatNumber(minutes.value)}:${formatNumber(seconds.value)}`
})

onMounted(() => {
    if (userStore.getIsLoggedIn) {
        setTimer()
        startTimer()
    } else {
        fetchUser()
    }
})

async function fetchUser() {
    state.isPageLoading = true
    try {
        const response = await userService.fetchUser()
        if (response?.data) {
            if (response?.data?.time_log?.total_time) {
                const totalTime = response?.data?.time_log?.total_time.split(":")
                hours.value = totalTime[0]
                minutes.value = totalTime[1]
                seconds.value = totalTime[2]
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function toggleLogin() {
    state.isPageLoading = true
    try {
        if (!userStore.getIsLoggedIn) {
            const response = await userService.checkin()
            if (response?.data) {
                if (response?.data?.total_time) {
                    const totalTime = response?.data?.total_time.split(":")
                    hours.value = totalTime[0]
                    minutes.value = totalTime[1]
                    seconds.value = totalTime[2]
                }
                userStore.setIsLoggedIn(!userStore.getIsLoggedIn)
                startTimer()
            }
        } else {
            const response = await userService.checkout()
            if (response?.data) {
                if (response?.data?.total_time) {
                    const totalTime = response?.data?.total_time.split(":")
                    hours.value = totalTime[0]
                    minutes.value = totalTime[1]
                    seconds.value = totalTime[2]
                }
                userStore.setIsLoggedIn(!userStore.getIsLoggedIn)
                stopTimer()
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function setTimer(hoursValue: any = null, minutesValue: any = null, secondsValue: any = null) {
    if (hoursValue != null) {
        userStore.setHours(hoursValue)
    }
    if (minutesValue != null) {
        userStore.setMinutes(minutesValue)
    }
    if (secondsValue != null) {
        userStore.setSeconds(secondsValue)
    }
    hours.value = userStore.getTimer.hours
    minutes.value = userStore.getTimer.minutes
    seconds.value = userStore.getTimer.seconds
}

const startTimer = (): void => {
    if (timer) return
    timer = window.setInterval(() => {
        if (minutes.value === 59) {
            if (seconds.value === 59) {
                seconds.value = 0
                minutes.value = 0
                hours.value++
            } else {
                minutes.value++
            }
        } else {
            seconds.value++
        }
        setTimer(hours.value, minutes.value, seconds.value)
    }, 1000)
}

const stopTimer = (): void => {
    if (timer) {
        clearInterval(timer)
        timer = null
    }
}
</script>