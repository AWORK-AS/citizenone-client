import BaseAPIService from '@/components/api/BaseAPIService'

class CouponService extends BaseAPIService {
    async validateCouponCode(params: object): Promise<any> {
        return await this.request(`/user/coupons/deal-promo`, 'POST', params)
    }
}

export const couponService = new CouponService()