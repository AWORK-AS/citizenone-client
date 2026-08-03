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

const routeStops = computed(() => {
    const log = props.selectedMileageLog
    if (!log) return []

    const middle = (log.stops ?? [])
        .slice()
        .sort((a: any, b: any) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0))

    return [
        { address: log.start_address, lat: log.geo_start_lat, lng: log.geo_start_lng },
        ...middle.map((s: any) => ({ address: s.address, lat: s.latitude, lng: s.longitude })),
        { address: log.end_address, lat: log.geo_end_lat, lng: log.geo_end_lng },
    ].filter((s) => s.address || validCoord(s.lat, s.lng))
})

const extraMarkers = computed(() => {
    // Keep the index tied to the position in routeStops (not to the filtered
    // list) so a stop with no coordinates can't shift the marker letters out
    // of sync with the route list above.
    return routeStops.value
        .map((stop, index) => ({ stop, index }))
        .filter(({ stop }) => validCoord(stop.lat, stop.lng))
        .map(({ stop, index }) => ({
            lat: Number(stop.lat),
            lng: Number(stop.lng),
            popup: `${letterFor(index)}. ${stop.address ?? ''}`,
        }))
})

const polylinePoints = computed(() => {
    const points: Array<[number, number]> = routeStops.value
        .filter((s) => validCoord(s.lat, s.lng))
        .map((s) => [Number(s.lat), Number(s.lng)])
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
