<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <div class="space-y-4">
            <!-- Name -->
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('dutyShiftRules.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('dutyShiftRules.form.name')"
                    v-model="state.form.name" />
                <FormError :error="v$?.form?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>

            <!-- Period days -->
            <div class="space-y-1">
                <FormLabel for="period_days" :label="$t('dutyShiftRules.form.periodDays')" />
                <FormTextField id="period_days" name="period_days" type="number" min="1"
                    :placeholder="$t('dutyShiftRules.form.periodDays')"
                    v-model="state.form.period_days" />
                <FormError :error="v$?.form?.period_days?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.period_days?.[0]" />
            </div>

            <!-- Condition type -->
            <div class="space-y-1">
                <FormLabel for="condition_type" :label="$t('dutyShiftRules.form.conditionType')" />
                <FormSelect id="condition_type" :options="state.conditionTypeOptions"
                    v-model="state.form.condition_type" />
                <FormError :error="v$?.form?.condition_type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.condition_type?.[0]" />
            </div>

            <!-- Threshold (count-based) -->
            <div class="space-y-1" v-if="state.form.condition_type === 'count'">
                <FormLabel for="threshold" :label="$t('dutyShiftRules.form.threshold')" />
                <FormTextField id="threshold" name="threshold" type="number" min="1"
                    :placeholder="$t('dutyShiftRules.form.threshold')"
                    v-model="state.form.threshold" />
                <FormError :error="v$?.form?.threshold?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.threshold?.[0]" />
            </div>

            <!-- Consecutive days (consecutive) -->
            <div class="space-y-1" v-if="state.form.condition_type === 'consecutive'">
                <FormLabel for="consecutive_days" :label="$t('dutyShiftRules.form.consecutiveDays')" />
                <FormTextField id="consecutive_days" name="consecutive_days" type="number" min="1"
                    :placeholder="$t('dutyShiftRules.form.consecutiveDays')"
                    v-model="state.form.consecutive_days" />
                <FormError :error="v$?.form?.consecutive_days?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.consecutive_days?.[0]" />
            </div>

            <!-- Shift types -->
            <div class="space-y-1">
                <FormLabel for="shift_type_uuids" :label="$t('dutyShiftRules.form.shiftTypes')" />
                <FormSelectMultiple id="shift_type_uuids" :options="state.shiftOptions"
                    v-model="state.form.shift_type_uuids" />
                <FormError :error="v$?.form?.shift_type_uuids?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.shift_type_uuids?.[0]" />
            </div>
        </div>

        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/settings/duty-shift-rules')">
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
import { shiftService } from '@/components/api/user/ShiftService'
import type { Error } from '@/types'

const props = defineProps({
    error: { type: Object, required: false },
    formType: { type: String, required: true },
    selectedRule: { type: Object, required: false },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])
const { t } = useI18n()

const state = reactive({
    form: {
        name: '',
        period_days: null as number | null,
        condition_type: null as string | null,
        threshold: null as number | null,
        consecutive_days: null as number | null,
        shift_type_uuids: [] as string[],
    },
    shiftOptions: [] as any[],
    conditionTypeOptions: [
        { value: 'count', label: t('dutyShiftRules.form.conditionTypes.count') },
        { value: 'consecutive', label: t('dutyShiftRules.form.conditionTypes.consecutive') },
    ],
})

onMounted(async () => {
    const shifts = await shiftService.getAllShifts({})
    state.shiftOptions = shifts?.data?.map((s: any) => ({
        value: s.uuid,
        label: s.en_name,
    })) ?? []
})

watch(() => props.selectedRule, (newValue: any) => {
    if (newValue != null) {
        state.form = {
            name: newValue.name ?? '',
            period_days: newValue.period_days ?? null,
            condition_type: newValue.condition_type ?? null,
            threshold: newValue.threshold ?? null,
            consecutive_days: newValue.consecutive_days ?? null,
            shift_type_uuids: newValue.shift_type_uuids ?? [],
        }
    }
})

const rules = computed(() => ({
    form: {
        name: { required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required) },
        period_days: { required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required) },
        condition_type: { required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required) },
        shift_type_uuids: { required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required) },
    },
}))

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.form)
    }
}
</script>
