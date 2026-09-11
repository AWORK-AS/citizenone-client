<template>
    <div>
        <Modal size="sm" :title="$t('mileageLog.view.viewTrip')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="space-y-1 my-1">
                        <FormLabel :label="$t('mileageLog.view.createdBy')" />
                        <div class="flex items-center gap-x-2 py-1">
                            <img :src="props.selectedMileageLog?.user?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${props.selectedMileageLog?.user?.firstname + ' ' + props.selectedMileageLog?.user?.lastname}`"
                                class="h-10 w-10 rounded-full bg-gray-50 object-cover border-2" />
                            <p class="text-sm font-medium">
                                {{ props.selectedMileageLog?.user?.firstname }}
                                {{ props.selectedMileageLog?.user?.lastname }}
                            </p>
                        </div>
                    </div>

                    <div class="space-y-1 my-1" v-if="props.selectedMileageLog?.citizen">
                        <FormLabel :label="$t('mileageLog.view.linkedCitizen')" />
                        <div class="flex items-center gap-x-2 py-1">
                            <img :src="props.selectedMileageLog?.citizen?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${props.selectedMileageLog?.citizen?.firstname + ' ' + props.selectedMileageLog?.citizen?.lastname}`"
                                class="h-10 w-10 rounded-full bg-gray-50 object-cover border-2" />
                            <p class="text-sm font-medium">
                                {{ props.selectedMileageLog?.citizen?.firstname }}
                                {{ props.selectedMileageLog?.citizen?.lastname }}
                            </p>
                        </div>
                    </div>

                    <div class="space-y-1 my-1">
                        <FormLabel :label="$t('mileageLog.view.dateTimeStart')" />
                        <p class="text-sm font-semibold text-gray-700">
                            {{ formatDateTimeToReadable(props.selectedMileageLog?.date_time_start) }}
                        </p>
                    </div>

                    <div class="space-y-1 my-1" v-for="(stop, index) in routeStops" :key="index">
                        <FormLabel :label="stopLabel(index)" />
                        <p class="text-sm font-semibold text-gray-700">{{ stop.address }}</p>
                    </div>

                    <div class="space-y-1 my-1">
                        <FormLabel :label="$t('mileageLog.view.distance')" />
                        <p class="text-sm font-semibold text-gray-700">
                            {{ formatNumber(locale, props.selectedMileageLog?.kilometers) }} km
                        </p>
                        <!-- distance_source_label is null on every row created before this
                             deploy -- render that as unknown provenance, never blank and
                             never as "GPS". A flagged 0.00 km trip is a legitimate answer
                             (the only leg was impossible), not "nothing recorded". -->
                        <p class="text-xs text-gray-400">{{ distanceSourceLabel }}</p>
                    </div>

                    <div class="space-y-1 my-2" v-if="props.selectedMileageLog?.needs_review">
                        <div class="flex items-start gap-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <Icon name="ph:warning-circle" class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <p class="text-sm font-semibold text-red-700">{{ $t('mileageLog.table.needsReview') }}</p>
                                <p class="text-xs text-red-700 mt-0.5" v-if="props.selectedMileageLog?.review_reason_label">
                                    {{ props.selectedMileageLog.review_reason_label }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-1 my-2">
                        <div class="h-48 w-full rounded-md overflow-hidden border">
                            <MapLocation ref="mapRef" :center="mapCenter" :extraMarkers="extraMarkers"
                                :polylinePoints="polylinePoints" @map-ready="onMapReady" />
                        </div>
                    </div>

                    <div class="space-y-1 my-1" v-if="props.selectedMileageLog?.note">
                        <FormLabel :label="$t('mileageLog.view.note')" />
                        <p class="text-sm font-semibold text-gray-700">{{ props.selectedMileageLog?.note }}</p>
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
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useRoutePreview } from '@/composables/routePreview'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedMileageLog: {
        type: Object as PropType<Record<string, any> | null>,
        required: true,
    },
})
const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()

function closeModal() {
    emit('close')
}

const distanceSourceLabel = computed(() => {
    return props.selectedMileageLog?.distance_source_label || t('mileageLog.table.distanceSourceUnknown')
})

const mapRef = ref<any>(null)
const mapCenter = ref<[number, number]>([55.6761, 12.5683])
const mapInstance = ref<any>(null)

function validCoord(lat: any, lng: any) {
    return lat !== null && lat !== undefined && lng !== null && lng !== undefined && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
}

