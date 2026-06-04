<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="type" :label="$t('citizens.outcomes.form.type')" />
                <FormSelect id="type" :options="state.options.types" v-model="state.formOutcome.type" />
                <FormError :error="v$?.formOutcome?.type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.type?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="employer_institution" :label="$t('citizens.outcomes.form.employerInstitution')" />
                <FormTextField id="employer_institution" name="employer_institution"
                    :placeholder="$t('citizens.outcomes.form.employerInstitution')"
                    v-model="state.formOutcome.employer_institution" />
                <FormError :error="v$?.formOutcome?.employer_institution?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.employer_institution?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="start_date" :label="$t('citizens.outcomes.form.startDate')" />
                <FormDateField id="start_date" name="start_date"
                    :placeholder="$t('citizens.outcomes.form.startDate')"
                    v-model="state.formOutcome.start_date" />
                <FormError :error="v$?.formOutcome?.start_date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.start_date?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="end_date" :label="$t('citizens.outcomes.form.endDate')" />
                <FormDateField id="end_date" name="end_date"
                    :placeholder="$t('citizens.outcomes.form.endDate')"
                    v-model="state.formOutcome.end_date" />
                <FormError :error="props?.error?.errors?.end_date?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="billing_rule_uuid" :label="$t('citizens.outcomes.form.billingRule')" />
                <FormSelect id="billing_rule_uuid" :options="state.options.billingRules"
                    v-model="state.formOutcome.billing_rule_uuid" />
                <FormError :error="props?.error?.errors?.billing_rule_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="notes" :label="$t('citizens.outcomes.form.notes')" />
                <FormTextArea id="notes" name="notes" :placeholder="$t('citizens.outcomes.form.notes')"
                    v-model="state.formOutcome.notes" />
                <FormError :error="props?.error?.errors?.notes?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="w-full">
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
import { employmentService } from '@/components/api/user/EmploymentService'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedOutcome: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    formOutcome: {
        uuid: '',
        type: '',
        employer_institution: '',
        start_date: '',
        end_date: '',
        notes: '',
        billing_rule_uuid: '',
    },
    options: {
        types: [] as any,
        billingRules: [] as any,
    },
})

onMounted(() => {
    state.options.types = [
        { value: 'employment', label: t('citizens.outcomes.type.employment') },
        { value: 'education', label: t('citizens.outcomes.type.education') },
        { value: 'work_placement', label: t('citizens.outcomes.type.workPlacement') },
    ]

    state.formOutcome = {
        uuid: props.selectedOutcome.uuid || '',
        type: props.selectedOutcome.type || '',
        employer_institution: props.selectedOutcome.employer_institution || '',
        start_date: props.selectedOutcome.start_date || '',
        end_date: props.selectedOutcome.end_date || '',
        notes: props.selectedOutcome.notes || '',
        billing_rule_uuid: props.selectedOutcome.billing_rule_uuid || '',
    }

    fetchBillingRules()
})

watch(() => props.selectedOutcome, (newValue: any) => {
    if (newValue != null) {
        state.formOutcome = {
            uuid: newValue.uuid || '',
            type: newValue.type || '',
            employer_institution: newValue.employer_institution || '',
            start_date: newValue.start_date || '',
            end_date: newValue.end_date || '',
            notes: newValue.notes || '',
            billing_rule_uuid: newValue.billing_rule_uuid || '',
        }
    }
})

const rules = computed(() => {
    return {
        formOutcome: {
            type: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            employer_institution: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            start_date: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formOutcome)
    }
}

async function fetchBillingRules() {
    try {
        const response = await employmentService.getAllBillingRules()
        if (response) {
            const options: any = [{ value: '', label: t('citizens.outcomes.form.noBillingRule') }]
            response.data.forEach((item: any) =>
                options.push({ value: item.uuid, label: item.name })
            )
            state.options.billingRules = options
        }
    } catch (_) {
        state.options.billingRules = [{ value: '', label: t('citizens.outcomes.form.noBillingRule') }]
    }
}
</script>
