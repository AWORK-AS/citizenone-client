import BaseAPIService from '@/components/api/BaseAPIService'

class MediaRiskService extends BaseAPIService {
    async getMediaRisks(): Promise<any> {
        return await this.request(`/user/media-risks`, 'GET')
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

    async getAllMediaRisks(): Promise<any> {
        return await this.request(`/user/media-risks/all/list`, 'GET')
    }

}

export const mediaRiskService = new MediaRiskService()