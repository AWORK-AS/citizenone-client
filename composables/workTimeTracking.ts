const WORK_TIME_STATE_KEY = 'work_time_tracking_state'

interface WorkTimeState {
    isWorking: boolean
    careHourUuid: string | null
    citizenUuid: string | null
    citizenName: string | null
    startTime: number
    lastPromptTime: number | null
}

export const useWorkTimeTracking = () => {
    const isTracking = ref(false)
    const careHourUuid = ref<string | null>(null)
    const startTime = ref<number>(0)
    const lastPromptTime = ref<number | null>(null)
    let checkIntervalId: NodeJS.Timeout | null = null

    const saveWorkTimeState = (state: WorkTimeState) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(WORK_TIME_STATE_KEY, JSON.stringify(state))
        }
    }

    const loadWorkTimeState = (): WorkTimeState | null => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(WORK_TIME_STATE_KEY)
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (error) {
                    console.error('Failed to parse work time state:', error)
                    return null
                }
            }
        }
        return null
    }

    const clearWorkTimeState = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(WORK_TIME_STATE_KEY)
        }
    }

    const getWorkingMinutes = (): number => {
        if (!startTime.value) return 0
        return Math.floor((Date.now() - startTime.value) / 1000 / 60)
    }

    const shouldShowPrompt = (): boolean => {
        const minutesWorking = getWorkingMinutes()
        
        if (minutesWorking > 0 && minutesWorking % 15 === 0) {
            if (lastPromptTime.value) {
                const minutesSinceLastPrompt = Math.floor((Date.now() - lastPromptTime.value) / 1000 / 60)
                if (minutesSinceLastPrompt < 1) {
                    return false
                }
            }
            return true
        }
        return false
    }

    const markPromptShown = () => {
        lastPromptTime.value = Date.now()
        const currentState = loadWorkTimeState()
        if (currentState) {
            currentState.lastPromptTime = Date.now()
            saveWorkTimeState(currentState)
        }
    }

    const startTracking = (
        careHourId: string,
        onPromptNeeded: () => void,
        citizenUuid?: string,
        citizenName?: string
    ) => {
        if (isTracking.value) {
            return
        }

        isTracking.value = true
        careHourUuid.value = careHourId
        startTime.value = Date.now()
        lastPromptTime.value = null

        // Save state to localStorage
        saveWorkTimeState({
            isWorking: true,
            careHourUuid: careHourId,
            citizenUuid: citizenUuid || null,
            citizenName: citizenName || null,
            startTime: startTime.value,
            lastPromptTime: null,
        })

        checkIntervalId = setInterval(() => {
            if (shouldShowPrompt()) {
                markPromptShown()
                onPromptNeeded()
            }
        }, 60000)
    }

    const stopTracking = () => {
        if (checkIntervalId !== null) {
            clearInterval(checkIntervalId)
            checkIntervalId = null
        }

        isTracking.value = false
        careHourUuid.value = null
        startTime.value = 0
        lastPromptTime.value = null

        clearWorkTimeState()
    }

    const getSavedWorkTimeState = (): WorkTimeState | null => {
        return loadWorkTimeState()
    }

    const restoreFromState = (state: WorkTimeState, onPromptNeeded: () => void) => {
        isTracking.value = true
        careHourUuid.value = state.careHourUuid
        startTime.value = state.startTime
        lastPromptTime.value = state.lastPromptTime

        const minutesElapsed = Math.floor((Date.now() - state.startTime) / 1000 / 60)

        checkIntervalId = setInterval(() => {
            if (shouldShowPrompt()) {
                markPromptShown()
                onPromptNeeded()
            }
        }, 60000)
    }

    onUnmounted(() => {
        if (checkIntervalId !== null) {
            clearInterval(checkIntervalId)
        }
    })

    return {
        isTracking,
        careHourUuid,
        startTracking,
        stopTracking,
        getWorkingMinutes,
        getSavedWorkTimeState,
        restoreFromState,
        markPromptShown,
    }
}