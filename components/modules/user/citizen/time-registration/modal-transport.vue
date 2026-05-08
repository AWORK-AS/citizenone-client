<template>
    <div>
        <Modal size="sm" :title="type === 'login' ? $t('citizens.timeRegistration.registerTransport.registerTransport') : $t('citizens.timeRegistration.registerTransport.endTransport')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-1 mt-3">
                        <ClientOnly>
                            <LMap
                            :key="mapKey"
                            style="height: 16rem; width: 100%; border-radius: 0.375rem; overflow: hidden;"
                            :zoom="mapZoom"
                            :center="mapCenter"
                            @click="onMapClick"
                            ref="lmap"
                            >
                            <LTileLayer :url="tileUrl" :attribution="tileAttribution" />
                            <LMarker
                                v-if="markerLat !== null && markerLng !== null"
                                :lat-lng="[markerLat, markerLng]"
                                :draggable="true"
                                ref="markerRef"
                                @update:lat-lng="onMarkerDrag"
                                @dragend="onMarkerDrag"
                            >
                                <LPopup>
                                {{ state.startAddress || t('citizens.timeRegistration.registerTransport.form.currentLocation') }}
                                </LPopup>
                            </LMarker>
                            </LMap>
                        </ClientOnly>

                    </div>

                    <ModulesUserCitizenTimeRegistrationFormLogin v-if="type === 'login'" :startAddress="state.startAddress" :isLocating="state.isLocating"
                        @close="closeModal" @useCurrentLocation="useCurrentLocation" @searchAddress="searchAddress" @centerMapToCoords="centerMapToCoords" @submitTransport="submitFormLogin" />
                    <ModulesUserCitizenTimeRegistrationFormLogout v-else :endAddress="state.startAddress" :isLocating="state.isLocating"
                        @close="closeModal" @useCurrentLocation="useCurrentLocation" @searchAddress="searchAddress" @centerMapToCoords="centerMapToCoords" @submitTransport="submitFormLogout" />
                    
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { useI18n } from "vue-i18n"
import { reactive, watch, computed, ref, nextTick } from 'vue'
import type { Error } from '@/types'
import { not } from "@vuelidate/validators"

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
})
const emit = defineEmits(['close', 'submitTransportLogin', 'submitTransportLogout'])

const state = reactive({
    error: {} as Error,
    startAddress: '',
    isPageLoading: false,
    isLocating: false,
})

const mapKey = ref(0)
const lmap = ref<any>(null)
const markerRef = ref<any>(null)
const markerLat = ref<number | null>(null)
const markerLng = ref<number | null>(null)
const mapCenter = ref<[number, number]>([55.6761, 12.5683]) // default: Copenhagen
const mapZoom = ref<number>(13)
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tileAttribution = '&copy; OpenStreetMap contributors'

function closeModal() {
    emit('close')
}

const { isLocating, error: locationError, getLocationAndAddress, reverseGeocode, geocode } = useLocationHelper(t)

watch(
    () => props.isModalOpen,
    async (open) => {
        if (open) {
            state.error = {} as Error
            state.startAddress = ''

            markerLat.value = null
            markerLng.value = null
            
            mapKey.value++
            
            await nextTick()
            useCurrentLocation().catch(() => {})
        }
    }
)

watch(isLocating, (val) => {
    state.isLocating = val
})
watch(locationError, (val) => {
    if (val) {
        state.error = { message: val } as Error
    } else {
        state.error = {} as Error
    }
})

const hasCoords = computed(() => {
  return markerLat.value !== null && markerLng.value !== null
})

function submitFormLogin(formDetails: any) {
    state.error = {}
    const params = {
        start_address: formDetails.start_address,
        geo_start_lat: markerLat.value ? String(markerLat.value) : '',
        geo_start_lng: markerLng.value ? String(markerLng.value) : '',
        note: formDetails.note,
    }
    emit('submitTransportLogin', params)
    closeModal()
    setTimeout(() => {
        state.startAddress = ''
        markerLat.value = null
        markerLng.value = null
    }, 500)
}

