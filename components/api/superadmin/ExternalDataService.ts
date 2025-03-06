import BaseAPIService from '@/components/api/BaseAPIService'

class ExternalDataService extends BaseAPIService {
    async getExternalData(params: object): Promise<any> {
        return await this.request(`/superadmin/external-data`, 'GET', params)
    }

    async getData(externalDataUuid: any): Promise<any> {
        return await this.request(`/superadmin/external-data/${externalDataUuid}`, 'GET')
    }
}

export const externalDataService = new ExternalDataService()