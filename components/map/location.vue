<template>
    <ClientOnly>
        <LMap 
            :key="mapKey" 
            ref="lmap" 
            :center="internalCenter" 
            :zoom="internalZoom" 
            @click="onMapClick"
            @ready="onMapReady"
            class="w-full h-full"
        >
            <LTileLayer :url="tileUrl" :attribution="tileAttribution" />
            <LMarker 
                v-if="markerLat !== null && markerLng !== null" 
                :lat-lng="[markerLat, markerLng]"
                :draggable="draggable" 
                ref="markerRef" 
                @update:lat-lng="onMarkerUpdate" 
                @dragend="onMarkerDragEnd"
            >
                <LPopup v-if="markerPopup">{{ markerPopup }}</LPopup>
            </LMarker>

            <template v-for="(m, idx) in extraMarkers" :key="`extra-marker-${idx}`">
                <LMarker v-if="validCoord(m)" :lat-lng="[Number(m.lat), Number(m.lng)]">
                    <LPopup v-if="m.popup">{{ m.popup }}</LPopup>
                </LMarker>
            </template>

            <LPolyline 
                v-if="polylinePoints && polylinePoints.length > 1" 
                :lat-lngs="polylinePoints"
                :color="polylineColor" 
                :weight="polylineWeight" 
            />
        </LMap>
    </ClientOnly>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import type { PropType } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup, LPolyline } from '@vue-leaflet/vue-leaflet'

const props = defineProps({
    center: {
        type: Array as any,
        default: () => [55.6761, 12.5683],
    },
    zoom: {
        type: Number,
        default: 13,
    },
    markerCoords: {
        type: Object as PropType<{ lat: number | string; lng: number | string } | null>,
        default: null,
    },
    markerPopup: {
        type: String,
        default: '',
    },
    extraMarkers: {
        type: Array as PropType<Array<{ lat: number | string; lng: number | string; popup?: string }>>,
        default: () => [],
    },
    polylinePoints: {
        type: Array as PropType<Array<[number, number]>>,
        default: () => [],
    },
    polylineColor: {
        type: String,
        default: '#3b82f6',
    },
    polylineWeight: {
        type: Number,
        default: 4,
    },
    draggable: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits<{
    (e: 'update:marker', coords: { lat: number; lng: number }): void
    (e: 'map-ready', mapObj: any): void
}>()

const mapKey = ref(0)
const lmap = ref<any>(null)
const markerRef = ref<any>(null)
const internalCenter = ref<[number, number]>(props.center)
const internalZoom = ref<number>(props.zoom)

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tileAttribution = '&copy; OpenStreetMap contributors'

const markerLat = computed(() => {
    return props.markerCoords && props.markerCoords.lat !== undefined && props.markerCoords.lat !== null
        ? Number(props.markerCoords.lat)
        : null
})
const markerLng = computed(() => {
    return props.markerCoords && props.markerCoords.lng !== undefined && props.markerCoords.lng !== null
        ? Number(props.markerCoords.lng)
        : null
})

watch(
    () => props.center,
    (c) => {
        if (c && Array.isArray(c)) internalCenter.value = c as [number, number]
    }
)
watch(
    () => props.zoom,
    (z) => {
        if (typeof z === 'number') internalZoom.value = z
    }
)

function validCoord(m: any) {
    return m && m.lat !== undefined && m.lng !== undefined && m.lat !== null && m.lng !== null && !Number.isNaN(Number(m.lat)) && !Number.isNaN(Number(m.lng))
}

function getMapObject() {
    return lmap.value?.leafletObject || lmap.value?.mapObject || lmap.value
}

function onMapReady() {
    nextTick(() => {
        const mapObj = getMapObject()
        if (mapObj) {
            emit('map-ready', mapObj)
        }
    })
}

function onMapClick(e: any) {
    if (!e?.latlng) return
    const lat = e.latlng.lat
    const lng = e.latlng.lng
    emit('update:marker', { lat, lng })
}

function onMarkerUpdate(payload: any) {
    let lat: number | undefined
    let lng: number | undefined

    if (Array.isArray(payload) && payload.length >= 2) {
        lat = Number(payload[0])
        lng = Number(payload[1])
    } else if (payload && typeof payload.lat === 'number' && typeof payload.lng === 'number') {
        lat = payload.lat
        lng = payload.lng
    } else if (payload && payload.latlng) {
        lat = payload.latlng.lat
        lng = payload.latlng.lng
    }

    if (lat === undefined || lng === undefined) return

    emit('update:marker', { lat, lng })
}

function onMarkerDragEnd(evt: any) {
    if (!evt?.target?.getLatLng) return
    const ll = evt.target.getLatLng()
    emit('update:marker', { lat: ll.lat, lng: ll.lng })
}

function centerTo(lat: number, lng: number, zoom?: number) {
    internalCenter.value = [lat, lng]
    if (typeof zoom === 'number') internalZoom.value = zoom
    nextTick(() => {
        const mapObj = getMapObject()
        if (mapObj && typeof mapObj.setView === 'function') {
            try {
                mapObj.setView([lat, lng], typeof zoom === 'number' ? zoom : internalZoom.value, { animate: true })
            } catch (e) {
                console.warn('Failed to center map:', e)
            }
        }
    })
}

function setMarker(lat: number, lng: number) {
    emit('update:marker', { lat, lng })
}

defineExpose({
    centerTo,
    setMarker,
    lmap,
    markerRef,
    getMapObject,
})
</script>

<style scoped>
.LMap {
    height: 100%;
    width: 100%;
}
</style>