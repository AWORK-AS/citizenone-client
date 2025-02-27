import BaseAPIService from '@/components/api/user/BaseAPIService'

class CouponService extends BaseAPIService {
    async validateDealCouponCode(params: object): Promise<any> {
        return await this.request(`/user/coupons/deal-promo`, 'POST', params)
    }

    async validateAddOnCouponCode(params: object): Promise<any> {
        return await this.request(`/user/coupons/addon-promo`, 'POST', params)
    }
}

export const couponService = new CouponService()