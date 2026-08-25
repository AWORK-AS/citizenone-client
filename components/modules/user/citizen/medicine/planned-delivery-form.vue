<template>
    <div>
        <form @submit.prevent="submitForm()" id="formPlannedDelivery">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="grid grid-cols-1 gap-y-3">
                <div class="space-y-1" v-if="!props.preselectedMedicineUuid">
                    <FormLabel for="planned_delivery_medicine" :label="$t('citizens.medicineJournals.form.medicine')" />
                    <FormSelect id="planned_delivery_medicine" :options="medicineOptions" v-model="state.citizenMedicineUuid" />
                    <FormError :error="state.touched && !state.citizenMedicineUuid ? `${t('validation.thisFieldIsRequired')}.` : ''" />
                    <FormError :error="props?.error?.errors?.citizen_medicine_uuid?.[0]" />
                </div>

                <div v-if="selectedMedicine"
                    class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 space-y-1">
                    <p class="text-sm font-semibold text-gray-900">
                        {{ selectedMedicineName }}
                    </p>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                        <p>
                            <span class="font-medium">{{ $t('citizens.medicineJournals.plannedDelivery.activeIngredient') }}:</span>
                            {{ selectedMedicine?.medicine?.ingredients }}
                        </p>
                        <p v-if="selectedMedicine?.strength">
                            <span class="font-medium">{{ $t('citizens.medicineJournals.form.strength') }}:</span>
                            {{ selectedMedicine?.strength }}
                            {{ selectedMedicine?.mass_unit?.name ? ' ' + selectedMedicine.mass_unit.name : '' }}
                        </p>
                        <p>
                            <span class="font-medium">{{ $t('citizens.medicineJournals.plannedDelivery.currentMainStock') }}:</span>
                            {{ selectedMedicine?.current_stocks }}
                        </p>
                    </div>
                </div>

                <div class="space-y-1">
                    <FormLabel for="planned_delivery_amount" :label="$t('citizens.medicineJournals.plannedDelivery.amount')" />
                    <FormNumberField id="planned_delivery_amount" name="planned_delivery_amount"
                        :placeholder="$t('citizens.medicineJournals.plannedDelivery.amount')" :min="0"
                        v-model="state.amount" />
                    <FormError v-if="state.touched && !state.amount"
                        :error="`${t('validation.thisFieldIsRequired')}.`" />
                    <FormError v-else-if="amountExceedsStock"
                        :error="$t('citizens.medicineJournals.plannedDelivery.amountExceedsStock')" />
                    <FormError :error="props?.error?.errors?.amount?.[0]" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="planned_delivery_period_start" :label="$t('citizens.medicineJournals.plannedDelivery.periodStart')" />
                        <FormDateField id="planned_delivery_period_start" name="planned_delivery_period_start"
                            :placeholder="$t('citizens.medicineJournals.plannedDelivery.periodStart')"
                            v-model="state.periodStart" />
                        <FormError v-if="state.touched && !state.periodStart"
                            :error="`${t('validation.thisFieldIsRequired')}.`" />
                        <FormError :error="props?.error?.errors?.period_start?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="planned_delivery_period_end" :label="$t('citizens.medicineJournals.plannedDelivery.periodEnd')" />
                        <FormDateField id="planned_delivery_period_end" name="planned_delivery_period_end"
                            :placeholder="$t('citizens.medicineJournals.plannedDelivery.periodEnd')"
                            v-model="state.periodEnd" />
                        <FormError v-if="state.touched && !state.periodEnd"
                            :error="`${t('validation.thisFieldIsRequired')}.`" />
                        <FormError v-else-if="periodEndBeforeStart"
                            :error="$t('citizens.medicineJournals.plannedDelivery.periodEndBeforeStart')" />
                        <FormError :error="props?.error?.errors?.period_end?.[0]" />
                    </div>
                </div>

                <div class="space-y-1">
                    <FormLabel for="planned_delivery_comment" :label="$t('citizens.medicineJournals.history.form.comment')" />
                    <FormTextArea id="planned_delivery_comment" name="planned_delivery_comment"
                        :placeholder="$t('citizens.medicineJournals.history.form.comment')"
                        v-model="state.comment" />
                    <FormError :error="props?.error?.errors?.comment?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="!canSubmit">
                        {{ $t('save') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    medicines: {
        type: Array,
        default: () => [],
    },
    preselectedMedicineUuid: {
        type: String,
        default: null,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()
const language = useI18n()

const state = reactive({
    citizenMedicineUuid: props.preselectedMedicineUuid ?? '',
    amount: '',
    periodStart: '',
    periodEnd: '',
    comment: '',
    touched: false,
})

watch(() => props.preselectedMedicineUuid, (uuid) => {
    if (uuid) state.citizenMedicineUuid = uuid
})

function getMedicineName(medicine: any): string {
    const locale = language.locale.value
    if (locale === 'en') return medicine?.medicine?.en_name ?? ''
    if (locale === 'no') return medicine?.medicine?.no_name ?? medicine?.medicine?.dk_name ?? ''
    if (locale === 'sv') return medicine?.medicine?.sv_name ?? medicine?.medicine?.dk_name ?? ''
    return medicine?.medicine?.dk_name ?? ''
}

const medicineOptions = computed(() =>
    (props.medicines ?? []).map((medicine: any) => ({
        value: medicine.uuid,
        label: `${getMedicineName(medicine)}, ${medicine?.medicine?.ingredients ?? ''}`,
    }))
)

const selectedMedicine = computed(() =>
    (props.medicines ?? []).find((medicine: any) => medicine.uuid === state.citizenMedicineUuid) ?? null
)

const selectedMedicineName = computed(() => selectedMedicine.value ? getMedicineName(selectedMedicine.value) : '')

const amountExceedsStock = computed(() => {
    if (!selectedMedicine.value || state.amount === '' || state.amount === null) return false
    const stock = Number(selectedMedicine.value?.current_stocks)
    if (Number.isNaN(stock)) return false
    return Number(state.amount) > stock
})

const periodEndBeforeStart = computed(() => {
    if (!state.periodStart || !state.periodEnd) return false
    return state.periodEnd < state.periodStart
})

const canSubmit = computed(() =>
    !!state.citizenMedicineUuid &&
    !!state.amount &&
    !!state.periodStart &&
    !!state.periodEnd &&
    !amountExceedsStock.value &&
    !periodEndBeforeStart.value
)

function submitForm() {
    state.touched = true
    if (!canSubmit.value) return
    emit('submitForm', {
        citizen_medicine_uuid: state.citizenMedicineUuid,
        amount: state.amount,
        period_start: state.periodStart,
        period_end: state.periodEnd,
        comment: state.comment,
    })
}
</script>
