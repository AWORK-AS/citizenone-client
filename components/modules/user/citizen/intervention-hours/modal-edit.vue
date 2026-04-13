<template>
    <div>
        <Modal :size="props.selectedInterventionHours?.is_transportation ? 'lg' : 'xs'"
            :title="$t('citizens.interventionHours.editInterventionHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenInterventionHoursForm formType="update"
                        :selectedInterventionHours="props.selectedInterventionHours" :error="state.error"
                        :transportData="state.formData" :calculatedDistance="calculatedDistance"
                        @isPageLoading="(value: boolean) => (state.isPageLoading = value)" @closeModal="closeModal"
                        @submitForm="updateInterventionHours" @openStartLocationMap="openStartLocationMap"
                        @openEndLocationMap="openEndLocationMap" />

                    <!-- Start Location Map Modal -->
                    <Modal size="lg" :title="$t(
                        'citizens.timeRegistration.registerTransport.form.selectStartLocation',
                    )
                        " :show="state.modal.isStartLocationOpen" @close="state.modal.isStartLocationOpen = false">
                        <template #modal-body>
                            <div class="space-y-4">
                                <ClientOnly>
                                    <LMap :key="`start-${mapKey}`" style="
                      height: 20rem;
                      width: 100%;
                      border-radius: 0.375rem;
                      overflow: hidden;
                    " :zoom="14" :center="startMapCenter" @click="onStartMapClick" ref="startMapRef">
                                        <LTileLayer :url="tileUrl" :attribution="tileAttribution" />
                                        <LMarker v-if="startMarkerLat !== null && startMarkerLng !== null"
                                            :lat-lng="[startMarkerLat, startMarkerLng]" :draggable="true"
                                            @update:lat-lng="onStartMarkerDrag">
                                            <LPopup>
                                                {{
                                                    state.formData.start_address ||
                                                    $t(
                                                        "citizens.timeRegistration.registerTransport.form.startLocation",
                                                    )
                                                }}
                                            </LPopup>
                                        </LMarker>
                                    </LMap>
                                </ClientOnly>

                                <div v-if="state.formData.start_address"
                                    class="p-3 bg-gray-50 rounded-md border border-gray-200">
                                    <p class="text-sm font-semibold text-gray-700">
                                        {{ state.formData.start_address }}
                                    </p>
                                </div>

                                <div class="flex justify-end gap-3">
                                    <FormButton buttonStyle="cancel" @click="state.modal.isStartLocationOpen = false">
                                        {{ $t("cancel") }}
                                    </FormButton>
                                    <FormButton buttonStyle="primary" @click="confirmStartLocation">
                                        {{ $t("citizens.form.useThisLocation") }}
                                    </FormButton>
                                </div>
                            </div>
                        </template>
                    </Modal>

                    <!-- End Location Map Modal -->
                    <Modal size="lg" :title="$t(
                        'citizens.timeRegistration.registerTransport.form.selectEndLocation',
                    )
                        " :show="state.modal.isEndLocationOpen" @close="state.modal.isEndLocationOpen = false">
                        <template #modal-body>
                            <div class="space-y-4">
                                <ClientOnly>
                                    <LMap :key="`end-${mapKey}`" style="
                      height: 20rem;
                      width: 100%;
                      border-radius: 0.375rem;
                      overflow: hidden;
                    " :zoom="14" :center="endMapCenter" @click="onEndMapClick" ref="endMapRef">
                                        <LTileLayer :url="tileUrl" :attribution="tileAttribution" />
                                        <LMarker v-if="endMarkerLat !== null && endMarkerLng !== null"
                                            :lat-lng="[endMarkerLat, endMarkerLng]" :draggable="true"
                                            @update:lat-lng="onEndMarkerDrag">
                                            <LPopup>
                                                {{
                                                    state.formData.end_address ||
                                                    $t(
                                                        "citizens.timeRegistration.registerTransport.form.endLocation",
                                                    )
                                                }}
                                            </LPopup>
                                        </LMarker>
                                    </LMap>
                                </ClientOnly>

                                <div v-if="state.formData.end_address"
                                    class="p-3 bg-gray-50 rounded-md border border-gray-200">
                                    <p class="text-sm font-semibold text-gray-700">
                                        {{ state.formData.end_address }}
                                    </p>
                                </div>

                                <div class="flex justify-end gap-3">
                                    <FormButton buttonStyle="cancel" @click="state.modal.isEndLocationOpen = false">
                                        {{ $t("cancel") }}
                                    </FormButton>
                                    <FormButton buttonStyle="primary" @click="confirmEndLocation">
                                        {{ $t("citizens.form.useThisLocation") }}
                                    </FormButton>
                                </div>
                            </div>
                        </template>
                    </Modal>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { interventionHoursService } from "@/components/api/user/InterventionHoursService";
