<template>
    <div>
        <Modal size="sm" :title="$t('citizens.timeRegistration.registerTransport.registerTransport')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formAbsence">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />

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
                                    {{ state.formTransport.start_address || t('citizens.timeRegistration.registerTransport.form.currentLocation') }}
                                    </LPopup>
                                </LMarker>
                                </LMap>
                            </ClientOnly>

                        </div>

                        <div class="space-y-1">
                            <div class="flex justify-between items-center py-0.5">
                                <FormLabel for="start_address" :label="$t('citizens.timeRegistration.registerTransport.form.startAddress')" />
                            </div>
                            <FormTextArea id="start_address" name="start_address"
                                :placeholder="$t('citizens.timeRegistration.registerTransport.form.startAddress')"
                                v-model="state.formTransport.start_address" />

                            <div v-if="state.isLocating" class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="useCurrentLocation">
                                {{ $t('citizens.timeRegistration.registerTransport.form.locating') }}
                            </div>
                            <div v-else class="flex items-center gap-x-2 w-full">
                                <div class="flex gap-x-1 text-tertiary hover:text-primary text-xs cursor-pointer"
                                    @click="useCurrentLocation">
                                    <Icon name="ph:map-pin" class="h-4 w-4" aria-hidden="true" /> 
                                    <span class="">{{ $t('citizens.timeRegistration.registerTransport.form.useCurrentLocation') }}</span>
                                </div>
                                <div class="flex gap-x-1 text-tertiary hover:text-primary text-xs cursor-pointer"
                                    @click="searchAddress">
                                    <Icon name="ph:magnifying-glass" class="h-4 w-4" aria-hidden="true" /> 
                                    <span class="">{{ $t('citizens.timeRegistration.registerTransport.form.searchAddress') }}</span>
                                </div>
                                <div class="flex gap-x-1 text-tertiary hover:text-primary text-xs cursor-pointer"
                                    @click="centerMapToCoords">
                                    <Icon name="ph:crosshair" class="h-4 w-4" aria-hidden="true" /> 
                                    <span class="">{{ $t('citizens.timeRegistration.registerTransport.form.centerMap') }}</span>
                                </div>
                            </div>
                            
                            <FormError :error="v$?.formTransport?.start_address?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.start_address?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <div class="flex justify-between items-center py-0.5">
                                <FormLabel for="note" :label="$t('citizens.timeRegistration.registerTransport.form.note')" />
                            </div>
                            <FormTextArea id="note" name="note"
                                :placeholder="$t('citizens.timeRegistration.registerTransport.form.note')"
                                v-model="state.formTransport.note" />
                            <FormError :error="v$?.formTransport?.note?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.note?.[0]" />
                        </div>

                        <input type="hidden" name="geo_start_lat" :value="state.formTransport.geo_start_lat" />
                        <input type="hidden" name="geo_start_lng" :value="state.formTransport.geo_start_lng" />
                        
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('citizens.timeRegistration.checkIn') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
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

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'submitTransport'])

const state = reactive({
    error: {} as Error,
    formTransport: {
        geo_start_lat: '',
        geo_start_lng: '',
        start_address: '',
        note: '',
    },
    isPageLoading: false,
    isLocating: false,
})

const mapKey = ref(0)
const lmap = ref<any>(null) // reference to LMap component instance (optional)
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

const rules = computed(() => {
    return {
        formTransport: {},
    }
})

const v$ = useVuelidate(rules, state)

const { isLocating, error: locationError, getLocationAndAddress, reverseGeocode, geocode } = useLocationHelper(t)

watch(
    () => props.isModalOpen,
    async (open) => {
        if (open) {
            state.error = {} as Error
            state.formTransport = {
                geo_start_lat: '',
                geo_start_lng: '',
                start_address: '',
                note: '',
            }
            markerLat.value = null
            markerLng.value = null
            
            // Force LMap to remount by changing key
            mapKey.value++
            
            await nextTick()
            // try to pre-populate the user's current location
            useCurrentLocation().catch(() => {
                /* swallow errors here — useCurrentLocation sets state.error on failure */
            })
        }
    }
)

/* keep state.isLocating and state.error in sync with composable */
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

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitTransport', state.formTransport)
        state.formTransport.geo_start_lat = ''
        state.formTransport.geo_start_lng = ''
        state.formTransport.start_address = ''
        state.formTransport.note = ''
        markerLat.value = null
        markerLng.value = null
        v$.value.$reset()
    }
}


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Try reverse geocoding with retries (exponential backoff).
 * Will stop retrying early if composable's locationError indicates rate-limiting.
 *
 * @param lat
 * @param lng
 * @param maxAttempts total attempts (including the first)
 * @param initialDelay initial delay in ms between retries
 */
