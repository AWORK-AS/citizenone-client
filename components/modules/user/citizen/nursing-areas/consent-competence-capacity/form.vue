<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="date" :label="$t('citizens.nursingAreas.consentCompetenceOrCapacity.form.date')" />
                <FormDateField id="date" name="birthday"
                    :placeholder="$t('citizens.nursingAreas.consentCompetenceOrCapacity.form.date')"
                    v-model="state.formConsentCompetenceCapacity.date" />
                <FormError :error="v$?.formConsentCompetenceCapacity?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('citizens.nursingAreas.consentCompetenceOrCapacity.form.consentCompetenceOrCapacity') }}
                </p>
                <FormTextField id="consent_competence_capacity" name="consent_competence_capacity"
                    :placeholder="$t('citizens.nursingAreas.consentCompetenceOrCapacity.form.consentCompetenceOrCapacity')"
                    v-model="state.formConsentCompetenceCapacity.consent_competence_capacity" />
                <FormError
                    :error="v$?.formConsentCompetenceCapacity?.consent_competence_capacity?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.consent_competence_capacity?.[0]" />
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
    selectedConsentCompetenceCapacity: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()

const state = reactive({
    formConsentCompetenceCapacity: {
        id: '',
        uuid: '',
        date: '',
        consent_competence_capacity: '',
    },
})

onMounted(() => {
    state.formConsentCompetenceCapacity = {
        id: props.selectedConsentCompetenceCapacity.id,
        uuid: props.selectedConsentCompetenceCapacity.uuid,
        date: props.selectedConsentCompetenceCapacity.date,
        consent_competence_capacity: props.selectedConsentCompetenceCapacity.consent_competence_capacity,
    }
})

watch(() => props.selectedConsentCompetenceCapacity, (newValue: any) => {
    if (newValue != null) {
        state.formConsentCompetenceCapacity = {
            id: newValue.id,
            uuid: newValue.uuid,
            date: newValue.date,
            consent_competence_capacity: newValue.consent_competence_capacity,
        }
    }
})

const rules = computed(() => {
    return {
        formConsentCompetenceCapacity: {
            date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            consent_competence_capacity: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formConsentCompetenceCapacity)
    }
}
</script>