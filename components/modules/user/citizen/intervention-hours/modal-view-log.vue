<template>
    <div>
        <Modal size="sm" :title="$t('citizens.interventionHours.view.viewInterventionHourLog')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="space-y-1 my-1">
                        <FormLabel :label="$t('citizens.interventionHours.view.createdBy')" />
                        <div class="flex items-center gap-x-2 py-1">
                            <img :src="props.selectedCareHour?.user?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${props.selectedCareHour?.user?.firstname + ' ' + props.selectedCareHour?.user?.lastname}`"
                                :class="[
                                    'h-10 w-10 rounded-full bg-gray-50 object-cover border-2'
                                ]" />
                            <p class="text-sm font-medium">
                                {{ props.selectedCareHour?.user?.firstname }}
                                {{ props.selectedCareHour?.user?.lastname }}
                            </p>
                        </div>
                    </div>

                    <div class="space-y-1 my-1" v-if="props.selectedCareHour?.citizen">
                        <FormLabel :label="$t('citizens.interventionHours.view.citizen')" />
                        <div class="flex items-center gap-x-2 py-1">
                            <img :src="props.selectedCareHour?.citizen?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${props.selectedCareHour?.citizen?.firstname ?? ''} ${props.selectedCareHour?.citizen?.lastname ?? ''}`"
                                :class="[
                                    'h-10 w-10 rounded-full bg-gray-50 object-cover border-2'
                                ]" />
                            <p class="text-sm font-medium">
                                {{ props.selectedCareHour?.citizen?.firstname }}
                                {{ props.selectedCareHour?.citizen?.lastname }}
                            </p>
                        </div>
                    </div>

                    <div class="space-y-1 my-1">
                        <FormLabel :label="$t('citizens.interventionHours.view.dateTimeStart')" />
                        <p class="text-sm font-semibold text-gray-700">{{
                            formatDateTimeToReadable(props.selectedCareHour?.date_time_start) }}</p>
                    </div>
                    <div class="space-y-1 my-1">
                        <FormLabel :label="$t('citizens.interventionHours.view.dateTimeEnd')" />
                        <p class="text-sm font-semibold text-gray-700">{{
                            formatDateTimeToReadable(props.selectedCareHour?.date_time_end) }}</p>
                    </div>

                    <div class="space-y-1 my-1" v-if="props.selectedCareHour?.is_transportation">
                        <FormLabel :label="startAddressLabel" />
                        <p class="text-sm font-semibold text-gray-700">{{ props.selectedCareHour?.start_address }}</p>
                    </div>
                    <template v-if="props.selectedCareHour?.is_transportation">
                        <div class="space-y-1 my-1" v-for="(stop, idx) in middleStops" :key="stop.id ?? idx">
                            <FormLabel :label="stopAddressLabel(idx)" />
                            <p class="text-sm font-semibold text-gray-700">{{ stop.address }}</p>
                        </div>
                    </template>
                    <div class="space-y-1 my-1" v-if="props.selectedCareHour?.is_transportation">
                        <FormLabel :label="endAddressLabel" />
                        <p class="text-sm font-semibold text-gray-700">{{ props.selectedCareHour?.end_address }}</p>
                    </div>
                    <div class="space-y-1 my-1" v-if="props.selectedCareHour?.is_transportation">
                        <FormLabel :label="$t('citizens.interventionHours.view.kilometers')" />
                        <p class="text-sm font-semibold text-gray-700">{{ formatNumber(locale,
                            props.selectedCareHour?.kilometers) }}</p>
                        <!-- Display only, and deliberately: a citizen-linked mileage trip is the
                             same database row as the one shown in the mileage log, so a manager's
                             correction reaches this figure too. Nothing on the intervention-hours
                             side changes - this just stops the corrected number from appearing
                             here without its provenance. There is no correct action on this
                             modal; corrections are made from the mileage log. -->
                        <div class="mt-1 inline-flex items-center gap-x-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700"
                            v-if="props.selectedCareHour?.is_distance_overridden"
                            :title="props.selectedCareHour?.kilometers_override_reason || undefined">
                            <Icon name="ph:pencil-simple-line" class="h-3.5 w-3.5" aria-hidden="true" />
                            {{ $t('mileageLog.table.corrected') }}
                        </div>
                    </div>

                    <div class="space-y-1 my-2" v-if="props.selectedCareHour?.is_transportation">
                        <div class="h-48 w-full rounded-md overflow-hidden border">
                            <MapLocation ref="mapRef" :center="mapCenter" :zoom="mapZoom" :markerCoords="startMarker"
                                :markerPopup="startMarkerPopup" :extraMarkers="extraMarkers"
                                :polylinePoints="polylinePoints" @map-ready="onMapReady" />
                        </div>
                        <p v-if="hasLocationLogs" class="text-xs text-gray-500 mt-1">
                            {{ t('citizens.interventionHours.view.routeBasedOnLocationLogs', {
                                count:
                            locationLogs.length }) }}
                        </p>
                    </div>

                    <div class="space-y-1 my-1" v-if="props.selectedCareHour?.note">
                        <FormLabel :label="$t('citizens.interventionHours.view.note')" />
                        <p class="text-sm font-semibold text-gray-700">{{ props.selectedCareHour?.note }}</p>
                    </div>

                    <div class="mt-5 flex justify-end">
                        <FormButton buttonStyle="cancel" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface LocationLog {
    id: number
    uuid: string
    citizen_care_hour_id: number
    latitude: number | string
    longitude: number | string
    created_at: string
    updated_at: string
}

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedCareHour: {
        type: Object as PropType<Record<string, any> | null>,
        required: true,
    },
})
const emit = defineEmits(['close', 'openTransport', 'openWork'])