function submitFormLogout(formDetails: any) {
    state.error = {}
    const params = {
        end_address: formDetails.end_address,
        geo_end_lat: markerLat.value ? String(markerLat.value) : '',
        geo_end_lng: markerLng.value ? String(markerLng.value) : '',
        note: formDetails.note,
    }
    emit('submitTransportLogout', params)
    closeModal()
    setTimeout(() => {
        state.startAddress = ''
        markerLat.value = null
        markerLng.value = null
    }, 500)
}


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function attemptReverseGeocode(lat: number, lng: number, maxAttempts = 3, initialDelay = 500): Promise<string | null> {
    let attempt = 0
    let delay = initialDelay

    locationError.value = null

    while (attempt < maxAttempts) {
        attempt++
        try {
            const addr = await reverseGeocode(lat, lng)
            if (addr) {
                return addr
            }

            const err = locationError.value
            if (err && /rate/i.test(err)) {
                // stop retrying if rate-limited
                return null
            }
        } catch (err) {
            // ignore and retry below
        }

        // if we still have attempts left, wait with exponential backoff
        if (attempt < maxAttempts) {
            await sleep(delay)
            delay *= 2
        }
    }

    return null
}

async function useCurrentLocation() {
    state.error = {}
    
    const result = await getLocationAndAddress({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    })

    if (!result.success) {
        state.error = { message: result.error || t('citizens.timeRegistration.registerTransport.errors.unableToLocate') } as Error
        return
    }

    if (typeof result.latitude !== 'number' || typeof result.longitude !== 'number') {
        return
    }

    const lat = result.latitude
    const lng = result.longitude

    markerLat.value = lat
    markerLng.value = lng

    // Resolve address
    let finalAddress = ''
    if (result.address) {
        finalAddress = result.address
    } else {
        const retryAddress = await attemptReverseGeocode(lat, lng, 3, 500)
        if (retryAddress) {
            finalAddress = retryAddress
        } else if (locationError.value && /rate/i.test(locationError.value)) {
            state.error = { message: locationError.value } as Error
        } else {
            // finalAddress = `${lat.toFixed(7)}, ${lng.toFixed(7)}`
        }
    }

    if (finalAddress) {
        state.startAddress = finalAddress
    }

    // Wait for map with more checks
    await nextTick()
    
    const start = Date.now()
    const maxWait = 5000 // increased to 5s
    let mapObj = null
    
    while (Date.now() - start < maxWait) {
        // Try multiple ways to access the map object
        if (lmap.value?.mapObject) {
            mapObj = lmap.value.mapObject
            break
        } else if (lmap.value?.leafletObject) {
            mapObj = lmap.value.leafletObject
            break
        } else if (lmap.value?.$refs?.map) {
            mapObj = lmap.value.$refs.map
            break
        }
        await sleep(100)
    }

    if (mapObj && typeof mapObj.setView === 'function') {
        const targetZoom = 15
        
        try {
            mapObj.setView([lat, lng], targetZoom, { animate: true })
            mapCenter.value = [lat, lng]
            mapZoom.value = targetZoom
        } catch (err) {
            
        }

        await sleep(300)
        
        try {
            const mk = markerRef.value?.mapObject || markerRef.value?.leafletObject || markerRef.value
            if (mk && typeof mk.openPopup === 'function') {
                mk.openPopup()

                if (!state.startAddress) {
                    state.startAddress = finalAddress
                }
            }
        } catch (e) {
            
        }
    } else {
        mapCenter.value = [lat, lng]
        mapZoom.value = 15
    }
}

