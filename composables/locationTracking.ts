import { citizenCareHourLocationLogService } from '@/components/api/user/CitizenCareHourLocationLogService'

const TRACKING_STATE_KEY = 'location_tracking_state'
const ARRIVAL_PROMPT_KEY = 'arrival_prompt_shown'

interface TrackingState {
    isTracking: boolean
    careHourUuid: string | null
    citizenUuid: string | null
    citizenName: string | null
    citizenAddress: string | null
    citizenLatitude: number | null
    citizenLongitude: number | null
    startTime: number
}

export const useLocationTracking = () => {
    const isTracking = ref(false)
    const currentLocation = ref<{ lat: number; lng: number } | null>(null)
    const trackingError = ref<string>('')
    const careHourUuid = ref<string | null>(null)
    const lastLoggedLocation = ref<{ lat: number; lng: number } | null>(null)
    const locationLogInterval = ref(30000)
    const allLocations = ref<Array<{ lat: number; lng: number }>>([])
    const totalDistanceTraveled = ref<number>(0)
    let watchId: number | null = null
    let logIntervalId: NodeJS.Timeout | null = null

    const saveTrackingState = (state: TrackingState) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TRACKING_STATE_KEY, JSON.stringify(state))
        }
    }

    const loadTrackingState = (): TrackingState | null => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(TRACKING_STATE_KEY)
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (error) {
                    return null
                }
            }
        }
        return null
    }

    const clearTrackingState = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TRACKING_STATE_KEY)
            localStorage.removeItem(ARRIVAL_PROMPT_KEY)
        }
    }

    const setArrivalPromptShown = (shown: boolean) => {
        if (typeof window !== 'undefined') {
            if (shown) {
                localStorage.setItem(ARRIVAL_PROMPT_KEY, 'true')
            } else {
                localStorage.removeItem(ARRIVAL_PROMPT_KEY)
            }
        }
    }

    const getArrivalPromptShown = (): boolean => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(ARRIVAL_PROMPT_KEY) === 'true'
        }
        return false
    }

    // Calculate distance between two points using Haversine formula
    const calculateDistance = (
        point1: { lat: number; lng: number },
        point2: { lat: number; lng: number }
    ): number => {
        const R = 6371000 // Earth's radius in meters
        const dLat = (point2.lat - point1.lat) * Math.PI / 180
        const dLon = (point2.lng - point1.lng) * Math.PI / 180
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(point1.lat * Math.PI / 180) *
            Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    const calculateTotalDistance = (): number => {
        if (allLocations.value.length < 2) return 0
        
        let total = 0
        for (let i = 1; i < allLocations.value.length; i++) {
            total += calculateDistance(allLocations.value[i - 1], allLocations.value[i])
        }
        return total
    }

    const logLocationToBackend = async (location: { lat: number; lng: number }) => {
        if (!careHourUuid.value) {
            return
        }

        // Only log if moved more than 10 meters from last logged location
        if (lastLoggedLocation.value) {
            const distance = calculateDistance(lastLoggedLocation.value, location)
            if (distance < 10) {
                return
            }
        }

        try {
            await citizenCareHourLocationLogService.logLocation({
                citizen_care_hour_uuid: careHourUuid.value,
                latitude: location.lat,
                longitude: location.lng,
            })
            lastLoggedLocation.value = location
            allLocations.value.push(location)
            totalDistanceTraveled.value = calculateTotalDistance()
            
            console.log(`Location logged: ${location.lat}, ${location.lng}. Total distance: ${(totalDistanceTraveled.value / 1000).toFixed(2)}km`)
        } catch (error) {
            console.error('Failed to log location:', error)
        }
    }

    const startTracking = (
        careHourId: string,
        onLocationUpdate: (location: { lat: number; lng: number }) => void,
        onError?: (error: string) => void,
        logIntervalMs: number = 30000,
        citizenUuid?: string,
        citizenName?: string,
        citizenAddress?: string,
        citizenLatitude?: number,
        citizenLongitude?: number
    ) => {
        if (!navigator.geolocation) {
            const error = 'Geolocation is not supported by your browser'
            trackingError.value = error
            if (onError) onError(error)
            return
        }

        if (isTracking.value) {
            console.log('Already tracking, skipping...')
            return
        }

        console.log('Starting location tracking for care hour:', careHourId)
        
        isTracking.value = true
        trackingError.value = ''
        careHourUuid.value = careHourId
        locationLogInterval.value = logIntervalMs
        lastLoggedLocation.value = null
        allLocations.value = []
        totalDistanceTraveled.value = 0

        // Save state to localStorage
        saveTrackingState({
            isTracking: true,
            careHourUuid: careHourId,
            citizenUuid: citizenUuid || null,
            citizenName: citizenName || null,
            citizenAddress: citizenAddress || null,
            citizenLatitude: citizenLatitude || null,
            citizenLongitude: citizenLongitude || null,
            startTime: Date.now(),
        })

        // Start watching position
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }
                currentLocation.value = location
                onLocationUpdate(location)
            },
            (error) => {
                const errorMsg = `Location error: ${error.message}`
                trackingError.value = errorMsg
                console.error(errorMsg)
                if (onError) onError(errorMsg)
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 10000,
            }
        )

        // Set up interval to log location periodically
        logIntervalId = setInterval(() => {
            if (currentLocation.value) {
                logLocationToBackend(currentLocation.value)
            }
        }, locationLogInterval.value)

        // Log initial location if available
        if (currentLocation.value) {
            logLocationToBackend(currentLocation.value)
        }

        console.log('Location tracking started successfully')
    }

    const stopTracking = async () => {
        console.log('Stopping location tracking...')
        
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId)
            watchId = null
        }

        if (logIntervalId !== null) {
            clearInterval(logIntervalId)
            logIntervalId = null
        }

        // Log final location before stopping
        if (currentLocation.value && careHourUuid.value) {
            await logLocationToBackend(currentLocation.value)
        }

        isTracking.value = false
        careHourUuid.value = null
        lastLoggedLocation.value = null
        
        // Clear localStorage
        clearTrackingState()
        
        console.log('Location tracking stopped')
    }

    const isNearDestination = (
        destination: { lat: number; lng: number },
        radiusInMeters: number = 150
    ): { isNear: boolean; distance: number } => {
        if (!currentLocation.value) {
            return { isNear: false, distance: Infinity }
        }

        const distance = calculateDistance(currentLocation.value, destination)
        return {
            isNear: distance <= radiusInMeters,
            distance: Math.round(distance),
        }
    }

    const logCurrentLocation = async () => {
        if (currentLocation.value && careHourUuid.value) {
            await logLocationToBackend(currentLocation.value)
        }
    }

    const getTotalDistanceKm = (): number => {
        return totalDistanceTraveled.value / 1000
    }

    const getSavedTrackingState = (): TrackingState | null => {
        return loadTrackingState()
    }

    onUnmounted(() => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId)
        }
        if (logIntervalId !== null) {
            clearInterval(logIntervalId)
        }
    })

    return {
        isTracking,
        currentLocation,
        trackingError,
        careHourUuid,
        totalDistanceTraveled,
        startTracking,
        stopTracking,
        calculateDistance,
        isNearDestination,
        logCurrentLocation,
        getTotalDistanceKm,
        getSavedTrackingState,
        setArrivalPromptShown,
        getArrivalPromptShown,
    }
}