const { t, locale } = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()

function closeModal() {
    emit('close')
}

const mapRef = ref<any>(null)
const mapZoom = ref<number>(13)
const mapCenter = ref<[number, number]>([55.6761, 12.5683])
const mapInstance = ref<any>(null)

interface TripStop {
    id?: number
    uuid?: string
    address: string
    latitude: number | string
    longitude: number | string
    sequence_order?: number
}

const middleStops = computed<TripStop[]>(() => {
    const stops = props.selectedCareHour?.stops
    if (!stops || !Array.isArray(stops) || stops.length === 0) {
        return []
    }
    return [...stops].sort((a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0))
})

const hasMiddleStops = computed(() => middleStops.value.length > 0)

function letterFor(index: number) {
    return index < 26 ? String.fromCharCode(65 + index) : `#${index + 1}`
}

const totalStopsCount = computed(() => middleStops.value.length + 2)

const startAddressLabel = computed(() => `${letterFor(0)} — ${t('citizens.interventionHours.view.startAddress')}`)
const endAddressLabel = computed(() => `${letterFor(totalStopsCount.value - 1)} — ${t('citizens.interventionHours.view.endAddress')}`)
function stopAddressLabel(idx: number) {
    return `${letterFor(idx + 1)} — ${t('citizens.interventionHours.view.stopAddress')}`
}

const locationLogs = computed<LocationLog[]>(() => {
    const logs = props.selectedCareHour?.location_logs
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
        return []
    }
    // Sort by created_at to ensure correct order
    return [...logs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
})

const hasLocationLogs = computed(() => locationLogs.value.length > 0)

const startLat = computed(() => {
    const v = props.selectedCareHour?.geo_start_lat ?? null
    return v !== undefined && v !== null ? Number(v) : null
})
const startLng = computed(() => {
    const v = props.selectedCareHour?.geo_start_lng ?? null
    return v !== undefined && v !== null ? Number(v) : null
})
const endLat = computed(() => {
    const v = props.selectedCareHour?.geo_end_lat ?? null
    return v !== undefined && v !== null ? Number(v) : null
})
const endLng = computed(() => {
    const v = props.selectedCareHour?.geo_end_lng ?? null
    return v !== undefined && v !== null ? Number(v) : null
})

const startCoordsValid = computed(() => {
    return startLat.value !== null && startLng.value !== null && !Number.isNaN(startLat.value) && !Number.isNaN(startLng.value)
})
const endCoordsValid = computed(() => {
    return endLat.value !== null && endLng.value !== null && !Number.isNaN(endLat.value) && !Number.isNaN(endLng.value)
})

