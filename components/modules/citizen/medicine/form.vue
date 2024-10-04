<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="medicine" :label="$t('citizens.medicineJournals.form.medicine')" />
                <FormTextField id="medicine" name="medicine"
                    :placeholder="$t('citizens.medicineJournals.form.medicine')"
                    v-model="state.formMedicine.medicine" />
                <FormError :error="v$?.formMedicine?.medicine?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.medicine?.[0]" />
            </div>
            <div class="grid grid-cols-2 gap-x-3">
                <div class="space-y-1">
                    <FormLabel for="strength" :label="$t('citizens.medicineJournals.form.strength')" />
                    <FormTextField id="strength" name="strength"
                        :placeholder="$t('citizens.medicineJournals.form.strength')"
                        v-model="state.formMedicine.strength" />
                    <FormError :error="v$?.formMedicine?.strength?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.strength?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="dosage_id" :label="$t('citizens.medicineJournals.form.dosageForm')" />
                    <FormSelect id="dosage_id" :options="state.options.dosage_form"
                        v-model="state.formMedicine.dosage_id" />
                    <FormError :error="v$?.formMedicine?.dosage_id?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.dosage_id?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-2 gap-x-3">
                <div class="space-y-1">
                    <FormLabel for="daily_dose" :label="$t('citizens.medicineJournals.form.dailyDose')" />
                    <FormTextField id="daily_dose" name="daily_dose"
                        :placeholder="$t('citizens.medicineJournals.form.dailyDose')"
                        v-model="state.formMedicine.daily_dose" />
                    <FormError :error="v$?.formMedicine?.daily_dose?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.daily_dose?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="quantity" :label="$t('citizens.medicineJournals.form.quantity')" />
                    <FormTextField id="quantity" name="quantity"
                        :placeholder="$t('citizens.medicineJournals.form.quantity')"
                        v-model="state.formMedicine.quantity" />
                    <FormError :error="v$?.formMedicine?.quantity?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.quantity?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="active_ingredients" :label="$t('citizens.medicineJournals.form.activeIngredients')" />
                <FormTextArea id="active_ingredients" name="active_ingredients"
                    :placeholder="$t('citizens.medicineJournals.form.activeIngredients')"
                    v-model="state.formMedicine.active_ingredients" />
                <FormError :error="v$?.formMedicine?.active_ingredients?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.active_ingredients?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('citizens.medicineJournals.form.description')" />
                <FormTextArea id="description" name="description"
                    :placeholder="$t('citizens.medicineJournals.form.description')"
                    v-model="state.formMedicine.description" />
                <FormError :error="v$?.formMedicine?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
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
    </form>
</template>

<script setup lang="ts">
import { dosageService } from '@/components/api/DosageService'
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
})
const emit = defineEmits(['closeModal', 'submitForm', 'isPageLoading', 'error'])

const { t } = useI18n()

const state = reactive({
    formMedicine: {
        uuid: '',
        medicine: '',
        strength: '',
        dosage_id: '',
        daily_dose: '',
        quantity: '',
        active_ingredients: '',
        description: '',
    },
    options: {
        dosage_form: []
    }
})

onMounted(() => {
    state.formMedicine = {
        uuid: props.selectedMedicine.uuid,
        medicine: props.selectedMedicine.medicine,
        strength: props.selectedMedicine.strength,
        dosage_id: props.selectedMedicine.dosage_id,
        daily_dose: props.selectedMedicine.daily_dose,
        quantity: props.selectedMedicine.quantity?.toString(),
        active_ingredients: props.selectedMedicine.active_ingredients,
        description: props.selectedMedicine.description,
    }
    fetchDosageForm()
})

watch(() => props.selectedMedicine, (newValue: any) => {
    if (newValue != null) {
        state.formMedicine = {
            uuid: newValue.uuid,
            medicine: newValue.medicine,
            strength: newValue.strength,
            dosage_id: newValue.dosage_id,
            daily_dose: newValue.daily_dose,
            quantity: newValue.quantity?.toString(),
            active_ingredients: newValue.active_ingredients,
            description: newValue.description,
        }
    }
})

const rules = computed(() => {
    return {
        formMedicine: {
            medicine: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            strength: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            dosage_id: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            daily_dose: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            quantity: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            active_ingredients: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            description: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formMedicine)
    }
}

async function fetchDosageForm() {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const response = await dosageService.getAllDosages()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.id,
                    label: item.name,
                })
            )
            state.options.dosage_form = options
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}
</script>