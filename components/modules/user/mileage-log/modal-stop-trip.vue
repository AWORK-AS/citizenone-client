<template>
    <Modal size="lg" :title="$t('mileageLog.tracking.reviewTitle')" :show="props.show" @close="onClose">
        <template #modal-body>
            <LoadingSpinner :isActive="tracking.isBusy.value">
                <div class="space-y-4">
                    <Alert type="danger" :text="tracking.trackingError.value" v-if="tracking.trackingError.value" />

                    <!-- Phase 1: still tracking, deciding whether to stop or discard -->
                    <template v-if="state.phase === 'confirm'">
                        <div class="h-64 w-full rounded-md overflow-hidden border">
                            <MapLocation :center="mapCenter" :zoom="15" :markerCoords="markerCoords" :polylinePoints="polylinePoints" layers />
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <p class="text-xs text-tertiary">{{ $t('mileageLog.tracking.elapsed') }}</p>
                                <p class="text-sm font-semibold text-gray-700">{{ formattedElapsed }}</p>
                            </div>
                            <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <p class="text-xs text-tertiary">{{ $t('mileageLog.tracking.distanceSoFar') }}</p>
                                <p class="text-sm font-semibold text-gray-700">{{ tracking.distanceSoFarKm.value.toFixed(2) }} km</p>
                            </div>
                        </div>

                        <div v-if="tracking.points.value.length === 0" class="flex items-start gap-x-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <Icon name="ph:warning-circle" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p class="text-xs text-amber-700">{{ $t('mileageLog.tracking.noGpsPointsYetHint') }}</p>
                        </div>

                        <div class="space-y-1">
                            <FormLabel for="stop-trip-note" :label="$t('mileageLog.form.note')" />
                            <FormTextArea id="stop-trip-note" name="stop-trip-note" :placeholder="$t('mileageLog.form.note')"
                                v-model="state.note" />
                        </div>

                        <div class="flex items-center gap-x-3">
                            <FormSwitch :value="state.linkToCitizen" @toggleSwitch="state.linkToCitizen = !state.linkToCitizen" />
                            <p class="text-sm">{{ $t('mileageLog.form.linkToCitizen') }}</p>
                        </div>
                        <div class="space-y-1" v-if="state.linkToCitizen">
                            <FormLabel for="stop-trip-citizen" :label="$t('mileageLog.form.selectCitizen')" />
                            <FormSelect id="stop-trip-citizen" :options="state.citizenOptions" v-model="state.citizenUuid" />
                        </div>

                        <div class="flex justify-end gap-3">
                            <FormButton buttonStyle="cancel" @click="state.confirmingCancel = true">
                                {{ $t('mileageLog.tracking.cancelTrip') }}
                            </FormButton>
                            <FormButton buttonStyle="primary" @click="onStop">
                                {{ $t('mileageLog.tracking.stopTrip') }}
                            </FormButton>
                        </div>

                        <div v-if="state.confirmingCancel" class="p-3 bg-red-50 border border-red-200 rounded-md space-y-2">
                            <p class="text-sm text-red-700">{{ $t('mileageLog.tracking.confirmation.cancelTrip') }}?</p>
                            <div class="flex justify-end gap-2">
                                <FormButton buttonStyle="cancel" @click="state.confirmingCancel = false">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton buttonStyle="primary" @click="onCancelTrip">
                                    {{ $t('mileageLog.tracking.cancelTrip') }}
                                </FormButton>
                            </div>
                        </div>
                    </template>

                    <!-- Phase 2: already stopped server-side, showing the final summary.
                         Reads tracking.activeTrip directly (kept up to date by stop()
                         itself) rather than a component-local copy, so this still
                         renders correctly if this component gets unmounted and
                         reopened (e.g. a page refresh) while a review is pending. -->
                    <template v-else-if="state.phase === 'summary' && tracking.activeTrip.value">
                        <div class="p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-x-2">
                            <Icon name="ph:check-circle" class="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <p class="text-sm text-green-800">{{ $t('mileageLog.tracking.alert.tripSaved') }}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <p class="text-xs text-tertiary">{{ $t('mileageLog.form.startAddress') }}</p>
                                <p class="text-sm font-semibold text-gray-700">{{ tracking.activeTrip.value.start_address || '—' }}</p>
                            </div>
                            <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <p class="text-xs text-tertiary">{{ $t('mileageLog.form.endAddress') }}</p>
                                <p class="text-sm font-semibold text-gray-700">{{ tracking.activeTrip.value.end_address || '—' }}</p>
                            </div>
                        </div>
                        <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                            <p class="text-xs text-tertiary">{{ $t('mileageLog.form.estimatedDistance') }}</p>
                            <p class="text-sm font-semibold text-gray-700">{{ Number(tracking.activeTrip.value.kilometers ?? 0).toFixed(2) }} km</p>
                        </div>
                        <div class="flex justify-end">
                            <FormButton buttonStyle="primary" @click="onCloseSummary">
                                {{ $t('close') }}
                            </FormButton>
                        </div>
                    </template>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useMileageTracking } from '@/composables/mileageTracking'
