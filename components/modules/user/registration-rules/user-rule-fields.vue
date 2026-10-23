<template>
    <!-- One consultant's own rule on a case: mileage and expenses (follow the
         case, yes or no) and monthly limits. Used on the rules panel, when an
         employee is put on a case, and when a consultant is chosen for an inquiry. -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
            <label :for="`${props.idPrefix}-mileage`" class="block text-xs font-semibold text-gray-700">
                {{ $t('registrationRules.consultants.mileage') }}
            </label>
            <select :id="`${props.idPrefix}-mileage`" v-model="mileage"
                class="mt-1 block h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-primary">
                <option value="case">{{ $t('registrationRules.consultants.followCase') }}</option>
                <option value="yes">{{ $t('registrationRules.allowed') }}</option>
                <option value="no">{{ $t('registrationRules.notAllowed') }}</option>
            </select>
        </div>
        <div>
            <label :for="`${props.idPrefix}-km`" class="block text-xs font-semibold text-gray-700">
                {{ $t('registrationRules.consultants.kmLimit') }}
            </label>
            <div class="mt-1">
                <FormNumberField :id="`${props.idPrefix}-km`" :name="`${props.idPrefix}-km`" :min="0"
                    :placeholder="$t('registrationRules.consultants.noLimit')" v-model="km_limit" />
            </div>
        </div>
        <div>
            <label :for="`${props.idPrefix}-expenses`" class="block text-xs font-semibold text-gray-700">
                {{ $t('registrationRules.consultants.expenses') }}
            </label>
            <select :id="`${props.idPrefix}-expenses`" v-model="expenses"
                class="mt-1 block h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-primary">
                <option value="case">{{ $t('registrationRules.consultants.followCase') }}</option>
                <option value="yes">{{ $t('registrationRules.allowed') }}</option>
                <option value="no">{{ $t('registrationRules.notAllowed') }}</option>
            </select>
        </div>
        <div>
            <label :for="`${props.idPrefix}-amount`" class="block text-xs font-semibold text-gray-700">
                {{ $t('registrationRules.consultants.amountLimit') }}
            </label>
            <div class="mt-1">
                <FormNumberField :id="`${props.idPrefix}-amount`" :name="`${props.idPrefix}-amount`" :min="0"
                    :placeholder="$t('registrationRules.consultants.noLimit')" v-model="amount_limit" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { UserRuleDraft } from '@/components/api/user/RegistrationRuleService'

const props = defineProps({
    modelValue: {
        type: Object as PropType<UserRuleDraft>,
        required: true,
    },
    idPrefix: {
        type: String,
        default: 'user-rule',
    },
})

const emit = defineEmits(['update:modelValue'])

const field = <K extends keyof UserRuleDraft>(key: K) => computed({
    get: () => props.modelValue[key],
    set: (value: UserRuleDraft[K]) => emit('update:modelValue', { ...props.modelValue, [key]: value }),
})

const mileage = field('mileage')
const expenses = field('expenses')
const km_limit = field('km_limit')
const amount_limit = field('amount_limit')
</script>
