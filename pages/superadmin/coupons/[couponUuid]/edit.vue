<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.coupons.editCoupon') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.coupons.editCoupon') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/coupons">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminCouponForm formType="update" :selectedCoupon="state.formCoupon"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateCoupon" />
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
const router = useRouter()
const couponUuid = router?.currentRoute?.value?.params?.couponUuid

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

onMounted(() => {
    fetchCoupon()
})

async function fetchCoupon() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await couponService.getCoupon(couponUuid)
        if (response) {
            state.formCoupon = {
                code: response?.data?.code ?? '',
                description: response?.data?.description ?? '',
                amount: response?.data?.amount ?? '',
                unit: response?.data?.unit ?? '',
                expiration: response?.data?.expiration ?? '',
                is_active: response?.data?.is_active ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateCoupon(couponDetails: any) {
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
        const response = await couponService.updateCoupon(couponUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.coupons.form.alert.couponSuccessfullyUpdated')}.`)
            navigateTo('/superadmin/coupons')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>