async function attemptReverseGeocode(lat: number, lng: number, maxAttempts = 3, initialDelay = 500): Promise<string | null> {
    let attempt = 0
    let delay = initialDelay

    // clear previous composable error before starting
    // (composable's error ref is also updated inside reverseGeocode)
    // @ts-ignore
    locationError.value = null

    while (attempt < maxAttempts) {
        attempt++
        try {
            const addr = await reverseGeocode(lat, lng)
            if (addr) {
                return addr
            }

            // If reverseGeocode returned null, check composable error for rate-limit
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

    console.log('📍 Current location found:', lat, lng)

    markerLat.value = lat
    markerLng.value = lng
    state.formTransport.geo_start_lat = String(lat)
    state.formTransport.geo_start_lng = String(lng)

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
            finalAddress = `${lat.toFixed(7)}, ${lng.toFixed(7)}`
        }
    }

    if (finalAddress) {
        state.formTransport.start_address = finalAddress
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

    console.log('🗺️ Map object available:', !!mapObj)
    console.log('🗺️ lmap.value structure:', lmap.value)

    if (mapObj && typeof mapObj.setView === 'function') {
        const targetZoom = 15
        console.log('🎯 Forcing map to setView:', lat, lng, targetZoom)
        
        try {
            mapObj.setView([lat, lng], targetZoom, { animate: true })
            mapCenter.value = [lat, lng]
            mapZoom.value = targetZoom
        } catch (err) {
            console.error('❌ setView failed:', err)
        }

        await sleep(300)
        
        try {
            const mk = markerRef.value?.mapObject || markerRef.value?.leafletObject || markerRef.value
            if (mk && typeof mk.openPopup === 'function') {
                console.log('🔓 Opening marker popup')
                mk.openPopup()

                if (!state.formTransport.start_address) {
                    state.formTransport.start_address = finalAddress
                }
            }
        } catch (e) {
            console.error('❌ Popup open failed:', e)
        }
    } else {
        console.warn('⚠️ Map object not available after waiting. Falling back to reactive props.')
        console.log('lmap.value:', lmap.value)
        mapCenter.value = [lat, lng]
        mapZoom.value = 15
    }
}

async function searchAddress() {
    const address = state.formTransport.start_address?.trim()
    
    if (!address || address.length < 3) {
        state.error = { message: t('citizens.timeRegistration.registerTransport.errors.addressTooShort') } as Error
        return
    }

    state.error = {}
    console.log('🔍 Searching for address:', address)

    const result = await geocode(address)

    if (!result) {
        // error is already set by composable
        if (locationError.value) {
            state.error = { message: locationError.value } as Error
        }
        return
    }

    console.log('📍 Address found at:', result.lat, result.lng)

    // Set marker and coordinates
    markerLat.value = result.lat
    markerLng.value = result.lng
    state.formTransport.geo_start_lat = String(result.lat)
    state.formTransport.geo_start_lng = String(result.lng)

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
        console.log('🎯 Centering map to searched address')
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
    console.log('🖱️ Map clicked', e)
    
    if (!e?.latlng) {
        console.warn('⚠️ No latlng in click event')
        return
    }
    
    const lat = e.latlng.lat
    const lng = e.latlng.lng
    
    console.log('📍 Click coordinates:', lat, lng)
    
    markerLat.value = lat
    markerLng.value = lng
    state.formTransport.geo_start_lat = String(lat)
    state.formTransport.geo_start_lng = String(lng)

    // Show temporary "loading" message in address field
    state.formTransport.start_address = t('citizens.timeRegistration.registerTransport.form.locating')

    // try reverse geocode with retries
    const addr = await attemptReverseGeocode(lat, lng, 3, 500)
    if (addr) {
        console.log('✅ Reverse geocode successful:', addr)
        state.formTransport.start_address = addr
        return
    }

    // if rate-limited, surface error and don't fallback to coords
    if (locationError.value && /rate/i.test(locationError.value)) {
        state.error = { message: locationError.value } as Error
        state.formTransport.start_address = '' // clear the "locating" message
        return
    }

    // fallback to coordinates if no address resolved
    console.log('⚠️ No address found, using coordinates')
    state.formTransport.start_address = `${lat.toFixed(7)}, ${lng.toFixed(7)}`
}

/**
 * Marker drag handler - robust to different payload shapes and retries reverse-geocoding
 */
async function onMarkerDrag(payload: any) {
    // payload can be: [lat,lng] | { lat, lng } | Leaflet event with .latlng | drag event with target.getLatLng()
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
    state.formTransport.geo_start_lat = String(lat)
    state.formTransport.geo_start_lng = String(lng)

    // attempt reverse geocoding with retries (non-blocking)
    try {
        const addr = await attemptReverseGeocode(lat, lng, 3, 500)
        if (addr) {
            state.formTransport.start_address = addr
            return
        }

        // if rate-limited, set UI error and do not set coords as address
        if (locationError.value && /rate/i.test(locationError.value)) {
            state.error = { message: locationError.value } as Error
            return
        }

        // fallback to coords if no address
        state.formTransport.start_address = `${lat.toFixed(7)}, ${lng.toFixed(7)}`
    } catch {
        // ignore
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

    console.log('🎯 Centering map to:', lat, lng)

    // Update reactive refs first
    mapCenter.value = [lat, lng]
    mapZoom.value = Math.max(mapZoom.value, targetZoom)

    await nextTick()

    // Wait for map object to be available
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
        console.log('✅ Calling setView on map')
        try {
            mapObj.setView([lat, lng], targetZoom, { animate: true })
        } catch (err) {
            console.error('❌ setView failed:', err)
        }
    } else {
        console.warn('⚠️ Map object not available for centering')
        console.log('lmap.value:', lmap.value)
    }
}
</script>
