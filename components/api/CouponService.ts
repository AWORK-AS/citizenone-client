import BaseAPIService from '@/components/api/BaseAPIService'

class CouponService extends BaseAPIService {
    async validateCouponCode(params: object): Promise<any> {
        return await this.request(`/user/promo-code`, 'POST', params)
    }
}

export const couponService = new CouponService()