const startMarker = computed(() => {
    return startCoordsValid.value ? { lat: startLat.value as number, lng: startLng.value as number } : null
})

const startMarkerPopup = computed(() => {
    return props.selectedCareHour?.start_address || t('citizens.timeRegistration.registerTransport.form.start')
})

const extraMarkers = computed(() => {
    const arr: Array<{ lat: number; lng: number; popup?: string }> = []

    if (hasLocationLogs.value) {
        locationLogs.value.forEach((log, idx) => {
            const lat = Number(log.latitude)
            const lng = Number(log.longitude)

            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                const isStart = startCoordsValid.value &&
                    Math.abs(lat - startLat.value!) < 0.0001 &&
                    Math.abs(lng - startLng.value!) < 0.0001
                const isEnd = endCoordsValid.value &&
                    Math.abs(lat - endLat.value!) < 0.0001 &&
                    Math.abs(lng - endLng.value!) < 0.0001

                if (!isStart && !isEnd) {
                    arr.push({
                        lat,
                        lng,
                        popup: t('citizens.interventionHours.view.locationLogPoint', {
                            index: idx + 1,
                            time: new Date(log.created_at).toLocaleTimeString(locale.value)
                        })
                    })
                }
            }
        })
    }

    if (!hasLocationLogs.value && hasMiddleStops.value) {
        middleStops.value.forEach((stop, idx) => {
            const lat = Number(stop.latitude)
            const lng = Number(stop.longitude)

            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                arr.push({
                    lat,
                    lng,
                    popup: stopAddressLabel(idx),
                })
            }
        })
    }

    if (endCoordsValid.value) {
        arr.push({
            lat: endLat.value as number,
            lng: endLng.value as number,
            popup: props.selectedCareHour?.end_address ?? t('citizens.timeRegistration.registerTransport.form.end'),
        })
    }

    return arr
})

const polylinePoints = computed(() => {
    const points: Array<[number, number]> = []

    if (startCoordsValid.value) {
        points.push([startLat.value as number, startLng.value as number])
    }

    if (hasLocationLogs.value) {
        locationLogs.value.forEach(log => {
            const lat = Number(log.latitude)
            const lng = Number(log.longitude)
            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                points.push([lat, lng])
            }
        })
    } else if (hasMiddleStops.value) {
        middleStops.value.forEach(stop => {
            const lat = Number(stop.latitude)
            const lng = Number(stop.longitude)
            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                points.push([lat, lng])
            }
        })
    }

    if (endCoordsValid.value) {
        points.push([endLat.value as number, endLng.value as number])
    }

    return points.length > 1 ? points : []
})

function onMapReady(mapObj: any) {
    mapInstance.value = mapObj
    fitMapBounds()
}

function fitMapBounds() {
    if (!mapInstance.value) return

    nextTick(() => {
        try {
            if (polylinePoints.value.length > 1) {
                mapInstance.value.fitBounds(polylinePoints.value, {
                    padding: [50, 50],
                    maxZoom: 15
                })
            } else if (startCoordsValid.value && endCoordsValid.value) {
                const bounds = [
                    [startLat.value as number, startLng.value as number],
                    [endLat.value as number, endLng.value as number]
                ]
                mapInstance.value.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 15
                })
            } else if (startCoordsValid.value) {
                mapInstance.value.setView([startLat.value as number, startLng.value as number], 15)
            } else if (endCoordsValid.value) {
                mapInstance.value.setView([endLat.value as number, endLng.value as number], 15)
            }
        } catch (err) {

        }
    })
}

watch(
    () => props.selectedCareHour,
    async (val) => {
        if (!val) return

        await nextTick()

        if (startCoordsValid.value) {
            mapCenter.value = [startLat.value as number, startLng.value as number]
        } else if (endCoordsValid.value) {
            mapCenter.value = [endLat.value as number, endLng.value as number]
        }

        if (mapInstance.value) {
            fitMapBounds()
        }
    },
    { immediate: true }
)

watch(
    () => props.isModalOpen,
    (isOpen) => {
        if (isOpen && mapInstance.value) {
            setTimeout(() => {
                mapInstance.value.invalidateSize()
                fitMapBounds()
            }, 100)
        }
    }
)
</script>
