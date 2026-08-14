<template>
    <div class="space-y-3">
        <div v-for="(stop, index) in modelValue" :key="stop.key ?? index" class="space-y-1">
            <div class="flex justify-between items-center py-0.5">
                <FormLabel :for="`trip-stop-${index}`" :label="stopLabel(index)" />
                <div class="flex items-center gap-x-3">
                    <button type="button" class="flex gap-x-1 items-center text-tertiary hover:text-tertiary-800"
                        @click="openMapForStop(index)">
                        <Icon name="ph:map-pin" class="w-4 h-4" />
                        <span class="text-xs">{{ $t('mileageLog.form.pickOnMap') }}</span>
                    </button>
                    <button type="button" class="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        :disabled="index === 0" @click="moveStop(index, -1)">
                        <Icon name="ph:arrow-up" class="w-4 h-4" />
                    </button>
                    <button type="button" class="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        :disabled="index === modelValue.length - 1" @click="moveStop(index, 1)">
                        <Icon name="ph:arrow-down" class="w-4 h-4" />
                    </button>
                    <button type="button" v-if="modelValue.length > min"
                        class="text-red-400 hover:text-red-600" @click="removeStop(index)">
                        <Icon name="ph:trash" class="w-4 h-4" />
                    </button>
                </div>
            </div>

            <FormAddressAutocomplete :id="`trip-stop-${index}`" :name="`trip-stop-${index}`"
                :placeholder="stopLabel(index)" :model-value="stop.address" :coords="stopCoords(stop)"
                :busy="busyKeys.has(stop.key ?? '')" @update:model-value="(value) => onAddressInput(stop, value)"
                @select="(s) => onAddressSelected(stop, s)" @clear="onAddressCleared(stop)">
                <template #actions>
                    <button type="button" class="flex items-center gap-x-1 text-xs text-tertiary hover:text-tertiary-800"
                        :disabled="busyKeys.has(stop.key ?? '')" @click="useMyLocation(stop)">
                        <Icon name="ph:crosshair" class="w-4 h-4" />
                        {{ $t('mileageLog.form.useMyLocation') }}
                    </button>
                </template>
            </FormAddressAutocomplete>

            <FormError :error="errors?.[index]" />
        </div>

        <button type="button" v-if="!max || modelValue.length < max"
            class="flex items-center gap-x-1 text-sm text-primary hover:text-primary-700" @click="addStop">
            <Icon name="ph:plus" class="w-4 h-4" />
            {{ $t('mileageLog.form.addStop') }}
        </button>

        <Modal size="lg" :title="$t('mileageLog.form.pickOnMap')" :show="state.isMapModalOpen" @close="cancelMap">
            <template #modal-body>
                <div class="space-y-4">
                    <FormAddressAutocomplete name="trip-stop-map-search" :placeholder="$t('mileageLog.form.searchOnMap')"
                        :model-value="state.mapSearch" :coords="null" :show-confirmation="false"
                        @update:model-value="(v) => (state.mapSearch = v)" @select="onMapSearchSelect" />

                    <div class="h-80 w-full rounded-md overflow-hidden border">
                        <MapLocation ref="mapRef" :center="state.mapCenter" :zoom="state.mapZoom"
                            :markerCoords="activeMarker" :extraMarkers="otherMarkers" draggable layers
                            @update:marker="onMarkerUpdate" @map-ready="onMapReady" />
                    </div>
                    <p class="text-xs text-tertiary">{{ $t('mileageLog.form.mapHint') }}</p>

                    <div v-if="activeStopAddress" class="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p class="text-sm font-semibold text-gray-700">{{ activeStopAddress }}</p>
                    </div>
                    <div class="flex justify-end gap-3">
                        <FormButton buttonStyle="cancel" @click="cancelMap">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" @click="confirmMap">
                            {{ $t('citizens.form.useThisLocation') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocationHelper } from '@/composables/locationHelper'
import { useAlert } from '@/composables/alert'
import type { ResolvedAddressSuggestion } from '@/composables/addressSearch'

export interface TripStopValue {
    address: string
    lat: number | null
    lng: number | null
    key?: string
}

const props = defineProps({
    modelValue: {
        type: Array as PropType<TripStopValue[]>,
        required: true,
    },
    min: {
        type: Number,
        default: 2,
    },
    max: {
        type: Number,
        default: 0,
    },
    errors: {
        type: Array as PropType<Array<string | undefined>>,
        default: () => [],
    },
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: TripStopValue[]): void
}>()

const { t } = useI18n()
const { reverseGeocode, getLocationAndAddress } = useLocationHelper(t)
const { errorAlert } = useAlert()

let keySeq = 0
function newKey() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    keySeq += 1
    return `stop-${keySeq}-${Date.now()}`
}