import { citizenService } from '@/components/api/user/CitizenService'

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits<{
    (e: 'close'): void
    (e: 'saved'): void
    (e: 'discarded'): void
}>()

const { t } = useI18n()
const tracking = useMileageTracking(t)

const state = reactive({
    phase: 'confirm' as 'confirm' | 'summary',
    note: '',
    linkToCitizen: false,
    citizenUuid: null as string | null,
    citizenOptions: [] as any,
    confirmingCancel: false,
})

watch(() => props.show, (open) => {
    if (!open) return
    state.confirmingCancel = false

    // A trip that was already stopped, awaiting review, opens straight into
    // the summary — re-running the "confirm stop" screen for an already-
    // stopped trip makes no sense, and would be unreachable anyway (nothing
    // in that phase applies once trip_started_at is already cleared
    // server-side). This is also what makes the trip recoverable via the
    // banner after this component remounts (e.g. a page refresh) while a
    // review is still pending.
    if (tracking.isReviewing.value) {
        state.phase = 'summary'
        return
    }

    state.phase = 'confirm'
    // The trip may already have been linked to a citizen at Start — reflect
    // that here rather than always opening blank/unlinked. tracking.citizenUuid
    // is set from opts.citizenUuid in start() and persists for the life of
    // the tracked trip.
    state.linkToCitizen = !!tracking.citizenUuid.value
    state.citizenUuid = tracking.citizenUuid.value
    fetchCitizenOptions()
})

async function fetchCitizenOptions() {
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.citizenOptions = response.data.map((citizen: any) => ({
                value: citizen.uuid,
                label: `${citizen.firstname} ${citizen.lastname ?? ''}`,
            }))
        }
    } catch {
        // Non-fatal — stopping the trip doesn't require citizen linking
    }
}

const mapCenter = computed<[number, number]>(() => {
    // Prefer, in order: the last logged (accuracy-filtered) breadcrumb; the
    // raw last-known fix regardless of accuracy (covers the common case of
    // testing without a real GPS chip, where every fix gets filtered out of
    // `points` but we still know roughly where the device is); the trip's
    // actual start coordinates from the backend resource; and only then a
    // hardcoded fallback, which should now be rare rather than the default.
    const last = tracking.points.value[tracking.points.value.length - 1]
    if (last) return [last.lat, last.lng]

    const rawFix = tracking.lastKnownPosition.value
    if (rawFix) return [rawFix.lat, rawFix.lng]

    const trip = tracking.activeTrip.value
    if (trip?.geo_start_lat != null && trip?.geo_start_lng != null) {
        return [Number(trip.geo_start_lat), Number(trip.geo_start_lng)]
    }

    return [55.6761, 12.5683]
})

const polylinePoints = computed<[number, number][]>(() => tracking.points.value.map((p) => [p.lat, p.lng]))

const markerCoords = computed(() => ({ lat: mapCenter.value[0], lng: mapCenter.value[1] }))

const formattedElapsed = computed(() => {
    const seconds = tracking.elapsedSeconds.value
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
})

async function onStop() {
    try {
        // stop() itself now writes the final trip data into
        // tracking.activeTrip, which is what the summary phase reads —
        // nothing further to capture from the return value here.
        await tracking.stop({
            note: state.note,
            citizenUuid: state.linkToCitizen ? state.citizenUuid : null,
        })
        state.phase = 'summary'
    } catch {
        // tracking.trackingError is already populated; stay on the confirm
        // screen so the user can retry.
    }
}

async function onCancelTrip() {
    await tracking.cancel()
    emit('discarded')
}

function onCloseSummary() {
    tracking.finishReview()
    emit('saved')
}

function onClose() {
    // Closing without stopping/cancelling just hides the modal — the trip
    // keeps tracking in the background (the banner remains visible).
    if (state.phase === 'confirm') {
        emit('close')
        return
    }
    onCloseSummary()
}
</script>
