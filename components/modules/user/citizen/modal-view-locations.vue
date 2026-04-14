<template>
    <div>
        <Modal size="xl" :title="$t('citizens.viewLocations.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-4">
                    <div class="h-[600px] w-full rounded-md overflow-hidden border">
                        <MapLocation ref="mapRef" :center="mapCenter" :zoom="mapZoom" :markerCoords="userLocation"
                            :markerPopup="$t('citizens.viewLocations.yourLocation')" :extraMarkers="citizenMarkers"
                            :polylinePoints="routeLines" :polylineColor="'#3b82f6'" :polylineWeight="2"
                            @map-ready="onMapReady" />
                    </div>

                    <div v-if="isLoading" class="flex items-center justify-center py-4 bg-blue-50 rounded">
                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <p class="ml-2 text-sm text-gray-700">{{ $t('citizens.viewLocations.loading') }}...</p>
                    </div>

                    <Alert v-if="locationError" type="danger" :text="locationError" />

                    <div v-if="citizensWithLocations.length > 0" class="space-y-2">
                        <FormLabel
                            :label="$t('citizens.viewLocations.citizensWithLocations', { count: citizensWithLocations.length })" />
                        <div class="max-h-60 overflow-y-auto border rounded-md">
                            <div v-for="(citizen, index) in citizensWithLocations" :key="citizen.uuid"
                                class="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0">
                                <div class="flex items-center gap-x-3">
                                    <img :src="citizen.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen.firstname + ' ' + citizen.lastname}`"
                                        class="w-10 h-10 rounded-full object-cover border-2 border-gray-300" />
                                    <div>
                                        <p class="text-sm font-medium">{{ citizen.firstname }} {{ citizen.lastname }}
                                        </p>
                                        <p class="text-xs text-gray-500">{{ citizen.address?.street }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-xs text-gray-500">
                                        {{ $t('citizens.viewLocations.distance') }}: {{ calculateDistance(userLocation,
                                            {
                                                lat: Number(citizen.address.latitude), lng: Number(citizen.address.longitude)
                                        }) }} km
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="!isLoading" class="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p class="text-sm text-yellow-800">
                            {{ $t('citizens.viewLocations.noCitizensWithLocations') }}
                        </p>
                    </div>
                    <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p class="text-xs text-tertiary">
                            {{ $t('citizens.viewLocations.instructions') }}
                        </p>
                    </div>
                    <div class="flex justify-end gap-3 mt-5">
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

interface Address {
    street?: string
    city?: string
    post_code?: string
    latitude?: string | number
    longitude?: string | number
}

interface Citizen {
    uuid: string
    firstname: string
    lastname: string
    image?: string
    address?: Address
}

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizens: {
        type: Array as PropType<Citizen[]>,
        default: () => [],
    },
})

const emit = defineEmits<{
    (e: 'close'): void
}>()

const mapRef = ref<any>(null)
const mapZoom = ref<number>(11)
const mapCenter = ref<[number, number]>([55.6761, 12.5683])
const mapInstance = ref<any>(null)
const userLocation = ref<{ lat: number; lng: number } | null>(null)
const isLoading = ref<boolean>(false)
const locationError = ref<string>('')

const citizensWithLocations = computed(() => {
    return props.citizens.filter(citizen => {
        if (!citizen.address) return false

        const lat = Number(citizen.address.latitude)
        const lng = Number(citizen.address.longitude)

        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
    })
})

const citizenMarkers = computed(() => {
    return citizensWithLocations.value.map(citizen => ({
        lat: Number(citizen.address!.latitude),
        lng: Number(citizen.address!.longitude),
        popup: `${citizen.firstname} ${citizen.lastname}<br/>${citizen.address!.street || ''}`
    }))
})

const routeLines = computed(() => {
    if (!userLocation.value || citizensWithLocations.value.length === 0) {
        return []
    }

    const lines: Array<[number, number]> = []

    citizensWithLocations.value.forEach(citizen => {
        // Add user location
        lines.push([userLocation.value!.lat, userLocation.value!.lng])
        // Add citizen location
        lines.push([Number(citizen.address!.latitude), Number(citizen.address!.longitude)])
    })

    return lines
})

function closeModal() {
    emit('close')
}

function onMapReady(mapObj: any) {
    mapInstance.value = mapObj
    getUserLocation()
}

async function getUserLocation() {
    isLoading.value = true
    locationError.value = ''

    if (!navigator.geolocation) {
        locationError.value = 'Geolocation is not supported by your browser'
        isLoading.value = false
        return
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude

            userLocation.value = { lat, lng }
            mapCenter.value = [lat, lng]

            // Fit map to show all locations
            if (mapInstance.value && citizensWithLocations.value.length > 0) {
                nextTick(() => {
                    fitMapBounds()
                })
            }

            isLoading.value = false
        },
        (error) => {
            console.error('Error getting location:', error)
            locationError.value = `Unable to get your location: ${error.message}`
            isLoading.value = false

            // Still show citizens on map even without user location
            if (citizensWithLocations.value.length > 0) {
                const firstCitizen = citizensWithLocations.value[0]
                mapCenter.value = [Number(firstCitizen.address!.latitude), Number(firstCitizen.address!.longitude)]
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    )
}

function fitMapBounds() {
    if (!mapInstance.value) return

    const bounds: Array<[number, number]> = []

    // Add user location
    if (userLocation.value) {
        bounds.push([userLocation.value.lat, userLocation.value.lng])
    }

    // Add all citizen locations
    citizensWithLocations.value.forEach(citizen => {
        bounds.push([Number(citizen.address!.latitude), Number(citizen.address!.longitude)])
    })

    if (bounds.length > 0) {
        try {
            mapInstance.value.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 14
            })
        } catch (err) {
            console.warn('Failed to fit map bounds:', err)
        }
    }
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(point1: { lat: number; lng: number } | null, point2: { lat: number; lng: number }): string {
    if (!point1) return '—'

    const R = 6371 // Radius of the Earth in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLon = (point2.lng - point1.lng) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance.toFixed(1)
}

// Watch for modal opening
watch(
    () => props.isModalOpen,
    async (isOpen) => {
        if (isOpen) {
            await nextTick()
            if (mapInstance.value) {
                setTimeout(() => {
                    mapInstance.value.invalidateSize()
                    getUserLocation()
                }, 100)
            }
        }
    }
)
</script>