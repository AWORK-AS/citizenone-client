import BaseAPIService from '@/components/api/BaseAPIService'

class MediaRiskService extends BaseAPIService {
    async getMediaRisks(params: object): Promise<any> {
        return await this.request(`/user/media-risks`, 'GET', params)
    }

    async getMediaRisk(mediaRiskUuid: any): Promise<any> {
        return await this.request(`/user/media-risks/${mediaRiskUuid}`, 'GET')
    }

    async saveMediaRisk(params: object): Promise<any> {
        return await this.request(`/user/media-risks`, 'POST', params)
    }

    async updateMediaRisk(mediaRiskUuid: any, params: object): Promise<any> {
        return await this.request(`/user/media-risks/${mediaRiskUuid}`, 'PUT', params)
    }

}

export const mediaRiskService = new MediaRiskService()