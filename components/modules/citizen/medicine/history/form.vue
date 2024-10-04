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
                <FormLabel for="quantity" :label="$t('citizens.medicineJournals.history.form.quantity')" />
                <FormTextField id="quantity" name="quantity"
                    :placeholder="$t('citizens.medicineJournals.history.form.quantity')"
                    v-model="state.formMedicineHistory.quantity" />
                <FormError :error="v$?.formMedicineHistory?.quantity?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.quantity?.[0]" />
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
        <DialogConfirmation :isModalOpen="state.modal.isMoreThanMedicineQuantityConfirmationOpen"
            :message="$t('citizens.medicineJournals.history.confirmation.rightQuantityConfirmation') + '?'"
            @close="state.modal.isMoreThanMedicineQuantityConfirmationOpen = false" @confirm="submitForm" />
    </form>
</template>

<script setup lang="ts">
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
    },
    modal: {
        isMoreThanMedicineQuantityConfirmationOpen: false,
    }
})

onMounted(() => {
    state.formMedicineHistory = {
        uuid: props.selectedMedicineHistory.uuid,
        date: props.selectedMedicineHistory.date,
        quantity: props.selectedMedicineHistory.quantity,
    }
})

watch(() => props.selectedMedicineHistory, (newValue: any) => {
    if (newValue != null) {
        state.formMedicineHistory = {
            uuid: newValue.uuid,
            date: newValue.date,
            quantity: newValue.quantity,
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
        },
    }
})

const v$ = useVuelidate(rules, state)

function validateForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        if (parseInt(state.formMedicineHistory.quantity) > parseInt(props.selectedMedicine?.quantity)) {
            state.modal.isMoreThanMedicineQuantityConfirmationOpen = true
        } else {
            submitForm()
        }
    }
}

function submitForm() {
    emit('submitForm', state.formMedicineHistory)
}
</script>