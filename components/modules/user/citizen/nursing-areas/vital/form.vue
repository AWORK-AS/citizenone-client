<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="date" :label="$t('citizens.nursingAreas.vitals.form.date')" />
                <FormDateField id="date" name="date" :placeholder="$t('citizens.nursingAreas.vitals.form.date')"
                    v-model="state.formVitals.date" />
                <FormError :error="v$?.formVitals?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="blood_pressure" :label="$t('citizens.nursingAreas.vitals.form.bloodPressure')" />
                <FormTextField id="blood_pressure" name="blood_pressure"
                    :placeholder="$t('citizens.nursingAreas.vitals.form.bloodPressure')"
                    v-model="state.formVitals.blood_pressure" />
                <FormError :error="v$?.formVitals?.blood_pressure?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.blood_pressure?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="pulse" :label="$t('citizens.nursingAreas.vitals.form.pulse')" />
                <FormTextField id="pulse" name="pulse" :placeholder="$t('citizens.nursingAreas.vitals.form.pulse')"
                    v-model="state.formVitals.pulse" />
                <FormError :error="v$?.formVitals?.pulse?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.pulse?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="weight" :label="$t('citizens.nursingAreas.vitals.form.weight')" />
                <FormTextField id="weight" name="weight" :placeholder="$t('citizens.nursingAreas.vitals.form.weight')"
                    v-model="state.formVitals.weight" />
                <FormError :error="v$?.formVitals?.weight?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.weight?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="blood_sugar" :label="$t('citizens.nursingAreas.vitals.form.bloodSugar')" />
                <FormTextField id="blood_sugar" name="blood_sugar"
                    :placeholder="$t('citizens.nursingAreas.vitals.form.bloodSugar')"
                    v-model="state.formVitals.blood_sugar" />
                <FormError :error="v$?.formVitals?.blood_sugar?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.blood_sugar?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="temperature" :label="$t('citizens.nursingAreas.vitals.form.temperature')" />
                <FormTextField id="temperature" name="temperature"
                    :placeholder="$t('citizens.nursingAreas.vitals.form.temperature')"
                    v-model="state.formVitals.temperature" />
                <FormError :error="v$?.formVitals?.temperature?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.temperature?.[0]" />
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
    selectedVitals: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()

const state = reactive({
    formVitals: {
        id: '',
        uuid: '',
        date: '',
        blood_pressure: '',
        pulse: '',
        weight: '',
        blood_sugar: '',
        temperature: '',
        additional_fields: [],
    },
})

onMounted(() => {
    state.formVitals = {
        id: props.selectedVitals.id,
        uuid: props.selectedVitals.uuid,
        date: props.selectedVitals.date,
        blood_pressure: props.selectedVitals.blood_pressure,
        pulse: props.selectedVitals.pulse,
        weight: props.selectedVitals.weight,
        blood_sugar: props.selectedVitals.blood_sugar,
        temperature: props.selectedVitals.temperature,
        additional_fields: props.selectedVitals.additional_fields,
    }
})

watch(() => props.selectedVitals, (newValue: any) => {
    if (newValue != null) {
        state.formVitals = {
            id: newValue.id,
            uuid: newValue.uuid,
            date: newValue.date,
            blood_pressure: newValue.blood_pressure,
            pulse: newValue.pulse,
            weight: newValue.weight,
            blood_sugar: newValue.blood_sugar,
            temperature: newValue.temperature,
            additional_fields: newValue.additional_fields,
        }
    }
})

const rules = computed(() => {
    return {
        formVitals: {
            date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            blood_pressure: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            pulse: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            weight: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            blood_sugar: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            temperature: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formVitals)
    }
}
</script>