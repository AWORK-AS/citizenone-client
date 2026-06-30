<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="en_name" :label="$t('shifts.form.nameEnglish')" />
                <FormTextField id="en_name" name="en_name" :placeholder="$t('shifts.form.nameEnglish')"
                    v-model="state.formShift.en_name" />
                <FormError :error="v$?.formShift?.en_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.en_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="dk_name" :label="$t('shifts.form.nameDanish')" />
                <FormTextField id="dk_name" name="dk_name" :placeholder="$t('shifts.form.nameDanish')"
                    v-model="state.formShift.dk_name" />
                <FormError :error="v$?.formShift?.dk_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.dk_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="no_name" :label="$t('shifts.form.nameNorwegian')" />
                <FormTextField id="no_name" name="no_name" :placeholder="$t('shifts.form.nameNorwegian')"
                    v-model="state.formShift.no_name" />
                <FormError :error="v$?.formShift?.no_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.no_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="sv_name" :label="$t('shifts.form.nameSwedish')" />
                <FormTextField id="sv_name" name="sv_name" :placeholder="$t('shifts.form.nameSwedish')"
                    v-model="state.formShift.sv_name" />
                <FormError :error="v$?.formShift?.sv_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.sv_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="pay_code" :label="$t('shifts.form.paycode')" />
                <FormTextField id="pay_code" name="pay_code" :placeholder="$t('shifts.form.paycode')"
                    v-model="state.formShift.pay_code" />
                <FormError :error="v$?.formShift?.pay_code?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.pay_code?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="time_in" :label="$t('shifts.form.timeIn')" />
                <FormTimeField id="time_in" name="time_in" :placeholder="$t('shifts.form.timeIn')"
                    v-model="state.formShift.time_in" />
                <FormError :error="v$?.formShift?.time_in?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.time_in?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="time_out" :label="$t('shifts.form.timeOut')" />
                <FormTimeField id="time_out" name="time_out" :placeholder="$t('shifts.form.timeOut')"
                    v-model="state.formShift.time_out" />
                <FormError :error="v$?.formShift?.time_out?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.time_out?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="color" :label="$t('shifts.form.color')" />
                <FormColorPicker id="color" v-model="state.formShift.color" />
                <FormError :error="v$?.formShift?.color?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.color?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex items-center gap-x-2">
                    <div class="flex items-center cursor-pointer"
                        @click="state.formShift.is_leave_shift_type = !state.formShift.is_leave_shift_type">
                        <FormCheckbox :value="state.formShift.is_leave_shift_type" />
                        {{ $t('shifts.form.markAsLeaveType') }}
                    </div>
                    <Icon name="ph:question" class="size-4 cursor-pointer text-gray-500 hover:text-gray-700"
                        aria-hidden="true" @click="state.isLeaveTypeModalOpen = true" />
                </div>
            </div>
            <div class="space-y-3 pt-2 border-t border-gray-100">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">{{ $t('shifts.form.multiplierRules') }}</span>
                    <button type="button" @click="addMultiplierRule"
                        class="text-sm text-primary hover:text-primary-700 flex items-center gap-1">
                        <Icon name="ph:plus" size="16" />
                        {{ $t('shifts.form.addMultiplierRule') }}
                    </button>
                </div>
                <p v-if="state.formShift.multiplier_rules.length === 0" class="text-sm text-gray-400">
                    {{ $t('shifts.form.multiplierRulesEmpty') }}
                </p>
                <div v-for="(rule, index) in state.formShift.multiplier_rules" :key="index"
                    class="border border-gray-200 rounded-xl p-3 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700">
                            {{ $t('shifts.form.multiplierRuleTitle') }} {{ index + 1 }}
                        </span>
                        <button type="button" @click="removeMultiplierRule(index)"
                            class="text-red-500 hover:text-red-700">
                            <Icon name="ph:trash" size="18" />
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <FormLabel :label="$t('shifts.form.multiplierRuleName')" />
                            <FormTextField :name="`rule_name_${index}`"
                                :placeholder="$t('shifts.form.multiplierRuleNamePlaceholder')"
                                v-model="rule.name" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel :label="$t('shifts.form.multiplierRuleFactor')" />
                            <FormNumberField :name="`rule_factor_${index}`"
                                :placeholder="$t('shifts.form.multiplierRuleFactorPlaceholder')"
                                v-model="rule.factor" />
                            <span v-if="state.ruleErrors[index]?.factor" class="text-xs text-red-500">
                                {{ state.ruleErrors[index].factor }}
                            </span>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center justify-between">
                            <p class="text-sm text-gray-500">{{ $t('shifts.form.multiplierRuleTimeInterval') }}</p>
                            <button v-if="rule.time_from || rule.time_to" type="button"
                                @click="rule.time_from = ''; rule.time_to = ''"
                                class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                <Icon name="ph:x" size="12" />
                                {{ $t('clear') }}
                            </button>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="flex-1 space-y-1">
                                <FormLabel :label="$t('shifts.form.multiplierRuleTimeFrom')" />
                                <FormTimeField :name="`rule_time_from_${index}`"
                                    v-model:value="rule.time_from" />
                                <span v-if="state.ruleErrors[index]?.time_from" class="text-xs text-red-500">
                                    {{ state.ruleErrors[index].time_from }}
                                </span>
                            </div>
                            <div class="flex-1 space-y-1">
                                <FormLabel :label="$t('shifts.form.multiplierRuleTimeTo')" />
                                <FormTimeField :name="`rule_time_to_${index}`"
                                    v-model:value="rule.time_to" />
                                <span v-if="state.ruleErrors[index]?.time_to" class="text-xs text-red-500">
                                    {{ state.ruleErrors[index].time_to }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <p class="text-sm text-gray-500">{{ $t('shifts.form.multiplierRuleDaysOfWeek') }}</p>
                        <div class="flex gap-1 flex-wrap">
                            <button v-for="day in daysOfWeekOptions" :key="day.value" type="button"
                                @click="toggleDayOfWeek(rule, day.value)"
                                :class="[
                                    'px-2 py-1 text-xs rounded-full border transition-colors',
                                    (rule.days_of_week ?? []).includes(day.value)
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                ]">
                                {{ day.label }}
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-x-4 gap-y-2">
                        <div class="flex items-center cursor-pointer"
                            @click="rule.applies_to_weekdays = !rule.applies_to_weekdays">
                            <FormCheckbox :value="rule.applies_to_weekdays" />
                            <span class="ml-1 text-sm">{{ $t('shifts.form.multiplierRuleAppliesToWeekdays') }}</span>
                        </div>
                        <div class="flex items-center cursor-pointer"
                            @click="rule.applies_to_weekends = !rule.applies_to_weekends">
                            <FormCheckbox :value="rule.applies_to_weekends" />
                            <span class="ml-1 text-sm">{{ $t('shifts.form.multiplierRuleAppliesToWeekends') }}</span>
                        </div>
                        <div class="flex items-center cursor-pointer"
                            @click="rule.applies_to_holidays = !rule.applies_to_holidays">
                            <FormCheckbox :value="rule.applies_to_holidays" />
                            <span class="ml-1 text-sm">{{ $t('shifts.form.multiplierRuleAppliesToHolidays') }}</span>
                        </div>
                    </div>
                    <div class="flex items-center cursor-pointer" @click="rule.is_active = !rule.is_active">
                        <FormCheckbox :value="rule.is_active" />
                        <span class="ml-1 text-sm">{{ $t('shifts.form.multiplierRuleIsActive') }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/settings/shifts')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" :disabled="props.isModalLoading">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
    <ModulesUserDutyScheduleShiftModalLeaveType :isModalOpen="state.isLeaveTypeModalOpen"
        @close="state.isLeaveTypeModalOpen = false" />
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
    selectedShift: {
        type: Object,
        required: false,
    },
    isModalLoading: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isLeaveTypeModalOpen: false,
    ruleErrors: [] as any[],
    formShift: {
        en_name: '',
        dk_name: '',
        no_name: '',
        sv_name: '',
        pay_code: '',
        time_in: '',
        time_out: '',
        color: '#000000',
        is_leave_shift_type: false,
        multiplier_rules: [] as any[],
    },
})

