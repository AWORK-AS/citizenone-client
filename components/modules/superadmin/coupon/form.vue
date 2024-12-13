<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="code" :label="$t('superadmin.coupons.form.code')" />
                <FormTextField id="code" name="code" :placeholder="$t('superadmin.coupons.form.code')"
                    v-model="state.formCoupon.code" />
                <FormError :error="v$?.formCoupon?.code?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.code?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('superadmin.coupons.form.description')" />
                <FormTextField id="description" name="description"
                    :placeholder="$t('superadmin.coupons.form.description')" v-model="state.formCoupon.description" />
                <FormError :error="v$?.formCoupon?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="unit" :label="$t('superadmin.coupons.form.unit.unit')" />
                <FormSelect id="unit" :options="state.options.unit" v-model="state.formCoupon.unit" />
                <FormError :error="v$?.formCoupon?.unit?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.unit?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="amount" :label="$t('superadmin.coupons.form.amount')" />
                <FormTextField id="amount" name="amount" :placeholder="$t('superadmin.coupons.form.amount')"
                    v-model="state.formCoupon.amount" />
                <FormError :error="v$?.formCoupon?.amount?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.amount?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="expiration" :label="$t('superadmin.coupons.form.expiration')" />
                <FormDateField id="expiration" name="expiration" :placeholder="$t('superadmin.coupons.form.expiration')"
                    v-model="state.formCoupon.expiration" />
                <FormError :error="v$?.formCoupon?.expiration?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.expiration?.[0]" />
            </div>
            <div v-if="props.formType === 'update'">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formCoupon.is_active = !state.formCoupon.is_active">
                    <FormCheckbox :value="state.formCoupon.is_active" />
                    {{ $t('superadmin.coupons.form.active') }}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/superadmin/coupons')">
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
    selectedCoupon: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])
const { t } = useI18n()
const language = useI18n()

const state = reactive({
    error: {} as Error,
    formCoupon: {
        code: '',
        description: '',
        amount: '',
        unit: '',
        expiration: '',
        is_active: false,
    },
    options: {
        unit: [
            { value: 'amount', label: `${t('superadmin.coupons.form.unit.amount')}` },
            { value: 'percentage', label: `${t('superadmin.coupons.form.unit.percentage')}` },
        ]
    }
})

watch(() => props.selectedCoupon, (newValue: any) => {
    if (newValue != null) {
        state.formCoupon = {
            code: newValue.code,
            description: newValue.description,
            amount: newValue.amount,
            unit: newValue.unit,
            expiration: newValue.expiration,
            is_active: newValue.is_active,
        }
    }
})

watch(() => language.locale.value, (newValue: any) => {
    if (newValue != null) {
        state.options.unit = [
            { value: 'amount', label: `${t('superadmin.coupons.form.unit.amount')}` },
            { value: 'percentage', label: `${t('superadmin.coupons.form.unit.percentage')}` },
        ]
    }
})

const rules = computed(() => {
    return {
        formCoupon: {
            code: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            description: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            amount: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            unit: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            is_active: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formCoupon)
    }
}
</script>