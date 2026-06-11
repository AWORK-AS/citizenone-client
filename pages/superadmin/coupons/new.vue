<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.coupons.newCoupon') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.coupons.newCoupon') }}</template>

            <div class="p-1 max-w-2xl">
                <NuxtLink to="/superadmin/coupons"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-6 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    {{ $t('superadmin.coupons.coupons') }}
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminCouponForm formType="create" :selectedCoupon="state.formCoupon"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveCoupon" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { couponService } from '@/components/api/superadmin/CouponService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formCoupon: {
        type: '',
        code: '',
        description: '',
        amount: '',
        unit: '',
        quantity: '',
        expiration: '',
        is_active: '',
    },
    isPageLoading: false,
})

async function saveCoupon(couponDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            type: couponDetails.type,
            code: couponDetails.code,
            description: couponDetails.description,
            amount: couponDetails.amount,
            unit: couponDetails.unit,
            quantity: couponDetails.quantity,
            expiration: couponDetails.expiration,
            is_active: couponDetails.is_active,
        }
        const response = await couponService.saveCoupon(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.coupons.form.alert.newCouponSuccessfullySaved')}.`)
            navigateTo('/superadmin/coupons')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>