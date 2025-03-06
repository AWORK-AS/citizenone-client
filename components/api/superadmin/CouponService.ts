import BaseAPIService from '@/components/api/BaseAPIService'

class CouponService extends BaseAPIService {
    async getCoupons(params: object): Promise<any> {
        return await this.request(`/superadmin/coupons`, 'GET', params)
    }

    async getCoupon(couponUuid: any): Promise<any> {
        return await this.request(`/superadmin/coupons/${couponUuid}`, 'GET')
    }

    async saveCoupon(params: object): Promise<any> {
        return await this.request(`/superadmin/coupons`, 'POST', params)
    }

    async updateCoupon(couponUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/coupons/${couponUuid}`, 'PUT', params)
    }

    async deleteCoupon(couponUuid: any): Promise<any> {
        return await this.request(`/superadmin/coupons/${couponUuid}`, 'DELETE')
    }
}

export const couponService = new CouponService()