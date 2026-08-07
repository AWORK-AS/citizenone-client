import BaseAPIService from '@/components/api/BaseAPIService'

class MergeFieldService extends BaseAPIService {
    async getCatalogue(): Promise<any> {
        return await this.request(`/user/form-merge-fields`, 'GET')
    }

    async resolveForCitizen(citizenUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/merge-fields`, 'GET', params)
    }
}

export const mergeFieldService = new MergeFieldService()
