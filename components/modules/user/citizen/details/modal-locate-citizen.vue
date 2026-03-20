<template>
    <div>
        <Modal size="lg" :title="$t('citizens.form.locateCitizen')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-4">
                    <div class="h-96 w-full rounded-md overflow-hidden border">
                        <MapLocation 
                            ref="mapRef" 
                            :center="mapCenter" 
                            :zoom="mapZoom" 
                            :markerCoords="selectedLocation"
                            :markerPopup="$t('citizens.form.selectedLocation')"
                            :draggable="true"
                            @update:marker="onLocationSelected"
                            @map-ready="onMapReady"
                        />
                    </div>

                    <div v-if="isGeocodingAddress" class="flex items-center justify-center py-4 bg-blue-50 rounded">
                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <p class="ml-2 text-sm text-gray-700">{{ $t('citizens.form.locatingAddress') }}...</p>
                    </div>

                    <div v-if="selectedAddress" class="space-y-2">
                        <FormLabel :label="$t('citizens.form.selectedAddress')" />
                        <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                            <p class="text-sm font-semibold text-gray-700">{{ selectedAddress }}</p>
                        </div>
                        
                        <div v-if="addressData" class="grid grid-cols-2 gap-2 text-xs text-gray-600 p-2 bg-blue-50 rounded">
                            <div v-if="addressData.address?.road">
                                <span class="font-medium">{{ $t('citizens.form.street') }}:</span> 
                                {{ addressData.address.road }} {{ addressData.address.house_number || '' }}
                            </div>
                            <div v-if="addressData.address?.postcode">
                                <span class="font-medium">{{ $t('citizens.form.postCode') }}:</span> 
                                {{ addressData.address.postcode }}
                            </div>
                            <div v-if="addressData.address?.city || addressData.address?.town">
                                <span class="font-medium">{{ $t('citizens.form.city') }}:</span> 
                                {{ addressData.address.city || addressData.address.town }}
                            </div>
                            <div v-if="addressData.address?.municipality">
                                <span class="font-medium">{{ $t('citizens.form.municipality') }}:</span> 
                                {{ addressData.address.municipality }}
                            </div>
                            <div v-if="addressData.address?.state">
                                <span class="font-medium">{{ $t('citizens.form.region') }}:</span> 
                                {{ addressData.address.state }}
                            </div>
                            <div v-if="addressData.address?.country">
                                <span class="font-medium">{{ $t('citizens.form.country') }}:</span> 
                                {{ addressData.address.country }}
                            </div>
                        </div>
                    </div>

                    <div v-if="isLoadingAddress" class="flex items-center justify-center py-4">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <p class="ml-2 text-sm text-gray-600">{{ $t('citizens.form.fetchingAddress') }}</p>
                    </div>

                    <Alert v-if="errorMessage" type="danger" :text="errorMessage" />

                    <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p class="text-xs text-tertiary">
                            {{ $t('citizens.form.locateCitizenInstructions') }}
                        </p>
                    </div>

                    <div class="flex justify-end gap-3 mt-5">
                        <FormButton buttonStyle="cancel" @click="closeModal" class="rounded-md">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton 
                            buttonStyle="primary" 
                            @click="confirmLocation" 
                            class="rounded-md"
                            :disabled="!canConfirm"
                        >
                            {{ $t('citizens.form.useThisLocation') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import type { PropType } from 'vue'

interface Location {
    lat: number
    lng: number
}

interface CurrentAddress {
    street?: string
    city?: string
    postCode?: string
    municipality?: string
    region?: string
}

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    initialLocation: {
        type: Object as PropType<Location | null>,
        default: null,
    },
    currentAddress: {
        type: Object as PropType<CurrentAddress | null>,
        default: null,
    },
})

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'locationSelected', location: Location, address: string, addressData: any): void
}>()

const mapRef = ref<any>(null)
const mapZoom = ref<number>(13)
const mapCenter = ref<[number, number]>([55.6761, 12.5683])
const mapInstance = ref<any>(null)
const selectedLocation = ref<Location | null>(props.initialLocation)
const selectedAddress = ref<string>('')
const addressData = ref<any>(null)
const isLoadingAddress = ref<boolean>(false)
const isGeocodingAddress = ref<boolean>(false)
const errorMessage = ref<string>('')

