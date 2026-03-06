<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl" id="timeAccountForm">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <div class="space-y-4">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('timeAccounts.form.name')" />
                <FormTextField id="name" name="name" placeholder="" v-model="state.formTimeAccount.name" />
                <FormError :error="v$?.formTimeAccount?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>

            <div class="space-y-1">
                <FormLabel for="initial_amount" :label="$t('timeAccounts.form.initialAmount')" />
                <FormNumberField id="initial_amount" name="initial_amount" placeholder="" :min="0"
                    v-model="state.formTimeAccount.initial_amount" />
                <FormError :error="v$?.formTimeAccount?.initial_amount?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.initial_amount?.[0]" />
            </div>
            <div v-if="Number(state.formTimeAccount.initial_amount) > 0" class="flex items-center gap-2">
                <div class="w-fit flex items-center gap-2 cursor-pointer"
                    @click="state.formTimeAccount.is_recurring = !state.formTimeAccount.is_recurring">
                    <FormCheckbox :value="state.formTimeAccount.is_recurring" />
                    <span class="text-sm font-medium text-gray-700 select-none">{{
                        $t('timeAccounts.form.isRecurring') }}</span>
                </div>
                <Icon name="ph:question" class="h-4 w-4 text-gray-500 cursor-pointer" aria-hidden="true"
                    @click="state.modal.isRecurringInfoOpen = true" />
            </div>

            <div class="space-y-1">
                <FormLabel for="start_date" :label="$t('normPeriod.form.dateStart')" />
                <FormDateField id="start_date" name="start_date" placeholder=""
                    v-model="state.formTimeAccount.start_date" />
                <FormError :error="v$?.formTimeAccount?.start_date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.start_date?.[0]" />
            </div>

            <div class="space-y-1">
                <FormLabel for="account_until" :label="$t('timeAccounts.form.accountUntil')" />
                <FormDateField id="account_until" name="account_until" placeholder=""
                    v-model="state.formTimeAccount.account_until" />
                <FormError :error="props?.error?.errors?.account_until?.[0]" />
            </div>

            <div class="border border-gray-200 rounded-md p-4 space-y-4">
                <p class="text-sm font-semibold text-gray-700">{{ $t('timeAccounts.form.advancedConfiguration') }}</p>

                <div class="space-y-1">
                    <FormLabel :label="$t('timeAccounts.form.ruleType')" />
                    <FormSelect id="rule_type" :options="ruleTypeOptions" :modelValue="state.formTimeAccount.rule.type"
                        @update:modelValue="(val: string) => { state.formTimeAccount.rule.type = val; state.formTimeAccount.rule.conditions = { min_age: '', max_age: '', hired_after: '', hired_before: '', month_duration: '' } }" />
                    <FormError :error="v$?.formTimeAccount?.rule?.type.$errors[0]?.$message.toString()" />
                </div>

                <div class="space-y-1">
                    <FormLabel :label="$t('timeAccounts.form.grantAmount')" />
                    <FormNumberField id="rule_grant_amount" name="rule_grant_amount" placeholder="" :min="0"
                        v-model="state.formTimeAccount.rule.grant_amount" />
                    <FormError :error="v$?.formTimeAccount?.rule?.grant_amount.$errors[0]?.$message.toString()" />
                </div>

                <div class="space-y-1">
                    <FormLabel :label="$t('timeAccounts.form.grantFrequency')" />
                    <FormSelect id="rule_grant_frequency" :options="frequencyOptions"
                        v-model="state.formTimeAccount.rule.grant_frequency" />
                    <FormError :error="v$?.formTimeAccount?.rule?.grant_frequency.$errors[0]?.$message.toString()" />
                </div>

                <template v-if="state.formTimeAccount.rule.type === 'age'">
                    <div class="space-y-1">
                        <FormLabel :label="$t('timeAccounts.form.minAge')" />
                        <FormNumberField id="rule_min_age" name="rule_min_age" placeholder="" :min="0"
                            v-model="state.formTimeAccount.rule.conditions.min_age" />
                        <FormError :error="v$?.formTimeAccount?.rule?.conditions.min_age.$errors[0]?.$message.toString()" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel :label="$t('timeAccounts.form.maxAge')" />
                        <FormNumberField id="rule_max_age" name="rule_max_age" placeholder="" :min="0"
                            v-model="state.formTimeAccount.rule.conditions.max_age" />
                        <FormError :error="v$?.formTimeAccount?.rule?.conditions.max_age.$errors[0]?.$message.toString()" />
                    </div>
                </template>

                <template v-if="state.formTimeAccount.rule.type === 'employment_date'">
                    <div class="space-y-1">
                        <FormLabel :label="$t('timeAccounts.form.hiredAfter')" />
                        <FormDateField id="rule_hired_after" name="rule_hired_after" placeholder=""
                            v-model="state.formTimeAccount.rule.conditions.hired_after" />
                        <FormError :error="v$?.formTimeAccount?.rule?.conditions.hired_after.$errors[0]?.$message.toString()" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel :label="$t('timeAccounts.form.hiredBefore')" />
                        <FormDateField id="rule_hired_before" name="rule_hired_before" placeholder=""
                            v-model="state.formTimeAccount.rule.conditions.hired_before" />
                        <FormError :error="v$?.formTimeAccount?.rule?.conditions.hired_before.$errors[0]?.$message.toString()" />
                    </div>
                </template>

                <template v-if="state.formTimeAccount.rule.type === 'employment_duration'">
                    <div class="space-y-1">
                        <FormLabel :label="$t('timeAccounts.form.duration')" />
                        <FormNumberField id="rule_month_duration" name="rule_month_duration" placeholder="" :min="0"
                            v-model="state.formTimeAccount.rule.conditions.month_duration" />
                        <FormError :error="v$?.formTimeAccount?.rule?.conditions.month_duration.$errors[0]?.$message.toString()" />
                    </div>
                </template>
            </div>

            <div class="space-y-2">
                <div class="w-fit flex items-center gap-2 cursor-pointer"
                    @click="state.formTimeAccount.carry_over = !state.formTimeAccount.carry_over">
                    <FormCheckbox :value="state.formTimeAccount.carry_over" />
                    <span class="text-sm font-medium text-gray-700 select-none">{{
                        $t('timeAccounts.form.carryOver') }}</span>
                </div>
                <div class="w-fit flex items-center gap-2 cursor-pointer"
                    @click="state.formTimeAccount.is_active = !state.formTimeAccount.is_active">
                    <FormCheckbox :value="state.formTimeAccount.is_active" />
                    <span class="text-sm font-medium text-gray-700 select-none">{{
                        $t('timeAccounts.form.isActive') }}</span>
                </div>
            </div>
        </div>

        <ModulesUserTimeAccountsModalRecurringInfo :isModalOpen="state.modal.isRecurringInfoOpen"
            @close="state.modal.isRecurringInfoOpen = false" />

        <div class="mt-6 mb-20">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/settings/time-accounts')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
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
// import { stat } from "node:fs"

