import BaseAPIService from '@/components/api/BaseAPIService'

class PatientPriceEstimateService extends BaseAPIService {
    async getPriceEstimates(params: object = {}): Promise<any> {
        return await this.request(`/patient/price-estimates`, 'GET', params)
    }

    async getPriceEstimate(uuid: string): Promise<any> {
        return await this.request(`/patient/price-estimates/${uuid}`, 'GET')
    }
}

export const patientPriceEstimateService = new PatientPriceEstimateService()
