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

            <!-- Pricing type -->
            <div class="space-y-1">
                <FormLabel for="pricing_type" :label="$t('employment.billingRules.form.pricingType')" />
                <FormSelect id="pricing_type" :options="pricingTypeOptions"
                    v-model="state.formBillingRule.pricing_type" />
                <FormError :error="v$?.formBillingRule?.pricing_type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.pricing_type?.[0]" />
            </div>

            <!-- Weekly rate -->
            <div class="space-y-1" v-if="state.formBillingRule.pricing_type === 'weekly'">
                <FormLabel for="weekly_rate" :label="$t('employment.billingRules.form.weeklyRate')" />
                <FormTextField id="weekly_rate" name="weekly_rate"
                    :placeholder="$t('employment.billingRules.form.weeklyRate')"
                    v-model="state.formBillingRule.weekly_rate" />
                <FormError :error="v$?.formBillingRule?.weekly_rate?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.weekly_rate?.[0]" />
            </div>

            <!-- Hourly rate -->
            <div class="space-y-1" v-if="state.formBillingRule.pricing_type === 'hourly'">
                <FormLabel for="hourly_rate" :label="$t('employment.billingRules.form.hourlyRate')" />
                <FormTextField id="hourly_rate" name="hourly_rate"
                    :placeholder="$t('employment.billingRules.form.hourlyRate')"
                    v-model="state.formBillingRule.hourly_rate" />
                <FormError :error="v$?.formBillingRule?.hourly_rate?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.hourly_rate?.[0]" />
            </div>

            <!-- Bonus fields -->
            <template v-if="state.formBillingRule.pricing_type === 'bonus'">
                <div class="space-y-1">
                    <FormLabel for="bonus_amount" :label="$t('employment.billingRules.form.bonusAmount')" />
                    <FormTextField id="bonus_amount" name="bonus_amount"
                        :placeholder="$t('employment.billingRules.form.bonusAmount')"
                        v-model="state.formBillingRule.bonus_amount" />
                    <FormError :error="v$?.formBillingRule?.bonus_amount?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.bonus_amount?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="bonus_condition_months"
                        :label="$t('employment.billingRules.form.bonusConditionMonths')" />
                    <FormSelect id="bonus_condition_months" :options="bonusMonthOptions"
                        v-model="state.formBillingRule.bonus_condition_months" />
                    <p class="text-xs text-[#8891A4]">
                        {{ $t('employment.billingRules.form.bonusConditionMonthsHint') }}
                    </p>
                    <FormError :error="props?.error?.errors?.bonus_condition_months?.[0]" />
                </div>
            </template>

            <!-- Invoice data fields -->
            <div class="border-t border-[#EAECF0] pt-3 mt-1">
                <p class="text-xs font-semibold text-[#8891A4] uppercase tracking-wide mb-3">
                    {{ $t('employment.billingRules.form.invoiceDataSection') }}
                </p>
                <div class="space-y-3">
                    <div class="space-y-1">
                        <FormLabel for="customer_number" :label="$t('employment.billingRules.form.customerNumber')" />
                        <FormTextField id="customer_number" name="customer_number"
                            :placeholder="$t('employment.billingRules.form.customerNumber')"
                            v-model="state.formBillingRule.customer_number" />
                        <FormError :error="props?.error?.errors?.customer_number?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="product_number" :label="$t('employment.billingRules.form.productNumber')" />
                        <FormTextField id="product_number" name="product_number"
                            :placeholder="$t('employment.billingRules.form.productNumber')"
                            v-model="state.formBillingRule.product_number" />
                        <FormError :error="props?.error?.errors?.product_number?.[0]" />
                    </div>
                </div>
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
    error: { type: Object, required: false },
    formType: { type: String, required: true },
    selectedBillingRule: { type: Object, required: false },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const pricingTypeOptions = computed(() => [
    { value: 'weekly', label: t('employment.billingRules.form.pricingTypeOptions.weekly') },
    { value: 'hourly', label: t('employment.billingRules.form.pricingTypeOptions.hourly') },
    { value: 'bonus', label: t('employment.billingRules.form.pricingTypeOptions.bonus') },
])

const bonusMonthOptions = computed(() => [
    { value: 3, label: t('employment.billingRules.form.bonusMonthOptions.three') },
    { value: 6, label: t('employment.billingRules.form.bonusMonthOptions.six') },
])

const state = reactive({
    error: {} as Error,
    formBillingRule: {
        name: '',
        pricing_type: 'weekly' as any,
        weekly_rate: '' as string,
        hourly_rate: '' as string,
        bonus_amount: '' as string,
        bonus_condition_months: null as any | null,
        customer_number: '',
        product_number: '',
        description: '',
        is_active: true,
    },
})

watch(() => props.selectedBillingRule, (newValue: any) => {
    if (newValue != null) {
        state.formBillingRule = {
            name: newValue.name ?? '',
            pricing_type: newValue.pricing_type ?? 'weekly',
            weekly_rate: newValue.weekly_rate != null ? String(newValue.weekly_rate) : '',
            hourly_rate: newValue.hourly_rate != null ? String(newValue.hourly_rate) : '',
            bonus_amount: newValue.bonus_amount != null ? String(newValue.bonus_amount) : '',
            bonus_condition_months: newValue.bonus_condition_months ?? null,
            customer_number: newValue.customer_number ?? '',
            product_number: newValue.product_number ?? '',
            description: newValue.description ?? '',
            is_active: newValue.is_active ?? true,
        }
    }
})

const rules = computed(() => ({
    formBillingRule: {
        name: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        pricing_type: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        const toRate = (val: string) => val !== '' ? val : null
        const payload = {
            ...state.formBillingRule,
            weekly_rate: toRate(state.formBillingRule.weekly_rate),
            hourly_rate: toRate(state.formBillingRule.hourly_rate),
            bonus_amount: toRate(state.formBillingRule.bonus_amount),
        }
        emit('submitForm', payload)
    }
}
</script>
