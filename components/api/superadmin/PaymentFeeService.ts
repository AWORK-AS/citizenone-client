import BaseAPIService from '@/components/api/BaseAPIService'

class PaymentFeeService extends BaseAPIService {
    async getPaymentFees(params: object): Promise<any> {
        return await this.request(`/superadmin/payment-fees`, 'GET', params)
    }
}

export const superadminPaymentFeeService = new PaymentFeeService()
