import { defineStore } from 'pinia'

export const useCouponStore = defineStore('couponStore',
    {
        persist: true,
        state: () => ({
            addOnCoupon: '',
            dealCoupon: '',
        }),
        actions: {
            setAddOnCouponCode(couponCode) {
                this.addOnCoupon = couponCode
            },
            setDealCouponCode(couponCode) {
                this.dealCoupon = couponCode
            },
            resetAddOnCouponCode() {
                this.addOnCoupon = ''
            },
            resetDealCouponCode() {
                this.dealCoupon = ''
            },
        },
        getters: {
            getAddOnCouponCode: (state) => state.addOnCoupon,
            getDealCouponCode: (state) => state.dealCoupon,
        },
    },
)
