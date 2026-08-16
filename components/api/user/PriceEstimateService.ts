import BaseAPIService from '@/components/api/BaseAPIService'

class PriceEstimateService extends BaseAPIService {
    async getEstimates(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/price-estimates`, 'GET')
    }

    async createEstimate(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/price-estimates`, 'POST', params)
    }

    async updateEstimate(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/price-estimates/${uuid}`, 'PUT', params)
    }

    async updateStatus(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/price-estimates/${uuid}/status`, 'PUT', params)
    }

    async deleteEstimate(uuid: string): Promise<any> {
        return await this.request(`/user/price-estimates/${uuid}`, 'DELETE')
    }

    async downloadPdf(uuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/price-estimates/${uuid}/pdf`, 'GET')
    }
}

export const priceEstimateService = new PriceEstimateService()
