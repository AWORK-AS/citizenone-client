<template>
    <div class="space-y-3">
        <div v-for="(stop, index) in modelValue" :key="index" class="space-y-1">
            <div class="flex justify-between items-center py-0.5">
                <FormLabel :for="`trip-stop-${index}`" :label="stopLabel(index)" />
                <div class="flex items-center gap-x-3">
                    <div class="flex gap-x-1 items-center cursor-pointer" @click="openMapForStop(index)">
                        <Icon name="ph:map-pin" class="text-tertiary w-4 h-4" />
                        <span class="text-xs text-tertiary hover:text-tertiary-800">
                            {{ $t('mileageLog.form.pickOnMap') }}
                        </span>
                    </div>
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
            <FormTextArea :id="`trip-stop-${index}`" :name="`trip-stop-${index}`"
                :placeholder="stopLabel(index)" v-model="stop.address"
                @update:modelValue="(value: string) => onAddressInput(index, value)" />
            <FormError :error="errors?.[index]" />
        </div>

        <button type="button" v-if="!max || modelValue.length < max"
            class="flex items-center gap-x-1 text-sm text-primary hover:text-primary-700" @click="addStop">
            <Icon name="ph:plus" class="w-4 h-4" />
            {{ $t('mileageLog.form.addStop') }}
        </button>

        <Modal size="lg" :title="$t('mileageLog.form.pickOnMap')" :show="state.isMapModalOpen"
            @close="state.isMapModalOpen = false">
            <template #modal-body>
                <div class="space-y-4">
                    <div class="h-80 w-full rounded-md overflow-hidden border">
                        <MapLocation ref="mapRef" :center="state.mapCenter" :markerCoords="activeMarker"
                            :extraMarkers="otherMarkers" draggable @update:marker="onMarkerUpdate" />
                    </div>
                    <div v-if="activeStopAddress" class="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p class="text-sm font-semibold text-gray-700">{{ activeStopAddress }}</p>
                    </div>
                    <div class="flex justify-end gap-3">
                        <FormButton buttonStyle="cancel" @click="state.isMapModalOpen = false">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" @click="state.isMapModalOpen = false">
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

export interface TripStopValue {
    address: string
    lat: number | null
    lng: number | null
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
const { geocode, reverseGeocode } = useLocationHelper(t)

const state = reactive({
    isMapModalOpen: false,
    activeIndex: -1,
    mapCenter: [55.6761, 12.5683] as [number, number],
})

const geocodeTimers: Record<number, ReturnType<typeof setTimeout>> = {}

function stopLabel(index: number) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const letter = letters[index] ?? `#${index + 1}`
    if (index === 0) return `${letter} — ${t('mileageLog.form.startAddress')}`
    if (index === props.modelValue.length - 1) return `${letter} — ${t('mileageLog.form.endAddress')}`
    return `${letter} — ${t('mileageLog.form.stopAddress')}`
}

function updateStops(stops: TripStopValue[]) {
    emit('update:modelValue', stops)
}

function addStop() {
    const stops = [...props.modelValue, { address: '', lat: null, lng: null }]
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

function onAddressInput(index: number, value: string) {
    const stops = [...props.modelValue]
    stops[index] = { ...stops[index], address: value }
    updateStops(stops)

    if (geocodeTimers[index]) {
        clearTimeout(geocodeTimers[index])
    }
    geocodeTimers[index] = setTimeout(async () => {
        if (!value || value.trim().length < 4) return
        const result = await geocode(value)
        if (result) {
            const current = [...props.modelValue]
            current[index] = { ...current[index], lat: result.lat, lng: result.lng }
            updateStops(current)
        }
    }, 600)
}

function openMapForStop(index: number) {
    state.activeIndex = index
    const stop = props.modelValue[index]
    if (stop?.lat !== null && stop?.lng !== null && stop?.lat !== undefined && stop?.lng !== undefined) {
        state.mapCenter = [Number(stop.lat), Number(stop.lng)]
    }
    state.isMapModalOpen = true
}

const activeMarker = computed(() => {
    const stop = props.modelValue[state.activeIndex]
    if (!stop || stop.lat === null || stop.lng === null || stop.lat === undefined || stop.lng === undefined) {
        return null
    }
    return { lat: Number(stop.lat), lng: Number(stop.lng) }
})

const activeStopAddress = computed(() => props.modelValue[state.activeIndex]?.address ?? '')

const otherMarkers = computed(() => {
    return props.modelValue
        .map((stop, index) => ({ stop, index }))
        .filter(({ index, stop }) => index !== state.activeIndex && stop.lat !== null && stop.lng !== null && stop.lat !== undefined && stop.lng !== undefined)
        .map(({ stop, index }) => ({ lat: Number(stop.lat), lng: Number(stop.lng), popup: stopLabel(index) }))
})

async function onMarkerUpdate(coords: { lat: number; lng: number }) {
    if (state.activeIndex < 0) return
    const stops = [...props.modelValue]
    stops[state.activeIndex] = {
        ...stops[state.activeIndex],
        lat: coords.lat,
        lng: coords.lng,
        address: t('citizens.timeRegistration.registerTransport.form.locating'),
    }
    updateStops(stops)

    const address = await reverseGeocode(coords.lat, coords.lng)
    const refreshed = [...props.modelValue]
    refreshed[state.activeIndex] = {
        ...refreshed[state.activeIndex],
        address: address || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
    }
    updateStops(refreshed)
}
</script>
