import BaseAPIService from '@/components/api/BaseAPIService'

class MergeFieldService extends BaseAPIService {
    async getCatalogue(): Promise<any> {
        return await this.request(`/user/form-merge-fields`, 'GET')
    }

}

export const mergeFieldService = new MergeFieldService()
