<template>
    <div class="space-y-1">
        <FormLabel :for="props.id" :label="$t('mileageLog.form.vehicleRegistration')" />
        <FormTextField :id="props.id" :name="props.id" :maxLength="VEHICLE_REGISTRATION_MAX_LENGTH"
            placeholder="AB 12 345" :modelValue="props.modelValue ?? ''" @update:modelValue="onInput" />
        <p class="text-xs text-tertiary">{{ $t('mileageLog.form.vehicleRegistrationHelp') }}</p>
        <FormError :error="props.error" />
        <FormError :error="props.serverError" />
    </div>
</template>

<script setup lang="ts">
import { VEHICLE_REGISTRATION_MAX_LENGTH, formatVehicleRegistrationInput } from '@/composables/vehicleRegistration'

// Optional car registration number on a trip. Shared by every trip form so
// label, helper text and input behaviour stay identical everywhere.
const props = defineProps({
    id: {
        type: String,
        default: 'vehicle_registration',
    },
    modelValue: {
        type: String as PropType<string | null>,
        default: '',
    },
    error: {
        type: String,
        required: false,
    },
    serverError: {
        type: String,
        required: false,
    },
})
const emit = defineEmits(['update:modelValue'])

function onInput(value: string) {
    emit('update:modelValue', formatVehicleRegistrationInput(value))
}
</script>
