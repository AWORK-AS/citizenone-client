import BaseAPIService from '@/components/api/BaseAPIService'

class DentalRecallService extends BaseAPIService {
    async getRecalls(params: object): Promise<any> {
        return await this.request(`/user/dental-recalls`, 'GET', params)
    }

    async markContacted(citizenUuid: string): Promise<any> {
        return await this.request(`/user/dental-recalls/${citizenUuid}/contacted`, 'PUT')
    }
}

export const dentalRecallService = new DentalRecallService()
