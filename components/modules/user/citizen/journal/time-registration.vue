<template>
    <!-- Time registered together with a note written without a booking.
         Collapsed until asked for; left closed, the note saves as before. -->
    <div class="space-y-3 rounded-xl border border-gray-100 p-4" data-testid="journal-time-registration">
        <button type="button" class="flex w-full items-center gap-x-2 text-left text-sm font-medium text-primary"
            v-if="!model.enabled" @click="open">
            <Icon name="ph:clock" class="size-4" aria-hidden="true" />
            {{ $t('citizens.citizenJournals.registerTime.title') }}
        </button>
        <template v-else>
            <div class="flex items-center justify-between gap-x-2">
                <p class="flex items-center gap-x-2 text-sm font-semibold text-gray-800">
                    <Icon name="ph:clock" class="size-4" aria-hidden="true" />
                    {{ $t('citizens.citizenJournals.registerTime.title') }}
                </p>
                <button type="button" class="text-xs text-gray-500 hover:text-gray-700" @click="model.enabled = false">
                    {{ $t('citizens.citizenJournals.registerTime.remove') }}
                </button>
            </div>
            <p class="text-xs text-gray-500">{{ $t('citizens.citizenJournals.registerTime.hint') }}</p>
            <FormError :error="props.error?.errors?.care_hour?.[0]" />
            <div class="space-y-1" v-if="hourTypeOptions.length > 0">
                <FormLabel for="care_hour_contract_hour_type_uuid" :label="$t('citizens.interventionHours.form.hourType')" />
                <FormSelect id="care_hour_contract_hour_type_uuid" :options="hourTypeOptions" :searchable="false"
                    :canClear="false" :canDeselect="false" v-model="model.contract_hour_type_uuid" />
                <FormError :error="props.error?.errors?.['care_hour.contract_hour_type_uuid']?.[0]" />
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="space-y-1">
                    <FormLabel for="care_hour_date_time_start" :label="$t('citizens.interventionHours.form.datetimeStart')" />
                    <FormDateTimeField id="care_hour_date_time_start" name="care_hour_date_time_start"
                        :placeholder="$t('citizens.interventionHours.form.datetimeStart')"
                        v-model="model.date_time_start" />
                    <FormError :error="props.error?.errors?.['care_hour.date_time_start']?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="care_hour_date_time_end" :label="$t('citizens.interventionHours.form.datetimeEnd')" />
                    <FormDateTimeField id="care_hour_date_time_end" name="care_hour_date_time_end"
                        :placeholder="$t('citizens.interventionHours.form.datetimeEnd')"
                        v-model="model.date_time_end" />
                    <FormError :error="props.error?.errors?.['care_hour.date_time_end']?.[0]" />
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { useCareHourTypes } from '@/composables/careHourTypeList'
import { defaultHourTypeUuid, hourTypeChoices } from '@/composables/careHourTypes'

type NoteTimeRegistration = {
    enabled: boolean,
    date_time_start: string,
    date_time_end: string,
    contract_hour_type_uuid: string,
}

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
})

const model = defineModel<NoteTimeRegistration>({ required: true })

// The company's hour types, only where it switched them on (else empty and no picker).
const { types: hourTypes, loadHourTypes } = useCareHourTypes()
const hourTypeOptions = computed(() => hourTypeChoices(hourTypes.value))

async function open() {
    model.value.enabled = true
    await loadHourTypes()
    if (!model.value.contract_hour_type_uuid) {
        model.value.contract_hour_type_uuid = defaultHourTypeUuid(hourTypes.value)
    }
}
</script>