// Ensure every stop has a stable key. Guarded so this is a no-op once every
// stop is keyed (form.vue seeds keys up front on the happy path) — without
// the guard this would loop on every emitted update.
watch(
    () => props.modelValue,
    (stops) => {
        if (!stops?.some((s) => !s.key)) return
        emit('update:modelValue', stops.map((s) => (s.key ? s : { ...s, key: newKey() })))
    },
    { immediate: true }
)

const DEFAULT_CENTER: [number, number] = [55.6761, 12.5683]
const ADDRESS_ZOOM = 18
const AREA_ZOOM = 13
const COUNTRY_ZOOM = 7

const state = reactive({
    isMapModalOpen: false,
    activeKey: '',
    mapCenter: DEFAULT_CENTER as [number, number],
    mapZoom: AREA_ZOOM,
    mapSearch: '',
    snapshot: null as TripStopValue | null,
})

const busyKeys = reactive(new Set<string>())
const mapRef = ref<any>(null)

function stopLabel(index: number) {
    const letter = index < 26 ? String.fromCharCode(65 + index) : `#${index + 1}`
    if (index === 0) return `${letter} — ${t('mileageLog.form.startAddress')}`
    if (index === props.modelValue.length - 1) return `${letter} — ${t('mileageLog.form.endAddress')}`
    return `${letter} — ${t('mileageLog.form.stopAddress')}`
}

function hasCoords(stop: TripStopValue | undefined | null) {
    return !!stop && stop.lat !== null && stop.lat !== undefined && stop.lng !== null && stop.lng !== undefined
}

function stopCoords(stop: TripStopValue) {
    if (!hasCoords(stop)) return null
    return { lat: Number(stop.lat), lng: Number(stop.lng) }
}

function updateStops(stops: TripStopValue[]) {
    emit('update:modelValue', stops)
}

function findIndexByKey(key: string) {
    return props.modelValue.findIndex((s) => s.key === key)
}

/**
 * Every async write (geocode selection, "use my location", marker drag)
 * resolves the stop's array index at write time via its stable key, rather
 * than closing over an index captured when the async call started. If the
 * stop was reordered or removed in the meantime, the write lands on the
 * correct stop (or is silently dropped if it no longer exists).
 */
function writeByKey(key: string, patch: Partial<TripStopValue>) {
    const i = findIndexByKey(key)
    if (i === -1) return
    const stops = [...props.modelValue]
    stops[i] = { ...stops[i], ...patch }
    updateStops(stops)
}

function addStop() {
    const stops = [...props.modelValue, { address: '', lat: null, lng: null, key: newKey() }]
    updateStops(stops)
}

function removeStop(index: number) {
    const stops = props.modelValue.filter((_, i) => i !== index)
    updateStops(stops)
}

function moveStop(index: number, direction: 1 | -1) {
    const target = index + direction
    if (target < 0 || target >= props.modelValue.length) return
    const stops = [...props.modelValue]
    const [removed] = stops.splice(index, 1)
    stops.splice(target, 0, removed)
    updateStops(stops)
}

function onAddressInput(stop: TripStopValue, value: string) {
    if (!stop.key) return
    writeByKey(stop.key, { address: value })
}

function onAddressSelected(stop: TripStopValue, suggestion: ResolvedAddressSuggestion) {
    if (!stop.key) return
    writeByKey(stop.key, { address: suggestion.label, lat: suggestion.lat, lng: suggestion.lng })
}

function onAddressCleared(stop: TripStopValue) {
    if (!stop.key) return
    writeByKey(stop.key, { lat: null, lng: null })
}

