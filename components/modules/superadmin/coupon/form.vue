<template>
    <form @submit.prevent="submitForm()" class="space-y-5">

        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <!-- Coupon information -->
        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-5">
                {{ $t('superadmin.coupons.form.couponInformation') }}
            </h2>

            <!-- Type -->
            <div class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.coupons.form.type.type')" :required="true" />
                <SuperadminFormSelectField v-model="state.formCoupon.type"
                    :hasError="v$?.formCoupon?.type?.$error">
                    <option value="" disabled>— {{ $t('superadmin.coupons.form.type.type') }} —</option>
                    <option value="deal">{{ $t('superadmin.coupons.form.type.deal') }}</option>
                    <option value="add-on">{{ $t('superadmin.coupons.form.type.addOn') }}</option>
                </SuperadminFormSelectField>
                <SuperadminFormError :error="v$?.formCoupon?.type?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props?.error?.errors?.type?.[0]" />
            </div>

            <!-- Code -->
            <div class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.coupons.form.code')" :required="true" />
                <SuperadminFormTextField v-model="state.formCoupon.code"
                    :placeholder="$t('superadmin.coupons.form.code')"
                    :hasError="v$?.formCoupon?.code?.$error" />
                <SuperadminFormError :error="v$?.formCoupon?.code?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props?.error?.errors?.code?.[0]" />
            </div>

            <!-- Description -->
            <div class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.coupons.form.description')" :required="true" />
                <SuperadminFormTextField v-model="state.formCoupon.description"
                    :placeholder="$t('superadmin.coupons.form.description')"
                    :hasError="v$?.formCoupon?.description?.$error" />
                <SuperadminFormError :error="v$?.formCoupon?.description?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props?.error?.errors?.description?.[0]" />
            </div>

            <!-- Unit -->
            <div class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.coupons.form.unit.unit')" :required="true" />
                <SuperadminFormSelectField v-model="state.formCoupon.unit"
                    :hasError="v$?.formCoupon?.unit?.$error">
                    <option value="" disabled>— {{ $t('superadmin.coupons.form.unit.unit') }} —</option>
                    <option value="amount">{{ $t('superadmin.coupons.form.unit.amount') }}</option>
                    <option value="percentage">{{ $t('superadmin.coupons.form.unit.percentage') }}</option>
                </SuperadminFormSelectField>
                <SuperadminFormError :error="v$?.formCoupon?.unit?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props?.error?.errors?.unit?.[0]" />
            </div>

            <!-- Amount + Quantity -->
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.coupons.form.amount')" :required="true" />
                    <SuperadminFormTextField v-model="state.formCoupon.amount" type="number"
                        :placeholder="$t('superadmin.coupons.form.amount')"
                        :hasError="v$?.formCoupon?.amount?.$error" />
                    <SuperadminFormError :error="v$?.formCoupon?.amount?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="props?.error?.errors?.amount?.[0]" />
                </div>
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.coupons.form.quantity')" />
                    <SuperadminFormTextField v-model="state.formCoupon.quantity" type="number"
                        :placeholder="$t('superadmin.coupons.form.quantity')" />
                    <SuperadminFormError :error="props?.error?.errors?.quantity?.[0]" />
                </div>
            </div>

            <!-- Expiration -->
            <div>
                <SuperadminFormLabel :label="$t('superadmin.coupons.form.expiration')" />
                <SuperadminFormTextField v-model="state.formCoupon.expiration" type="date" />
                <SuperadminFormError :error="props?.error?.errors?.expiration?.[0]" />
            </div>
        </div>

        <!-- Settings (update only) -->
        <div v-if="props.formType === 'update'" class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-4">
                {{ $t('superadmin.companies.form.settings') }}
            </h2>

            <div class="flex items-center justify-between py-3">
                <p class="text-[13px] font-medium text-[#1F2533]">
                    {{ $t('superadmin.coupons.form.active') }}
                </p>
                <button type="button" @click="state.formCoupon.is_active = !state.formCoupon.is_active"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                    :style="state.formCoupon.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                    <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                        :class="state.formCoupon.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                </button>
            </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-end gap-3 pb-6">
            <button type="button" @click="navigateTo('/superadmin/coupons')"
                class="px-5 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                {{ $t('cancel') }}
            </button>
            <button type="submit"
                class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                style="background:#205E77">
                {{ props.formType === 'create' ? $t('save') : $t('update') }}
            </button>
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

const state = reactive({
    error: {} as Error,
    formCoupon: {
        type: '',
        code: '',
        description: '',
        amount: '',
        unit: '',
        expiration: '',
        quantity: '',
        is_active: false,
    },
})

watch(() => props.selectedCoupon, (newValue: any) => {
    if (newValue != null) {
        state.formCoupon = {
            type: newValue.type ?? '',
            code: newValue.code ?? '',
            description: newValue.description ?? '',
            amount: newValue.amount ?? '',
            unit: newValue.unit ?? '',
            expiration: newValue.expiration ?? '',
            quantity: newValue.quantity ?? '',
            is_active: newValue.is_active ?? false,
        }
    }
})

const rules = computed(() => ({
    formCoupon: {
        type: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        code: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        description: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        amount: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        unit: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formCoupon)
    }
}
</script>
