<template>
    <form @submit.prevent="submitForm()" class="max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-1">
            <FormLabel for="name" :label="$t('medicationAllergies.form.name')" />
            <FormTextField id="name" name="name" :placeholder="$t('medicationAllergies.form.name')"
                v-model="state.formMedicationAllergy.name" />
            <FormError :error="v$?.formMedicationAllergy?.name?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.name?.[0]" />
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
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
    selectedMedicationAllergy: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formMedicationAllergy: {
        name: '',
    },
})

watch(() => props.selectedMedicationAllergy, (newValue: any) => {
    if (newValue != null) {
        state.formMedicationAllergy = {
            name: newValue.name,
        }
    }
})

const rules = computed(() => {
    return {
        formMedicationAllergy: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formMedicationAllergy)
    }
}
</script>