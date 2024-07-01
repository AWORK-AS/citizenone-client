<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div
            class="mb-2 flex items-center justify-between gap-x-2 border-b border-t py-4 px-2 border-tertiary-25 border-dashed">
            <p class="text-sm text-white">
                {{ userStore.getIsLoggedIn ? $t('timeRegistration.checkIn') : $t('timeRegistration.checkOut') }}
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
    fetchUser()
})

async function fetchUser() {
    state.isPageLoading = true
    try {
        const response = await userService.getUser()
        if (response?.data) {
            if (response?.data?.time_summary) {
                const totalTime = response?.data?.time_summary.split(":")
                hours.value = totalTime[0]
                minutes.value = totalTime[1]
                seconds.value = totalTime[2]
            }
            if (response?.data?.is_checked_in) {
                userStore.setIsLoggedIn(true)
            } else {
                userStore.setIsLoggedIn(false)
            }
            if (userStore.getIsLoggedIn) {
                startTimer()
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