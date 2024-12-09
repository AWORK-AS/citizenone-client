<template>
    <form @submit.prevent="validateForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="date" :label="$t('citizens.medicineJournals.history.form.date')" />
                <FormDateField id="date" name="date" :placeholder="$t('citizens.medicineJournals.history.form.date')"
                    v-model="state.formMedicineHistory.date" />
                <FormError :error="v$?.formMedicineHistory?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="quantity" :label="$t('citizens.medicineJournals.history.form.dailyDose')" />
                <FormTextField id="quantity" name="quantity"
                    :placeholder="$t('citizens.medicineJournals.history.form.dailyDose')"
                    v-model="state.formMedicineHistory.quantity" />
                <FormError :error="v$?.formMedicineHistory?.quantity?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.quantity?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('citizens.medicineJournals.history.form.type.type') }}
                </p>
                <div>
                    <RadioGroup v-model="state.formMedicineHistory.type"
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <RadioGroupOption as="template" v-for="(type, index) in state.options.types" :key="index"
                            :value="type.value" v-slot="{ active, checked }">
                            <div :class="[
                                active ? 'ring-1 ring-offset-2' : '',
                                type.title === 'Delivered' && 'ring-primary',
                                type.title === 'Deviated' && 'ring-green-700',
                                type.title === 'Given' && 'ring-yellow-500',
                                checked && type.title === 'Delivered' && 'bg-primary text-white ring-0 hover:bg-primary',
                                checked && type.title === 'Deviated' && 'bg-green-700 text-white ring-0 hover:bg-green-700',
                                checked && type.title === 'Given' && 'bg-yellow-500 text-white ring-0 hover:bg-yellow-500',
                                !active && !checked && type.title === 'Delivered' && 'border border-primary ring-inset',
                                !active && !checked && type.title === 'Deviated' && 'border border-green-700 ring-inset',
                                !active && !checked && type.title === 'Given' && 'border border-yellow-500 ring-inset',
                                active && checked ? 'text-white ring-1' : '',
                                'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
                                <span v-if="type.title === 'Delivered'">
                                    {{ $t('citizens.medicineJournals.history.form.type.delivered') }}
                                </span>
                                <span v-if="type.title === 'Deviated'">
                                    {{ $t('citizens.medicineJournals.history.form.type.deviated') }}
                                </span>
                                <span v-if="type.title === 'Given'">
                                    {{ $t('citizens.medicineJournals.history.form.type.given') }}
                                </span>
                            </div>
                        </RadioGroupOption>
                    </RadioGroup>
                </div>
                <FormError :error="v$?.formMedicineHistory?.type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.type?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <DialogConfirmation :isModalOpen="state.modal.isMoreThanMedicineDailyConfirmationOpen"
            :message="$t('citizens.medicineJournals.history.confirmation.rightDailyDoseConfirmation') + '?'"
            @close="state.modal.isMoreThanMedicineDailyConfirmationOpen = false" @confirm="submitForm" />
    </form>
</template>

<script setup lang="ts">
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedMedicine: {
        type: Object,
        required: true,
    },
    selectedMedicineHistory: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm', 'isPageLoading', 'error'])

const { t } = useI18n()

const state = reactive({
    formMedicineHistory: {
        uuid: '',
        date: '',
        quantity: '',
        type: '',
    },
    modal: {
        isMoreThanMedicineDailyConfirmationOpen: false,
    },
    options: {
        types: [
            { value: 'delivered', title: 'Delivered' },
            { value: 'deviated', title: 'Deviated' },
            { value: 'given', title: 'Given' },
        ] as any
    }
})

onMounted(() => {
    state.formMedicineHistory = {
        uuid: props.selectedMedicineHistory.uuid,
        date: props.selectedMedicineHistory.date,
        quantity: props.selectedMedicineHistory.quantity?.toString(),
        type: props.selectedMedicineHistory.type,
    }
})

watch(() => props.selectedMedicineHistory, (newValue: any) => {
    if (newValue != null) {
        state.formMedicineHistory = {
            uuid: newValue.uuid,
            date: newValue.date,
            quantity: newValue.quantity?.toString(),
            type: newValue.type,
        }
    }
})

const rules = computed(() => {
    return {
        formMedicineHistory: {
            date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            quantity: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            type: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function validateForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        if (parseInt(state.formMedicineHistory.quantity) > parseInt(props.selectedMedicine?.quantity)) {
            state.modal.isMoreThanMedicineDailyConfirmationOpen = true
        } else {
            submitForm()
        }
    }
}

function submitForm() {
    emit('submitForm', state.formMedicineHistory)
}
</script>