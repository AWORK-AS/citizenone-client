<template>
    <form @submit.prevent="submitForm()" id="formLogin">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="space-y-1">
            <div class="flex justify-between items-center py-0.5">
                <FormLabel for="start_address"
                    :label="$t('citizens.timeRegistration.registerTransport.form.startAddress')" />
            </div>
            <FormTextArea id="start_address" name="start_address"
                :placeholder="$t('citizens.timeRegistration.registerTransport.form.startAddress')"
                v-model="state.formTransport.start_address" />

            <div v-if="props.isLocating" class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                @click="useCurrentLocation">
                {{ $t('citizens.timeRegistration.registerTransport.form.locating') }}
            </div>
            <div v-else class="flex items-center gap-x-2 w-full">
                <div class="flex gap-x-1 text-tertiary hover:text-primary text-xs cursor-pointer"
                    @click="useCurrentLocation">
                    <Icon name="ph:map-pin" class="h-4 w-4" aria-hidden="true" />
                    <span class="">{{ $t('citizens.timeRegistration.registerTransport.form.useCurrentLocation')
                        }}</span>
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
        <ModulesUserMileageLogVehicleRegistrationField id="transport_vehicle_registration"
            v-model="state.formTransport.vehicle_registration"
            :error="v$?.formTransport?.vehicle_registration?.$errors[0]?.$message.toString()"
            :serverError="state?.error?.errors?.vehicle_registration?.[0]" />
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

        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ $t('citizens.timeRegistration.checkIn') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { fetchLastVehicleRegistration, normalizeVehicleRegistration, vehicleRegistrationRules } from '@/composables/vehicleRegistration'
import type { Error } from '@/types'

const props = defineProps({
    startAddress: {
        type: String,
        required: false,
    },
    isLocating: {
        type: Boolean,
        required: false,
    },
})

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isLocating: false,
    formTransport: {
        start_address: '',
        note: '',
        vehicle_registration: '' as string,
    }
})

const { t } = useI18n()

const emit = defineEmits(['close', 'submitTransport', 'useCurrentLocation', 'searchAddress', 'centerMapToCoords'])

const rules = computed(() => {
    return {
        formTransport: {
            start_address: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            vehicle_registration: vehicleRegistrationRules(t),
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

function useCurrentLocation() {
    emit('useCurrentLocation')
}

function searchAddress() {
    emit('searchAddress')
}

function centerMapToCoords() {
    emit('centerMapToCoords')
}

watch(() => props.startAddress, (newValue: any) => {
    if (newValue != null) {
        state.formTransport.start_address = newValue || ''
    }
})

// A transport check-in always starts a new trip: pre-fill with the car the
// user last drove. Only fills an empty field; a failed lookup is ignored.
onMounted(async () => {
    const last = await fetchLastVehicleRegistration()
    if (last && !state.formTransport.vehicle_registration) {
        state.formTransport.vehicle_registration = last
    }
})

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitTransport', {
            ...state.formTransport,
            vehicle_registration: normalizeVehicleRegistration(state.formTransport.vehicle_registration),
        })
    }
}

</script>