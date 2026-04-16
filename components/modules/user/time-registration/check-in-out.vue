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
import { userService } from '@/components/api/user/UserService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const userStore = useUserStore() as any

const hours = ref<number>(0)
const seconds = ref<number>(0)
const minutes = ref<number>(0)
let timer: number | null = null

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

const formattedTime = computed<string>(() => {
    const formatTime = (num: number): string => String(num).padStart(2, '0')
    return `${formatTime(hours.value)}:${formatTime(minutes.value)}:${formatTime(seconds.value)}`
})

onMounted(() => {
    if (userStore.getUser != null) {
        if (userStore.getUser?.time_summary) {
            const totalTime = userStore.getUser?.time_summary.split(":")
            hours.value = totalTime[0]
            minutes.value = totalTime[1]
            seconds.value = totalTime[2]
        }
        if (userStore.getUser?.is_checked_in) {
            userStore.setIsLoggedIn(true)
        } else {
            userStore.setIsLoggedIn(false)
        }
        if (userStore.getIsLoggedIn) {
            startTimer()
        }
    }
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

const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
            },
            (error) => {
                console.error('Error getting location:', error)
                reject(error)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    })
}

const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'da,en',
                }
            }
        )
        const data = await response.json()
        if (data && data.display_name) {
            return data.display_name
        }
    } catch (error) {
        console.error('Failed to get address from coordinates:', error)
    }
    return `${lat}, ${lng}`
}

async function toggleLogin() {
    state.error = {}
    state.isPageLoading = true
    try {
        if (!userStore.getIsLoggedIn) {
            let location
            let address = ''
            try {
                location = await getCurrentLocation()
                if (location) {
                    address = await getAddressFromCoordinates(location.lat, location.lng)
                }
            } catch (locError) {
                console.warn('Could not get location for check-in:', locError)
            }

            const params = location ? {
                start_lat: location.lat,
                start_lng: location.lng,
                start_address: address
            } : {}

            const response = await userService.checkin(params)
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
            let location
            let address = ''
            try {
                location = await getCurrentLocation()
                if (location) {
                    address = await getAddressFromCoordinates(location.lat, location.lng)
                }
            } catch (locError) {
                console.warn('Could not get location for check-out:', locError)
            }

            const params = location ? {
                end_lat: location.lat,
                end_lng: location.lng,
                end_address: address
            } : {}

            const response = await userService.checkout(params)
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