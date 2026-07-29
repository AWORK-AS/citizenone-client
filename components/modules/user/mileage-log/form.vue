<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="date_time_start" :label="$t('mileageLog.form.dateTimeStart')" />
                <FormDateTimeField id="date_time_start" name="date_time_start"
                    :placeholder="$t('mileageLog.form.dateTimeStart')" v-model="state.formMileageLog.date_time_start" />
                <FormError :error="v$?.formMileageLog?.date_time_start?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_start?.[0]" />
            </div>

            <MapTripStopsInput v-model="state.stops" :min="2" />
            <FormError :error="props?.error?.errors?.stops?.[0]" />

            <div class="space-y-1">
                <FormLabel :label="$t('mileageLog.form.estimatedDistance')" />
                <p class="text-sm font-semibold text-gray-700">
                    {{ formatNumber(locale, estimatedDistanceKm) }} km
                </p>
            </div>

            <div class="space-y-1">
                <FormLabel for="note" :label="$t('mileageLog.form.note')" />
                <FormTextArea id="note" name="note" :placeholder="$t('mileageLog.form.note')"
                    v-model="state.formMileageLog.note" />
                <FormError :error="props?.error?.errors?.note?.[0]" />
            </div>

            <div class="flex items-center gap-x-3 pt-2">
                <FormSwitch :value="state.formMileageLog.linkToCitizen"
                    @toggleSwitch="state.formMileageLog.linkToCitizen = !state.formMileageLog.linkToCitizen" />
                <p class="text-sm">{{ $t('mileageLog.form.linkToCitizen') }}</p>
            </div>

            <div class="space-y-1" v-if="state.formMileageLog.linkToCitizen">
                <FormLabel for="citizen_uuid" :label="$t('mileageLog.form.selectCitizen')" />
                <FormSelect id="citizen_uuid" :options="props.citizenOptions"
                    v-model="state.formMileageLog.citizen_uuid" />
                <FormError :error="v$?.formMileageLog?.citizen_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.citizen_uuid?.[0]" />
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
import moment from 'moment'
import { useVuelidate } from "@vuelidate/core"
import { required, requiredIf, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useNumberFormatter } from '@/composables/numberFormatter'
import { computeTripDistanceKm } from '@/composables/tripDistance'
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
    selectedMileageLog: {
        type: Object,
        default: null,
    },
    citizenOptions: {
        type: Array,
        default: () => [],
    },
})
const emit = defineEmits(['submitForm', 'closeModal'])

const { t, locale } = useI18n()
const { formatNumber } = useNumberFormatter()

const state = reactive({
    error: {} as Error,
    formMileageLog: {
        date_time_start: moment().format('YYYY-MM-DD H:mm'),
        note: '',
        linkToCitizen: false,
        citizen_uuid: null as string | null,
    },
    stops: [
        { address: '', lat: null, lng: null },
        { address: '', lat: null, lng: null },
    ] as Array<{ address: string; lat: number | null; lng: number | null }>,
})

const estimatedDistanceKm = computed(() => computeTripDistanceKm(state.stops))

watch(() => props.selectedMileageLog, (selected: any) => {
    if (selected != null) {
        state.formMileageLog = {
            date_time_start: selected.date_time_start ?? '',
            note: selected.note ?? '',
            linkToCitizen: !!selected.citizen,
            citizen_uuid: selected.citizen?.uuid ?? null,
        }

        const middleStops = (selected.stops ?? []).map((stop: any) => ({
            address: stop.address ?? '',
            lat: stop.latitude ?? null,
            lng: stop.longitude ?? null,
        }))

        state.stops = [
            { address: selected.start_address ?? '', lat: selected.geo_start_lat ?? null, lng: selected.geo_start_lng ?? null },
            ...middleStops,
            { address: selected.end_address ?? '', lat: selected.geo_end_lat ?? null, lng: selected.geo_end_lng ?? null },
        ]
    }
}, { immediate: true })

const rules = computed(() => {
    return {
        formMileageLog: {
            date_time_start: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            citizen_uuid: {
                required: helpers.withMessage(
                    () => `${t('validation.thisFieldIsRequired')}.`,
                    requiredIf(() => state.formMileageLog.linkToCitizen)
                ),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('closeModal')
}

function submitForm() {
    state.error = {}
    v$.value.$validate()

    const hasIncompleteStop = state.stops.some((s) => s.lat === null || s.lng === null)
    if (hasIncompleteStop) {
        state.error = { message: t('mileageLog.form.alert.incompleteStopAddress') } as Error
        return
    }

    if (!v$.value.$error) {
        emit('submitForm', {
            date_time_start: state.formMileageLog.date_time_start,
            note: state.formMileageLog.note,
            citizen_uuid: state.formMileageLog.linkToCitizen ? state.formMileageLog.citizen_uuid : null,
            stops: state.stops,
        })
    }
}
</script>
