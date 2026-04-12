<template>
    <form @submit.prevent="submitForm()" id="formLogout">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="space-y-1">
            <div class="flex justify-between items-center py-0.5">
                <FormLabel for="end_address"
                    :label="$t('citizens.timeRegistration.registerTransport.form.endAddress')" />
            </div>
            <FormTextArea id="end_address" name="end_address"
                :placeholder="$t('citizens.timeRegistration.registerTransport.form.endAddress')"
                v-model="state.formTransport.end_address" />

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
                    {{ $t('citizens.timeRegistration.checkOut') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    endAddress: {
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
        end_address: '',
        note: '',
    }
})

const { t } = useI18n()

const emit = defineEmits(['close', 'submitTransport', 'useCurrentLocation', 'searchAddress', 'centerMapToCoords'])

const rules = computed(() => {
    return {
        formTransport: {
            end_address: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
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

watch(() => props.endAddress, (newValue: any) => {
    if (newValue != null) {
        state.formTransport.end_address = newValue || ''
    }
})

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitTransport', state.formTransport)
    }
}

</script>