async function searchAddress() {
    const address = state.startAddress?.trim()
    
    if (!address || address.length < 3) {
        state.error = { message: t('citizens.timeRegistration.registerTransport.errors.addressTooShort') } as Error
        return
    }

    state.error = {}

    const result = await geocode(address)

    if (!result) {
        // error is already set by composable
        if (locationError.value) {
            state.error = { message: locationError.value } as Error
        }
        return
    }

    // Set marker and coordinates
    markerLat.value = result.lat
    markerLng.value = result.lng

    // Center map
    await nextTick()
    
    const start = Date.now()
    const maxWait = 3000
    let mapObj = null
    
    while (Date.now() - start < maxWait) {
        if (lmap.value?.mapObject) {
            mapObj = lmap.value.mapObject
            break
        } else if (lmap.value?.leafletObject) {
            mapObj = lmap.value.leafletObject
            break
        }
        await sleep(50)
    }

    if (mapObj && typeof mapObj.setView === 'function') {
        const targetZoom = 15
        mapObj.setView([result.lat, result.lng], targetZoom, { animate: true })
        mapCenter.value = [result.lat, result.lng]
        mapZoom.value = targetZoom

        // Open popup after a short delay
        await sleep(300)
        try {
            const mk = markerRef.value?.mapObject || markerRef.value?.leafletObject || markerRef.value
            if (mk && typeof mk.openPopup === 'function') {
                mk.openPopup()
            }
        } catch (e) {
            // ignore
        }
    } else {
        // Fallback to reactive props
        mapCenter.value = [result.lat, result.lng]
        mapZoom.value = 15
    }
}

async function onMapClick(e: any) {
    if (!e?.latlng) {
        return
    }
    
    const lat = e.latlng.lat
    const lng = e.latlng.lng
    
    markerLat.value = lat
    markerLng.value = lng

    state.startAddress = t('citizens.timeRegistration.registerTransport.form.locating')

    const addr = await attemptReverseGeocode(lat, lng, 3, 500)
    if (addr) {
        state.startAddress = addr
        return
    }

    if (locationError.value && /rate/i.test(locationError.value)) {
        state.error = { message: locationError.value } as Error
        state.startAddress = ''
        return
    }

}

async function onMarkerDrag(payload: any) {
    let lat: number | undefined
    let lng: number | undefined

    if (Array.isArray(payload) && payload.length >= 2) {
        lat = Number(payload[0])
        lng = Number(payload[1])
    } else if (payload && typeof payload.lat === 'number' && typeof payload.lng === 'number') {
        lat = payload.lat
        lng = payload.lng
    } else if (payload && payload.latlng && typeof payload.latlng.lat === 'number') {
        lat = payload.latlng.lat
        lng = payload.latlng.lng
    } else if (payload && payload.target && typeof payload.target.getLatLng === 'function') {
        const ll = payload.target.getLatLng()
        lat = ll.lat
        lng = ll.lng
    } else {
        return
    }

    if (lat === undefined || lng === undefined) {
        return
    }

    markerLat.value = lat
    markerLng.value = lng
    try {
        const addr = await attemptReverseGeocode(lat, lng, 3, 500)
        if (addr) {
            state.startAddress = addr
            return
        }

        if (locationError.value && /rate/i.test(locationError.value)) {
            state.error = { message: locationError.value } as Error
            return
        }

    } catch {

    }
}

async function centerMapToCoords() {
    if (markerLat.value === null || markerLng.value === null) {
        console.warn('⚠️ No coordinates to center to')
        return
    }

    const lat = markerLat.value
    const lng = markerLng.value
    const targetZoom = 15

    mapCenter.value = [lat, lng]
    mapZoom.value = Math.max(mapZoom.value, targetZoom)

    await nextTick()

    const start = Date.now()
    const maxWait = 2000
    let mapObj = null

    while (Date.now() - start < maxWait) {
        if (lmap.value?.mapObject) {
            mapObj = lmap.value.mapObject
            break
        } else if (lmap.value?.leafletObject) {
            mapObj = lmap.value.leafletObject
            break
        }
        await sleep(50)
    }

    if (mapObj && typeof mapObj.setView === 'function') {
        try {
            mapObj.setView([lat, lng], targetZoom, { animate: true })
        } catch (err) {
        }
    } else {
    }
}
</script>