function letterFor(index: number) {
    return index < 26 ? String.fromCharCode(65 + index) : `#${index + 1}`
}

// "A — Start address" / "B — Stop address" / "C — End address", matching the
// citizen-scoped intervention hours view and the create/edit form.
function stopLabel(index: number) {
    const letter = letterFor(index)
    if (index === 0) return `${letter} — ${t('mileageLog.view.startAddress')}`
    if (index === routeStops.value.length - 1) return `${letter} — ${t('mileageLog.view.endAddress')}`

    return `${letter} — ${t('mileageLog.view.stopAddress')}`
}

const middleStops = computed(() => {
    const log = props.selectedMileageLog
    if (!log) return []

    return (log.stops ?? [])
        .slice()
        .sort((a: any, b: any) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0))
})

const routeStops = computed(() => {
    const log = props.selectedMileageLog
    if (!log) return []

    return [
        { address: log.start_address, lat: log.geo_start_lat, lng: log.geo_start_lng },
        ...middleStops.value.map((s: any) => ({ address: s.address, lat: s.latitude, lng: s.longitude })),
        { address: log.end_address, lat: log.geo_end_lat, lng: log.geo_end_lng },
    ].filter((s) => s.address || validCoord(s.lat, s.lng))
})

const extraMarkers = computed(() => {
    // Keep the index tied to the position in routeStops (not to the filtered
    // list) so a stop with no coordinates can't shift the marker letters out
    // of sync with the route list above. This stays the address legend even
    // for a GPS-tracked trip -- the breadcrumb trail is conveyed by the
    // polyline alone (a marker per breadcrumb overwhelms the map on a long
    // trip and has nothing to do with the lettered stop list above the map).
    return routeStops.value
        .map((stop, index) => ({ stop, index }))
        .filter(({ stop }) => validCoord(stop.lat, stop.lng))
        .map(({ stop, index }) => ({
            lat: Number(stop.lat),
            lng: Number(stop.lng),
            popup: `${letterFor(index)}. ${stop.address ?? ''}`,
        }))
})

function logTime(log: any) {
    return new Date(log.recorded_at ?? log.created_at).getTime()
}

// GPS breadcrumbs recorded during a tracked trip (only present once the modal
// has the single-trip record -- see the detail fetch in the consuming pages).
// Sorted by recorded_at (falling back to created_at for legacy/untimed rows),
// matching TripDistanceCalculator::calculateForCareHour's own ordering rule --
// the relation's default `orderBy('created_at')` alone is not reliable for a
// batch-flushed backlog, where many rows share one created_at.
const locationLogs = computed(() => {
    const logs = props.selectedMileageLog?.location_logs
    if (!logs || !Array.isArray(logs) || logs.length === 0) return []

    return [...logs]
        .filter((l: any) => validCoord(l.latitude, l.longitude))
        .sort((a: any, b: any) => logTime(a) - logTime(b))
        // Drop consecutive duplicate fixes (a parked/idle GPS repeats the same
        // coordinate), same dedup TripDistanceCalculator applies before it
        // computes distance from these points.
        .filter((l: any, i: number, arr: any[]) => i === 0
            || Number(l.latitude) !== Number(arr[i - 1].latitude)
            || Number(l.longitude) !== Number(arr[i - 1].longitude))
})

// Requires >= 2 points, matching the same threshold the backend's own
// distance calculation trusts breadcrumbs at -- a single point (most of the
// breadcrumb-bearing trips in practice) isn't a route, and preferring it here
// would throw away a perfectly good stops-derived line for a degenerate one.
const hasLocationLogs = computed(() => locationLogs.value.length >= 2)

// Full ordered chain (start, then middle stops, then end) as sent to
// /route-preview -- unfiltered, unlike routeStops above, since the endpoint
// needs every entry resolved or none of it.
const rawRouteStops = computed(() => {
    const log = props.selectedMileageLog
    if (!log) return []

    return [
        { lat: log.geo_start_lat, lng: log.geo_start_lng },
        ...middleStops.value.map((s: any) => ({ lat: s.latitude, lng: s.longitude })),
        { lat: log.geo_end_lat, lng: log.geo_end_lng },
    ]
})

const canFetchRoadRoute = computed(() => {
    return !hasLocationLogs.value
        && rawRouteStops.value.length >= 2
        && rawRouteStops.value.every((s) => validCoord(s.lat, s.lng))
})