watch(() => props.selectedShift, (newValue: any) => {
    if (newValue != null) {
        state.formShift = {
            en_name: newValue.en_name,
            dk_name: newValue.dk_name,
            no_name: newValue.no_name,
            sv_name: newValue.sv_name,
            pay_code: newValue.pay_code,
            time_in: newValue.time_in,
            time_out: newValue.time_out,
            color: newValue.color,
            is_leave_shift_type: newValue.is_leave_shift_type,
            multiplier_rules: (newValue.multiplier_rules ?? []).map((rule: any) => ({
                name: rule.name ?? '',
                factor: rule.factor != null ? String(rule.factor) : '',
                time_from: rule.time_from ?? '',
                time_to: rule.time_to ?? '',
                days_of_week: rule.days_of_week ?? [],
                applies_to_weekdays: rule.applies_to_weekdays ?? false,
                applies_to_weekends: rule.applies_to_weekends ?? false,
                applies_to_holidays: rule.applies_to_holidays ?? false,
                is_active: rule.is_active ?? true,
            })),
        }
        state.ruleErrors = (newValue.multiplier_rules ?? []).map(() => ({}))
    }
})

const rules = computed(() => {
    return {
        formShift: {
            en_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            dk_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            no_name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            sv_name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            time_in: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            time_out: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            color: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

const daysOfWeekOptions = computed(() => [
    { value: 0, label: t('recurring.days.sunday').slice(0, 3) },
    { value: 1, label: t('recurring.days.monday').slice(0, 3) },
    { value: 2, label: t('recurring.days.tuesday').slice(0, 3) },
    { value: 3, label: t('recurring.days.wednesday').slice(0, 3) },
    { value: 4, label: t('recurring.days.thursday').slice(0, 3) },
    { value: 5, label: t('recurring.days.friday').slice(0, 3) },
    { value: 6, label: t('recurring.days.saturday').slice(0, 3) },
])

function addMultiplierRule() {
    state.formShift.multiplier_rules.push({
        name: '',
        factor: '',
        time_from: '',
        time_to: '',
        days_of_week: [],
        applies_to_weekdays: false,
        applies_to_weekends: false,
        applies_to_holidays: false,
        is_active: true,
    })
    state.ruleErrors.push({})
}

function removeMultiplierRule(index: number) {
    state.formShift.multiplier_rules.splice(index, 1)
    state.ruleErrors.splice(index, 1)
}

function toggleDayOfWeek(rule: any, day: number) {
    if (!rule.days_of_week) rule.days_of_week = []
    const idx = rule.days_of_week.indexOf(day)
    if (idx === -1) {
        rule.days_of_week.push(day)
    } else {
        rule.days_of_week.splice(idx, 1)
    }
}

function validateMultiplierRules(): boolean {
    let valid = true
    state.ruleErrors = state.formShift.multiplier_rules.map((rule: any) => {
        const errors: any = {}
        if (!rule.factor && rule.factor !== 0) {
            errors.factor = `${t('validation.thisFieldIsRequired')}.`
            valid = false
        }
        if (rule.time_to && !rule.time_from) {
            errors.time_from = `${t('validation.thisFieldIsRequired')}.`
            valid = false
        }
        if (rule.time_from && !rule.time_to) {
            errors.time_to = `${t('validation.thisFieldIsRequired')}.`
            valid = false
        }
        return errors
    })
    return valid
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error && validateMultiplierRules()) {
        const multiplierRules = state.formShift.multiplier_rules.map((rule: any) => ({
            name: rule.name || null,
            factor: Number(rule.factor),
            time_from: rule.time_from ? rule.time_from.substring(0, 5) : null,
            time_to: rule.time_to ? rule.time_to.substring(0, 5) : null,
            days_of_week: rule.days_of_week?.length > 0 ? rule.days_of_week : null,
            applies_to_weekdays: rule.applies_to_weekdays ?? false,
            applies_to_weekends: rule.applies_to_weekends ?? false,
            applies_to_holidays: rule.applies_to_holidays ?? false,
            is_active: rule.is_active ?? true,
        }))
        emit('submitForm', {
            ...state.formShift,
            multiplier_rules: multiplierRules,
        })
    }
}
</script>