async function useMyLocation(stop: TripStopValue) {
    if (!stop.key) return
    const key = stop.key
    busyKeys.add(key)
    try {
        const res = await getLocationAndAddress({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
        if (!res.success) {
            errorAlert(t('mileageLog.form.address.locationFailed'), res.error || '')
            return
        }
        writeByKey(key, {
            lat: res.latitude!,
            lng: res.longitude!,
            address: res.address ?? `${res.latitude!.toFixed(6)}, ${res.longitude!.toFixed(6)}`,
        })
    } finally {
        busyKeys.delete(key)
    }
}

function nearestNeighbourCoords(index: number): { lat: number; lng: number } | null {
    const stops = props.modelValue
    for (let offset = 1; offset < stops.length; offset++) {
        const before = stops[index - offset]
        if (hasCoords(before)) return stopCoords(before)
        const after = stops[index + offset]
        if (hasCoords(after)) return stopCoords(after)
    }
    return null
}

function openMapForStop(index: number) {
    const stop = props.modelValue[index]
    if (!stop?.key) return

    state.activeKey = stop.key
    state.snapshot = { ...stop }
    state.mapSearch = ''

    // Always reassign both center and zoom — never leave a stale center from
    // a previously-opened stop (this was the "map isn't centered correctly"
    // complaint: an empty stop kept whatever center the last stop left behind).
    if (hasCoords(stop)) {
        state.mapCenter = [Number(stop.lat), Number(stop.lng)]
        state.mapZoom = ADDRESS_ZOOM
    } else {
        const neighbour = nearestNeighbourCoords(index)
        if (neighbour) {
            state.mapCenter = [neighbour.lat, neighbour.lng]
            state.mapZoom = AREA_ZOOM
        } else {
            state.mapCenter = DEFAULT_CENTER
            state.mapZoom = COUNTRY_ZOOM
        }
    }

    state.isMapModalOpen = true
}

function recentre() {
    mapRef.value?.invalidate?.()
    const [lat, lng] = state.mapCenter
    mapRef.value?.centerTo?.(lat, lng, state.mapZoom)
}

function onMapReady() {
    recentre()
}

watch(
    () => state.isMapModalOpen,
    async (open) => {
        if (!open) return
        await nextTick()
        // Leaflet measures its container's size on init; inside a modal that
        // container is animating open (duration-300), so invalidateSize()
        // must run after layout has settled, not on mount.
        setTimeout(recentre, 100)
    }
)

function cancelMap() {
    if (state.snapshot && state.activeKey) {
        writeByKey(state.activeKey, { ...state.snapshot })
    }
    state.isMapModalOpen = false
}

async function confirmMap() {
    const stop = props.modelValue.find((s) => s.key === state.activeKey)

    // If the user never clicked the map, dragged the marker, or picked a
    // search result, there's nothing to confirm yet — fall back to treating
    // the map's current center as the pick, so the button always does
    // something instead of silently closing with nothing selected.
    if (!hasCoords(stop) && state.activeKey) {
        const [lat, lng] = state.mapCenter
        await onMarkerUpdate({ lat, lng })
    }

    state.isMapModalOpen = false
}

const activeMarker = computed(() => {
    const stop = props.modelValue.find((s) => s.key === state.activeKey)
    return stopCoords(stop as TripStopValue)
})

const activeStopAddress = computed(() => props.modelValue.find((s) => s.key === state.activeKey)?.address ?? '')

const otherMarkers = computed(() => {
    return props.modelValue
        .map((stop, index) => ({ stop, index }))
        .filter(({ stop }) => stop.key !== state.activeKey && hasCoords(stop))
        .map(({ stop, index }) => ({ lat: Number(stop.lat), lng: Number(stop.lng), popup: stopLabel(index) }))
})

async function onMarkerUpdate(coords: { lat: number; lng: number }) {
    if (!state.activeKey) return
    const key = state.activeKey
    writeByKey(key, { lat: coords.lat, lng: coords.lng, address: t('citizens.timeRegistration.registerTransport.form.locating') })

    const address = await reverseGeocode(coords.lat, coords.lng)
    writeByKey(key, { address: address || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` })
}

function onMapSearchSelect(suggestion: ResolvedAddressSuggestion) {
    state.mapCenter = [suggestion.lat, suggestion.lng]
    state.mapZoom = ADDRESS_ZOOM
    mapRef.value?.centerTo?.(suggestion.lat, suggestion.lng, ADDRESS_ZOOM)
    if (state.activeKey) {
        writeByKey(state.activeKey, { lat: suggestion.lat, lng: suggestion.lng, address: suggestion.label })
    }
    state.mapSearch = ''
}
</script>
