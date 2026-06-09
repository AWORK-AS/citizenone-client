<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('employment.billingRules.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('employment.billingRules.form.name')"
                    v-model="state.formBillingRule.name" />
                <FormError :error="v$?.formBillingRule?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="rate" :label="$t('employment.billingRules.form.rate')" />
                <FormTextField id="rate" name="rate" :placeholder="$t('employment.billingRules.form.rate')"
                    v-model="state.formBillingRule.rate" />
                <FormError :error="v$?.formBillingRule?.rate?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.rate?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="frequency" :label="$t('employment.billingRules.form.frequency')" />
                <FormSelect id="frequency" :options="frequencyOptions" v-model="state.formBillingRule.frequency" />
                <FormError :error="v$?.formBillingRule?.frequency?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.frequency?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('employment.billingRules.form.description')" />
                <FormTextArea id="description" name="description"
                    :placeholder="$t('employment.billingRules.form.description')"
                    v-model="state.formBillingRule.description" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="flex items-center gap-x-3">
                <FormLabel for="is_active" :label="$t('employment.billingRules.form.isActive')" />
                <FormSwitch :value="state.formBillingRule.is_active"
                    @toggleSwitch="state.formBillingRule.is_active = !state.formBillingRule.is_active" />
                <FormError :error="props?.error?.errors?.is_active?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel"
                    @click="navigateTo('/settings/employment-billing-rules')">
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
    selectedBillingRule: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const frequencyOptions = computed(() => [
    { value: 'hourly', label: t('employment.billingRules.form.frequencyOptions.hourly') },
    { value: 'daily', label: t('employment.billingRules.form.frequencyOptions.daily') },
    { value: 'weekly', label: t('employment.billingRules.form.frequencyOptions.weekly') },
    { value: 'monthly', label: t('employment.billingRules.form.frequencyOptions.monthly') },
    { value: 'fixed', label: t('employment.billingRules.form.frequencyOptions.fixed') },
])

const state = reactive({
    error: {} as Error,
    formBillingRule: {
        name: '',
        rate: '',
        frequency: null as string | null,
        description: '',
        is_active: true,
    },
})

watch(() => props.selectedBillingRule, (newValue: any) => {
    if (newValue != null) {
        state.formBillingRule = {
            name: newValue.name ?? '',
            rate: newValue.rate ?? '',
            frequency: newValue.frequency ?? null,
            description: newValue.description ?? '',
            is_active: newValue.is_active ?? true,
        }
    }
})

const rules = computed(() => {
    return {
        formBillingRule: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            rate: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            frequency: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formBillingRule)
    }
}
</script>