const props = defineProps({
    error: { type: Object, required: false },
    formType: { type: String, required: true },
    selectedTimeAccount: { type: Object, required: false },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const ruleTypeOptions = computed(() => [
    { value: 'age', label: t('timeAccounts.form.ruleTypes.age') },
    { value: 'employment_date', label: t('timeAccounts.form.ruleTypes.employmentDate') },
    { value: 'employment_duration', label: t('timeAccounts.form.ruleTypes.employmentDuration') },
])

const frequencyOptions = computed(() => [
    { value: 'weekly', label: t('timeAccounts.form.frequencies.weekly') },
    { value: 'monthly', label: t('timeAccounts.form.frequencies.monthly') },
    { value: 'yearly', label: t('timeAccounts.form.frequencies.yearly') },
])

const state = reactive({
    error: {} as Error,
    modal: {
        isRecurringInfoOpen: false,
    },
    formTimeAccount: {
        name: '',
        initial_amount: '0' as any,
        start_date: '' as any,
        account_until: '' as any,
        carry_over: false,
        is_recurring: false,
        is_active: false,
        rule: {
            type: '',
            grant_amount: '',
            grant_frequency: '',
            conditions: {
                min_age: '',
                max_age: '',
                hired_before: '',
                hired_after: '',
                month_duration: '',
            },
        },
    },
})

watch(() => state.formTimeAccount.initial_amount, (newValue: any) => {
    if (Number(newValue) === 0) {
        state.formTimeAccount.is_recurring = false
    }
})

watch(() => props.selectedTimeAccount, (newValue: any) => {
    if (newValue != null) {
        state.formTimeAccount = {
            name: newValue.name ?? '',
            initial_amount: newValue.initial_amount ?? '',
            start_date: newValue.start_date ?? '',
            account_until: newValue.account_until ?? '',
            carry_over: newValue.carry_over ?? false,
            is_recurring: newValue.is_recurring ?? false,
            is_active: newValue.is_active ?? true,
            rule: {
                type: newValue.rules?.type ?? '',
                grant_amount: newValue.rules?.grant_amount ?? '',
                grant_frequency: newValue.rules?.grant_frequency ?? '',
                conditions: {
                    min_age: newValue.rules?.conditions?.min_age ?? '',
                    max_age: newValue.rules?.conditions?.max_age ?? '',
                    hired_before: newValue.rules?.conditions?.hired_before ?? '',
                    hired_after: newValue.rules?.conditions?.hired_after ?? '',
                    month_duration: newValue.rules?.conditions?.month_duration ?? '',
                },
            },
        }
    }
})

const rules = computed(() => {
    return {
        formTimeAccount: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            initial_amount: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            start_date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            rule: {
                type: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                grant_amount: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                grant_frequency: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                conditions: {
                    min_age: state.formTimeAccount.rule.type === 'age' && state.formTimeAccount.rule.conditions.max_age === '' ? {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    } : {},
                    max_age: state.formTimeAccount.rule.type === 'age' && state.formTimeAccount.rule.conditions.min_age === '' ? {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    } : {},
                    hired_after: state.formTimeAccount.rule.type === 'employment_date' && state.formTimeAccount.rule.conditions.hired_before === '' ? {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    } : {},
                    hired_before: state.formTimeAccount.rule.type === 'employment_date' && state.formTimeAccount.rule.conditions.hired_after === '' ? {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    } : {},
                    month_duration: state.formTimeAccount.rule.type === 'employment_duration' ? {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    } : {},
                },
            }
        },
    }
})

const v$ = useVuelidate(rules, state)

function filteredConditions(rule: any) {
    if (rule.type === 'age') return { min_age: rule.conditions.min_age, max_age: rule.conditions.max_age }
    if (rule.type === 'employment_date') return { hired_after: rule.conditions.hired_after, hired_before: rule.conditions.hired_before }
    if (rule.type === 'employment_duration') return { month_duration: rule.conditions.month_duration }
    return {}
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', {
            ...state.formTimeAccount,
            rule: { ...state.formTimeAccount.rule, conditions: filteredConditions(state.formTimeAccount.rule) },
        })
    }
}
</script>
