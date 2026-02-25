<template>
    <div>
        <Modal size="sm" :title="$t('citizens.timeRegistration.registerTransport.registerTransport')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formAbsence">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-1">
                            <div class="flex justify-between items-center py-0.5">
                                <FormLabel for="start_address" :label="$t('citizens.timeRegistration.registerTransport.form.startAddress')" />
                            </div>
                            <FormTextArea id="start_address" name="start_address"
                                :placeholder="$t('citizens.timeRegistration.registerTransport.form.startAddress')"
                                v-model="state.formTransport.start_address" />
                            <div v-if="!state.isLocating" class="flex gap-x-1"
                                @click="useCurrentLocation">
                               <Icon name="ph:map-pin" class="h-4 w-4 text-tertiary" aria-hidden="true" /> 
                               <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800">{{ $t('citizens.timeRegistration.registerTransport.form.useCurrentLocation') }}</span>
                            </div>
                            <div v-else class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="useCurrentLocation">
                                {{ $t('citizens.timeRegistration.registerTransport.form.locating') }}
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
import { reactive, watch, computed } from 'vue'
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

function closeModal() {
    emit('close')
}

const rules = computed(() => {
    return {
        formTransport: {},
    }
})

const v$ = useVuelidate(rules, state)

const { isLocating, error: locationError, getLocationAndAddress } = useLocationHelper(t)

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

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitTransport', state.formTransport)
        state.formTransport.geo_start_lat = ''
        state.formTransport.geo_start_lng = ''
        state.formTransport.start_address = ''
        state.formTransport.note = ''
        v$.value.$reset()
    }
}

async function useCurrentLocation() {
    // clear previous error (composable also clears error on getLocationAndAddress)
    state.error = {}
        const result = await getLocationAndAddress({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    })

    if (!result.success) {
        // composable already set a localized error ref; ensure UI state.error is set too
        state.error = { message: result.error || t('citizens.timeRegistration.registerTransport.errors.unableToLocate') } as Error
        return
    }

    // populate form fields and marker
    if (typeof result.latitude === 'number' && typeof result.longitude === 'number') {
        // markerLat.value = result.latitude
        // markerLng.value = result.longitude
        // mapCenter.value = [result.latitude, result.longitude]
        // mapZoom.value = Math.max(mapZoom.value, 15)
        // store as strings for hidden inputs
        state.formTransport.geo_start_lat = String(result.latitude)
        state.formTransport.geo_start_lng = String(result.longitude)
    }

    const wasRateLimited = !!(locationError.value && locationError.value.includes('rate') || locationError.value && locationError.value.includes('rate-limited'))

    if (result.address) {
        state.formTransport.start_address = result.address
    } else if (!wasRateLimited && result.latitude !== undefined && result.longitude !== undefined) {
        state.formTransport.start_address = ''
        state.error = { message: result.error || t('citizens.timeRegistration.registerTransport.errors.somethingWentWrong') } as Error
    } else {
        state.formTransport.start_address = ''
    }
}
</script>

<style scoped>
button[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>