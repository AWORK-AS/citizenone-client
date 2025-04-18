import BaseAPIService from '@/components/api/BaseAPIService'

class SecuredMailService extends BaseAPIService {
    async getMessage(): Promise<any> {
        return await this.request(`/user/unlock-message`, 'GET')
    }
}

export const securedMailService = new SecuredMailService()