// This trip was manually entered (no GPS breadcrumbs) -- ask the backend for
// the same OSRM road geometry the stored kilometres were calculated from,
// rather than drawing a straight line between the typed addresses (see
// composables/tripDistance.ts for why that under-reports distance badly).
// Nothing is stored on the trip itself, so a saved trip re-asks
// /route-preview same as the entry form; polylinePoints below falls back to
// the straight-line approximation while this is loading or if it fails.
const { state: roadRoute, request: requestRoadRoute, reset: resetRoadRoute } = useRoutePreview(t)

watch(() => props.selectedMileageLog, () => {
    if (!canFetchRoadRoute.value) {
        resetRoadRoute()
        return
    }
    requestRoadRoute(rawRouteStops.value.map((s) => ({ lat: Number(s.lat), lng: Number(s.lng) })))
}, { immediate: true })

const startPoint = computed<[number, number] | null>(() => {
    const log = props.selectedMileageLog
    return log && validCoord(log.geo_start_lat, log.geo_start_lng)
        ? [Number(log.geo_start_lat), Number(log.geo_start_lng)]
        : null
})

const endPoint = computed<[number, number] | null>(() => {
    const log = props.selectedMileageLog
    return log && validCoord(log.geo_end_lat, log.geo_end_lng)
        ? [Number(log.geo_end_lat), Number(log.geo_end_lng)]
        : null
})

// Straight line between the typed stops -- the old behaviour, kept only as a
// fallback for while the road route is loading or if the lookup fails. The
// trip's stored `kilometers` (with its own provenance label) is authoritative
// either way; this map is illustrative, so an approximate line beats a blank
// one.
const straightLinePoints = computed(() => {
    const points: Array<[number, number]> = []
    if (startPoint.value) points.push(startPoint.value)
    middleStops.value
        .filter((s: any) => validCoord(s.latitude, s.longitude))
        .forEach((s: any) => points.push([Number(s.latitude), Number(s.longitude)]))
    if (endPoint.value) points.push(endPoint.value)
    return points.length > 1 ? points : []
})

const polylinePoints = computed(() => {
    if (hasLocationLogs.value) {
        const points: Array<[number, number]> = []
        if (startPoint.value) points.push(startPoint.value)
        locationLogs.value.forEach((log: any) => points.push([Number(log.latitude), Number(log.longitude)]))
        if (endPoint.value) points.push(endPoint.value)
        return points.length > 1 ? points : []
    }

    // No GPS breadcrumbs -- prefer the actual road geometry once it arrives.
    if (roadRoute.value.status === 'ready' && roadRoute.value.coordinates && roadRoute.value.coordinates.length > 1) {
        return roadRoute.value.coordinates
    }
    return straightLinePoints.value
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
                mapInstance.value.fitBounds(polylinePoints.value, { padding: [50, 50], maxZoom: 15 })
            } else if (polylinePoints.value.length === 1) {
                mapInstance.value.setView(polylinePoints.value[0], 15)
            } else if (extraMarkers.value.length > 1) {
                // No line at all (e.g. a GPS trip with < 2 usable fixes and no
                // resolvable stops) -- fall back to framing the stop markers
                // so the map isn't stuck on the default Denmark-wide view.
                mapInstance.value.fitBounds(extraMarkers.value.map((m) => [m.lat, m.lng]), { padding: [50, 50], maxZoom: 15 })
            } else if (extraMarkers.value.length === 1) {
                mapInstance.value.setView([extraMarkers.value[0].lat, extraMarkers.value[0].lng], 15)
            }
        } catch (err) {
            // ignore map fit errors (e.g. map not fully ready)
        }
    })
}

watch(() => props.selectedMileageLog, async () => {
    await nextTick()
    if (polylinePoints.value.length > 0) {
        mapCenter.value = polylinePoints.value[0]
    } else if (extraMarkers.value.length > 0) {
        mapCenter.value = [extraMarkers.value[0].lat, extraMarkers.value[0].lng]
    }
    if (mapInstance.value) {
        fitMapBounds()
    }
}, { immediate: true })

// The road route above resolves asynchronously (debounced + a network round
// trip), after this file's other selectedMileageLog watcher already ran --
// this is what re-fits the map once that response actually lands.
watch(() => roadRoute.value.status, () => {
    if (mapInstance.value) fitMapBounds()
})

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen && mapInstance.value) {
        setTimeout(() => {
            mapInstance.value.invalidateSize()
            fitMapBounds()
        }, 100)
    }
})
</script>
