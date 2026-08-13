<template>
    <Modal size="lg" :title="$t('mileageLog.tracking.reviewTitle')" :show="props.show" @close="onClose">
        <template #modal-body>
            <LoadingSpinner :isActive="tracking.isBusy.value">
                <div class="space-y-4">
                    <Alert type="danger" :text="tracking.trackingError.value" v-if="tracking.trackingError.value" />

                    <!-- Phase 1: still tracking, deciding whether to stop or discard -->
                    <template v-if="state.phase === 'confirm'">
                        <div class="h-64 w-full rounded-md overflow-hidden border">
                            <MapLocation :center="mapCenter" :zoom="15" :polylinePoints="polylinePoints" layers />
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

                    <!-- Phase 2: already stopped server-side, showing the final summary -->
                    <template v-else-if="state.phase === 'summary' && state.finalTrip">
                        <div class="p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-x-2">
                            <Icon name="ph:check-circle" class="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <p class="text-sm text-green-800">{{ $t('mileageLog.tracking.alert.tripSaved') }}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <p class="text-xs text-tertiary">{{ $t('mileageLog.form.startAddress') }}</p>
                                <p class="text-sm font-semibold text-gray-700">{{ state.finalTrip.start_address || '—' }}</p>
                            </div>
                            <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <p class="text-xs text-tertiary">{{ $t('mileageLog.form.endAddress') }}</p>
                                <p class="text-sm font-semibold text-gray-700">{{ state.finalTrip.end_address || '—' }}</p>
                            </div>
                        </div>
                        <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                            <p class="text-xs text-tertiary">{{ $t('mileageLog.form.estimatedDistance') }}</p>
                            <p class="text-sm font-semibold text-gray-700">{{ Number(state.finalTrip.kilometers ?? 0).toFixed(2) }} km</p>
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
    finalTrip: null as any,
})

watch(() => props.show, (open) => {
    if (!open) return
    state.phase = 'confirm'
    state.confirmingCancel = false
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
    const last = tracking.points.value[tracking.points.value.length - 1]
    if (last) return [last.lat, last.lng]
    return [55.6761, 12.5683]
})

const polylinePoints = computed<[number, number][]>(() => tracking.points.value.map((p) => [p.lat, p.lng]))

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
        const result = await tracking.stop({
            note: state.note,
            citizenUuid: state.linkToCitizen ? state.citizenUuid : null,
        })
        state.finalTrip = result
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
