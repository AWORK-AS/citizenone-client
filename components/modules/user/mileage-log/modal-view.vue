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
                        <!-- Translated client-side from the raw distance_source key, not
                             from the server's pre-rendered label -- see useMileageLabels().
                             A row created before the provenance deploy has no key at all and
                             reads as unknown provenance, never blank and never as "GPS". A
                             flagged 0.00 km trip is a legitimate answer (the only leg was
                             impossible), not "nothing recorded". -->
                        <p class="text-xs text-gray-400">{{ distanceSourceLabel }}</p>

                        <!-- Ungated: the driver whose trip was corrected has to be able to
                             see the figure it replaced and the reason given, even though
                             only a manager can make the correction. -->
                        <div class="mt-2 rounded-md bg-amber-50 border border-amber-200 p-3 space-y-1"
                            v-if="props.selectedMileageLog?.is_distance_overridden">
                            <p class="flex items-center gap-x-1 text-sm font-semibold text-amber-700">
                                <Icon name="ph:pencil-simple-line" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('mileageLog.table.corrected') }}
                            </p>
                            <p class="text-xs text-amber-800" v-if="props.selectedMileageLog?.kilometers_calculated != null">
                                {{ $t('mileageLog.correction.calculatedDistance') }}:
                                {{ formatNumber(locale, props.selectedMileageLog.kilometers_calculated) }} km
                            </p>
                            <p class="text-xs text-amber-800" v-if="props.selectedMileageLog?.kilometers_override_reason">
                                {{ $t('mileageLog.correction.reason') }}:
                                {{ props.selectedMileageLog.kilometers_override_reason }}
                            </p>
                            <p class="text-xs text-amber-700" v-if="overriddenByLabel">{{ overriddenByLabel }}</p>
                        </div>
                    </div>

                    <div class="space-y-1 my-2" v-if="props.selectedMileageLog?.needs_review">
                        <div class="flex items-start gap-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <Icon name="ph:warning-circle" class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <p class="text-sm font-semibold text-red-700">{{ $t('mileageLog.table.needsReview') }}</p>
                                <p class="text-xs text-red-700 mt-0.5" v-if="reviewReasonLabel">
                                    {{ reviewReasonLabel }}
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

                    <div class="mt-5 flex justify-end gap-x-3">
                        <FormButton buttonStyle="action" @click="emit('correctDistance')"
                            v-if="canCorrectDistance">
                            <Icon name="ph:ruler" class="size-4" />
                            {{ $t('mileageLog.correction.correctDistance') }}
                        </FormButton>
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
import { usePermissions } from '@/composables/usePermissions'
import { useMileageLabels } from '@/composables/mileageLabels'

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
const emit = defineEmits(['close', 'correctDistance'])

const { t, locale } = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const { isAtLeast } = usePermissions()
const labels = useMileageLabels()

// Same gate as the list page's canCorrectDistance, and the only thing that
// changes if drivers are later allowed to correct their own trips. The badge
// above is deliberately NOT behind it.
const canCorrectDistance = isAtLeast('Manager')

// kilometers_overridden_by is only eager-loaded on the single-trip record, so
// this stays empty until the detail fetch lands - fall back to the bare date
// rather than printing "Corrected by  on ...".
const overriddenByLabel = computed(() => {
    const log = props.selectedMileageLog
    if (!log?.kilometers_overridden_at) return ''

    const by = log.kilometers_overridden_by
    const name = by ? `${by.firstname ?? ''} ${by.lastname ?? ''}`.trim() : ''
    if (!name) return formatDateTimeToReadable(log.kilometers_overridden_at)

    return t('mileageLog.correction.correctedBy', {
        name,
        date: formatDateTimeToReadable(log.kilometers_overridden_at),
    })
})

function closeModal() {
    emit('close')
}

const distanceSourceLabel = computed(() => labels.distanceSourceLabel(props.selectedMileageLog))
const reviewReasonLabel = computed(() => labels.reviewReasonLabel(props.selectedMileageLog))

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

const polylinePoints = computed(() => {
    const points: Array<[number, number]> = []

    if (startPoint.value) points.push(startPoint.value)

    if (hasLocationLogs.value) {
        locationLogs.value.forEach((log: any) => points.push([Number(log.latitude), Number(log.longitude)]))
    } else {
        middleStops.value
            .filter((s: any) => validCoord(s.latitude, s.longitude))
            .forEach((s: any) => points.push([Number(s.latitude), Number(s.longitude)]))
    }

    if (endPoint.value) points.push(endPoint.value)

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
                mapInstance.value.fitBounds(polylinePoints.value, { padding: [50, 50], maxZoom: 15 })
            } else if (polylinePoints.value.length === 1) {
                mapInstance.value.setView(polylinePoints.value[0], 15)
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
    }
    if (mapInstance.value) {
        fitMapBounds()
    }
}, { immediate: true })

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen && mapInstance.value) {
        setTimeout(() => {
            mapInstance.value.invalidateSize()
            fitMapBounds()
        }, 100)
    }
})
</script>
