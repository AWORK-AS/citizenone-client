import BaseAPIService from '@/components/api/BaseAPIService'

class SecuredMailService extends BaseAPIService {
    async unlockMessage(emailUuid: any, params: object): Promise<any> {
        return await this.request(`/user/encrypted-email/${emailUuid}/decrypt`, 'GET', params)
    }
}

export const securedMailService = new SecuredMailService()