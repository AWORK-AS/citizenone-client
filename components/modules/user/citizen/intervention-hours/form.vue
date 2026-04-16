<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <!-- Transportation fields if transportation type -->
        <div v-if="props.selectedInterventionHours?.is_transportation" class="space-y-3 mb-4">
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="start_address"
                        :label="$t('citizens.timeRegistration.registerTransport.form.startAddress')" />
                    <div class="flex gap-x-1 items-center cursor-pointer" @click="openStartLocationMap">
                        <Icon name="ph:map-pin" class="text-tertiary w-4 h-4" />
                        <span class="text-xs text-tertiary hover:text-tertiary-800">
                            {{ $t('citizens.timeRegistration.registerTransport.form.selectLocation') }}
                        </span>
                    </div>
                </div>
                <FormTextArea id="start_address" name="start_address"
                    :placeholder="$t('citizens.timeRegistration.registerTransport.form.startAddress')"
                    v-model="state.formTransport.start_address" />
                <FormError :error="props?.error?.errors?.start_address?.[0]" />
            </div>

            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="end_address"
                        :label="$t('citizens.timeRegistration.registerTransport.form.endAddress')" />
                    <div class="flex gap-x-1 items-center cursor-pointer" @click="openEndLocationMap">
                        <Icon name="ph:map-pin" class="text-tertiary w-4 h-4" />
                        <span class="text-xs text-tertiary hover:text-tertiary-800">
                            {{ $t('citizens.timeRegistration.registerTransport.form.selectLocation') }}
                        </span>
                    </div>
                </div>
                <FormTextArea id="end_address" name="end_address"
                    :placeholder="$t('citizens.timeRegistration.registerTransport.form.endAddress')"
                    v-model="state.formTransport.end_address" />
                <FormError :error="props?.error?.errors?.end_address?.[0]" />
            </div>

            <div class="space-y-1">
                <FormLabel for="kilometers"
                    :label="$t('citizens.timeRegistration.registerTransport.form.kilometers')" />
                <FormTextField id="kilometers" name="kilometers" type="number" step="0.01"
                    :placeholder="$t('citizens.timeRegistration.registerTransport.form.kilometers')"
                    v-model="state.formTransport.kilometers" />
                <FormError :error="props?.error?.errors?.distance_km?.[0]" />
            </div>
        </div>

        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="date_time_start" :label="$t('citizens.interventionHours.form.datetimeStart')" />
                <FormDateTimeField id="date_time_start" name="date_time_start"
                    :placeholder="$t('citizens.interventionHours.form.datetimeStart')"
                    v-model="state.formInterventionHours.date_time_start" />
                <FormError :error="v$?.formInterventionHours?.date_time_start?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_start?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_end" :label="$t('citizens.interventionHours.form.datetimeEnd')" />
                <FormDateTimeField id="date_time_end" name="date_time_end"
                    :placeholder="$t('citizens.interventionHours.form.datetimeEnd')"
                    v-model="state.formInterventionHours.date_time_end" />
                <FormError :error="v$?.formInterventionHours?.date_time_end?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_end?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="note" :label="$t('citizens.interventionHours.form.note')" />
                <FormTextArea id="note" name="note" :placeholder="$t('citizens.interventionHours.form.note')"
                    v-model="state.formInterventionHours.note" />
                <FormError :error="v$?.formInterventionHours?.note?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.note?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') : $t('update') }}
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
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedInterventionHours: {
        type: Object,
        required: true,
    },
    transportData: {
        type: Object,
        default: null,
    },
    calculatedDistance: {
        type: Number,
        default: 0,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal', 'openStartLocationMap', 'openEndLocationMap'])

const state = reactive({
    error: {} as Error,
    formInterventionHours: {
        date_time_start: '',
        date_time_end: '',
        note: '',
    },
    formTransport: {
        start_address: '',
        end_address: '',
        kilometers: '',
    }
})

const { t } = useI18n()

watch(() => props.transportData, (data) => {
    if (data && props.selectedInterventionHours?.is_transportation) {
        state.formTransport.start_address = data.start_address || ''
        state.formTransport.end_address = data.end_address || ''
    }
}, { immediate: true, deep: true })

watch(() => props.calculatedDistance, (distance) => {
    if (props.selectedInterventionHours?.is_transportation && distance > 0) {
        state.formTransport.kilometers = parseFloat(distance.toFixed(2)).toString()
    }
}, { immediate: true })

watch(() => props.selectedInterventionHours, (selectedInterventionHours: any) => {
    if (selectedInterventionHours != null) {
        state.formInterventionHours = {
            date_time_start: selectedInterventionHours.date_time_start,
            date_time_end: selectedInterventionHours.date_time_end,
            note: selectedInterventionHours.note,
        }

        if (selectedInterventionHours.is_transportation) {
            state.formTransport = {
                start_address: selectedInterventionHours.start_address || '',
                end_address: selectedInterventionHours.end_address || '',
                kilometers: selectedInterventionHours.kilometers || '0',
            }
        }
    }
}, { immediate: true })

const rules = computed(() => {
    return {
        formInterventionHours: {
            date_time_start: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_end: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('closeModal')
}

function openStartLocationMap() {
    emit('openStartLocationMap')
}

function openEndLocationMap() {
    emit('openEndLocationMap')
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        const formData = {
            ...state.formInterventionHours,
            ...(props.selectedInterventionHours?.is_transportation ? state.formTransport : {})
        }
        emit('submitForm', formData)
    }
}
</script>