const canConfirm = computed(() => {
    return selectedLocation.value !== null && 
           selectedAddress.value !== '' && 
           !isLoadingAddress.value && 
           !isGeocodingAddress.value
})

const hasCurrentAddress = computed(() => {
    return props.currentAddress && (
        props.currentAddress.street ||
        props.currentAddress.city ||
        props.currentAddress.municipality
    )
})

function closeModal() {
    emit('close')
}

function onMapReady(mapObj: any) {
    mapInstance.value = mapObj
    
    if (props.initialLocation) {
        mapCenter.value = [props.initialLocation.lat, props.initialLocation.lng]
        mapZoom.value = 15
        fetchAddressFromCoordinates(props.initialLocation.lat, props.initialLocation.lng)
    } else if (hasCurrentAddress.value) {
        geocodeCurrentAddress()
    }
}

async function geocodeCurrentAddress() {
    if (!props.currentAddress) return
    
    const { street, city, postCode, municipality, region } = props.currentAddress
    
    const addressParts = [
        street,
        postCode,
        city || municipality,
        region,
        'Denmark'
    ].filter(Boolean)
    
    const addressString = addressParts.join(', ')
    
    if (!addressString || addressString === 'Denmark') {
        console.warn('Insufficient address data for geocoding')
        return
    }
    
    console.log('Geocoding address:', addressString)
    isGeocodingAddress.value = true
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1&addressdetails=1&countrycodes=dk`,
            {
                headers: {
                    'Accept-Language': 'da,en',
                }
            }
        )
        
        if (!response.ok) {
            throw new Error('Failed to geocode address')
        }
        
        const data = await response.json()
        
        if (data && data.length > 0) {
            const result = data[0]
            const lat = parseFloat(result.lat)
            const lng = parseFloat(result.lon)
            
            selectedLocation.value = { lat, lng }
            mapCenter.value = [lat, lng]
            mapZoom.value = 15
            
            if (mapInstance.value) {
                mapInstance.value.setView([lat, lng], 15)
            }
            
            await fetchAddressFromCoordinates(lat, lng)

        } else {

        }
    } catch (error) {

    } finally {
        isGeocodingAddress.value = false
    }
}

async function onLocationSelected(coords: Location) {
    selectedLocation.value = coords
    errorMessage.value = ''
    await fetchAddressFromCoordinates(coords.lat, coords.lng)
}

async function fetchAddressFromCoordinates(lat: number, lng: number) {
    isLoadingAddress.value = true
    errorMessage.value = ''
    addressData.value = null
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'da,en',
                }
            }
        )
        
        if (!response.ok) {
            throw new Error('Failed to fetch address')
        }
        
        const data = await response.json()
        
        if (data && data.display_name) {
            selectedAddress.value = data.display_name
            addressData.value = data
        } else {
            selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            addressData.value = null
        }
    } catch (error) {
        errorMessage.value = 'Failed to fetch address. Please try again.'
        selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        addressData.value = null
    } finally {
        isLoadingAddress.value = false
    }
}

function confirmLocation() {
    if (selectedLocation.value && selectedAddress.value) {
        emit('locationSelected', selectedLocation.value, selectedAddress.value, addressData.value)
        closeModal()
    }
}

watch(
    () => props.isModalOpen,
    async (isOpen) => {
        if (isOpen) {
            if (!props.initialLocation) {
                selectedLocation.value = null
                selectedAddress.value = ''
                addressData.value = null
            }
            errorMessage.value = ''
            
            await nextTick()
            if (mapInstance.value) {
                setTimeout(() => {
                    mapInstance.value.invalidateSize()
                    
                    if (!props.initialLocation && hasCurrentAddress.value) {
                        geocodeCurrentAddress()
                    }
                }, 100)
            }
        }
    }
)

watch(
    () => props.initialLocation,
    (location) => {
        if (location) {
            selectedLocation.value = location
            mapCenter.value = [location.lat, location.lng]
            mapZoom.value = 15
            if (props.isModalOpen && mapInstance.value) {
                mapInstance.value.setView([location.lat, location.lng], 15)
                fetchAddressFromCoordinates(location.lat, location.lng)
            }
        }
    },
    { immediate: true }
)
</script>