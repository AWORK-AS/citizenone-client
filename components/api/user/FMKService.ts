import BaseAPIService from '@/components/api/BaseAPIService'

class FMKService extends BaseAPIService {
    async getFMK(params: object): Promise<any> {
        return await this.request(`/user/fmk`, 'GET', params)
    }
}

export const fMKService = new FMKService()