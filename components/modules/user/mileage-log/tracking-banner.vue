<template>
    <div v-if="tracking.hasTripSession.value"
        class="fixed bottom-0 inset-x-0 z-40 lg:bottom-4 lg:left-auto lg:right-4 lg:inset-x-auto lg:max-w-sm lg:rounded-xl bg-gray-900 text-white shadow-2xl">
        <div class="px-4 py-3 flex items-center gap-x-3">
            <div class="flex items-center justify-center w-9 h-9 rounded-full bg-primary/20 shrink-0">
                <Icon name="ph:car" class="w-5 h-5 text-primary-300" />
            </div>
            <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold truncate">
                    {{ tracking.isReviewing.value ? $t('mileageLog.tracking.reviewTitle') : $t('mileageLog.tracking.tripInProgress') }}
                </p>
                <p class="text-xs text-gray-300 flex items-center gap-x-2">
                    <template v-if="tracking.isReviewing.value">
                        <span>{{ $t('mileageLog.tracking.alert.tripSaved') }}</span>
                    </template>
                    <template v-else-if="tracking.isStopping.value">
                        <Icon name="ph:spinner-gap" class="w-3.5 h-3.5 animate-spin" />
                        <span>{{ $t('mileageLog.tracking.stoppingInProgress') }}</span>
                    </template>
                    <template v-else>
                        <span>{{ formattedElapsed }}</span>
                        <span>·</span>
                        <span>{{ tracking.distanceSoFarKm.value.toFixed(2) }} km</span>
                        <span v-if="tracking.status.value === 'tracking-degraded'"
                            class="flex items-center gap-x-1 text-amber-300">
                            <Icon name="ph:warning" class="w-3.5 h-3.5" />
                            {{ $t('mileageLog.tracking.gpsPaused') }}
                        </span>
                    </template>
                </p>
            </div>
            <button type="button" :disabled="tracking.isStopping.value"
                class="shrink-0 bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="state.isStopModalOpen = true">
                {{ tracking.isReviewing.value ? $t('close') : $t('mileageLog.tracking.stopTrip') }}
            </button>
        </div>

        <ModulesUserMileageLogModalStopTrip :show="state.isStopModalOpen" @close="state.isStopModalOpen = false"
            @saved="onSaved" @discarded="onDiscarded" />
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useMileageTracking } from '@/composables/mileageTracking'
import { useAlert } from '@/composables/alert'

const { t } = useI18n()
const tracking = useMileageTracking(t)
const { successAlert } = useAlert()

const state = reactive({
    isStopModalOpen: false,
})

const now = ref(Date.now())
let tickId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
    // Reconciles against the server once per app load — this is what lets a
    // trip started on one device (or before a page refresh / cleared
    // localStorage) show up here again. The layout persists across page
    // navigations within the app, so this fires once per session, not once
    // per page.
    tracking.reconcile()
    tickId = setInterval(() => { now.value = Date.now() }, 1000)
})

onUnmounted(() => {
    if (tickId) clearInterval(tickId)
})

const formattedElapsed = computed(() => {
    // eslint-disable-next-line no-unused-expressions
    now.value // establish reactive dependency so this re-renders every second
    const seconds = tracking.elapsedSeconds.value
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
})

function onSaved() {
    state.isStopModalOpen = false
    successAlert(`${t('alert.success')}!`, t('mileageLog.tracking.alert.tripSaved'))
}

function onDiscarded() {
    state.isStopModalOpen = false
    successAlert(`${t('alert.success')}!`, t('mileageLog.tracking.alert.tripDiscarded'))
}
</script>
