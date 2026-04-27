<template>
    <div>
        <Modal size="sm" :title="$t('timeLogs.view.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="space-y-1 my-1" v-if="props.selectedTimeLog?.user">
                        <FormLabel :label="$t('timeLogs.view.employee')" />
                        <div class="flex items-center gap-x-2 py-1">
                            <img :src="props.selectedTimeLog?.user?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${props.selectedTimeLog?.user?.firstname + ' ' + props.selectedTimeLog?.user?.lastname}`"
                                class="h-10 w-10 rounded-full bg-gray-50 object-cover border-2" />
                            <p class="text-sm font-medium">
                                {{ props.selectedTimeLog?.user?.firstname }}
                                {{ props.selectedTimeLog?.user?.lastname }}
                            </p>
                        </div>
                    </div>

                    <div class="space-y-1 my-1">
                        <p class="text-sm text-gray-600">
                            {{ $t('timeLogs.table.citizen') }}
                        </p>
                        <p class="text-sm font-semibold text-gray-700">
                            {{
                                props.selectedTimeLog?.citizen?.firstname + ' ' +
                                (props.selectedTimeLog?.citizen?.lastname ?? '')
                            }}
                        </p>
                    </div>

                    <div class="space-y-1 my-1">
                        <FormLabel :label="$t('timeLogs.table.createdAt')" />
                        <p class="text-sm font-semibold text-gray-700">
                            {{
                                formatDateTimeToReadable(props.selectedTimeLog?.created_at)
                            }}
                        </p>
                    </div>

                    <div class="space-y-1 my-1">
                        <FormLabel :label="$t('timeLogs.table.dateTimeStart')" />
                        <p class="text-sm font-semibold text-gray-700">
                            {{
                                props.selectedTimeLog?.date_time_start ?
                                    formatDateTimeToReadable(props.selectedTimeLog?.date_time_start) : '-'
                            }}
                        </p>
                    </div>
                    <div class="space-y-1 my-1">
                        <FormLabel :label="$t('timeLogs.table.dateTimeEnd')" />
                        <p class="text-sm font-semibold text-gray-700">
                            {{
                                props.selectedTimeLog?.date_time_end ?
                                    formatDateTimeToReadable(props.selectedTimeLog?.date_time_end) : '-'
                            }}
                        </p>
                    </div>

                    <div class="space-y-1 my-1">
                        <FormLabel :label="$t('timeLogs.table.status.status')" />
                        <Badge type="primary" class="w-fit"
                            v-if="props.selectedTimeLog?.status === 'cancelled_by_citizen'">
                            <p class="text-xxs">{{ $t('timeLogs.table.status.cancelledByCitizen') }}</p>
                        </Badge>
                        <Badge type="primary" class="w-fit"
                            v-else-if="props.selectedTimeLog?.status === 'cancelled_by_employee'">
                            <p class="text-xxs">{{ $t('timeLogs.table.status.cancelledByEmployee') }}</p>
                        </Badge>
                        <Badge type="primary" class="w-fit" v-else-if="props.selectedTimeLog?.status === 'completed'">
                            <p class="text-xxs">{{ $t('timeLogs.table.status.completed') }}</p>
                        </Badge>
                    </div>

                    <div class="space-y-1 my-1" v-if="props.selectedTimeLog?.time_summary">
                        <FormLabel :label="$t('timeLogs.table.summary')" />
                        <p class="text-sm font-semibold text-gray-700">{{ props.selectedTimeLog?.time_summary }}</p>
                    </div>

                    <div class="space-y-1 my-1" v-if="props.selectedTimeLog?.remarks">
                        <FormLabel :label="$t('timeLogs.table.remarks')" />
                        <p class="text-sm font-semibold text-gray-700">{{ props.selectedTimeLog?.remarks }}</p>
                    </div>

                    <div v-if="hasLocationData" class="mt-4 pt-4 border-t">
                        <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ $t('timeLogs.view.locationInformation')
                        }}</h3>

                        <div class="space-y-1 my-1" v-if="startAddress">
                            <FormLabel :label="$t('timeLogs.view.checkInLocation')" />
                            <p class="text-sm font-semibold text-gray-700">{{ startAddress }}</p>
                        </div>

                        <div class="space-y-1 my-1" v-if="endAddress">
                            <FormLabel :label="$t('timeLogs.view.checkOutLocation')" />
                            <p class="text-sm font-semibold text-gray-700">{{ endAddress }}</p>
                        </div>

                        <div class="space-y-1 my-2">
                            <div class="h-96 w-full rounded-md overflow-hidden border">
                                <MapLocation ref="mapRef" :center="mapCenter" :zoom="mapZoom"
                                    :markerCoords="startMarker" :markerPopup="startMarkerPopup" :markerColor="'#22c55e'"
                                    :extraMarkers="extraMarkers" @map-ready="onMapReady" />
                            </div>
                        </div>
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

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedTimeLog: {
        type: Object as PropType<Record<string, any> | null>,
        required: true,
    },
})
const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()