import { useAlert } from "@/composables/alert";
import { useI18n } from "vue-i18n";
import type { Error } from "@/types";

const { successAlert } = useAlert();
const { t } = useI18n();

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedInterventionHours: {
        type: Object,
        required: true,
    },
});
const emit = defineEmits(["close", "refreshInterventionHours"]);

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formData: {
        start_address: "",
        end_address: "",
        geo_start_lat: null as number | null,
        geo_start_lng: null as number | null,
        geo_end_lat: null as number | null,
        geo_end_lng: null as number | null,
    },
    modal: {
        isStartLocationOpen: false,
        isEndLocationOpen: false,
    },
});

// Map state
const mapKey = ref(0);
const startMapRef = ref<any>(null);
const endMapRef = ref<any>(null);
const startMarkerLat = ref<number | null>(null);
const startMarkerLng = ref<number | null>(null);
const endMarkerLat = ref<number | null>(null);
const endMarkerLng = ref<number | null>(null);
const startMapCenter = ref<[number, number]>([55.6761, 12.5683]);
const endMapCenter = ref<[number, number]>([55.6761, 12.5683]);
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const tileAttribution = "&copy; OpenStreetMap contributors";

const { reverseGeocode } = useLocationHelper(t);

// Calculate distance between two coordinates using Haversine formula
const calculatedDistance = computed(() => {
    if (
        startMarkerLat.value === null ||
        startMarkerLng.value === null ||
        endMarkerLat.value === null ||
        endMarkerLng.value === null
    ) {
        return 0;
    }

    const R = 6371; // Earth's radius in km
    const dLat = ((endMarkerLat.value - startMarkerLat.value) * Math.PI) / 180;
    const dLon = ((endMarkerLng.value - startMarkerLng.value) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((startMarkerLat.value * Math.PI) / 180) *
        Math.cos((endMarkerLat.value * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
});

watch(
    () => props.isModalOpen,
    async (isOpen) => {
        if (isOpen && props.selectedInterventionHours?.is_transportation) {
            mapKey.value++;
            if (
                props.selectedInterventionHours.geo_start_lat &&
                props.selectedInterventionHours.geo_start_lng
            ) {
                startMarkerLat.value = Number(
                    props.selectedInterventionHours.geo_start_lat,
                );
                startMarkerLng.value = Number(
                    props.selectedInterventionHours.geo_start_lng,
                );
                startMapCenter.value = [startMarkerLat.value, startMarkerLng.value];
                state.formData.geo_start_lat = startMarkerLat.value;
                state.formData.geo_start_lng = startMarkerLng.value;
                state.formData.start_address =
                    props.selectedInterventionHours.start_address || "";
            }

            if (
                props.selectedInterventionHours.geo_end_lat &&
                props.selectedInterventionHours.geo_end_lng
            ) {
                endMarkerLat.value = Number(
                    props.selectedInterventionHours.geo_end_lat,
                );
                endMarkerLng.value = Number(
                    props.selectedInterventionHours.geo_end_lng,
                );
                endMapCenter.value = [endMarkerLat.value, endMarkerLng.value];
                state.formData.geo_end_lat = endMarkerLat.value;
                state.formData.geo_end_lng = endMarkerLng.value;
                state.formData.end_address =
                    props.selectedInterventionHours.end_address || "";
            }
        }
    },
);

function openStartLocationMap() {
    state.modal.isStartLocationOpen = true;
    // Re-center map if we have coordinates
    if (startMarkerLat.value !== null && startMarkerLng.value !== null) {
        startMapCenter.value = [startMarkerLat.value, startMarkerLng.value];
    }
}

function openEndLocationMap() {
    state.modal.isEndLocationOpen = true;
    // Re-center map if we have coordinates
    if (endMarkerLat.value !== null && endMarkerLng.value !== null) {
        endMapCenter.value = [endMarkerLat.value, endMarkerLng.value];
    }
}

function confirmStartLocation() {
    state.modal.isStartLocationOpen = false;
}

function confirmEndLocation() {
    state.modal.isEndLocationOpen = false;
}

async function onStartMapClick(e: any) {
    if (!e?.latlng) return;

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    startMarkerLat.value = lat;
    startMarkerLng.value = lng;
    state.formData.geo_start_lat = lat;
    state.formData.geo_start_lng = lng;

    state.formData.start_address = t(
        "citizens.timeRegistration.registerTransport.form.locating",
    );

    const addr = await reverseGeocode(lat, lng);
    if (addr) {
        state.formData.start_address = addr;
    } else {
        state.formData.start_address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
}

async function onEndMapClick(e: any) {
    if (!e?.latlng) return;

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    endMarkerLat.value = lat;
    endMarkerLng.value = lng;
    state.formData.geo_end_lat = lat;
    state.formData.geo_end_lng = lng;

    state.formData.end_address = t(
        "citizens.timeRegistration.registerTransport.form.locating",
    );

    const addr = await reverseGeocode(lat, lng);
    if (addr) {
        state.formData.end_address = addr;
    } else {
        state.formData.end_address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
}

async function onStartMarkerDrag(payload: any) {
    let lat: number | undefined;
    let lng: number | undefined;

    if (Array.isArray(payload) && payload.length >= 2) {
        lat = Number(payload[0]);
        lng = Number(payload[1]);
    } else if (payload?.latlng) {
        lat = payload.latlng.lat;
        lng = payload.latlng.lng;
    } else if (payload?.target?.getLatLng) {
        const ll = payload.target.getLatLng();
        lat = ll.lat;
        lng = ll.lng;
    }

    if (lat === undefined || lng === undefined) return;

    startMarkerLat.value = lat;
    startMarkerLng.value = lng;
    state.formData.geo_start_lat = lat;
    state.formData.geo_start_lng = lng;

    const addr = await reverseGeocode(lat, lng);
    if (addr) {
        state.formData.start_address = addr;
    }
}

async function onEndMarkerDrag(payload: any) {
    let lat: number | undefined;
    let lng: number | undefined;

    if (Array.isArray(payload) && payload.length >= 2) {
        lat = Number(payload[0]);
        lng = Number(payload[1]);
    } else if (payload?.latlng) {
        lat = payload.latlng.lat;
        lng = payload.latlng.lng;
    } else if (payload?.target?.getLatLng) {
        const ll = payload.target.getLatLng();
        lat = ll.lat;
        lng = ll.lng;
    }

    if (lat === undefined || lng === undefined) return;

    endMarkerLat.value = lat;
    endMarkerLng.value = lng;
    state.formData.geo_end_lat = lat;
    state.formData.geo_end_lng = lng;

    const addr = await reverseGeocode(lat, lng);
    if (addr) {
        state.formData.end_address = addr;
    }
}

function closeModal() {
    emit("close");
}

function refreshInterventionHours() {
    emit("refreshInterventionHours");
}

async function updateInterventionHours(interventionHoursDetails: any) {
    state.error = {};
    state.isPageLoading = true;
    try {
        const interventionHoursUuid = props?.selectedInterventionHours.uuid;
        const params: any = {
            date_time_start: interventionHoursDetails.date_time_start,
            date_time_end: interventionHoursDetails.date_time_end,
            note: interventionHoursDetails.note,
        };

        // Add transportation data if applicable
        if (props.selectedInterventionHours?.is_transportation) {
            params.is_transportation = true;
            params.start_address = state.formData.start_address;
            params.end_address = state.formData.end_address;
            params.geo_start_lat = state.formData.geo_start_lat;
            params.geo_start_lng = state.formData.geo_start_lng;
            params.geo_end_lat = state.formData.geo_end_lat;
            params.geo_end_lng = state.formData.geo_end_lng;
            params.kilometers = interventionHoursDetails.kilometers;
        }

        const response = await interventionHoursService.updateInterventionHours(
            interventionHoursUuid,
            params,
        );
        if (response?.data) {
            refreshInterventionHours();
            closeModal();
            successAlert(
                `${t("alert.success")}!`,
                `${t("citizens.interventionHours.form.alert.interventionHoursSuccessfullyUpdated")}.`,
            );
        }
    } catch (error: any) {
        state.error = error;
    }
    state.isPageLoading = false;
}
</script>
