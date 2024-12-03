<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.coupons.newCoupon') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.coupons.newCoupon') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/coupons">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
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
        code: '',
        description: '',
        amount: '',
        unit: '',
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
            code: couponDetails.code,
            description: couponDetails.description,
            amount: couponDetails.amount,
            unit: couponDetails.unit,
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