function closeModal() {
    emit('close')
}

const mapRef = ref<any>(null)
const mapZoom = ref<number>(13)
const mapCenter = ref<[number, number]>([55.6761, 12.5683])
const mapInstance = ref<any>(null)

const startLat = computed(() => {
    const v = props.selectedTimeLog?.geo_start_lat ?? null
    return v !== undefined && v !== null ? Number(v) : null
})
const startLng = computed(() => {
    const v = props.selectedTimeLog?.geo_start_lng ?? null
    return v !== undefined && v !== null ? Number(v) : null
})
const endLat = computed(() => {
    const v = props.selectedTimeLog?.geo_end_lat ?? null
    return v !== undefined && v !== null ? Number(v) : null
})
const endLng = computed(() => {
    const v = props.selectedTimeLog?.geo_end_lng ?? null
    return v !== undefined && v !== null ? Number(v) : null
})

const startCoordsValid = computed(() => {
    return startLat.value !== null && startLng.value !== null && !Number.isNaN(startLat.value) && !Number.isNaN(startLng.value)
})
const endCoordsValid = computed(() => {
    return endLat.value !== null && endLng.value !== null && !Number.isNaN(endLat.value) && !Number.isNaN(endLng.value)
})

const hasLocationData = computed(() => {
    return startCoordsValid.value || endCoordsValid.value
})

const startAddress = computed(() => {
    return props.selectedTimeLog?.geo_start_address || null
})

const endAddress = computed(() => {
    return props.selectedTimeLog?.geo_end_address || null
})

const startMarker = computed(() => {
    return startCoordsValid.value ? { lat: startLat.value as number, lng: startLng.value as number } : null
})

const startMarkerPopup = computed(() => {
    return startAddress.value || t('timeLogs.view.checkInLocation')
})

const extraMarkers = computed(() => {
    const arr: Array<{ lat: number; lng: number; popup?: string; color?: string }> = []

    if (endCoordsValid.value) {
        arr.push({
            lat: endLat.value as number,
            lng: endLng.value as number,
            popup: endAddress.value || t('timeLogs.view.checkOutLocation'),
            color: '#ef4444'
        })
    }

    return arr
})

function onMapReady(mapObj: any) {
    mapInstance.value = mapObj
    fitMapBounds()
}

function fitMapBounds() {
    if (!mapInstance.value) return

    nextTick(() => {
        try {
            if (startCoordsValid.value && endCoordsValid.value) {
                const bounds = [
                    [startLat.value as number, startLng.value as number],
                    [endLat.value as number, endLng.value as number]
                ]
                mapInstance.value.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 15
                })
            } else if (startCoordsValid.value) {
                mapInstance.value.setView([startLat.value as number, startLng.value as number], 15)
            } else if (endCoordsValid.value) {
                mapInstance.value.setView([endLat.value as number, endLng.value as number], 15)
            }
        } catch (err) {
            console.error('Error fitting map bounds:', err)
        }
    })
}

watch(
    () => props.selectedTimeLog,
    async (val) => {
        if (!val) return

        await nextTick()

        if (startCoordsValid.value) {
            mapCenter.value = [startLat.value as number, startLng.value as number]
        } else if (endCoordsValid.value) {
            mapCenter.value = [endLat.value as number, endLng.value as number]
        }

        if (mapInstance.value) {
            fitMapBounds()
        }
    },
    { immediate: true }
)

watch(
    () => props.isModalOpen,
    (isOpen) => {
        if (isOpen && mapInstance.value) {
            setTimeout(() => {
                mapInstance.value.invalidateSize()
                fitMapBounds()
            }, 100)
        }
    }
)
</script>
